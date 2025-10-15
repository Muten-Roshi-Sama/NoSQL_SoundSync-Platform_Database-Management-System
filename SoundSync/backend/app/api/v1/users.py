from fastapi import APIRouter


router = APIRouter()

@router.get("/users")
def get_users():
    pass
# pour déconnecter la db et le cache : close_services()