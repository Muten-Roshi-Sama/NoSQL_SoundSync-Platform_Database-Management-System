from pymongo import MongoClient
import os


mongo_uri = os.getenv("MONGO_URI", "mongodb://mongo:27017")
mongo_client = MongoClient(mongo_uri)
db = mongo_client["soundsync_db"]

def connect_to_mongo():
    mongo_client.admin.command("ping")
    print("✅ Connected to MongoDB")

def close_mongo():
    if mongo_client:
        mongo_client.close()
        print("🛑 MongoDB connection closed")


def get_mongo_client():
    return mongo_client

def get_mongo_database():
    return db
