from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from datetime import date

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/bookings", tags=["bookings"])


@router.post("", response_model=schemas.BookingOut)
def create_booking(payload: schemas.BookingCreate, db: Session = Depends(get_db), user=Depends(get_current_user)):
    listing = db.query(models.Listing).filter(models.Listing.id == payload.listing_id).first()
    if not listing or not listing.is_active:
        raise HTTPException(404, "Listing not found")

    try:
        ci = date.fromisoformat(payload.check_in)
        co = date.fromisoformat(payload.check_out)
    except ValueError:
        raise HTTPException(400, "Invalid date format, use YYYY-MM-DD")

    if ci >= co:
        raise HTTPException(400, "Check-out date must be after check-in date")
    if ci < date.today():
        raise HTTPException(400, "Check-in date cannot be in the past")
    if payload.guests < 1 or payload.guests > listing.max_guests:
        raise HTTPException(400, f"This place accepts a maximum of {listing.max_guests} guests")

    # overlap check against existing confirmed bookings
    existing = (
        db.query(models.Booking)
        .filter(models.Booking.listing_id == listing.id, models.Booking.status != "cancelled")
        .all()
    )
    for b in existing:
        b_ci, b_co = date.fromisoformat(b.check_in), date.fromisoformat(b.check_out)
        if ci < b_co and b_ci < co:
            raise HTTPException(409, "These dates are no longer available for this listing")

    nights = (co - ci).days
    nightly_total = round(nights * listing.price_per_night, 2)
    service_fee = round(nightly_total * listing.service_fee_pct, 2)
    total = round(nightly_total + listing.cleaning_fee + service_fee, 2)

    booking = models.Booking(
        listing_id=listing.id,
        guest_id=user.id,
        check_in=payload.check_in,
        check_out=payload.check_out,
        guests=payload.guests,
        nights=nights,
        nightly_total=nightly_total,
        cleaning_fee=listing.cleaning_fee,
        service_fee=service_fee,
        total_price=total,
        status="confirmed",
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/mine", response_model=list[schemas.BookingOut])
def my_bookings(db: Session = Depends(get_db), user=Depends(get_current_user)):
    bookings = (
        db.query(models.Booking)
        .options(joinedload(models.Booking.listing).joinedload(models.Listing.photos))
        .filter(models.Booking.guest_id == user.id)
        .order_by(models.Booking.created_at.desc())
        .all()
    )
    return bookings


@router.post("/{booking_id}/cancel", response_model=schemas.BookingOut)
def cancel_booking(booking_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")
    if booking.guest_id != user.id:
        raise HTTPException(403, "Not your booking")
    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return booking
