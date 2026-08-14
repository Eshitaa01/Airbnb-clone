from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, or_
from typing import Optional, List
from datetime import date

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user, get_current_user_optional

router = APIRouter(prefix="/api/listings", tags=["listings"])


def _with_rating(
    db: Session,
    listing: models.Listing,
    user_id: Optional[int] = None,
):
    agg = (
        db.query(
            func.avg(models.Review.rating),
            func.count(models.Review.id),
        )
        .filter(models.Review.listing_id == listing.id)
        .first()
    )

    avg_rating = round(agg[0], 2) if agg and agg[0] else None
    review_count = agg[1] if agg else 0

    is_wishlisted = False

    if user_id:
        is_wishlisted = (
            db.query(models.Wishlist)
            .filter(
                models.Wishlist.user_id == user_id,
                models.Wishlist.listing_id == listing.id,
            )
            .first()
            is not None
        )

    return avg_rating, review_count, is_wishlisted


@router.get("")
def search_listings(
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional),
    location: Optional[str] = Query(None),
    check_in: Optional[str] = None,
    check_out: Optional[str] = None,
    guests: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    property_type: Optional[str] = None,
    room_type: Optional[str] = None,
    amenity_ids: Optional[str] = None,
    page: int = 1,
    page_size: int = 12,
):
    q = (
        db.query(models.Listing)
        .options(
            joinedload(models.Listing.photos),
            joinedload(models.Listing.bookings),
        )
        .filter(models.Listing.is_active == True)
    )

    if location:
        parts = [p.strip().lower() for p in location.split(",")]

        if len(parts) == 2:
            city, country = parts

            q = q.filter(
                func.lower(models.Listing.city) == city,
                func.lower(models.Listing.country) == country,
            )

        else:
            like = f"%{location.lower()}%"

            q = q.filter(
                or_(
                    func.lower(models.Listing.city).like(like),
                    func.lower(models.Listing.country).like(like),
                )
            )

    if guests:
        q = q.filter(models.Listing.max_guests >= guests)

    if min_price is not None:
        q = q.filter(models.Listing.price_per_night >= min_price)

    if max_price is not None:
        q = q.filter(models.Listing.price_per_night <= max_price)

    if property_type:
        q = q.filter(models.Listing.property_type == property_type)

    if room_type:
        q = q.filter(models.Listing.room_type == room_type)

    if amenity_ids:
        ids = [int(i) for i in amenity_ids.split(",") if i]

        for aid in ids:
            q = q.filter(
                models.Listing.amenities.any(
                    models.Amenity.id == aid
                )
            )

    all_matching = q.all()

    if check_in and check_out:
        try:
            ci = date.fromisoformat(check_in)
            co = date.fromisoformat(check_out)

        except ValueError:
            raise HTTPException(
                400,
                "Invalid date format. Use YYYY-MM-DD",
            )

        if ci >= co:
            raise HTTPException(
                400,
                "check_out must be after check_in",
            )

        filtered = []

        for listing in all_matching:
            conflict = False

            for booking in listing.bookings:
                if booking.status == "cancelled":
                    continue

                b_ci = date.fromisoformat(booking.check_in)
                b_co = date.fromisoformat(booking.check_out)

                if ci < b_co and b_ci < co:
                    conflict = True
                    break

            if not conflict:
                filtered.append(listing)

        all_matching = filtered

    total = len(all_matching)

    start = (page - 1) * page_size

    page_items = all_matching[start:start + page_size]

    results = []

    for listing in page_items:
        avg_rating, review_count, is_wishlisted = _with_rating(
            db,
            listing,
            user.id if user else None,
        )

        results.append(
            {
                "id": listing.id,
                "title": listing.title,
                "city": listing.city,
                "country": listing.country,
                "property_type": listing.property_type,
                "room_type": listing.room_type,
                "price_per_night": listing.price_per_night,
                "max_guests": listing.max_guests,
                "bedrooms": listing.bedrooms,
                "beds": listing.beds,
                "bathrooms": listing.bathrooms,
                "photos": [
                    {
                        "id": photo.id,
                        "url": photo.url,
                        "sort_order": photo.sort_order,
                    }
                    for photo in listing.photos
                ],
                "avg_rating": avg_rating,
                "review_count": review_count,
                "is_wishlisted": is_wishlisted,
            }
        )

    return {
        "items": results,
        "total": total,
        "page": page,
        "page_size": page_size,
        "has_more": start + page_size < total,
    }


@router.get("/{listing_id}", response_model=schemas.ListingDetailOut)
def get_listing(
    listing_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_optional),
):
    listing = (
        db.query(models.Listing)
        .options(
            joinedload(models.Listing.photos),
            joinedload(models.Listing.amenities),
            joinedload(models.Listing.host),
            joinedload(models.Listing.reviews).joinedload(
                models.Review.author
            ),
        )
        .filter(models.Listing.id == listing_id)
        .first()
    )

    if not listing:
        raise HTTPException(404, "Listing not found")

    avg_rating, review_count, is_wishlisted = _with_rating(
        db,
        listing,
        user.id if user else None,
    )

    out = schemas.ListingDetailOut.model_validate(listing)

    out.avg_rating = avg_rating
    out.review_count = review_count
    out.is_wishlisted = is_wishlisted

    out.booked_ranges = [
        {
            "check_in": b.check_in,
            "check_out": b.check_out,
        }
        for b in listing.bookings
        if b.status != "cancelled"
    ]

    return out


@router.get("/meta/amenities", response_model=List[schemas.AmenityOut])
def list_amenities(db: Session = Depends(get_db)):
    return db.query(models.Amenity).all()