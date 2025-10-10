from app.db.mongo import close_mongo, connect_to_mongo
from app.db.redis import connect_to_redis, close_redis

mongo_client = None
redis_client = None


def connect_to_services():
    connect_to_mongo()
    connect_to_redis()
    print("✅ Connected to MongoDB and Redis")

def close_services():
    close_mongo()
    close_redis()
    print ("❌ Closed connections")
