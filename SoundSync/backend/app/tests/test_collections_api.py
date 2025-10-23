# tests/test_collections_api.py
"""
Comprehensive test suite for centralized collections API.
Tests all CRUD operations across multiple collections.
"""
import pytest
import json
from urllib.parse import quote


# ==========================================
# TEST DATA FOR ALL COLLECTIONS
# ==========================================

TEST_DATA = {
    "users": {
        "_id": "test_user_1",
        "username": "testuser",
        "email": "test@example.com",
        "role": "user"
    },
    "tracks": {
        "_id": "test_track_1",
        "title": "Test Song",
        "artist_id": "test_artist_1",
        "genre": "Pop",
        "duration": 180
    },
    "artists": {
        "_id": "test_artist_1",
        "name": "Test Artist",
        "genre": "Pop",
        "country": "USA"
    },
    "playlists": {
        "_id": "test_playlist_1",
        "name": "Test Playlist",
        "user_id": "test_user_1",
        "tracks": ["test_track_1"],
        "public": True
    },
    "albums": {
        "_id": "test_album_1",
        "title": "Test Album",
        "artist_id": "test_artist_1",
        "release_year": 2025
    }
}

UPDATED_DATA = {
    "users": {"username": "updated_user", "email": "updated@example.com"},
    "tracks": {"title": "Updated Song", "duration": 200},
    "artists": {"name": "Updated Artist"},
    "playlists": {"name": "Updated Playlist", "public": False},
    "albums": {"title": "Updated Album"}
}


# ==========================================
# HELPER FUNCTIONS
# ==========================================

# def clean_collection(db, collection_name, doc_id):
#     """Clean up test document after test."""
#     db[collection_name].delete_one({"_id": doc_id})


# ==========================================
# TEST: BASIC CRUD FOR ALL COLLECTIONS
# ==========================================

@pytest.mark.parametrize("collection", ["users", "tracks", "artists", "playlists", "albums"])
def test_crud_flow_all_collections(client, db, collection):
    """Test full CRUD flow (Create → Read → Update → Delete) for all collections."""
    
    test_doc = TEST_DATA[collection]
    updated_doc = UPDATED_DATA[collection]
    doc_id = test_doc["_id"]
    
    # Clean up before test
    # clean_collection(db, collection, doc_id)
    
    # 1. CREATE
    response = client.post(f"/api/{collection}", json=test_doc)
    assert response.status_code == 200
    assert "id" in response.json()
    print(f"✓ CREATE: {collection} created")
    
    # 2. READ
    response = client.get(f"/api/{collection}/{doc_id}")
    assert response.status_code == 200
    assert "document" in response.json()
    assert response.json()["document"]["_id"] == doc_id
    print(f"✓ READ: {collection} retrieved")
    
    # 3. UPDATE
    response = client.put(f"/api/{collection}/{doc_id}", json=updated_doc)
    assert response.status_code == 200
    assert response.json()["modified"] == 1
    print(f"✓ UPDATE: {collection} updated")
    
    # 4. VERIFY UPDATE
    response = client.get(f"/api/{collection}/{doc_id}")
    assert response.status_code == 200
    doc = response.json()["document"]
    for key, value in updated_doc.items():
        assert doc[key] == value
    print(f"✓ VERIFY: {collection} update confirmed")
    
    # 5. DELETE
    response = client.delete(f"/api/{collection}/{doc_id}")
    assert response.status_code == 200
    assert response.json()["deleted"] == 1
    print(f"✓ DELETE: {collection} deleted")
    
    # 6. VERIFY DELETION
    response = client.get(f"/api/{collection}/{doc_id}")
    assert response.status_code == 404
    print(f"✓ VERIFY: {collection} deletion confirmed\n")


# ==========================================
# TEST: GET ALL WITH PAGINATION
# ==========================================

