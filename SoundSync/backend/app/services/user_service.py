from app.db.mongo import db 
from app.models.user import User

def create_user(user: User):
    result = db["users"].insert_one(user.dict())
    return { "id": str(result.inserted_id), **user.dict() }

def get_all_users():
    return db["users"].find()

# essaye de trouver un utilisateur avec l'email qu'il propose
def get_user(mailAttempt:str):
    user = db["users"].find_one({"email":mailAttempt}) 
    return user

