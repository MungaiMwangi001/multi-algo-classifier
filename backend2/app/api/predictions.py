from fastapi import APIRouter, HTTPException
from app.models.schemas import PredictionRequest, PredictionResponse
from app.ml.persistence import load_model
from app.ml.preprocessing import prepare_prediction_data
import numpy as np

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Make predictions using a saved model"""
    try:
        # Load model and related artifacts
        model, scaler, feature_columns, metadata = load_model(request.model_id)
        
        # Prepare prediction data
        X_pred = prepare_prediction_data(request.data, scaler, feature_columns)
        
        # Make predictions
        predictions = model.predict(X_pred).tolist()
        
        # Get probabilities if available
        probabilities = None
        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(X_pred).tolist()
        
        return PredictionResponse(
            predictions=predictions,
            probabilities=probabilities
        )
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Model not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during prediction: {str(e)}")