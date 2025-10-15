# from app.db.mongo import db 
# from app.models.user import User
from app.db import crud

# ACCESS DB
# from app.db.mongo import get_mongo_database
# MC = get_mongo_database()

COLLECTION = "users"


def get_all_users(skip: int = 0, limit: int = 50):
    return crud.get_all(COLLECTION, skip=skip, limit=limit)

def get_user_by_id(id_or_key: str):
    return crud.get_by_id(COLLECTION, id_or_key)

def create_user(user_data):
    return crud.create_one(COLLECTION, user_data)

def update_user(user_id, updates):
    return crud.update_one(COLLECTION, user_id, updates)

def delete_user(user_id):
    return crud.delete_one(COLLECTION, user_id)

def count_users(filter=None):
    return crud.count_documents(COLLECTION, filter)

def find_users_by_field(field, value, skip=0, limit=50):
    return crud.find_by_field(COLLECTION, field, value, skip, limit)
