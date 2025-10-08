import os
from pymongo import MongoClient
import redis

mongo_client = None
redis_client = None

def connect_to_services():
    global mongo_client, redis_client
    mongo_uri = os.getenv("MONGO_URI", "mongodb://mongo:27017")
    redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")

    mongo_client = MongoClient(mongo_uri)
    mongo_client.admin.command("ping")

    redis_client = redis.Redis.from_url(redis_url)
    redis_client.ping()

    print("✅ Connected to MongoDB and Redis")

def close_services():
    global mongo_client
    if mongo_client:
        mongo_client.close()
        print("🛑 MongoDB connection closed")
