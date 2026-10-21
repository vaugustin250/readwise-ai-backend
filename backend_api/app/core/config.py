from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ReadWise AI API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "secret"
    DATABASE_URL: str = "sqlite:///./test.db"
    STORE_RECORDINGS: bool = False

    class Config:
        env_file = ".env"

settings = Settings()
