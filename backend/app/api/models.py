from fastapi import APIRouter, HTTPException, Query
from typing import List

from app.ml.persistence import save_model
from app.schemas.training import AlgorithmResponse

router = APIRouter()

@router.post("/save-model", response_model=dict)
def save_trained_model(model_id: str = Query(..., description="ID of the model to save")):
    """Save a trained model to disk"""
    try:
        from app.api.training import models
        
        if model_id not in models:
            raise HTTPException(status_code=404, detail="Model not found")
        
        model_data = models[model_id]
        
        # Save model
        filename = save_model(model_data, model_id)
        
        return {"message": "Model saved successfully", "filename": filename}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving model: {str(e)}")

@router.get("/list-models", response_model=dict)
def list_models():
    """List all trained models"""
    try:
        from app.api.training import models
        
        model_list = []
        for model_id, model_data in models.items():
            model_list.append({
                "id": model_id,
                "algorithm": model_data["algorithm"].value if hasattr(model_data["algorithm"], 'value') else str(model_data["algorithm"]),
                "dataset_id": model_data["dataset_id"],
                "training_time": model_data["training_time"],
                "accuracy": model_data["metrics"]["accuracy"],
                "precision": model_data["metrics"]["precision"],
                "recall": model_data["metrics"]["recall"],
                "f1_score": model_data["metrics"]["f1_score"],
                "auc": model_data["metrics"]["auc"]
            })
        
        return {"models": model_list}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error retrieving model list")

@router.get("/metrics/{model_id}", response_model=AlgorithmResponse)
def get_metrics(model_id: str):
    """Get evaluation metrics for a trained model"""
    try:
        from app.api.training import models
        
        if model_id not in models:
            raise HTTPException(status_code=404, detail="Model not found")
        
        metrics = models[model_id]["metrics"]
        
        return {
            "name": models[model_id]["algorithm"].value if hasattr(models[model_id]["algorithm"], 'value') else str(models[model_id]["algorithm"]),
            "accuracy": metrics["accuracy"],
            "precision": metrics["precision"],
            "recall": metrics["recall"],
            "f1_score": metrics["f1_score"],
            "auc": metrics["auc"],
            "roc_curve": metrics["roc_curve"],
            "pr_curve": metrics["pr_curve"],
            "confusion_matrix": metrics["confusion_matrix"],
            "feature_importance": metrics["feature_importance"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error retrieving model metrics")