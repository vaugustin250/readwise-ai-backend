from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

# --- User & Auth Schemas ---
class UserBase(BaseModel):
    email: str

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "parent"

class UserLogin(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    role: str
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    sub: Optional[str] = None


# --- Child Profile Schemas ---
class ChildProfileBase(BaseModel):
    name: str
    age: int
    grade: str
    language: str

class ChildProfileCreate(ChildProfileBase):
    pass

class ChildProfile(ChildProfileBase):
    id: int
    owner_id: int
    model_config = ConfigDict(from_attributes=True)


# --- Assessment & Metrics Schemas ---
class MetricsBase(BaseModel):
    reading_speed_wpm: Optional[float] = None
    reading_hesitations: Optional[float] = None
    speech_accuracy: Optional[float] = None
    gaze_regressions: Optional[int] = None
    cognitive_score: Optional[float] = None
    risk_score: Optional[float] = None
    confidence_score: Optional[float] = None
    screening_level: Optional[str] = None

class AssessmentBase(BaseModel):
    status: str = "pending"

class Assessment(AssessmentBase):
    id: int
    profile_id: int
    date: datetime
    metrics: Optional[MetricsBase] = None
    model_config = ConfigDict(from_attributes=True)
