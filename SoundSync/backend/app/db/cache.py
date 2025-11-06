from app.db.redis import get_redis_client
import json

REDIS = get_redis_client()

def get_cache(key: str):
    """ Retrieve cached data by key. """
    data = REDIS.get(key)
    if data:
        print(f"[Redis] HIT -> {key}")
        return json.loads(data)
    print(f"[Redis] MISS -> {key}")
    return None

def set_cache(key: str, value: dict, ttl: int = 300):
    """ Set cached data with key and TTL (in seconds). """
    REDIS.setex(key, ttl, json.dumps(value))
    print(f"[Redis] SET -> {key} (TTL={ttl}s)")

def delete_cache(pattern: str):
    """ Delete cached entries matching the pattern. """
    for key in REDIS.scan_iter(pattern):
        REDIS.delete(key)
        print(f"[Redis] DEL -> {key}")

