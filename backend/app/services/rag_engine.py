"""
RAG Pipeline:
1. Embed user query via OpenAI
2. Search Qdrant for top-K chunks (cosine similarity)
3. Build prompt: system + KB context + history + query
4. Stream response from Claude (Anthropic)
5. Log to ConversationLogger
"""

import anthropic
from app.config import get_settings
from app.services.qdrant_service import QdrantService
from app.services.redis_service import RedisService
from typing import AsyncGenerator, Optional

settings = get_settings()

SYSTEM_PROMPT_TEMPLATE = """You are HelpdeskAI, the friendly and knowledgeable support assistant for FlowTask — a B2B project management SaaS for async-first teams.

You answer user support questions using ONLY the knowledge base context provided below.

RULES:
- Answer only from the provided CONTEXT. Do not fabricate answers.
- If the context doesn't contain a clear answer, say: "I don't have enough information about that in my knowledge base."
- Keep answers concise (under 150 words) unless detailed steps are genuinely needed.
- Use bullet points for step-by-step instructions.
- Be warm, direct, and human. Never say "Great question!" or "Certainly!".
- If the user seems frustrated or the question can't be answered, offer to create a support ticket.
- If user says "create ticket", "raise issue", "speak to human", "talk to agent", or "escalate" — respond with exactly: "I'll open a support ticket for you right away."

KNOWLEDGE BASE CONTEXT:
{context}

If context is empty or irrelevant, acknowledge you don't have that information and offer to escalate.
"""


class RAGEngine:
    def __init__(self, qdrant: QdrantService, redis: RedisService, logger=None):
        self.qdrant = qdrant
        self.redis = redis
        self.logger = logger
        self.client = anthropic.AsyncAnthropic(api_key=settings.anthropic_api_key)

    async def retrieve_context(self, query: str) -> tuple[list[dict], float]:
        results = await self.qdrant.search(query, top_k=settings.top_k_results)
        if not results:
            return [], 0.0
        confident = [r for r in results if r["score"] >= settings.confidence_threshold]
        max_score = results[0]["score"] if results else 0.0
        return confident, max_score

    def build_context_string(self, chunks: list[dict]) -> str:
        if not chunks:
            return ""
        parts = []
        for i, chunk in enumerate(chunks, 1):
            parts.append(f"[{i}] {chunk['title']}\n{chunk['content']}")
        return "\n\n---\n\n".join(parts)

    async def chat(self, session_id: str, message: str, channel: str = "web") -> dict:
        chunks, confidence = await self.retrieve_context(message)
        context_str = self.build_context_string(chunks)
        history = await self.redis.get_history(session_id)

        messages = history + [{"role": "user", "content": message}]
        system = SYSTEM_PROMPT_TEMPLATE.format(context=context_str or "No relevant context found.")

        response = await self.client.messages.create(
            model=settings.anthropic_model,
            max_tokens=1024,
            system=system,
            messages=messages,
        )

        reply = response.content[0].text
        should_escalate = (
            confidence < settings.confidence_threshold
            or "I don't have enough information" in reply
            or "I'll open a support ticket" in reply
        )

        await self.redis.append_history(session_id, "user", message)
        await self.redis.append_history(session_id, "assistant", reply)

        # Log to conversation logger
        if self.logger:
            await self.logger.log_message(session_id, "user", message, channel=channel)
            await self.logger.log_message(
                session_id, "assistant", reply,
                channel=channel,
                confidence=round(confidence, 4),
                sources=[c["title"] for c in chunks],
                escalated=should_escalate,
            )

        return {
            "reply": reply,
            "confidence": round(confidence, 4),
            "sources": [c["title"] for c in chunks],
            "should_escalate": should_escalate,
        }

    async def stream_chat(
        self,
        session_id: str,
        message: str,
        channel: str = "web",
    ) -> AsyncGenerator[str, None]:
        chunks, confidence = await self.retrieve_context(message)
        context_str = self.build_context_string(chunks)
        history = await self.redis.get_history(session_id)

        messages = history + [{"role": "user", "content": message}]
        system = SYSTEM_PROMPT_TEMPLATE.format(context=context_str or "No relevant context found.")

        full_reply = ""

        # Log user message immediately
        if self.logger:
            await self.logger.log_message(session_id, "user", message, channel=channel)

        async with self.client.messages.stream(
            model=settings.anthropic_model,
            max_tokens=1024,
            system=system,
            messages=messages,
        ) as stream:
            async for text in stream.text_stream:
                full_reply += text
                yield text

        await self.redis.append_history(session_id, "user", message)
        await self.redis.append_history(session_id, "assistant", full_reply)

        should_escalate = (
            confidence < settings.confidence_threshold
            or "I don't have enough information" in full_reply
        )

        # Log assistant reply
        if self.logger:
            await self.logger.log_message(
                session_id, "assistant", full_reply,
                channel=channel,
                confidence=round(confidence, 4),
                sources=[c["title"] for c in chunks],
                escalated=should_escalate,
            )

        import json
        yield f"\n\n[META]{json.dumps({'confidence': round(confidence, 4), 'sources': [c['title'] for c in chunks], 'should_escalate': should_escalate})}"
