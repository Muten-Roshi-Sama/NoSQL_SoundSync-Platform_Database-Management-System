# tests/test_users_api.py
import pytest
from fastapi.testclient import TestClient

# Test data - shared across all functions
TEST_USER = {
    "_id": "test_user_crud",
    "username": "testuser",
    "email": "test@example.com"
}

UPDATED_USER = {
    "username": "updated_testuser",
    "email": "updated@example.com"
}


def test_create_user(client, db):
    """Test CREATE: Add a new user"""
    collection = db.users
    initial_count = collection.count_documents({})
    
    response = client.post("/api/users/", json=TEST_USER)
    assert response.status_code == 200
    assert "user_id" in response.json()
    
    # Verify it was added
    assert collection.count_documents({}) == initial_count + 1
    print("✓ CREATE: User created successfully")


def test_read_user(client, db):
    """Test READ: Get the user by ID"""
    user_id = TEST_USER["_id"]
    
    response = client.get(f"/api/users/{user_id}")
    assert response.status_code == 200
    
    user_data = response.json()["user"]
    assert user_data["username"] == TEST_USER["username"]
    assert user_data["email"] == TEST_USER["email"]
    print("✓ READ: User retrieved successfully")


def test_update_user(client, db):
    """Test UPDATE: Modify the user"""
    user_id = TEST_USER["_id"]
    
    response = client.put(f"/api/users/{user_id}", json=UPDATED_USER)
    assert response.status_code == 200
    assert response.json()["modified"] == 1
    print("✓ UPDATE: User updated successfully")


def test_read_updated_user(client, db):
    """Test READ: Verify the update worked"""
    user_id = TEST_USER["_id"]
    
    response = client.get(f"/api/users/{user_id}")
    assert response.status_code == 200
    
    user_data = response.json()["user"]
    assert user_data["username"] == UPDATED_USER["username"]
    assert user_data["email"] == UPDATED_USER["email"]
    print("✓ READ: Updated user verified")


def test_delete_user(client, db):
    """Test DELETE: Remove the user"""
    collection = db.users
    initial_count = collection.count_documents({})
    user_id = TEST_USER["_id"]
    
    response = client.delete(f"/api/users/{user_id}")
    assert response.status_code == 200
    assert response.json()["deleted"] == 1
    
    # Verify deletion
    verify_response = client.get(f"/api/users/{user_id}")
    assert verify_response.status_code == 404
    
    # Verify count restored
    final_count = collection.count_documents({})
    assert final_count == initial_count - 1
    print("✓ DELETE: User deleted and verified")


# Run tests in order when executed directly
if __name__ == "__main__":
    import sys
    sys.path.insert(0, "..")  # Add parent directory to path
    
    from app.main import app
    from app.core import events
    from app.db.mongo import get_mongo_database
    from fastapi.testclient import TestClient
    
    # Setup
    events.connect_to_services()
    client = TestClient(app)
    db = get_mongo_database()
    
    print("\n=== Running Users API CRUD Tests ===\n")
    
    try:
        # Run tests in order
        test_create_user(client, db)
        test_read_user(client, db)
        test_update_user(client, db)
        test_read_updated_user(client, db)
        test_delete_user(client, db)
        
        print("\n✅ All tests passed!\n")
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}\n")
    finally:
        # Cleanup
        events.close_services()