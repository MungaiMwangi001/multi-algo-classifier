"""Training job management API endpoints."""

import asyncio
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from ..core.database import get_db, TrainingJob, Dataset
from ..core.logging import get_logger
from ..ml.preprocessing import DataPreprocessor
from ..ml.training import MLTrainer
from ..ml.persistence import TrainingJobPersistence, ModelPersistence, DatasetPersistence
from ..schemas.training import (
    TrainingRequest,
    TrainingJob as TrainingJobSchema,
    TrainingJobCreate,
    TrainingJobUpdate,
    TrainingStatus
)
from ..schemas.common import SuccessResponse

router = APIRouter(prefix="/training", tags=["training"])
logger = get_logger(__name__)
training_persistence = TrainingJobPersistence()
model_persistence = ModelPersistence()
dataset_persistence = DatasetPersistence()
preprocessor = DataPreprocessor()
ml_trainer = MLTrainer()


@router.post("/start", response_model=TrainingJobSchema)
async def start_training(
    request: TrainingRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Start a new training job."""
    try:
        # Validate dataset exists
        dataset = dataset_persistence.get_dataset(db, request.dataset_id)
        if not dataset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Dataset not found"
            )
        
        # Validate algorithm
        if request.algorithm not in ml_trainer.get_available_algorithms():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported algorithm: {request.algorithm}"
            )
        
        # Create training job
        job_id = training_persistence.generate_job_id()
        job = training_persistence.create_training_job(
            db=db,
            job_id=job_id,
            dataset_id=request.dataset_id,
            algorithm=request.algorithm
        )
        
        # Start training in background
        background_tasks.add_task(
            run_training_job,
            job_id=job_id,
            dataset_id=request.dataset_id,
            algorithm=request.algorithm,
            params=request.params,
            test_size=request.test_size,
            random_state=request.random_state
        )
        
        logger.info(f"Training job started: {job_id}")
        return job
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting training job: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start training job"
        )


@router.get("/status", response_model=TrainingStatus)
async def get_training_status(
    job_id: str,
    db: Session = Depends(get_db)
):
    """Get training job status."""
    try:
        job = training_persistence.get_training_job(db, job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training job not found"
            )
        
        # Parse logs if available
        logs = None
        if job.logs:
            logs = job.logs.split('\n')
        
        return TrainingStatus(
            job_id=job.job_id,
            status=job.status,
            progress=job.progress,
            logs=logs,
            created_at=job.created_at,
            updated_at=job.updated_at,
            completed_at=job.completed_at,
            error_message=job.error_message,
            model_id=job.model_id
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting training status {job_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve training status"
        )


@router.get("/jobs", response_model=List[TrainingJobSchema])
async def get_training_jobs(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all training jobs."""
    try:
        jobs = training_persistence.get_training_jobs(db, skip=skip, limit=limit)
        return jobs
    except Exception as e:
        logger.error(f"Error getting training jobs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve training jobs"
        )


@router.delete("/jobs/{job_id}", response_model=SuccessResponse)
async def cancel_training_job(
    job_id: str,
    db: Session = Depends(get_db)
):
    """Cancel a training job."""
    try:
        job = training_persistence.get_training_job(db, job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training job not found"
            )
        
        if job.status in ["finished", "failed"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot cancel completed job"
            )
        
        # Update job status
        training_persistence.update_training_job(
            db=db,
            job_id=job_id,
            status="cancelled",
            error_message="Job cancelled by user"
        )
        
        logger.info(f"Training job cancelled: {job_id}")
        return SuccessResponse(message="Training job cancelled successfully")
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling training job {job_id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to cancel training job"
        )


async def run_training_job(
    job_id: str,
    dataset_id: str,
    algorithm: str,
    params: Optional[dict],
    test_size: float,
    random_state: int
):
    """Run training job in background."""
    from ..core.database import SessionLocal
    
    db = SessionLocal()
    try:
        # Update job status to running
        training_persistence.update_training_job(
            db=db,
            job_id=job_id,
            status="running",
            progress=10
        )
        
        # Get dataset
        dataset = dataset_persistence.get_dataset(db, dataset_id)
        if not dataset:
            raise Exception("Dataset not found")
        
        # Load and preprocess data
        df = preprocessor.load_dataset(dataset.file_path)
        df_clean = preprocessor.clean_dataset(df)
        
        # Prepare features
        X, y = preprocessor.prepare_features(df_clean, dataset.target_column)
        
        if y is None:
            raise Exception("No target column specified")
        
        # Update progress
        training_persistence.update_training_job(
            db=db,
            job_id=job_id,
            progress=30
        )
        
        # Train model
        results = ml_trainer.train_model(
            X=X,
            y=y,
            algorithm=algorithm,
            params=params,
            test_size=test_size,
            random_state=random_state
        )
        
        # Update progress
        training_persistence.update_training_job(
            db=db,
            job_id=job_id,
            progress=80
        )
        
        # Save model
        model_id = model_persistence.generate_model_id()
        model_path = ml_trainer.save_model(
            model=results["model"],
            scaler=results["scaler"],
            label_encoder=results["label_encoder"],
            model_id=model_id,
            algorithm=algorithm,
            dataset_id=dataset_id,
            accuracy=results["accuracy"],
            metrics=results,
            params=params or {}
        )
        
        # Save model metadata
        model_persistence.save_model_metadata(
            db=db,
            model_id=model_id,
            algorithm=algorithm,
            dataset_id=dataset_id,
            accuracy=results["accuracy"],
            model_path=model_path,
            params=params or {},
            metrics=results
        )
        
        # Update job status to finished
        training_persistence.update_training_job(
            db=db,
            job_id=job_id,
            status="finished",
            progress=100,
            model_id=model_id
        )
        
        logger.info(f"Training job completed successfully: {job_id}")
        
    except Exception as e:
        logger.error(f"Training job failed {job_id}: {str(e)}")
        training_persistence.update_training_job(
            db=db,
            job_id=job_id,
            status="failed",
            error_message=str(e)
        )
    finally:
        db.close()
