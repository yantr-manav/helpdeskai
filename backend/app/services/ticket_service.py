import json
import uuid
import shortuuid
from datetime import datetime
import redis.asyncio as aioredis
from app.config import get_settings
from app.models.schemas import Ticket, TicketCreate

settings = get_settings()

# We use Redis as a simple ticket store for this demo.
# In production, swap for Supabase/Postgres.


class TicketService:
    def __init__(self, redis_client: aioredis.Redis):
        self.redis = redis_client

    def _gen_ticket_number(self) -> str:
        return f"FT-{str(uuid.uuid4().int)[:4].upper()}"

    async def create(self, data: TicketCreate) -> Ticket:
        ticket = Ticket(
            id=str(uuid.uuid4()),
            ticket_number=f"FT-{shortuuid.uuid()[:6].upper()}",
            name=data.name,
            email=data.email,
            issue=data.issue,
            priority=data.priority,
            channel=data.channel,
            session_id=data.session_id,
            status="open",
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        await self.redis.setex(
            f"ticket:{ticket.id}",
            86400 * 30,
            ticket.model_dump_json(),
        )
        # Add to ticket index
        await self.redis.lpush("tickets:index", ticket.id)
        return ticket

    async def get(self, ticket_id: str) -> Ticket | None:
        raw = await self.redis.get(f"ticket:{ticket_id}")
        if not raw:
            return None
        return Ticket.model_validate_json(raw)

    async def list_all(self, limit: int = 50) -> list[Ticket]:
        ids = await self.redis.lrange("tickets:index", 0, limit - 1)
        tickets = []
        for tid in ids:
            t = await self.get(tid)
            if t:
                tickets.append(t)
        return tickets

    async def update_status(self, ticket_id: str, status: str) -> Ticket | None:
        ticket = await self.get(ticket_id)
        if not ticket:
            return None
        ticket.status = status
        ticket.updated_at = datetime.utcnow()
        await self.redis.setex(
            f"ticket:{ticket_id}",
            86400 * 30,
            ticket.model_dump_json(),
        )
        return ticket

    async def send_confirmation_email(self, ticket: Ticket):
        """Send ticket confirmation via SendGrid. No-ops if key not set."""
        if not settings.sendgrid_api_key or settings.sendgrid_api_key == "SG...":
            print(f"📧 [MOCK EMAIL] Ticket {ticket.ticket_number} confirmation → {ticket.email}")
            return
        try:
            import sendgrid
            from sendgrid.helpers.mail import Mail, To, From

            sg = sendgrid.SendGridAPIClient(api_key=settings.sendgrid_api_key)
            message = Mail(
                from_email=settings.sendgrid_from_email,
                to_emails=ticket.email,
                subject=f"[{ticket.ticket_number}] Support Request Received — FlowTask",
                html_content=f"""
                <h2>Your support ticket has been received</h2>
                <p>Hi {ticket.name},</p>
                <p>We've received your request and will respond within 2-4 hours.</p>
                <table>
                  <tr><td><b>Ticket:</b></td><td>{ticket.ticket_number}</td></tr>
                  <tr><td><b>Priority:</b></td><td>{ticket.priority}</td></tr>
                  <tr><td><b>Issue:</b></td><td>{ticket.issue}</td></tr>
                </table>
                <p>— The FlowTask Support Team</p>
                """,
            )
            sg.send(message)
        except Exception as e:
            print(f"⚠️  SendGrid error: {e}")
