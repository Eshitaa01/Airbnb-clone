from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])


@router.get("", response_model=list[schemas.ListingCardOut])
def get_wishlist(db: Session = Depends(get_db), user=Depends(get_current_user)):
    items = (
        db.query(models.Wishlist)
        .options(joinedload(models.Wishlist.listing).joinedload(models.Listing.photos))
        .filter(models.Wishlist.user_id == user.id)
        .all()
    )
    out = []
    for w in items:
        card = schemas.ListingCardOut.model_validate(w.listing)
        card.is_wishlisted = True
        out.append(card)
    return out


@router.post("/toggle")
def toggle_wishlist(payload: schemas.WishlistToggle, db: Session = Depends(get_db), user=Depends(get_current_user)):
    existing = (
        db.query(models.Wishlist)
        .filter(models.Wishlist.user_id == user.id, models.Wishlist.listing_id == payload.listing_id)
        .first()
    )
    if existing:
        db.delete(existing)
        db.commit()
        return {"wishlisted": False}
    db.add(models.Wishlist(user_id=user.id, listing_id=payload.listing_id))
    db.commit()
    return {"wishlisted": True}
