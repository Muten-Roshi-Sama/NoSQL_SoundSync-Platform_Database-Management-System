from fastapi import APIRouter, Query, HTTPException

from app.db import crud, cache
import json

router = APIRouter()



# ========= Create / Read =========
@router.post("/{collection_name}")
def create_instance(collection_name : str, document_data: dict):
    """Create a new document in the collection."""
    doc_id = crud.create_one(collection_name, document_data)

    # Cache invalidation
    cache.delete_cache(f"{collection_name}:*")

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

    #cache key
    cache_key = f"{collection_name}:{json.dumps(filter_val, sort_keys=True)}:{skip}:{limit}:{sort_val}:{projection_val}"

    cached = cache.get_cache(cache_key)
    if cached:
        return cached


    result = crud.get_all(collection_name, filter=filter_val, skip=skip, limit=limit, sort=sort_val, projection=projection_val)
    return result

@router.get("/{collection_name}/by/{field}/{value}")
def get_instance(collection_name : str, field:str, value: str):
    """Get a single document by ID."""

    cache_key = f"{collection_name}:{field}:{value}"

    cached = cache.get_cache(cache_key)
    if cached:
        return cached

    document = crud.get_one_by_field(collection_name, field, value)
    if not document:
        raise HTTPException(status_code=404, detail=f"Document from {collection_name} not found")
    return {"document": document}

@router.get("/{collection_name}/count")
def count_instances(collection_name : str, filter: str = Query(None, description="JSON dict filter, e.g. {\"role\": \"artist\"}")):
    """Get total document count in a collection with optional filter."""
    cache_key = f"{collection_name}:count:{filter or 'all'}"
    cached = cache.get_cache(cache_key)
    if cached:
        return cached

    count = crud.count_documents(collection_name, filter)
    data = {"count": count}
    cache.set_cache(cache_key, data, ttl=1800)
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
    

    # Cache invalidation
    cache.delete_cache(f"{collection_name}:*")

    return {"modified": result, "message": f"Document {id} from {collection_name} updated"}


@router.delete("/{collection_name}/by/{id}")
def delete_instance(collection_name : str, id: str):
    """Delete a document by ID."""
    deleted = crud.delete_one(collection_name, id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Document {id} from {collection_name} not found ")
    
    # Cache invalidation
    cache.delete_cache(f"{collection_name}:*")

    
    return {"deleted": deleted, "message": "Document {id} from {collection_name} deleted"}


# ========= Meta =========
@router.get("/meta/list_collection_names")
def list_collection_names():
    """
    Return all collection names in the current MongoDB database.
    """
    names = crud.list_collection_names()
    return {"collections": names}



