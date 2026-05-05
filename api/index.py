from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from config import get_settings
from routers import chat, ticket, admin, health, webhook
from services.qdrant_service import QdrantService
from services.redis_service import RedisService
from services.whatsapp_session import WhatsAppSessionManager
from services.conversation_logger import ConversationLogger

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    qdrant = QdrantService()
    await qdrant.ensure_collection()
    redis_svc = RedisService()
    app.state.qdrant = qdrant
    app.state.redis = redis_svc
    app.state.whatsapp_sessions = WhatsAppSessionManager(redis_svc.client)
    app.state.convo_logger = ConversationLogger(redis_svc.client)
    print("✅ All services ready")
    yield
    print("👋 Shutting down")


app = FastAPI(
    title="HelpdeskAI — FlowTask Support API",
    version="1.0.0",
    docs_url="/docs",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(ticket.router, prefix="/api/v1/ticket", tags=["ticket"])
app.include_router(admin.router, prefix="/api/v1/admin", tags=["admin"])
app.include_router(webhook.router, prefix="/api/v1/webhook", tags=["webhook"])