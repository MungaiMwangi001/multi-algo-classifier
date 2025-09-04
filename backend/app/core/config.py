from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "ML Classification API"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    
    # File upload settings
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB
    
    # Model storage
    MODEL_DIR: str = "models"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
