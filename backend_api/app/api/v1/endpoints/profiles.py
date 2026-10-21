from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.all_models import ChildProfile
from app.schemas.all_schemas import ChildProfile as ChildProfileSchema, ChildProfileCreate

router = APIRouter()

@router.post("/", response_model=ChildProfileSchema)
def create_profile(
    profile: ChildProfileCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_profile = ChildProfile(**profile.model_dump(), owner_id=current_user["user_id"])
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.get("/", response_model=List[ChildProfileSchema])
def read_profiles(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    profiles = db.query(ChildProfile).filter(ChildProfile.owner_id == current_user["user_id"]).all()
    return profiles
