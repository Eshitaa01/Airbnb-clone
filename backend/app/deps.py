from fastapi import Header, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models
from .database import get_db


def get_current_user(
    x_user_id: int = Header(..., alias="X-User-Id"),
    db: Session = Depends(get_db),
) -> models.User:
    """Mocked auth: the frontend sends the active user's id in a header.
    Real identity verification / OAuth is out of scope for this assignment."""
    user = db.query(models.User).filter(models.User.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="Unknown user. Please sign in again.")
    return user


def get_current_user_optional(
    x_user_id: int | None = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
):
    if x_user_id is None:
        return None
    return db.query(models.User).filter(models.User.id == x_user_id).first()
