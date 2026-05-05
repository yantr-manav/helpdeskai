from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime
import uuid


# ── Chat ──────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    message: str
    channel: Literal["web", "whatsapp"] = "web"


class ChatResponse(BaseModel):
    session_id: str
    reply: str
    confidence: float
    sources: list[str] = []
    should_escalate: bool = False


class StreamChatRequest(BaseModel):
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    message: str
    channel: Literal["web", "whatsapp"] = "web"


# ── Ticket ────────────────────────────────────────────────────

class TicketCreate(BaseModel):
    session_id: Optional[str] = None
    name: str
    email: EmailStr
    issue: str
    priority: Literal["low", "medium", "high"] = "medium"
    channel: Literal["web", "whatsapp"] = "web"


class Ticket(BaseModel):
    id: str
    ticket_number: str
    name: str
    email: str
    issue: str
    priority: str
    status: Literal["open", "in_progress", "resolved", "closed"] = "open"
    channel: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    session_id: Optional[str] = None


class TicketUpdate(BaseModel):
    status: Literal["open", "in_progress", "resolved", "closed"]


# ── Admin ─────────────────────────────────────────────────────

class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ConversationLog(BaseModel):
    session_id: str
    messages: list[ChatMessage]
    created_at: datetime
    channel: str


# ── KB ────────────────────────────────────────────────────────

class KBDocument(BaseModel):
    doc_id: str
    title: str
    content: str
    topics: list[str] = []
