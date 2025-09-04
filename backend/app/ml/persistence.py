import joblib
import os
from datetime import datetime
from app.core.config import settings

def save_model(model_data, model_id):
    """Save a trained model to disk"""
    # Create filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{settings.MODEL_DIR}/{model_id}_{timestamp}.joblib"
    
    # Ensure directory exists
    os.makedirs(settings.MODEL_DIR, exist_ok=True)
    
    # Save model
    joblib.dump(model_data, filename)
    return filename

def load_model(filename):
    """Load a model from disk"""
    return joblib.load(filename)