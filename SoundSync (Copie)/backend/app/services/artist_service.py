from app.db import crud


collection_name = "artists"


def get_all_artists(skip: int = 0, limit: int = 50, q: str | None = None):
    filt = {"name": {"$regex": q, "$options": "i"}} if q else None
    return crud.get_all(collection_name, filter=filt, skip=skip, limit=limit)




def get_artist_by_id(id_or_key: str):
    return crud.get_by_id(collection_name, id_or_key)








