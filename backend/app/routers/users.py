from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("", response_model=list[schemas.UserOut])
def list_users(db: Session = Depends(get_db)):
    """Returns the seeded demo accounts so the UI can offer a 'switch user' picker
    instead of implementing real authentication (mocked per assignment spec)."""
    return db.query(models.User).all()


@router.get("/me", response_model=schemas.UserOut)
def me(user=Depends(get_current_user)):
    return user


@router.post("", response_model=schemas.UserOut)
def create_user(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(400, "A user with that email already exists")
    user = models.User(**payload.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/me/become-host", response_model=schemas.UserOut)
def become_host(db: Session = Depends(get_db), user=Depends(get_current_user)):
    user.is_host = True
    db.commit()
    db.refresh(user)
    return user
