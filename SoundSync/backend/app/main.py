from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core import events
from fastapi.staticfiles import StaticFiles
import os

# import all routers
from app.api.v1 import health_api as health
from app.api.v1 import init_db_api as init_db
# from app.api.v1 import users_api as users
from app.api.v1 import collections_api as coll
# from app.api.v1 import tracks_api as tracks
# from app.api.v1 import artists_api as artists
# from app.api.v1 import albums_api as albums
# from app.api.v1 import playlists_api as playlists
# from app.api.v1 import concerts_api as concerts
# etc...



app = FastAPI(title="Soundsync API", version="0.1.0")


static_path = os.path.join(os.path.dirname(__file__), "static") 
print("Static files path:", static_path) 
app.mount("/static", StaticFiles(directory=static_path), name="static")

origins = [
    "http://localhost:3000",  # frontend dev
    "http://localhost:5137"   # Vite ? 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # ou ["*"] pour autoriser tous les domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    events.connect_to_services()

@app.on_event("shutdown")
def shutdown_event():
    events.close_services()

# page test health
@app.get("/")
def read_root():
    return {"message": "Welcome to the Soundsync API! DB connected."}



# =====================================================================
# Path Logic :
    # Check tests/test_collections_api.py for implementations and examples
    # -----------Api-----------------------------------
    # Init db         (POST)   :   /api/init_db
    # Clean db        (POST)   :   /api/clean_db
    # ----------CRUDs---------------------------------
    # List all	      (GET)    :   /crud/tracks	
    # Get by id	      (GET)    :   /crud/tracks/by/{id_or_key}
    # Count           (GET)    :   /crud/count
    # Filter/search	  (POST)   :   /crud/tracks?genre=Jazz&q=love     (same function as List all...)
    # Create	      (POST)   :   /crud/tracks
    # Update	      (POST)   :   /crud/tracks/{track_id}
    # Delete	      (POST)   :   /crud/tracks/{track_id}




# CRUD - centralized
app.include_router(coll.router,prefix="/crud" )

# MISC
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(init_db.router, prefix="/api", tags=["init_db", "clean_db"])




# # Users
# app.include_router(users.router, prefix="/api/users", tags=["users"])

# Artists
# app.include_router(artists.router, prefix="/api/artists", tags=["artists"])

# Tracks
# app.include_router(tracks.router, prefix="/api/tracks", tags=["tracks"])

# Albums
# app.include_router(albums.router, prefix="/api/albums", tags=["albums"])

# Playlists
# app.include_router(playlists.router, prefix="/api/playlists", tags=["playlists"])

# Concerts
# app.include_router(concerts.router, prefix="/api/concerts", tags=["concert





