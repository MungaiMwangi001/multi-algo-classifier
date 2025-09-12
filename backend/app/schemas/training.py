"""Pydantic schemas for training operations."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class TrainingRequest(BaseModel):
    """Schema for training request."""
    dataset_id: str = Field(..., description="ID of the dataset to train on")
    algorithm: str = Field(..., description="ML algorithm to use")
    params: Optional[Dict[str, Any]] = Field(None, description="Algorithm-specific parameters")
    test_size: float = Field(0.2, ge=0.1, le=0.5, description="Test set size (0.1-0.5)")
    random_state: int = Field(42, description="Random state for reproducibility")


class TrainingJob(BaseModel):
    """Schema for training job response."""
    job_id: str = Field(..., description="Unique job identifier")
    dataset_id: str = Field(..., description="ID of the dataset")
    algorithm: str = Field(..., description="ML algorithm")
    status: str = Field(..., description="Job status: queued, running, finished, failed")
    progress: int = Field(0, ge=0, le=100, description="Progress percentage")
    logs: Optional[List[str]] = Field(None, description="Training logs")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    completed_at: Optional[datetime] = Field(None, description="Completion timestamp")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    model_id: Optional[str] = Field(None, description="Created model ID if successful")

    model_config = {
        "protected_namespaces": (),
        "from_attributes": True
    }


class TrainingJobCreate(BaseModel):
    """Schema for creating a training job."""
    dataset_id: str
    algorithm: str
    params: Optional[Dict[str, Any]] = None
    test_size: float = 0.2
    random_state: int = 42


class TrainingJobUpdate(BaseModel):
    """Schema for updating a training job."""
    status: Optional[str] = None
    progress: Optional[int] = None
    logs: Optional[List[str]] = None
    error_message: Optional[str] = None
    model_id: Optional[str] = None
    
    model_config = {"protected_namespaces": ()}


class TrainingStatus(BaseModel):
    """Schema for training status response."""
    job_id: str
    status: str
    progress: int
    logs: Optional[List[str]]
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime]
    error_message: Optional[str]
    model_id: Optional[str]

    model_config = {
        "protected_namespaces": (),
        "from_attributes": True
    }
