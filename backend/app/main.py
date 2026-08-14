from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import models
from .database import engine
from .routers import listings, bookings, users, host, wishlist

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Airbnb Clone API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(users.router)
app.include_router(host.router)
app.include_router(wishlist.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
