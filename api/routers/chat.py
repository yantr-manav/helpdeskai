from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from app.models.schemas import ChatRequest, ChatResponse, StreamChatRequest
from app.services.rag_engine import RAGEngine

router = APIRouter()


def get_rag(request: Request) -> RAGEngine:
    return RAGEngine(
        qdrant=request.app.state.qdrant,
        redis=request.app.state.redis,
        logger=request.app.state.convo_logger,
    )


@router.post("/send", response_model=ChatResponse)
async def send_message(body: ChatRequest, request: Request):
    rag = get_rag(request)
    result = await rag.chat(session_id=body.session_id, message=body.message, channel=body.channel)
    return ChatResponse(session_id=body.session_id, **result)


@router.post("/stream")
async def stream_message(body: StreamChatRequest, request: Request):
    rag = get_rag(request)

    async def event_generator():
        async for chunk in rag.stream_chat(
            session_id=body.session_id,
            message=body.message,
            channel=body.channel,
        ):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@router.delete("/session/{session_id}")
async def clear_session(session_id: str, request: Request):
    await request.app.state.redis.clear_history(session_id)
    return {"cleared": True, "session_id": session_id}


@router.get("/session/{session_id}/history")
async def get_history(session_id: str, request: Request):
    history = await request.app.state.redis.get_history(session_id)
    return {"session_id": session_id, "messages": history}
