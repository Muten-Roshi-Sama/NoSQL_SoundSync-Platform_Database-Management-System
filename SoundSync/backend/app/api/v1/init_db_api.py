
import app.db.crud as crud
from fastapi import APIRouter

router = APIRouter()


@router.post("/init_db")
def init_db():
    # print("TEST OK")
    crud.init_database("ALL")
    return {"message": "Database initialized with sample data."}


@router.post("/clean_db")
def clean_db():
    """Drop all collections dynamically."""
    from app.db.mongo import get_mongo_database
    db = get_mongo_database()
    
    # Get all collection names in the database
    collection_names = db.list_collection_names()
    
    dropped_count = 0
    for coll_name in collection_names:
        try:
            db[coll_name].drop()
            dropped_count += 1
            print(f"✓ Dropped collection: {coll_name}")
        except Exception as e:
            print(f"✗ Error dropping {coll_name}: {e}")
    
    return {
        "message": f"Database cleaned. {dropped_count} collections dropped.",
        "collections_dropped": collection_names
    }


