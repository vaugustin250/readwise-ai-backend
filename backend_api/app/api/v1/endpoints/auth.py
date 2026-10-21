from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional

from app.core.config import settings
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.models.all_models import User
from app.schemas.all_schemas import UserCreate, UserLogin, UserOut, Token

router = APIRouter()

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new parent/guardian user account.
    """
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role or "parent"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email,
        expires_delta=access_token_expires
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserOut(id=user.id, email=user.email, role=user.role)
    )

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate parent/guardian and issue expiring JWT access token.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if not user or not verify_password(user_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=user.email,
        expires_delta=access_token_expires
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserOut(id=user.id, email=user.email, role=user.role)
    )

@router.post("/token", response_model=Token)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Standard OAuth2 password form login endpoint for Swagger UI / OpenAPI docs.
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        subject=user.email,
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserOut(id=user.id, email=user.email, role=user.role)
    )

@router.get("/me", response_model=UserOut)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """
    Return currently authenticated guardian profile.
    """
    return UserOut(id=current_user.id, email=current_user.email, role=current_user.role)
