from fastapi import APIRouter, Request

router = APIRouter()


@router.get("/health")
async def health(request: Request):
    redis_ok = await request.app.state.redis.ping()
    qdrant_info = request.app.state.qdrant.collection_info()
    return {
        "status": "ok",
        "redis": "connected" if redis_ok else "disconnected",
        "qdrant": {
            "status": "connected",
            **qdrant_info,
        },
    }


@router.get("/")
async def root():
    return {
        "name": "HelpdeskAI — FlowTask Support API",
        "version": "1.0.0",
        "docs": "/docs",
    }
