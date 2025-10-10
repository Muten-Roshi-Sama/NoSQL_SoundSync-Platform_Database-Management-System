import redis
import os



def connect_to_redis():
    global redis_client
    redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")
    redis_client = redis.Redis.from_url(redis_url)
    redis_client.ping()
    print ("✅ Connected to Redis")


def close_redis():
    global redis_client
    if redis_client:
        redis_client.close()
        print("🛑 Redis connection closed")

