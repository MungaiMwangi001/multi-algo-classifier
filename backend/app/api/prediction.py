"""Prediction API endpoints."""

from typing import Dict, List, Optional, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import pandas as pd

from ..core.database import get_db, Model
from ..core.logging import get_logger
from ..ml.training import MLTrainer
from ..ml.persistence import ModelPersistence
from ..schemas.prediction import (
    PredictionRequest,
    PredictionResponse,
    BatchPredictionRequest,
    BatchPredictionResponse,
    PredictionInfo
)
from ..schemas.common import ErrorResponse

router = APIRouter(prefix="/predict", tags=["prediction"])
logger = get_logger(__name__)
model_persistence = ModelPersistence()
ml_trainer = MLTrainer()


@router.post("/", response_model=PredictionResponse)
async def predict(
    request: PredictionRequest,
    db: Session = Depends(get_db)
):
    """Make a prediction using a trained model."""
    try:
        # Get model
        model = model_persistence.get_model(db, request.model_id)
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        
        if not model.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Model is not active"
            )
        
        # Load model
        model_data = ml_trainer.load_model(model.model_path)
        
        # Prepare input data
        input_df = pd.DataFrame([request.input])
        
        # Make prediction
        results = ml_trainer.predict(model_data, input_df)
        
        # Get prediction and probability
        prediction = results["predictions"][0]
        probabilities = results["probabilities"]
        
        # Calculate confidence (max probability)
        confidence = 0.0
        if probabilities is not None and len(probabilities) > 0:
            confidence = float(max(probabilities[0]))
        
        # Prepare probability dict if available
        prob_dict = None
        if probabilities is not None and len(probabilities) > 0:
            target_classes = model_data.get("target_classes", [])
            if target_classes:
                prob_dict = {
                    str(target_classes[i]): float(prob) 
                    for i, prob in enumerate(probabilities[0])
                }
        
        logger.info(f"Prediction made using model {request.model_id}: {prediction}")
        
        return PredictionResponse(
            prediction=str(prediction),
            probability=confidence,
            probabilities=prob_dict
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error making prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to make prediction"
        )


@router.post("/batch", response_model=BatchPredictionResponse)
async def predict_batch(
    request: BatchPredictionRequest,
    db: Session = Depends(get_db)
):
    """Make batch predictions using a trained model."""
    try:
        # Get model
        model = model_persistence.get_model(db, request.model_id)
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        
        if not model.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Model is not active"
            )
        
        # Load model
        model_data = ml_trainer.load_model(model.model_path)
        
        # Prepare input data
        input_df = pd.DataFrame(request.inputs)
        
        # Make predictions
        results = ml_trainer.predict(model_data, input_df)
        
        # Process results
        predictions = [str(pred) for pred in results["predictions"]]
        probabilities = []
        all_probabilities = []
        
        if results["probabilities"] is not None:
            for prob_row in results["probabilities"]:
                # Max probability for confidence
                max_prob = float(max(prob_row))
                probabilities.append(max_prob)
                
                # All probabilities for each class
                target_classes = model_data.get("target_classes", [])
                if target_classes:
                    prob_dict = {
                        str(target_classes[i]): float(prob) 
                        for i, prob in enumerate(prob_row)
                    }
                    all_probabilities.append(prob_dict)
        
        logger.info(f"Batch prediction made using model {request.model_id}: {len(predictions)} predictions")
        
        return BatchPredictionResponse(
            predictions=predictions,
            probabilities=probabilities,
            all_probabilities=all_probabilities if all_probabilities else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error making batch prediction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to make batch predictions"
        )


@router.get("/{model_id}/info", response_model=PredictionInfo)
async def get_prediction_info(
    model_id: str,
    db: Session = Depends(get_db)
):
    """Get prediction information for a model."""
    try:
        # Get model
        model = model_persistence.get_model(db, model_id)
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        
        # Load model to get feature information
        model_data = ml_trainer.load_model(model.model_path)
        
        return PredictionInfo(
            model_id=model.model_id,
            algorithm=model.algorithm,
            dataset_id=model.dataset_id,
            input_features=model_data.get("feature_columns", []),
            output_classes=model_data.get("target_classes", []),
            created_at=model.created_at.isoformat()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting prediction info {model_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve prediction information"
        )


@router.get("/models/active", response_model=List[Dict[str, Any]])
async def get_active_models(db: Session = Depends(get_db)):
    """Get list of active models for prediction."""
    try:
        models = db.query(Model).filter(Model.is_active == True).all()
        
        model_list = []
        for model in models:
            model_list.append({
                "model_id": model.model_id,
                "algorithm": model.algorithm,
                "dataset_id": model.dataset_id,
                "accuracy": model.accuracy,
                "created_at": model.created_at.isoformat()
            })
        
        return model_list
        
    except Exception as e:
        logger.error(f"Error getting active models: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve active models"
        )
