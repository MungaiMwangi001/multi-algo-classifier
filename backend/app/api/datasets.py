"""Dataset management API endpoints."""

import os
import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from ..core.database import get_db, Dataset
from ..core.logging import get_logger
from ..core.config import settings
from ..ml.preprocessing import DataPreprocessor
from ..ml.persistence import DatasetPersistence
from ..schemas.dataset import (
    Dataset as DatasetSchema,
    DatasetUploadResponse,
    DatasetUpdate,
    DatasetInfo
)
from ..schemas.common import ErrorResponse, SuccessResponse

router = APIRouter(prefix="/datasets", tags=["datasets"])
logger = get_logger(__name__)
preprocessor = DataPreprocessor()
dataset_persistence = DatasetPersistence()


@router.get("/", response_model=List[DatasetSchema])
async def get_datasets(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all datasets."""
    try:
        datasets = dataset_persistence.get_datasets(db, skip=skip, limit=limit)
        return datasets
    except Exception as e:
        logger.error(f"Error getting datasets: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve datasets"
        )


@router.get("/{dataset_id}", response_model=DatasetSchema)
async def get_dataset(
    dataset_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific dataset by ID."""
    try:
        dataset = dataset_persistence.get_dataset(db, dataset_id)
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found"
            )
        return dataset
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting dataset {dataset_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve dataset"
        )


@router.post("/upload", response_model=DatasetUploadResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    name: Optional[str] = Form(None),
    target_column: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """Upload a new dataset."""
    try:
        # Validate file type
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in settings.supported_file_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file type. Supported types: {settings.supported_file_types}"
            )
        
        # Check file size
        file_content = await file.read()
        if len(file_content) > settings.max_file_size:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Maximum size: {settings.max_file_size} bytes"
            )
        
        # Generate unique filename and path
        dataset_id = dataset_persistence.generate_dataset_id()
        filename = f"{dataset_id}_{file.filename}"
        file_path = Path(settings.upload_dir) / filename
        
        # Save file
        with open(file_path, "wb") as f:
            f.write(file_content)
        
        # Load and validate dataset
        df = preprocessor.load_dataset(str(file_path))
        dataset_info = preprocessor.validate_dataset(df)
        
        # Generate dataset name if not provided
        if not name:
            name = Path(file.filename).stem
        
        # Save dataset metadata
        dataset = dataset_persistence.save_dataset_metadata(
            db=db,
            dataset_id=dataset_id,
            name=name,
            filename=file.filename,
            file_path=str(file_path),
            rows=dataset_info["rows"],
            columns=dataset_info["columns"],
            target_column=target_column,
            metadata=dataset_info
        )
        
        # Get dataset preview
        preview = preprocessor.get_dataset_preview(df)
        
        logger.info(f"Dataset uploaded successfully: {dataset_id}")
        
        return DatasetUploadResponse(
            id=dataset.id,
            name=dataset.name,
            rows=dataset.rows,
            columns=dataset.columns,
            target_column=dataset.target_column,
            created_at=dataset.created_at,
            updated_at=dataset.updated_at,
            is_processed=dataset.is_processed,
            metadata=dataset.dataset_metadata,
            preview=preview
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading dataset: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload dataset"
        )


@router.put("/{dataset_id}", response_model=DatasetSchema)
async def update_dataset(
    dataset_id: str,
    dataset_update: DatasetUpdate,
    db: Session = Depends(get_db)
):
    """Update dataset metadata."""
    try:
        dataset = dataset_persistence.get_dataset(db, dataset_id)
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found"
            )
        
        # Update fields
        if dataset_update.name is not None:
            dataset.name = dataset_update.name
        if dataset_update.target_column is not None:
            dataset.target_column = dataset_update.target_column
        if dataset_update.metadata is not None:
            dataset.dataset_metadata = dataset_update.metadata
        
        dataset.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(dataset)
        
        logger.info(f"Dataset updated: {dataset_id}")
        return dataset
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating dataset {dataset_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update dataset"
        )


@router.get("/{dataset_id}/info", response_model=DatasetInfo)
async def get_dataset_info(
    dataset_id: str,
    db: Session = Depends(get_db)
):
    """Get detailed dataset information."""
    try:
        dataset = dataset_persistence.get_dataset(db, dataset_id)
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found"
            )
        
        # Load dataset for detailed analysis
        df = preprocessor.load_dataset(dataset.file_path)
        feature_info = preprocessor.get_feature_info(df)
        
        return DatasetInfo(
            id=dataset.id,
            name=dataset.name,
            rows=dataset.rows,
            columns=dataset.columns,
            target_column=dataset.target_column,
            created_at=dataset.created_at,
            column_names=list(df.columns),
            column_types={col: str(dtype) for col, dtype in df.dtypes.items()},
            missing_values=df.isnull().sum().to_dict(),
            is_processed=dataset.is_processed
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting dataset info {dataset_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve dataset information"
        )


@router.delete("/{dataset_id}", response_model=SuccessResponse)
async def delete_dataset(
    dataset_id: str,
    db: Session = Depends(get_db)
):
    """Delete a dataset."""
    try:
        success = dataset_persistence.delete_dataset(db, dataset_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found"
            )
        
        logger.info(f"Dataset deleted: {dataset_id}")
        return SuccessResponse(message="Dataset deleted successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting dataset {dataset_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete dataset"
        )
