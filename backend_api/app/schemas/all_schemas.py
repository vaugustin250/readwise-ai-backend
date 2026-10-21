from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

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
    class Config:
        from_attributes = True

class MetricsBase(BaseModel):
    reading_speed_wpm: Optional[float] = None
    reading_hesitations: Optional[int] = None
    speech_accuracy: Optional[float] = None
    gaze_regressions: Optional[int] = None
    cognitive_score: Optional[float] = None
    risk_score: Optional[float] = None

class AssessmentBase(BaseModel):
    status: str = "pending"

class Assessment(AssessmentBase):
    id: int
    profile_id: int
    date: datetime
    metrics: Optional[MetricsBase] = None
    class Config:
        from_attributes = True
