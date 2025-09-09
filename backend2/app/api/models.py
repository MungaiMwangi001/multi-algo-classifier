from fastapi import APIRouter
from app.ml.persistence import list_saved_models

router = APIRouter()

@router.get("/saved-models")
async def get_saved_models():
    """Get list of all saved models"""
    models = list_saved_models()
    return models