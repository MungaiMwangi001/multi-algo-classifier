"""Model management API endpoints."""

from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..core.database import get_db, Model
from ..core.logging import get_logger
from ..ml.persistence import ModelPersistence
from ..ml.training import MLTrainer
from ..schemas.model import (
    Model as ModelSchema,
    ModelMetrics,
    ModelUpdate,
    ModelInfo
)
from ..schemas.common import SuccessResponse

router = APIRouter(prefix="/models", tags=["models"])
logger = get_logger(__name__)
model_persistence = ModelPersistence()
ml_trainer = MLTrainer()


@router.get("/", response_model=List[ModelSchema])
async def get_models(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all trained models."""
    try:
        models = model_persistence.get_models(db, skip=skip, limit=limit)
        return models
    except Exception as e:
        logger.error(f"Error getting models: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve models"
        )


@router.get("/{model_id}", response_model=ModelSchema)
async def get_model(
    model_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific model by ID."""
    try:
        model = model_persistence.get_model(db, model_id)
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        return model
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting model {model_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve model"
        )


@router.get("/{model_id}/metrics", response_model=ModelMetrics)
async def get_model_metrics(
    model_id: str,
    db: Session = Depends(get_db)
):
    """Get model evaluation metrics."""
    try:
        model = model_persistence.get_model(db, model_id)
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        
        if not model.metrics:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model metrics not available"
            )
        
        # Convert metrics to ModelMetrics schema
        metrics = model.metrics
        return ModelMetrics(
            accuracy=metrics.get("accuracy", 0.0),
            confusion_matrix=metrics.get("confusion_matrix", []),
            fpr=metrics.get("fpr", []),
            tpr=metrics.get("tpr", []),
            feature_importance=metrics.get("feature_importance", []),
            classification_report=metrics.get("classification_report", {})
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting model metrics {model_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve model metrics"
        )


@router.get("/{model_id}/info", response_model=ModelInfo)
async def get_model_info(
    model_id: str,
    db: Session = Depends(get_db)
):
    """Get detailed model information."""
    try:
        model = model_persistence.get_model(db, model_id)
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        
        # Get dataset name
        from ..core.database import Dataset
        dataset = db.query(Dataset).filter(Dataset.id == model.dataset_id).first()
        dataset_name = dataset.name if dataset else None
        
        # Convert metrics if available
        model_metrics = None
        if model.metrics:
            model_metrics = ModelMetrics(
                accuracy=model.metrics.get("accuracy", 0.0),
                confusion_matrix=model.metrics.get("confusion_matrix", []),
                fpr=model.metrics.get("fpr", []),
                tpr=model.metrics.get("tpr", []),
                feature_importance=model.metrics.get("feature_importance", []),
                classification_report=model.metrics.get("classification_report", {})
            )
        
        return ModelInfo(
            model_id=model.model_id,
            algorithm=model.algorithm,
            dataset_id=model.dataset_id,
            accuracy=model.accuracy,
            created_at=model.created_at,
            params=model.params or {},
            metrics=model_metrics,
            is_active=model.is_active,
            dataset_name=dataset_name
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting model info {model_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve model information"
        )


@router.put("/{model_id}", response_model=ModelSchema)
async def update_model(
    model_id: str,
    model_update: ModelUpdate,
    db: Session = Depends(get_db)
):
    """Update model metadata."""
    try:
        model = model_persistence.get_model(db, model_id)
        if not model:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        
        # Update fields
        if model_update.is_active is not None:
            model.is_active = model_update.is_active
        if model_update.params is not None:
            model.params = model_update.params
        
        model.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(model)
        
        logger.info(f"Model updated: {model_id}")
        return model
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating model {model_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update model"
        )


@router.delete("/{model_id}", response_model=SuccessResponse)
async def delete_model(
    model_id: str,
    db: Session = Depends(get_db)
):
    """Delete a model."""
    try:
        success = model_persistence.delete_model(db, model_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Model not found"
            )
        
        logger.info(f"Model deleted: {model_id}")
        return SuccessResponse(message="Model deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting model {model_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete model"
        )


@router.get("/algorithms/available", response_model=List[str])
async def get_available_algorithms():
    """Get list of available ML algorithms."""
    try:
        algorithms = ml_trainer.get_available_algorithms()
        return algorithms
    except Exception as e:
        logger.error(f"Error getting available algorithms: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve available algorithms"
        )


@router.get("/algorithms/{algorithm}/params", response_model=dict)
async def get_algorithm_params(algorithm: str):
    """Get default parameters for an algorithm."""
    try:
        params = ml_trainer.get_algorithm_params(algorithm)
        return params
    except Exception as e:
        logger.error(f"Error getting algorithm params for {algorithm}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve algorithm parameters"
        )


@router.get("/stats/summary", response_model=dict)
async def get_model_stats(db: Session = Depends(get_db)):
    """Get model statistics summary."""
    try:
        stats = model_persistence.get_model_stats(db)
        return stats
    except Exception as e:
        logger.error(f"Error getting model stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve model statistics"
        )
