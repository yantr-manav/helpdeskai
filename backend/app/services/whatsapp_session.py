import json
import redis.asyncio as aioredis
from app.config import get_settings

settings = get_settings()


class WhatsAppSessionManager:
    """
    Stores per-phone ticket collection state in Redis.
    Key: wa_ticket:{phone}  →  { step, data }
    """

    def __init__(self, redis_client: aioredis.Redis):
        self.redis = redis_client
        self.ttl = 1800  # 30 min ticket flow timeout

    def _key(self, phone: str) -> str:
        return f"wa_ticket:{phone}"

    async def get_ticket_state(self, phone: str) -> dict | None:
        raw = await self.redis.get(self._key(phone))
        return json.loads(raw) if raw else None

    async def start_ticket_flow(self, phone: str):
        await self.redis.setex(
            self._key(phone),
            self.ttl,
            json.dumps({"step": "name", "data": {}}),
        )

    async def update_ticket_state(self, phone: str, next_step: str, data: dict):
        await self.redis.setex(
            self._key(phone),
            self.ttl,
            json.dumps({"step": next_step, "data": data}),
        )

    async def clear_ticket_state(self, phone: str):
        await self.redis.delete(self._key(phone))

    async def clear(self, phone: str):
        """Full opt-out: remove ticket state + conversation history."""
        await self.redis.delete(self._key(phone))
        await self.redis.delete(f"session:wa:{phone}:history")
