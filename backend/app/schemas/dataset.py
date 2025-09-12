"""Pydantic schemas for dataset operations."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class DatasetBase(BaseModel):
    """Base dataset schema."""
    name: str = Field(..., description="Name of the dataset")
    target_column: Optional[str] = Field(None, description="Target column for ML tasks")


class DatasetCreate(DatasetBase):
    """Schema for creating a new dataset."""
    pass


class Dataset(DatasetBase):
    """Schema for dataset response."""
    id: str = Field(..., description="Unique dataset identifier")
    filename: str = Field(..., description="Original filename")
    file_path: str = Field(..., description="Path to the dataset file")
    rows: int = Field(..., description="Number of rows in the dataset")
    columns: int = Field(..., description="Number of columns in the dataset")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    is_processed: bool = Field(False, description="Whether the dataset has been processed")
    metadata: Optional[Dict[str, Any]] = Field(None, alias="dataset_metadata", description="Additional dataset metadata")

    model_config = {"from_attributes": True, "populate_by_name": True}


class DatasetUploadResponse(Dataset):
    """Schema for dataset upload response with preview."""
    preview: List[List[str]] = Field(..., description="Preview of the dataset (first 10 rows)")


class DatasetUpdate(BaseModel):
    """Schema for updating a dataset."""
    name: Optional[str] = Field(None, description="New name for the dataset")
    target_column: Optional[str] = Field(None, description="Target column for ML tasks")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional metadata")


class DatasetInfo(BaseModel):
    """Schema for dataset information."""
    id: str
    name: str
    rows: int
    columns: int
    target_column: Optional[str]
    created_at: datetime
    column_names: List[str]
    column_types: Dict[str, str]
    missing_values: Dict[str, int]
    is_processed: bool

    model_config = {"from_attributes": True}
