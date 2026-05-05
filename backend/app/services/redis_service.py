import json
import redis.asyncio as aioredis
from app.config import get_settings

settings = get_settings()


class RedisService:
    def __init__(self):
        self.client = aioredis.from_url(
            settings.redis_url,
            decode_responses=True,
        )
        self.ttl = settings.session_ttl_seconds
        self.max_turns = settings.max_history_turns

    async def get_history(self, session_id: str) -> list[dict]:
        """Return conversation history for session."""
        raw = await self.client.get(f"session:{session_id}:history")
        if not raw:
            return []
        return json.loads(raw)

    async def append_history(self, session_id: str, role: str, content: str):
        """Append a message to session history, keep last N turns."""
        history = await self.get_history(session_id)
        history.append({"role": role, "content": content})
        # Keep only last max_turns * 2 messages (user+assistant pairs)
        history = history[-(self.max_turns * 2):]
        await self.client.setex(
            f"session:{session_id}:history",
            self.ttl,
            json.dumps(history),
        )

    async def clear_history(self, session_id: str):
        await self.client.delete(f"session:{session_id}:history")

    async def set_session_meta(self, session_id: str, meta: dict):
        await self.client.setex(
            f"session:{session_id}:meta",
            self.ttl,
            json.dumps(meta),
        )

    async def get_session_meta(self, session_id: str) -> dict:
        raw = await self.client.get(f"session:{session_id}:meta")
        return json.loads(raw) if raw else {}

    async def ping(self) -> bool:
        try:
            return await self.client.ping()
        except Exception:
            return False
