# # db/collections.py
# # import pprint
# # import json, os
# from app.db.mongo import mongo_client
# from app.db.redis import redis_client

# MC = mongo_client
# REDIS = redis_client


# ARTISTS = MC["artists"]
# ALBUMS = MC["albums"]
# TRACKS = MC["tracks"]
# CONCERTS = MC["concerts"]
# GENRES = MC["genres"]

# USERS = MC["users"]
# LIKES = MC["likes"]
# COMMENTS = MC["comments"]
# PLAYLISTS = MC["playlists"]
# SUBSCRIPTIONS = MC["subscriptions"]




# # def get_db():
# #     return MC["moviesdb"]

# # def get_movies_collection():
# #     return get_db()["movies"]

# # def showDB():
# #     """Prints all documents in the movies collection."""
# #     movies = get_movies_collection()
# #     all_movies = list(movies.find())
    
# #     if not all_movies:
# #         print("Database empty (movies collection).")
# #         return
    
# #     pprint.pprint(all_movies)


# # def cleanup(print):
# #     db = get_db()
# #     db.drop_collection("movies")
# #     if print : print("[cleanup] Dropped 'movies' collection.")
# #     showDB()











