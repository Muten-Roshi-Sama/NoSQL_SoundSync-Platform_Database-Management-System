import redis
import os

redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
redis_client = redis.Redis.from_url(redis_url)

def connect_to_redis():
    redis_client.ping()
    print ("✅ Connected to Redis")


def close_redis():
    if redis_client:
        redis_client.close()
        print("🛑 Redis connection closed")

def get_redis_client():
    return redis_client