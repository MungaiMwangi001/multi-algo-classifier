import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings:
    # Directory paths
    UPLOAD_DIR = BASE_DIR / "data" / "uploaded_datasets"
    MODELS_DIR = BASE_DIR / "saved_models"
    
    # Create directories if they don't exist
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

settings = Settings()
