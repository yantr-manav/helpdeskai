"""
WhatsApp via Twilio webhook.
Twilio sends a POST with form-encoded body when a WhatsApp message arrives.
We run the same RAG pipeline as the web widget.
"""

from fastapi import APIRouter, Request, Form, Response
from fastapi.responses import PlainTextResponse
from ..services.rag_engine import RAGEngine
from ..services.ticket_service import TicketService
from ..services.whatsapp_session import WhatsAppSessionManager
from ..config import get_settings
import httpx
import re

router = APIRouter()
settings = get_settings()

BUSINESS_HOURS = (9, 18)   # 09:00–18:00 UTC

# Multi-step ticket collection states stored in WhatsApp session
TICKET_STEPS = ["name", "email", "issue", "priority"]


def is_business_hours() -> bool:
    from datetime import datetime, timezone
    hour = datetime.now(timezone.utc).hour
    return BUSINESS_HOURS[0] <= hour < BUSINESS_HOURS[1]


def twiml_reply(body: str) -> Response:
    xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>{body}</Message>
</Response>"""
    return Response(content=xml, media_type="application/xml")


async def send_whatsapp(to: str, body: str):
    """Send outbound WhatsApp message via Twilio REST API."""
    if not settings.twilio_account_sid or settings.twilio_account_sid == "AC...":
        print(f"[WhatsApp MOCK] → {to}: {body[:80]}")
        return
    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Messages.json"
    async with httpx.AsyncClient() as client:
        await client.post(
            url,
            data={
                "From": settings.twilio_whatsapp_number,
                "To": f"whatsapp:{to}",
                "Body": body,
            },
            auth=(settings.twilio_account_sid, settings.twilio_auth_token),
        )


@router.post("/whatsapp")
async def whatsapp_webhook(
    request: Request,
    Body: str = Form(""),
    From: str = Form(""),
    ProfileName: str = Form(""),
):
    """
    Twilio webhook endpoint.
    Set Twilio WhatsApp sandbox webhook to: POST /api/v1/webhook/whatsapp
    """
    phone = From.replace("whatsapp:", "").strip()
    text = Body.strip()

    if not phone or not text:
        return PlainTextResponse("ok")

    session_mgr: WhatsAppSessionManager = request.app.state.whatsapp_sessions
    rag = RAGEngine(
        qdrant=request.app.state.qdrant,
        redis=request.app.state.redis,
    )
    ticket_svc = TicketService(redis_client=request.app.state.redis.client)

    # ── STOP / opt-out ──────────────────────────────────────────
    if text.upper() in ("STOP", "UNSUBSCRIBE", "QUIT"):
        await session_mgr.clear(phone)
        return twiml_reply("You've been unsubscribed. Send any message to start again.")

    # ── Check if in ticket-collection flow ───────────────────────
    ticket_state = await session_mgr.get_ticket_state(phone)
    if ticket_state:
        reply = await handle_ticket_flow(phone, text, ticket_state, ticket_svc, session_mgr, request)
        return twiml_reply(reply)

    # ── Trigger ticket manually ───────────────────────────────────
    if re.search(r"ticket|raise issue|speak to human|escalate", text, re.I):
        await session_mgr.start_ticket_flow(phone)
        return twiml_reply(
            "🎫 Let me create a support ticket for you.\n\n"
            "Step 1/4 — What's your full name?"
        )

    # ── Outside business hours ─────────────────────────────────────
    if not is_business_hours():
        # Still answer with AI, but prepend hours notice
        pass  # falls through to RAG

    # ── RAG answer ─────────────────────────────────────────────────
    session_id = f"wa:{phone}"
    result = await rag.chat(session_id=session_id, message=text)

    reply = result["reply"]
    if result["should_escalate"]:
        reply += (
            "\n\n❓ I wasn't able to fully answer that from my knowledge base."
            "\n\nReply *TICKET* to create a support ticket, or keep asking questions."
        )

    if not is_business_hours():
        reply = (
            "⏰ Our team is currently offline (business hours: 09:00–18:00 UTC).\n\n"
            + reply
        )

    return twiml_reply(reply)


async def handle_ticket_flow(
    phone: str,
    text: str,
    state: dict,
    ticket_svc: TicketService,
    session_mgr: "WhatsAppSessionManager",
    request: Request,
):
    step = state.get("step", "name")
    data = state.get("data", {})

    if step == "name":
        data["name"] = text
        await session_mgr.update_ticket_state(phone, "email", data)
        return "Step 2/4 — What's your email address?"

    elif step == "email":
        if "@" not in text:
            return "That doesn't look like an email address. Please try again:"
        data["email"] = text
        await session_mgr.update_ticket_state(phone, "issue", data)
        return "Step 3/4 — Briefly describe your issue:"

    elif step == "issue":
        data["issue"] = text
        await session_mgr.update_ticket_state(phone, "priority", data)
        return (
            "Step 4/4 — Priority?\n"
            "Reply *1* = Low (general question)\n"
            "Reply *2* = Medium (affecting my work)\n"
            "Reply *3* = High (blocking me completely)"
        )

    elif step == "priority":
        priority_map = {"1": "low", "2": "medium", "3": "high"}
        data["priority"] = priority_map.get(text.strip(), "medium")
        await session_mgr.clear_ticket_state(phone)

        # Create ticket
        from ..models.schemas import TicketCreate
        ticket = await ticket_svc.create(
            TicketCreate(
                session_id=f"wa:{phone}",
                name=data["name"],
                email=data["email"],
                issue=data["issue"],
                priority=data["priority"],
                channel="whatsapp",
            )
        )
        await ticket_svc.send_confirmation_email(ticket)

        return (
            f"✅ Ticket created!\n\n"
            f"🎫 Ticket ID: *{ticket.ticket_number}*\n"
            f"📧 Confirmation sent to {ticket.email}\n\n"
            f"Our team will respond within 2–4 hours. "
            f"Reply with any message to keep chatting."
        )

    return "Something went wrong. Type *TICKET* to start again."
