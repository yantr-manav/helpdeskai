from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Anthropic (chat)
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-20250514"

    # OpenAI (embeddings)
    openai_api_key: str = ""
    openai_embedding_model: str = "text-embedding-3-small"
    embedding_dimension: int = 1536
    embedding_provider: str = "local"  # or "local"
    local_embedding_model: str = "all-MiniLM-L6-v2"
    # Qdrant
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_collection: str = "flowtask_kb"

    # Redis
    redis_url: str = "redis://localhost:6379"
    session_ttl_seconds: int = 3600
    max_history_turns: int = 10

    # RAG
    confidence_threshold: float = 0.72
    top_k_results: int = 5

    # SendGrid
    sendgrid_api_key: str = ""
    sendgrid_from_email: str = "support@flowtask.demo"
    sendgrid_ticket_template_id: str = ""
    support_email: str = "support@flowtask.demo"

    # Twilio (WhatsApp)
    twilio_account_sid: str = "AC..."
    twilio_auth_token: str = ""
    twilio_whatsapp_number: str = "whatsapp:+14155238886"

    # JWT
    jwt_secret: str = "change-me-in-production"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 1440
    admin_email: str = "admin@flowtask.demo"
    admin_password: str = "changeme123"

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:3001,http://localhost:3000"
    debug: bool = True

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
