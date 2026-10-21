from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "ReadWise AI API"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    DATABASE_URL: str = "sqlite:///./test.db"
    STORE_RECORDINGS: bool = False
    ENVIRONMENT: str = "development"

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
