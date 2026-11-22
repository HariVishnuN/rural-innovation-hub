from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Rural Innovation Hub API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    ENVIRONMENT: str = "development"
    DEMO_MODE: bool = True

    # Database: MySQL only
    DATABASE_URL: str = "mysql+pymysql://hub_user:hub_password@localhost:3306/rural_innovation_hub"
    DB_POOL_PRE_PING: bool = True
    DB_POOL_RECYCLE: int = 3600
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    # JWT Authentication
    JWT_SECRET: str = "super-secret-rural-innovation-jwt-key-2026-production-ready"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 120

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://127.0.0.1:3000"

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(env_file=(".env", "../.env"), env_file_encoding="utf-8", extra="ignore")


settings = Settings()
