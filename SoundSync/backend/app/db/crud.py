# db/crud.py

# from flask import jsonify
from app.db.collections import *
from app.db.mongo import get_mongo_database
from app.db.redis import get_redis_client
import json

MC = get_mongo_database()
REDIS = get_redis_client()

DEBUG_CRUD = True


#* ------------Helpers------------
def load_json(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def clean_collection(collection, print_debug=True):
    try:
        MC.drop_collection(collection)
        if print_debug: print(f"[clean_collection] Dropped '{collection}' collection.")
            # return jsonify({"message": f"Dropped '{collection}' collection."})
    except Exception as e:
        print(f"Error dropping collection {collection}: {e}")
        # return jsonify({"error": str(e)}), 500





# ------- Init DB with sample data --------
PATHS = {
    # --- Artists  ---
    "ARTISTS": "app/data/Artists/artists.json",
    "ALBUMS" : "app/data/Artists/albums.json",
    "TRACKS" : "app/data/Artists/tracks.json",
    "CONCERTS" : "app/data/Artists/concerts.json",
    "GENRES" : "app/data/Artists/genres.json",
    # --- Users ----
    "USERS" : "app/data/Users/users.json",
    "LIKES" : "app/data/Users/likes.json",
    "COMMENTS" : "app/data/Users/comments.json",
    "PLAYLISTS" : "app/data/Users/playlists.json",
    "SUBSCRIPTIONS" : "app/data/Users/subscriptions.json",
    }

def init_database(action):
    try :
        if action == "ALL":
            if DEBUG_CRUD : print(f"[init_database] Loading all collections...")
            for key, path in PATHS.items():
                collection = MC[key.lower()]
                data = load_json(path)
                if DEBUG_CRUD : print(f"Loading data : '{key}' from '{path}'")
                if data:
                    clean_collection(collection, print_debug = False)
                    collection.insert_many(data)
        else:
            collection = MC[action.lower()]
            data = load_json(PATHS[action])
            if DEBUG_CRUD : print(f"[init_database] Loading data : '{action}' from '{PATHS[action]}'")
            if data:
                clean_collection(collection, print_debug = False)
                collection.insert_many(data)
            else:
                print(f"Unknown collection: {action}")
    except Exception as e:
        print(f"[init_database] Error : {e}")



# ---------- CRUD Operations ----------
from bson import ObjectId
from typing import Any, Dict, List, Optional, Tuple

MAX_LIMIT = 200 # Avoid accidental huge scans

def _to_str_id(doc: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

def _id_query(id_or_key: str) -> Dict[str, Any]:
    """Accepts either a 24-char ObjectId or a string key (like 'user1')."""
    return {"_id": ObjectId(id_or_key)} if ObjectId.is_valid(id_or_key) else {"_id": id_or_key}



# ===================== CRUD Methods ================
# ------ Create / Read -------
def create_one(collection_name: str, data: Dict[str, Any]) -> str:
    """
    Insert one document; returns inserted id as string.
    """
    if collection_name in list_collection_names(): 
        coll = MC[collection_name]
        res = coll.insert_one(data)
        return str(res.inserted_id)
    else:
        return "Collection doesn't exist. Try again."


# --------- Read --------------
def get_all(
    collection_name: str,
    filter: Optional[Dict[str, Any]] = None,
    skip: int = 0,
    limit: int = 50,
    sort: Optional[List[Tuple[str, int]] | Tuple[str, int]] = None,
    projection: Optional[Dict[str, int]] = None,
    ) -> Dict[str, Any]:
    """
    List documents from any collection with pagination and optional sort/projection.
    Returns: {"items": [...], "total": N, "skip": X, "limit": Y}
    """
    coll = MC[collection_name]
    q = filter or {}
    s = max(0, int(skip))
    l = max(1, min(int(limit), MAX_LIMIT))

    cursor = coll.find(q, projection)
    if sort:
        # Support single tuple or list of tuples
        cursor = cursor.sort(sort if isinstance(sort, list) else [sort])
    cursor = cursor.skip(s).limit(l)

    items = [_to_str_id(doc) for doc in cursor]
    total = coll.count_documents(q)
    return {"items": items, "total": total, "skip": s, "limit": l}

def get_one_by_field(collection_name: str, field: str, value: Any) -> Optional[Dict[str, Any]]:
    """
    Fetch a single document by any field and value.
    """
    coll = MC[collection_name]
    if field == "_id":
        try:
            value = ObjectId(value)
        except Exception:
            return None
    doc = coll.find_one({field: value})
    return _to_str_id(doc) if doc else None

def count_documents(
    collection_name: str, 
    filter: Optional[Dict[str, Any]] = None
    ) -> int:
    coll = MC[collection_name]
    return coll.count_documents(filter or {})

def get_field_from_all(collection: str, field: str):
    """
    Return all distinct values for a given field in the specified collection.
    """
    if collection not in MC.list_collection_names():
        return None
    values = MC[collection].distinct(field)
    # Remove None/empty values and sort
    values = [v for v in values if v not in (None, "", [])]
    try:
        values = sorted(values, key=lambda x: x.lower() if isinstance(x, str) else x)
    except Exception:
        pass
    return values




# ------- Update / Delete --------
def update_one(collection_name: str, id_or_key: str, updates: Dict[str, Any]) -> int:
    """
    Update fields of one document; returns modified_count.
    """
    coll = MC[collection_name]
    res = coll.update_one(_id_query(id_or_key), {"$set": updates})
    return res.modified_count
def delete_one(collection_name: str, id_or_key: str) -> int:
    """
    Delete one document; returns deleted_count.
    """
    coll = MC[collection_name]
    res = coll.delete_one(_id_query(id_or_key))
    return res.deleted_count


# ---------- Meta -------------
def list_collection_names():
    """
    Return all collection names in the current MongoDB database.
    """
    return sorted(MC.list_collection_names())






