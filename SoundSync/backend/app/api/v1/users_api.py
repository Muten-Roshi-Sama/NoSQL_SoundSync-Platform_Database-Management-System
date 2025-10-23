from fastapi import APIRouter, Query, HTTPException
from app.services import user_service

router = APIRouter()

@router.get("/")
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200)
    ):
    """List all users with pagination."""
    result = user_service.get_all_users(skip=skip, limit=limit)
    return result  # Returns: {"items": [...], "total": N, "skip": X, "limit": Y}

@router.get("/{user_id}")
def get_user(user_id: str):
    """Get a single user by ID."""
    user = user_service.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"user": user}

@router.post("/")
def create_user(user_data: dict):
    """Create a new user."""
    user_id = crud.create_one(COLLECTION, user_data)
    return {"user_id": user_id, "message": "User created"}

@router.put("/{user_id}")
def update_user(user_id: str, updates: dict):
    """Update a user."""
    modified = user_service.update_user(user_id, updates)
    if not modified:
        raise HTTPException(status_code=404, detail="User not found or not modified")
    return {"modified": modified, "message": "User updated"}

@router.delete("/{user_id}")
def delete_user(user_id: str):
    """Delete a user."""
    deleted = user_service.delete_user(user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found")
    return {"deleted": deleted, "message": "User deleted"}

@router.get("/count")
def count_users():
    """Get total user count."""
    count = user_service.count_users()
    return {"count": count}

@router.get("/by/{field}/{value}")
def find_users_by_field(
    field: str,
    value: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200)
    ):
    """Find users by a specific field value."""
    result = user_service.find_users_by_field(field, value, skip, limit)
    return result




# pour déconnecter la db et le cache : close_services()