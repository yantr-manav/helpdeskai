"""
Conversation logger.
Stores conversation metadata + message logs for the admin dashboard.
Redis key: convo:{session_id}  →  ConversationLog JSON
Redis set: convos:index        →  sorted set (score = timestamp)
"""

import json
import uuid
from datetime import datetime
import redis.asyncio as aioredis


class ConversationLogger:
    def __init__(self, redis_client: aioredis.Redis):
        self.redis = redis_client
        self.ttl = 86400 * 30  # 30 days

    async def log_message(
        self,
        session_id: str,
        role: str,
        content: str,
        channel: str = "web",
        confidence: float | None = None,
        sources: list[str] | None = None,
        escalated: bool = False,
    ):
        key = f"convo:{session_id}"
        now = datetime.utcnow().isoformat()

        # Load or init conversation record
        raw = await self.redis.get(key)
        if raw:
            record = json.loads(raw)
        else:
            record = {
                "session_id": session_id,
                "channel": channel,
                "created_at": now,
                "updated_at": now,
                "message_count": 0,
                "escalated": False,
                "messages": [],
            }
            # Add to index
            ts = datetime.utcnow().timestamp()
            await self.redis.zadd("convos:index", {session_id: ts})

        record["updated_at"] = now
        record["message_count"] += 1
        if escalated:
            record["escalated"] = True

        record["messages"].append({
            "id": str(uuid.uuid4()),
            "role": role,
            "content": content,
            "timestamp": now,
            "confidence": confidence,
            "sources": sources or [],
        })

        # Keep latest 200 messages per session
        record["messages"] = record["messages"][-200:]

        await self.redis.setex(key, self.ttl, json.dumps(record))

    async def get_conversation(self, session_id: str) -> dict | None:
        raw = await self.redis.get(f"convo:{session_id}")
        return json.loads(raw) if raw else None

    async def list_conversations(self, limit: int = 50, offset: int = 0) -> list[dict]:
        """Return most recent conversations (sorted by time desc)."""
        # Get session IDs sorted by score descending
        ids = await self.redis.zrevrange("convos:index", offset, offset + limit - 1)
        results = []
        for sid in ids:
            convo = await self.get_conversation(sid)
            if convo:
                # Return summary (no full messages)
                results.append({
                    "session_id": convo["session_id"],
                    "channel": convo["channel"],
                    "created_at": convo["created_at"],
                    "updated_at": convo["updated_at"],
                    "message_count": convo["message_count"],
                    "escalated": convo["escalated"],
                    "preview": (
                        convo["messages"][-1]["content"][:80] + "…"
                        if convo["messages"]
                        else ""
                    ),
                })
        return results

    async def get_analytics(self) -> dict:
        """Aggregate stats for the admin analytics page."""
        total_ids = await self.redis.zcard("convos:index")
        all_ids = await self.redis.zrevrange("convos:index", 0, 199)

        total_messages = 0
        escalated = 0
        channels: dict[str, int] = {}
        daily: dict[str, int] = {}

        for sid in all_ids:
            convo = await self.get_conversation(sid)
            if not convo:
                continue
            total_messages += convo.get("message_count", 0)
            if convo.get("escalated"):
                escalated += 1
            ch = convo.get("channel", "web")
            channels[ch] = channels.get(ch, 0) + 1
            day = convo.get("created_at", "")[:10]
            if day:
                daily[day] = daily.get(day, 0) + 1

        escalation_rate = round(escalated / max(total_ids, 1) * 100, 1)

        return {
            "total_conversations": total_ids,
            "total_messages": total_messages,
            "escalated_count": escalated,
            "escalation_rate_pct": escalation_rate,
            "by_channel": channels,
            "daily_conversations": dict(sorted(daily.items())[-14:]),
        }
