import sys
import os

# Automatically configure sys.path so app and ai_engine are found regardless of working directory
_app_dir = os.path.dirname(os.path.abspath(__file__))
_backend_dir = os.path.dirname(_app_dir)
_root_dir = os.path.dirname(_backend_dir)
for _p in [_backend_dir, _root_dir, _app_dir]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router
from app.core.config import settings
from app.core.database import Base, engine

# Create tables for dev/testing (In production, use Alembic migrations)
if settings.ENVIRONMENT != "production":
    Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {"message": "ReadWise AI Backend API"}
