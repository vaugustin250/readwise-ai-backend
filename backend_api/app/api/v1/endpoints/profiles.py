from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.all_models import ChildProfile, User
from app.schemas.all_schemas import ChildProfile as ChildProfileSchema, ChildProfileCreate

router = APIRouter()

@router.post("/", response_model=ChildProfileSchema, status_code=status.HTTP_201_CREATED)
def create_profile(
    profile: ChildProfileCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Create a new child profile associated with the authenticated parent/guardian.
    """
    db_profile = ChildProfile(**profile.model_dump(), owner_id=current_user.id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@router.get("/", response_model=List[ChildProfileSchema])
def read_profiles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve all child profiles registered to the authenticated parent/guardian.
    """
    profiles = db.query(ChildProfile).filter(ChildProfile.owner_id == current_user.id).all()
    return profiles

@router.get("/{child_id}", response_model=ChildProfileSchema)
def read_profile(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retrieve details of a specific child profile, enforcing guardian ownership.
    """
    profile = db.query(ChildProfile).filter(ChildProfile.id == child_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child profile not found.")
    if profile.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: you do not have permission for this child profile."
        )
    return profile

@router.delete("/{child_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_profile(
    child_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete a child profile, enforcing guardian ownership.
    """
    profile = db.query(ChildProfile).filter(ChildProfile.id == child_id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child profile not found.")
    if profile.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: you do not have permission for this child profile."
        )
    db.delete(profile)
    db.commit()
    return None
