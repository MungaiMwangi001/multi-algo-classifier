"""Pydantic schemas for prediction operations."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
    """Schema for prediction request."""
    model_id: str = Field(..., description="ID of the model to use for prediction")
    input: Dict[str, Any] = Field(..., description="Input features for prediction")
    
    model_config = {"protected_namespaces": ()}


class PredictionResponse(BaseModel):
    """Schema for prediction response."""
    prediction: str = Field(..., description="Predicted class")
    probability: float = Field(..., description="Prediction confidence/probability")
    probabilities: Optional[Dict[str, float]] = Field(None, description="Probabilities for all classes")


class BatchPredictionRequest(BaseModel):
    """Schema for batch prediction request."""
    model_id: str = Field(..., description="ID of the model to use")
    inputs: List[Dict[str, Any]] = Field(..., description="List of input features")
    
    model_config = {"protected_namespaces": ()}


class BatchPredictionResponse(BaseModel):
    """Schema for batch prediction response."""
    predictions: List[str] = Field(..., description="List of predicted classes")
    probabilities: List[float] = Field(..., description="List of prediction confidences")
    all_probabilities: Optional[List[Dict[str, float]]] = Field(None, description="All class probabilities for each prediction")


class PredictionInfo(BaseModel):
    """Schema for prediction information."""
    model_id: str
    algorithm: str
    dataset_id: str
    input_features: List[str]
    output_classes: List[str]
    created_at: str

    model_config = {
        "protected_namespaces": (),
        "from_attributes": True
    }