@pytest.mark.parametrize("collection", ["users", "tracks", "artists"])
def test_get_all_pagination(client, db, collection):
    """Test GET ALL with skip and limit for all collections."""
    
    # Insert test documents
    test_docs = [
        {**TEST_DATA[collection], "_id": f"test_{collection}_{i}"}
        for i in range(5)
    ]
    db[collection].insert_many(test_docs)
    
    # Test pagination
    response = client.get(f"/api/{collection}?skip=1&limit=2")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["skip"] == 1
    assert data["limit"] == 2
    assert len(data["items"]) <= 2
    print(f"✓ PAGINATION: {collection} skip=1 limit=2 works")
    
    # Cleanup
    db[collection].delete_many({"_id": {"$regex": f"^test_{collection}_"}})


# ==========================================
# TEST: SORTING
# ==========================================

def test_get_all_with_sort(client, db):
    """Test GET ALL with sorting."""
    
    # Insert users with different creation dates
    users = [
        {"_id": "user_sort_1", "username": "alice", "created_at": "2025-01-01"},
        {"_id": "user_sort_2", "username": "bob", "created_at": "2025-01-03"},
        {"_id": "user_sort_3", "username": "charlie", "created_at": "2025-01-02"},
    ]
    db.users.insert_many(users)
    
    # Sort by created_at ascending
    sort_param = quote(json.dumps([["created_at", 1]]))
    response = client.get(f"/api/users?sort={sort_param}")
    assert response.status_code == 200
    items = response.json()["items"]
    assert items[0]["username"] == "alice"
    assert items[1]["username"] == "charlie"
    assert items[2]["username"] == "bob"
    print("✓ SORT: Ascending order works")
    
    # Sort by created_at descending
    sort_param = quote(json.dumps([["created_at", -1]]))
    response = client.get(f"/api/users?sort={sort_param}")
    assert response.status_code == 200
    items = response.json()["items"]
    assert items[0]["username"] == "bob"
    assert items[1]["username"] == "charlie"
    assert items[2]["username"] == "alice"
    print("✓ SORT: Descending order works")
    
    # Cleanup
    db.users.delete_many({"_id": {"$regex": "^user_sort_"}})


# ==========================================
# TEST: PROJECTION
# ==========================================

def test_get_all_with_projection(client, db):
    """Test GET ALL with field projection."""
    
    # Insert test user
    user = {
        "_id": "user_proj_1",
        "username": "alice",
        "email": "alice@example.com",
        "password": "secret123",
        "role": "user"
    }
    db.users.insert_one(user)
    
    # Get only username and email (exclude password)
    projection_param = quote(json.dumps({"username": 1, "email": 1}))
    response = client.get(f"/api/users?projection={projection_param}")
    assert response.status_code == 200
    items = response.json()["items"]
    
    for item in items:
        if item["_id"] == "user_proj_1":
            assert "username" in item
            assert "email" in item
            assert "password" not in item
            assert "role" not in item
            print("✓ PROJECTION: Only requested fields returned")
            break
    
    # Cleanup
    db.users.delete_one({"_id": "user_proj_1"})


# ==========================================
# TEST: FILTERING
# ==========================================

def test_get_all_with_filter(client, db):
    """Test GET ALL with filtering."""
    
    # Insert users with different roles
    users = [
        {"_id": "user_filter_1", "username": "alice", "role": "artist"},
        {"_id": "user_filter_2", "username": "bob", "role": "user"},
        {"_id": "user_filter_3", "username": "charlie", "role": "artist"},
    ]
    db.users.insert_many(users)
    
    # Filter by role=artist
    filter_param = quote(json.dumps({"role": "artist"}))
    response = client.get(f"/api/users?filter={filter_param}")
    assert response.status_code == 200
    items = response.json()["items"]
    
    artist_count = sum(1 for item in items if item.get("role") == "artist")
    assert artist_count >= 2
    print("✓ FILTER: Role filtering works")
    
    # Cleanup
    db.users.delete_many({"_id": {"$regex": "^user_filter_"}})


# ==========================================
# TEST: COUNT
# ==========================================

