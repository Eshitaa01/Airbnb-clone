from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/host", tags=["host"])


@router.get("/listings", response_model=list[schemas.ListingDetailOut])
def my_listings(db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not user.is_host:
        raise HTTPException(403, "Switch to hosting to view this page")
    listings = (
        db.query(models.Listing)
        .options(
            joinedload(models.Listing.photos),
            joinedload(models.Listing.amenities),
            joinedload(models.Listing.host),
            joinedload(models.Listing.bookings),
        )
        .filter(models.Listing.host_id == user.id)
        .all()
    )
    out = []
    for listing in listings:
        item = schemas.ListingDetailOut.model_validate(listing)
        item.booked_ranges = [
            {"check_in": b.check_in, "check_out": b.check_out} for b in listing.bookings if b.status != "cancelled"
        ]
        out.append(item)
    return out


@router.get("/bookings", response_model=list[schemas.BookingOut])
def bookings_for_my_listings(db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not user.is_host:
        raise HTTPException(403, "Switch to hosting to view this page")
    listing_ids = [l.id for l in db.query(models.Listing.id).filter(models.Listing.host_id == user.id).all()]
    bookings = (
        db.query(models.Booking)
        .options(joinedload(models.Booking.listing).joinedload(models.Listing.photos))
        .filter(models.Booking.listing_id.in_(listing_ids))
        .order_by(models.Booking.created_at.desc())
        .all()
    )
    return bookings
