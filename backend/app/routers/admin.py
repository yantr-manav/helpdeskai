from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.schemas import AdminLogin, TokenResponse, TicketUpdate
from app.config import get_settings
from app.services.ticket_service import TicketService
import jwt
from datetime import datetime, timedelta

router = APIRouter()
security = HTTPBearer()
settings = get_settings()


def create_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expire_minutes)
    return jwt.encode({"sub": email, "exp": expire}, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(credentials.credentials, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.post("/login", response_model=TokenResponse)
async def login(body: AdminLogin):
    if body.email != settings.admin_email or body.password != settings.admin_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return TokenResponse(access_token=create_token(body.email))


# ── Tickets ─────────────────────────────────────────────────────

@router.get("/tickets")
async def admin_list_tickets(request: Request, admin: str = Depends(verify_token), limit: int = 100):
    svc = TicketService(redis_client=request.app.state.redis.client)
    tickets = await svc.list_all(limit=limit)
    return {"tickets": [t.model_dump() for t in tickets], "total": len(tickets)}


@router.patch("/tickets/{ticket_id}")
async def admin_update_ticket(ticket_id: str, body: TicketUpdate, request: Request, admin: str = Depends(verify_token)):
    svc = TicketService(redis_client=request.app.state.redis.client)
    ticket = await svc.update_status(ticket_id, body.status)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


# ── Conversations ────────────────────────────────────────────────

@router.get("/conversations")
async def list_conversations(request: Request, admin: str = Depends(verify_token), limit: int = 50, offset: int = 0):
    logger = request.app.state.convo_logger
    convos = await logger.list_conversations(limit=limit, offset=offset)
    return {"conversations": convos, "total": len(convos)}


@router.get("/conversations/{session_id}")
async def get_conversation(session_id: str, request: Request, admin: str = Depends(verify_token)):
    logger = request.app.state.convo_logger
    convo = await logger.get_conversation(session_id)
    if not convo:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return convo


# ── Analytics ────────────────────────────────────────────────────

@router.get("/analytics")
async def get_analytics(request: Request, admin: str = Depends(verify_token)):
    logger = request.app.state.convo_logger
    stats = await logger.get_analytics()
    svc = TicketService(redis_client=request.app.state.redis.client)
    tickets = await svc.list_all(limit=500)
    ticket_stats = {
        "total": len(tickets),
        "open": sum(1 for t in tickets if t.status == "open"),
        "in_progress": sum(1 for t in tickets if t.status == "in_progress"),
        "resolved": sum(1 for t in tickets if t.status == "resolved"),
    }
    return {**stats, "tickets": ticket_stats}


# ── Knowledge Base ────────────────────────────────────────────────

@router.get("/kb/stats")
async def kb_stats(request: Request, admin: str = Depends(verify_token)):
    info = request.app.state.qdrant.collection_info()
    return {"collection": settings.qdrant_collection, **info}


@router.delete("/kb/reset")
async def kb_reset(request: Request, admin: str = Depends(verify_token)):
    request.app.state.qdrant.delete_collection()
    await request.app.state.qdrant.ensure_collection()
    return {"reset": True}