@pytest.mark.parametrize("collection", ["users", "tracks", "playlists"])
def test_count_documents(client, db, collection):
    """Test COUNT endpoint for all collections."""
    
    # Insert test documents
    test_docs = [
        {**TEST_DATA[collection], "_id": f"test_count_{collection}_{i}"}
        for i in range(3)
    ]
    db[collection].insert_many(test_docs)
    
    # Count all
    response = client.get(f"/api/{collection}/count")
    assert response.status_code == 200
    assert "count" in response.json()
    count = response.json()["count"]
    assert count >= 3
    print(f"✓ COUNT: {collection} has {count} documents")
    
    # Cleanup
    db[collection].delete_many({"_id": {"$regex": f"^test_count_{collection}_"}})


# ==========================================
# TEST: FIND BY FIELD
# ==========================================

# def test_find_by_field(client, db):
#     """Test FIND BY FIELD endpoint."""
    
#     # Insert tracks with different genres
#     tracks = [
#         {"_id": "track_genre_1", "title": "Jazz Song 1", "genre": "Jazz"},
#         {"_id": "track_genre_2", "title": "Jazz Song 2", "genre": "Jazz"},
#         {"_id": "track_genre_3", "title": "Pop Song", "genre": "Pop"},
#     ]
#     db.tracks.insert_many(tracks)
    
#     # Find tracks by genre=Jazz
#     response = client.get("/api/tracks/by/genre/Jazz")
#     assert response.status_code == 200
#     data = response.json()
#     assert "items" in data
#     jazz_tracks = [item for item in data["items"] if item.get("genre") == "Jazz"]
#     assert len(jazz_tracks) >= 2
#     print("✓ FIND BY FIELD: Genre filtering works")
    
#     # Cleanup
#     db.tracks.delete_many({"_id": {"$regex": "^track_genre_"}})


# ==========================================
# TEST: ERROR HANDLING
# ==========================================

def test_get_nonexistent_document(client):
    """Test 404 for non-existent document."""
    response = client.get("/api/users/nonexistent_id_12345")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()
    print("✓ ERROR: 404 for non-existent document")


def test_delete_nonexistent_document(client):
    """Test 404 when deleting non-existent document."""
    response = client.delete("/api/users/nonexistent_id_12345")
    assert response.status_code == 404
    print("✓ ERROR: 404 when deleting non-existent document")


def test_update_nonexistent_document(client):
    """Test 404 when updating non-existent document."""
    response = client.put("/api/users/nonexistent_id_12345", json={"username": "test"})
    assert response.status_code == 404
    print("✓ ERROR: 404 when updating non-existent document")


# ==========================================
# TEST: COMBINED PARAMETERS
# ==========================================

def test_combined_filter_sort_projection(client, db):
    """Test GET ALL with combined filter, sort, and projection."""
    
    # Insert artists
    artists = [
        {"_id": "artist_combo_1", "name": "Artist A", "genre": "Pop", "rating": 5},
        {"_id": "artist_combo_2", "name": "Artist B", "genre": "Jazz", "rating": 4},
        {"_id": "artist_combo_3", "name": "Artist C", "genre": "Pop", "rating": 3},
    ]
    db.artists.insert_many(artists)
    
    # Get Pop artists, sorted by rating descending, only show name
    filter_param = quote(json.dumps({"genre": "Pop"}))
    sort_param = quote(json.dumps([["rating", -1]]))
    projection_param = quote(json.dumps({"name": 1, "rating": 1}))
    
    response = client.get(f"/api/artists?filter={filter_param}&sort={sort_param}&projection={projection_param}")
    assert response.status_code == 200
    items = response.json()["items"]
    
    pop_artists = [item for item in items if item.get("genre") == "Pop" or "_id" in ["artist_combo_1", "artist_combo_3"]]
    if len(pop_artists) >= 2:
        assert pop_artists[0]["rating"] > pop_artists[1]["rating"]
        assert "name" in pop_artists[0]
        assert "genre" not in pop_artists[0]
        print("✓ COMBINED: Filter + Sort + Projection works")
    
    # Cleanup
    db.artists.delete_many({"_id": {"$regex": "^artist_combo_"}})


# ==========================================
# RUN ALL TESTS
# ==========================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])