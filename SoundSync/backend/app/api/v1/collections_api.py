from fastapi import APIRouter, Query, HTTPException

from app.db import crud
import json

router = APIRouter()



# ========= Create / Read =========
@router.post("/{collection_name}")
def create_instance(collection_name : str, document_data: dict):
    """Create a new document in the collection."""
    doc_id = crud.create_one(collection_name, document_data)
    return {"id": doc_id, "message": f"Document created in {collection_name}"}


# ========= Read ============
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

@router.get("/{collection_name}/by/{field}/{value}")
def get_instance(collection_name : str, field:str, value: str):
    """Get a single document by ID."""
    document = crud.get_one_by_field(collection_name, field, value)
    if not document:
        raise HTTPException(status_code=404, detail=f"Document from {collection_name} not found")
    return {"document": document}

@router.get("/{collection_name}/count")
def count_instances(collection_name : str, filter: str = Query(None, description="JSON dict filter, e.g. {\"role\": \"artist\"}")):
    """Get total document count in a collection with optional filter."""
    count = crud.count_documents(collection_name, filter)
    return {"count": count}

@router.get("/meta/get_field_from_all/{collection}/{field}")
def get_field_from_all(collection: str, field: str):
    """
    Return all distinct values for a given field in the specified collection.
    """
    values = crud.get_field_from_all(collection, field)
    if values is None:
        raise HTTPException(status_code=404, detail=f"Collection '{collection}' not found")
    return {"collection": collection, "field": field, "count": len(values), "values": values}



# ========= Update / Delete =========
@router.put("/{collection_name}/by/{id}")
def update_instance(collection_name : str, id: str, updates: dict):
    """Update a document by ID."""
    result = crud.update_one(collection_name, id, updates)
    
    # Check if document was found (not necessarily modified)
    if result == -1:  # Special return value for "not found"
        raise HTTPException(status_code=404, detail=f"Document from {collection_name} not found")
    
    return {"modified": result, "message": f"Document {id} from {collection_name} updated"}


@router.delete("/{collection_name}/by/{id}")
def delete_instance(collection_name : str, id: str):
    """Delete a document by ID."""
    deleted = crud.delete_one(collection_name, id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document {id} from {collection_name} not found ")
    return {"deleted": deleted, "message": "Document {id} from {collection_name} deleted"}


# ========= Meta =========
@router.get("/meta/list_collection_names")
def list_collection_names():
    """
    Return all collection names in the current MongoDB database.
    """
    names = crud.list_collection_names()
    return {"collections": names}










# pour déconnecter la db et le cache : close_services()

# ==========================================
# USAGE EXAMPLES
# ==========================================

"""
# 1. GET ALL with sorting and projection
GET /api/users?skip=0&limit=10&sort=[["created_at",-1]]&projection={"name":1,"email":1}
Output: {"items": [...], "total": 100, "skip": 0, "limit": 10}

# 2. GET ALL with filtering (e.g., only artists)
GET /api/users?filter={"role":"artist"}
Output: {"items": [...], "total": 25, "skip": 0, "limit": 50}

# 3. GET ALL with combined filters, sort, and projection
GET /api/tracks?filter={"genre":"Jazz"}&sort=[["popularity",-1]]&projection={"title":1,"artist":1}
Output: {"items": [...], "total": 15, "skip": 0, "limit": 50}

# 4. GET BY ID
GET /api/users/67890abcdef12345
Output: {"document": {"_id": "67890...", "name": "Alice", ...}}

# 5. COUNT with filter
GET /api/users/count?filter={"role":"artist"}
Output: {"count": 25}

# 6. COUNT without filter (total documents)
GET /api/users/count
Output: {"count": 100}

# 7. FIND BY FIELD with projection
GET /api/users/by/role/artist?projection={"name":1,"email":1}
Output: {"items": [...], "total": 25, "skip": 0, "limit": 50}

# 8. FIND BY FIELD with pagination
GET /api/tracks/by/genre/Jazz?skip=10&limit=5
Output: {"items": [...], "total": 15, "skip": 10, "limit": 5}

# 9. CREATE
POST /api/users
Body: {"name": "Bob", "email": "bob@example.com", "role": "user"}
Output: {"id": "abc123...", "message": "Document created in users"}

# 10. UPDATE
PUT /api/users/abc123
Body: {"email": "newemail@example.com"}
Output: {"modified": 1, "message": "Document abc123 from users updated"}

# 11. DELETE
DELETE /api/users/abc123
Output: {"deleted": 1, "message": "Document abc123 from users deleted"}


# ==========================================
# PYTHON EQUIVALENT (what happens internally)
# ==========================================

# GET ALL with sort and projection
crud.get_all(
    collection_name="users",
    filter={"role": "artist"},
    skip=0,
    limit=10,
    sort=[("created_at", -1)],
    projection={"name": 1, "email": 1}
)
# Returns: {"items": [...], "total": 25, "skip": 0, "limit": 10}

# COUNT with filter
crud.count_documents(
    collection_name="users",
    filter={"role": "artist"}
)
# Returns: 25

# FIND BY FIELD with projection
crud.find_by_field(
    collection_name="users",
    field="role",
    value="artist",
    skip=0,
    limit=50,
    projection={"name": 1, "email": 1}
)
# Returns: {"items": [...], "total": 25, "skip": 0, "limit": 50}


# ==========================================
# FRONTEND FETCH EXAMPLES (JavaScript)
# ==========================================

// GET ALL with sort and projection
const sortParam = encodeURIComponent(JSON.stringify([["created_at", -1]]));
const projectionParam = encodeURIComponent(JSON.stringify({"name": 1, "email": 1}));
fetch(`/api/users?sort=${sortParam}&projection=${projectionParam}`)

// GET ALL with filter
const filterParam = encodeURIComponent(JSON.stringify({"role": "artist"}));
fetch(`/api/users?filter=${filterParam}`)

// COUNT with filter
fetch(`/api/users/count?filter=${filterParam}`)

// FIND BY FIELD with projection
fetch(`/api/users/by/role/artist?projection=${projectionParam}`)

// CREATE
fetch('/api/users', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({name: "Alice", email: "alice@example.com"})
})

// UPDATE
fetch('/api/users/abc123', {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({email: "newemail@example.com"})
})

// DELETE
fetch('/api/users/abc123', {method: 'DELETE'})
"""