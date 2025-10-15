# db/crud.py

# from flask import jsonify
from app.db.collections import *
from app.db.mongo import get_mongo_database
from app.db.redis import get_redis_client
import json

MC = get_mongo_database()
REDIS = get_redis_client()

DEBUG_CRUD = True

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


#*------------CRUD-----------
# 1. CRUD (Create, Read, Update, Delete) operations

# def create_instance(collection, data):
#     """ Add instance to collection. Dynamically checks if provided data matches fields into already existing instances.
#         Expects collection name to be a string.
#     """
#     if not collection_exists(collection): return print(f"Collection {collection} not found..")

#     # Find collection
#     coll = MC[collection.lower()]
#     data = data.get_json()

#     # Get ALL fields that already exist in this collection
#     available_fields = get_collection_fields(coll)

#     if not available_fields:
#             # If collection is empty, we can't determine fields - accept anything
#             result = coll.insert_one(data)
#             print("Item added successfully to {collection} collection. (Collection was empty, so any fields accepted.)")
#             # REDIS: Invalidate list caches and optionally cache the new item
#                 # new_id = str(result.inserted_id)
#                 # redis_cache.delete_pattern(f"{collection}:list*")
#                 # redis_cache.set_json(redis_cache.make_id_key(collection, new_id), {**new_data, "_id": new_id})
#             return
#     else :
#         # Validate that at least some known fields are provided
#         provided_fields = set(data.keys())
#         known_fields = set(available_fields)
    
#         # Check if any provided fields match the collection's known fields
#         matching_fields = provided_fields.intersection(known_fields)
    
#         if not matching_fields:
#             print(f"[create_instance] No matching fields found for {collection} collection.")
#             print(f"available_fields: {available_fields}")
#             print(f"provided_fields: {provided_fields}")
#             return
    
#         # Insert into the correct collection
#         result = coll.insert_one(data)
    
#         # REDIS: Invalidate list caches and cache new item (works for all collections)
#             # new_id = str(result.inserted_id)
#             # redis_cache.delete_pattern(f"{collection}:list*")
#             # redis_cache.set_json(redis_cache.make_id_key(collection, new_id), {**new_data, "_id": new_id})
#     return


# def read_instance(collection, lookup_value):
#     pass

# def update_instance_by_field(collection, field):
#     pass

# def delete_instance(collection, identifier):
#     pass







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




# def collection_exists(collection_name):
#     """Check if a collection exists in the database."""
#     return collection_name in MC.list_collection_names()

# def get_collection_fields(collection_name):
#     """Get ALL field names from existing documents in the collection"""
#     try:
#         collection = MC[collection_name]
        
#         # Get the first document to analyze its structure
#         sample_doc = collection.find_one()
        
#         if not sample_doc:
#             # If collection is empty, return empty list or basic fields
#             return []  # or return ['name', 'type'] if you want defaults
        
#         # Return all field names except MongoDB internal fields
#         all_fields = [key for key in sample_doc.keys() if key not in ['_id', '__v']]
#         return all_fields
        
#     except Exception as e:
#         print(f"Error analyzing collection {collection_name}: {e}")
#         return []  # Return empty list on error

