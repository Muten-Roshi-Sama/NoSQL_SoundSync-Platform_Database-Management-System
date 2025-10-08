from fastapi import APIRouter
from app.core import events

router = APIRouter()

@router.get("/health")
def health_check():
    try:
        events.mongo_client.admin.command("ping")
        events.redis_client.ping()
        return {"status": "ok", "mongo": "connected", "redis": "connected"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}
