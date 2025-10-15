from pymongo import MongoClient
import os

def connect_to_mongo():
    global mongo_client, db
    mongo_uri = os.getenv("MONGO_URI", "mongodb://mongo:27017")
    mongo_client = MongoClient(mongo_uri)
    
    mongo_client.admin.command("ping")

    db = mongo_client["soundsync_db"]

    print("✅ Connected to MongoDB")

def close_mongo():
    global mongo_client
    if mongo_client:
        mongo_client.close()
        print("🛑 MongoDB connection closed")
