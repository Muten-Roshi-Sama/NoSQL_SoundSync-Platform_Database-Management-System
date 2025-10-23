from app.db import crud


COLLECTION = "playlists"


def get_all_playlists(skip: int = 0, limit: int = 50):
    return crud.get_all(COLLECTION, skip=skip, limit=limit)

def get_playlist_by_id(id_or_key: str):
    return crud.get_by_id(COLLECTION, id_or_key)

def create_playlist(playlist_data):
    return crud.create_one(COLLECTION, playlist_data)

def update_playlist(playlist_id, updates):
    return crud.update_one(COLLECTION, playlist_id, updates)

def delete_playlist(playlist_id):
    return crud.delete_one(COLLECTION, playlist_id)

def count_playlists(filter=None):
    return crud.count_documents(COLLECTION, filter)

def find_playlists_by_field(field, value, skip=0, limit=50):
    return crud.find_by_field(COLLECTION, field, value, skip, limit)
