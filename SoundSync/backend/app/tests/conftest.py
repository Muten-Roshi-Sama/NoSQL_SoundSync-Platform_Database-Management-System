# tests/conftest.py
import pytest
import os
from fastapi.testclient import TestClient

# CRITICAL: Set MongoDB URI to localhost BEFORE importing app modules
os.environ["MONGO_URI"] = "mongodb://localhost:27017"
os.environ["REDIS_URL"] = "redis://localhost:6379"

# Now import app modules (they'll use the overridden env vars)
from app.main import app
from app.core import events
from app.db.mongo import get_mongo_database




@pytest.fixture(scope="module")
def client():
    """
    Create a test client for the FastAPI app.
    Shared across ALL tests.
    """
    events.connect_to_services()
    test_client = TestClient(app)
    yield test_client
    events.close_services()


@pytest.fixture(scope="function")
def db():
    return get_mongo_database()


@pytest.fixture(scope="function", autouse=True)
def cleanup_test_data(db):
    """Automatically clean up test data after each test."""
    yield
    # Clean up any documents with test IDs
    collections = ["users", "tracks", "artists", "playlists", "albums"]
    for coll in collections:
        db[coll].delete_many({"_id": {"$regex": "^test_"}})