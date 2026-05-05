from fastapi import APIRouter, Request, HTTPException
from ..models.schemas import TicketCreate, Ticket, TicketUpdate
from ..services.ticket_service import TicketService

router = APIRouter()


def get_ticket_svc(request: Request) -> TicketService:
    return TicketService(redis_client=request.app.state.redis.client)


@router.post("/create", response_model=Ticket)
async def create_ticket(body: TicketCreate, request: Request):
    svc = get_ticket_svc(request)
    ticket = await svc.create(body)
    # Fire-and-forget email
    await svc.send_confirmation_email(ticket)
    return ticket


@router.get("/{ticket_id}", response_model=Ticket)
async def get_ticket(ticket_id: str, request: Request):
    svc = get_ticket_svc(request)
    ticket = await svc.get(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.patch("/{ticket_id}/status", response_model=Ticket)
async def update_ticket_status(ticket_id: str, body: TicketUpdate, request: Request):
    svc = get_ticket_svc(request)
    ticket = await svc.update_status(ticket_id, body.status)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket


@router.get("/", response_model=list[Ticket])
async def list_tickets(request: Request, limit: int = 50):
    svc = get_ticket_svc(request)
    return await svc.list_all(limit=limit)
