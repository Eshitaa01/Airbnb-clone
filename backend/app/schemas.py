from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime


# ---------- User ----------
class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: str
    avatar_url: str
    is_host: bool
    is_superhost: bool
    bio: str


class UserCreate(BaseModel):
    name: str
    email: str
    is_host: bool = False
    avatar_url: str = ""
    bio: str = ""


# ---------- Amenity ----------
class AmenityOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    icon: str


# ---------- Photo ----------
class PhotoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    url: str
    sort_order: int


class PhotoIn(BaseModel):
    url: str
    sort_order: int = 0


# ---------- Review ----------
class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    rating: int
    comment: str
    created_at: datetime
    author: UserOut


class ReviewCreate(BaseModel):
    booking_id: Optional[int] = None
    rating: int
    comment: str = ""


# ---------- Listing ----------
class ListingCardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    city: str
    country: str
    property_type: str
    room_type: str
    price_per_night: float
    max_guests: int
    bedrooms: int
    beds: int
    bathrooms: float
    photos: List[PhotoOut] = []
    avg_rating: Optional[float] = None
    review_count: int = 0
    is_wishlisted: Optional[bool] = False


class ListingDetailOut(ListingCardOut):
    description: str
    lat: float
    lng: float
    cleaning_fee: float
    service_fee_pct: float
    host: UserOut
    amenities: List[AmenityOut] = []
    reviews: List[ReviewOut] = []
    booked_ranges: List[dict] = []


class ListingCreate(BaseModel):
    title: str
    description: str = ""
    property_type: str = "Apartment"
    room_type: str = "Entire place"
    city: str
    country: str
    lat: float = 0.0
    lng: float = 0.0
    price_per_night: float
    cleaning_fee: float = 40.0
    service_fee_pct: float = 0.12
    max_guests: int = 2
    bedrooms: int = 1
    beds: int = 1
    bathrooms: float = 1.0
    amenity_ids: List[int] = []
    photo_urls: List[str] = []


class ListingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    property_type: Optional[str] = None
    room_type: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    price_per_night: Optional[float] = None
    cleaning_fee: Optional[float] = None
    service_fee_pct: Optional[float] = None
    max_guests: Optional[int] = None
    bedrooms: Optional[int] = None
    beds: Optional[int] = None
    bathrooms: Optional[float] = None
    is_active: Optional[bool] = None
    amenity_ids: Optional[List[int]] = None
    photo_urls: Optional[List[str]] = None


# ---------- Booking ----------
class BookingCreate(BaseModel):
    listing_id: int
    check_in: str
    check_out: str
    guests: int = 1


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    listing_id: int
    guest_id: int
    check_in: str
    check_out: str
    guests: int
    nights: int
    nightly_total: float
    cleaning_fee: float
    service_fee: float
    total_price: float
    status: str
    created_at: datetime
    listing: ListingCardOut


# ---------- Wishlist ----------
class WishlistToggle(BaseModel):
    listing_id: int
