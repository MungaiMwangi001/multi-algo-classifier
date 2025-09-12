"""Pydantic schemas for model operations."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ModelBase(BaseModel):
    """Base model schema."""
    algorithm: str = Field(..., description="ML algorithm used")
    dataset_id: str = Field(..., description="ID of the dataset used for training")
    params: Optional[Dict[str, Any]] = Field(None, description="Model parameters")


class ModelCreate(ModelBase):
    """Schema for creating a new model."""
    pass


class Model(ModelBase):
    """Schema for model response."""
    model_id: str = Field(..., description="Unique model identifier")
    accuracy: float = Field(..., description="Model accuracy score")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    model_path: str = Field(..., description="Path to the saved model file")
    metrics: Optional[Dict[str, Any]] = Field(None, description="Model evaluation metrics")
    is_active: bool = Field(True, description="Whether the model is active")

    model_config = {
        "protected_namespaces": (),
        "from_attributes": True
    }


class ModelMetrics(BaseModel):
    """Schema for model evaluation metrics."""
    accuracy: float = Field(..., description="Overall accuracy")
    confusion_matrix: List[List[int]] = Field(..., description="Confusion matrix")
    fpr: List[float] = Field(..., description="False positive rates for ROC curve")
    tpr: List[float] = Field(..., description="True positive rates for ROC curve")
    feature_importance: List[Dict[str, Any]] = Field(..., description="Feature importance scores")
    classification_report: Dict[str, Any] = Field(..., description="Detailed classification report")


class ModelUpdate(BaseModel):
    """Schema for updating a model."""
    is_active: Optional[bool] = Field(None, description="Whether the model is active")
    params: Optional[Dict[str, Any]] = Field(None, description="Model parameters")


class ModelInfo(BaseModel):
    """Schema for detailed model information."""
    model_id: str
    algorithm: str
    dataset_id: str
    accuracy: float
    created_at: datetime
    params: Dict[str, Any]
    metrics: Optional[ModelMetrics]
    is_active: bool
    dataset_name: Optional[str] = None

    model_config = {
        "protected_namespaces": (),
        "from_attributes": True
    }
