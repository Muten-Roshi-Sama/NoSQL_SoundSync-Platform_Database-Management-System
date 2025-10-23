from fastapi import APIRouter, Query, HTTPException

from app.db import crud
import json

router = APIRouter()



@router.get("/{collection_name}/by/{field}/{value}")
def find_instances_by_field(
    collection_name : str,
    field: str,
    value: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    projection: str = Query(None, description="JSON dict, e.g. {\"field\": 1}")
    ):
    """Find documents by a specific field value."""
    projection_val = json.loads(projection) if projection else None
    result = crud.find_by_field(collection_name, field, value, skip, limit, projection_val)
    return result


# ====================
# GET
# ====================
@router.get("/{collection_name}")
def get_all(
    collection_name: str,
    filter: str = Query(None, description="JSON dict filter, e.g. {\"role\": \"artist\"}"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    sort: str = Query(None, description="JSON list of tuples, e.g. [[\"field\", 1]]"),
    projection: str = Query(None, description="JSON dict, e.g. {\"field\": 1}")
    ):
    """List all documents from any collection with pagination, sorting, projection, and filtering."""
    sort_val = json.loads(sort) if sort else None
    projection_val = json.loads(projection) if projection else None
    filter_val = json.loads(filter) if filter else None

    result = crud.get_all(collection_name, filter=filter_val, skip=skip, limit=limit, sort=sort_val, projection=projection_val)
    return result

@router.get("/{collection_name}/{id_or_key}")
def get_instance(collection_name : str, id_or_key: str):
    """Get a single document by ID."""
    document = crud.get_by_id(collection_name, id_or_key)
    if not document:
        raise HTTPException(status_code=404, detail=f"Document from {collection_name} not found")
    return {"document": document}

@router.get("/{collection_name}/count")
def count_instances(collection_name : str, filter: str = Query(None, description="JSON dict filter, e.g. {\"role\": \"artist\"}")):
    """Get total document count in a collection with optional filter."""
    count = crud.count_documents(collection_name, filter)
    return {"count": count}


# ====================
# POST / PUT / DELETE
# ====================
@router.post("/{collection_name}")
def create_instance(collection_name : str, document_data: dict):
    """Create a new document in the collection."""
    doc_id = crud.create_one(collection_name, document_data)
    return {"id": doc_id, "message": f"Document created in {collection_name}"}

@router.put("/{collection_name}/{id}")
def update_instance(collection_name : str, id: str, updates: dict):
    """Update a document by ID."""
    modified = crud.update_one(collection_name, id, updates)
    if not modified:
        raise HTTPException(status_code=404, detail=f"Document from {collection_name} not found or not modified")
    return {"modified": modified, "message": f"Document {id} from {collection_name} updated"}

@router.delete("/{collection_name}/{id}")
def delete_instance(collection_name : str, id: str):
    """Delete a document by ID."""
    deleted = crud.delete_one(collection_name, id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document {id} from {collection_name} not found ")
    return {"deleted": deleted, "message": "Document {id} from {collection_name} deleted"}





# pour déconnecter la db et le cache : close_services()














# ===========================
# EXAMPLES: How to call the API
# ===========================

# 1. Get all users, sorted by creation date descending, only show name and email
# GET /api/users?skip=0&limit=10&sort=[["created_at",-1]]&projection={"name":1,"email":1}

# 2. Get all tracks, sorted by popularity ascending, show all fields
# GET /api/tracks?sort=[["popularity",1]]

# 3. Get all playlists, only show name and track_ids
# GET /api/playlists?projection={"name":1,"track_ids":1}

# 4. Get all artists, no sort, no projection
# GET /api/artists

# 5. Get all users, filter by role
# GET /api/users/by/role/artist

# 6. Get user by ID
# GET /api/users/1234567890abcdef

# 7. Create a new user
# POST /api/users
# Body: {"name": "Alice", "email": "alice@example.com", "role": "artist"}

# 8. Update a user
# PUT /api/users/1234567890abcdef
# Body: {"email": "newalice@example.com"}

# 9. Delete a user
# DELETE /api/users/1234567890abcdef

# 10. Count documents in a collection
# GET /api/users/count

# ===========================
# EXAMPLES: Python input/output
# ===========================

# Input to get_all:
# collection_name = "users"
# skip = 0
# limit = 10
# sort = [["created_at", -1]]
# projection = {"name": 1, "email": 1}

# result = crud.get_all(collection_name, skip=skip, limit=limit, sort=sort, projection=projection)

# Output:
# {
#     "items": [
#         {"_id": "123...", "name": "Alice", "email": "alice@example.com"},
#         {"_id": "456...", "name": "Bob", "email": "bob@example.com"},
#         # ...
#     ],
#     "total": 2,
#     "skip": 0,
#     "limit": 10
# }

# ===========================
# EXAMPLES: How to pass sort/projection in frontend fetch
# ===========================

# fetch('/api/users?sort=' + encodeURIComponent(JSON.stringify([["created_at",-1]])) + '&projection=' + encodeURIComponent(JSON.stringify({"name":1,"email":1})))

# ===========================
# EXAMPLES: Error handling
# ===========================

# If you pass invalid JSON for sort/projection:
# GET /api/users?sort=not_json
# Output: 422 Unprocessable Entity

# If you request a non-existent document:
# GET /api/users/doesnotexist
# Output: 404 Document from users not found
