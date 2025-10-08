from fastapi import FastAPI
from app.core import events
from app.api.v1 import health
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="Soundsync API", version="0.1.0")

origins = [
    "http://localhost:3000",  # frontend dev
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


app.include_router(health.router, prefix="/api", tags=["health"])
