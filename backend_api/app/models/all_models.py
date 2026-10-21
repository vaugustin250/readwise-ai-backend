from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default="parent")
    profiles = relationship("ChildProfile", back_populates="owner")

    def __getitem__(self, item):
        if item == "user_id":
            return self.id
        return getattr(self, item)

class ChildProfile(Base):
    __tablename__ = "child_profiles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    grade = Column(String)
    language = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="profiles")
    assessments = relationship("Assessment", back_populates="profile")

class Assessment(Base):
    __tablename__ = "assessments"
    id = Column(Integer, primary_key=True, index=True)
    profile_id = Column(Integer, ForeignKey("child_profiles.id"))
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="pending")
    profile = relationship("ChildProfile", back_populates="assessments")
    metrics = relationship("Metrics", back_populates="assessment", uselist=False)

class Metrics(Base):
    __tablename__ = "metrics"
    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"))
    reading_speed_wpm = Column(Float, nullable=True)
    reading_hesitations = Column(Float, nullable=True)
    speech_accuracy = Column(Float, nullable=True)
    gaze_regressions = Column(Integer, nullable=True)
    cognitive_score = Column(Float, nullable=True)
    risk_score = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    screening_level = Column(String, nullable=True)
    shap_json = Column(String, nullable=True)
    learning_plan_json = Column(String, nullable=True)
    assessment = relationship("Assessment", back_populates="metrics")
