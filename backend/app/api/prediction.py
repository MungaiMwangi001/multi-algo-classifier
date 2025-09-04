from fastapi import APIRouter, HTTPException
import pandas as pd
import torch

from app.schemas.prediction import PredictionRequest, PredictionResponse

router = APIRouter()

@router.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest):
    """Make predictions using a saved model"""
    try:
        from app.api.training import models
        
        if request.model_id not in models:
            raise HTTPException(status_code=404, detail="Model not found")
        
        model_data = models[request.model_id]
        model = model_data["model"]
        preprocessor = model_data["preprocessor"]
        target_names = model_data["target_names"]
        
        # Convert input data to DataFrame
        input_df = pd.DataFrame(request.data, columns=request.feature_names)
        
        # Preprocess input data
        input_processed = preprocessor.transform(input_df)
        
        # Make predictions
        if hasattr(model, 'forward'):  # Neural network
            model.eval()
            with torch.no_grad():
                input_tensor = torch.FloatTensor(input_processed)
                outputs = model(input_tensor)
                predictions = torch.argmax(outputs, dim=1).numpy()
                probabilities = torch.softmax(outputs, dim=1).numpy()
        else:
            predictions = model.predict(input_processed)
            probabilities = model.predict_proba(input_processed) if hasattr(model, 'predict_proba') else None
        
        # Convert predictions to class names
        if target_names and len(target_names) > 0:
            predicted_classes = [target_names[pred] for pred in predictions]
        else:
            predicted_classes = predictions.tolist()
        
        return {
            "predictions": predicted_classes,
            "probabilities": probabilities.tolist() if probabilities is not None else None
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error making predictions: {str(e)}")