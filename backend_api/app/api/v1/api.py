from fastapi import APIRouter
from app.api.v1.endpoints import auth, profiles, assessments

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(profiles.router, prefix="/profiles", tags=["profiles"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
