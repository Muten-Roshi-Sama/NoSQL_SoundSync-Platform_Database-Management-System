# from app.db import crud


# COLLECTION = "artists"


# # def get_all_artists(skip: int = 0, limit: int = 50, q: str | None = None):
# #     filt = {"name": {"$regex": q, "$options": "i"}} if q else None
# #     return crud.get_all(collection_name, filter=filt, skip=skip, limit=limit)



# def get_all_artists(skip: int = 0, limit: int = 50):
#     return crud.get_all(COLLECTION, skip=skip, limit=limit)

# def get_artist_by_id(id_or_key: str):
#     return crud.get_by_id(COLLECTION, id_or_key)

# def create_artist(artist_data):
#     return crud.create_one(COLLECTION, artist_data)

# def update_artist(artist_id, updates):
#     return crud.update_one(COLLECTION, artist_id, updates)

# def delete_artist(artist_id):
#     return crud.delete_one(COLLECTION, artist_id)

# def count_artists(filter=None):
#     return crud.count_documents(COLLECTION, filter)

# def find_artists_by_field(field, value, skip=0, limit=50):
#     return crud.find_by_field(COLLECTION, field, value, skip, limit)









