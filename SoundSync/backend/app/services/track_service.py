from app.db import crud


COLLECTION = "tracks"


def get_all_tracks(skip: int = 0, limit: int = 50):
    return crud.get_all(COLLECTION, skip=skip, limit=limit)

def get_track_by_id(id_or_key: str):
    return crud.get_by_id(COLLECTION, id_or_key)

def create_track(track_data):
    return crud.create_one(COLLECTION, track_data)

def update_track(track_id, updates):
    return crud.update_one(COLLECTION, track_id, updates)

def delete_track(track_id):
    return crud.delete_one(COLLECTION, track_id)

def count_tracks(filter=None):
    return crud.count_documents(COLLECTION, filter)

def find_tracks_by_field(field, value, skip=0, limit=50):
    return crud.find_by_field(COLLECTION, field, value, skip, limit)
