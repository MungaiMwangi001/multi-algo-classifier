"""Configuration settings for the ML Workbench application."""

import os
from pathlib import Path
from typing import Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings."""
    
    model_config = {
        "protected_namespaces": ("settings_",),
        "env_file": ".env",
        "case_sensitive": False
    }
    
    # Application
    app_name: str = "ML Workbench API"
    app_version: str = "1.0.0"
    debug: bool = False
    
    # API
    api_v1_prefix: str = "/api"
    host: str = "0.0.0.0"
    port: int = 8000
    
    # CORS
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8081",
    ]
    
    # Database
    database_url: str = "sqlite:///./ml_workbench.db"
    
    # File storage
    upload_dir: str = "uploads"
    models_dir: str = "models"
    logs_dir: str = "logs"
    
    # ML settings
    max_file_size: int = 50 * 1024 * 1024  # 50MB
    supported_file_types: list[str] = [".csv", ".xlsx", ".xls"]
    default_test_size: float = 0.2
    default_random_state: int = 42
    
    # Logging
    log_level: str = "INFO"
    log_format: str = "json"
    
    # Model persistence
    model_retention_days: int = 30


# Global settings instance
settings = Settings()

# Ensure directories exist
Path(settings.upload_dir).mkdir(exist_ok=True)
Path(settings.models_dir).mkdir(exist_ok=True)
Path(settings.logs_dir).mkdir(exist_ok=True)
