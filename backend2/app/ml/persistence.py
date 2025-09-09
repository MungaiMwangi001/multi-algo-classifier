import pickle
import json
from datetime import datetime
from pathlib import Path
from app.core.config import settings
from app.models.schemas import ModelInfo

def save_model(model, model_id, algorithm, accuracy, dataset_name, scaler, feature_columns):
    """Save model and metadata to disk"""
    # Create model directory
    model_dir = settings.MODELS_DIR / model_id
    model_dir.mkdir(exist_ok=True)
    
    # Save model
    model_path = model_dir / "model.pkl"
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    
    # Save scaler
    scaler_path = model_dir / "scaler.pkl"
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
    
    # Save feature columns
    features_path = model_dir / "features.json"
    with open(features_path, 'w') as f:
        json.dump(feature_columns, f)
    
    # Save metadata
    metadata = {
        "model_id": model_id,
        "algorithm": algorithm,
        "accuracy": accuracy,
        "trained_at": datetime.now().isoformat(),
        "dataset_name": dataset_name
    }
    
    metadata_path = model_dir / "metadata.json"
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f)
    
    return str(model_path)

def load_model(model_id):
    """Load model and related artifacts"""
    model_dir = settings.MODELS_DIR / model_id
    
    # Load model
    model_path = model_dir / "model.pkl"
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    
    # Load scaler
    scaler_path = model_dir / "scaler.pkl"
    with open(scaler_path, 'rb') as f:
        scaler = pickle.load(f)
    
    # Load feature columns
    features_path = model_dir / "features.json"
    with open(features_path, 'r') as f:
        feature_columns = json.load(f)
    
    # Load metadata
    metadata_path = model_dir / "metadata.json"
    with open(metadata_path, 'r') as f:
        metadata = json.load(f)
    
    return model, scaler, feature_columns, metadata

def list_saved_models():
    """List all saved models with their metadata"""
    models = []
    
    for model_dir in settings.MODELS_DIR.iterdir():
        if model_dir.is_dir():
            metadata_path = model_dir / "metadata.json"
            if metadata_path.exists():
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
                    models.append(ModelInfo(**metadata))
    
    return models