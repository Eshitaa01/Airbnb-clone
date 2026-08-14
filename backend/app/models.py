from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, Table
)
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

listing_amenities = Table(
    "listing_amenities",
    Base.metadata,
    Column("listing_id", Integer, ForeignKey("listings.id"), primary_key=True),
    Column("amenity_id", Integer, ForeignKey("amenities.id"), primary_key=True),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    avatar_url = Column(String, default="")
    is_host = Column(Boolean, default=False)
    is_superhost = Column(Boolean, default=False)
    bio = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    listings = relationship("Listing", back_populates="host", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="guest", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="author", cascade="all, delete-orphan")
    wishlist_items = relationship("Wishlist", back_populates="user", cascade="all, delete-orphan")


class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    icon = Column(String, default="check")


class Listing(Base):
    __tablename__ = "listings"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, default="")
    property_type = Column(String, default="Apartment")
    room_type = Column(String, default="Entire place")
    city = Column(String, nullable=False)
    country = Column(String, nullable=False)
    lat = Column(Float, default=0.0)
    lng = Column(Float, default=0.0)
    price_per_night = Column(Float, nullable=False)
    cleaning_fee = Column(Float, default=40.0)
    service_fee_pct = Column(Float, default=0.12)
    max_guests = Column(Integer, default=2)
    bedrooms = Column(Integer, default=1)
    beds = Column(Integer, default=1)
    bathrooms = Column(Float, default=1.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    host = relationship("User", back_populates="listings")
    photos = relationship("Photo", back_populates="listing", cascade="all, delete-orphan", order_by="Photo.sort_order")
    amenities = relationship("Amenity", secondary=listing_amenities)
    bookings = relationship("Booking", back_populates="listing", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="listing", cascade="all, delete-orphan")


class Photo(Base):
    __tablename__ = "photos"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    url = Column(String, nullable=False)
    sort_order = Column(Integer, default=0)

    listing = relationship("Listing", back_populates="photos")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    guest_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    check_in = Column(String, nullable=False)   # ISO date string YYYY-MM-DD
    check_out = Column(String, nullable=False)  # ISO date string YYYY-MM-DD
    guests = Column(Integer, default=1)
    nights = Column(Integer, nullable=False)
    nightly_total = Column(Float, nullable=False)
    cleaning_fee = Column(Float, default=0.0)
    service_fee = Column(Float, default=0.0)
    total_price = Column(Float, nullable=False)
    status = Column(String, default="confirmed")  # confirmed | cancelled | completed
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("Listing", back_populates="bookings")
    guest = relationship("User", back_populates="bookings")
    review = relationship("Review", back_populates="booking", uselist=False)


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=True)
    author_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    listing = relationship("Listing", back_populates="reviews")
    booking = relationship("Booking", back_populates="review")
    author = relationship("User", back_populates="reviews")


class Wishlist(Base):
    __tablename__ = "wishlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    listing_id = Column(Integer, ForeignKey("listings.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="wishlist_items")
    listing = relationship("Listing")
