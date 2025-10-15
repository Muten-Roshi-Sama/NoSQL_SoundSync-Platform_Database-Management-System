from fastapi import APIRouter
from app.core import events

router = APIRouter()

@router.get("/health")
def health_check():
    try:
        events.connect_to_services()
        return {"status": "ok", "mongo": "connected", "redis": "connected"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

# pour déconnecter la db et le cache : close_services()