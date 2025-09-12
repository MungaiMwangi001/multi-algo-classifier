"""Model persistence and storage utilities."""

import json
import shutil
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional, Any
import uuid

from ..core.logging import get_logger
from ..core.config import settings
from ..core.database import get_db, Dataset, Model, TrainingJob
from sqlalchemy.orm import Session

logger = get_logger(__name__)


class ModelPersistence:
    """Handles model persistence and storage operations."""
    
    def __init__(self):
        self.models_dir = Path(settings.models_dir)
        self.models_dir.mkdir(exist_ok=True)
    
    def generate_model_id(self) -> str:
        """Generate a unique model ID."""
        return str(uuid.uuid4())
    
    def save_model_metadata(self, 
                           db: Session,
                           model_id: str,
                           algorithm: str,
                           dataset_id: str,
                           accuracy: float,
                           model_path: str,
                           params: Dict[str, Any],
                           metrics: Dict[str, Any]) -> Model:
        """Save model metadata to database."""
        
        model = Model(
            model_id=model_id,
            algorithm=algorithm,
            dataset_id=dataset_id,
            accuracy=accuracy,
            model_path=model_path,
            params=params,
            metrics=metrics,
            is_active=True
        )
        
        db.add(model)
        db.commit()
        db.refresh(model)
        
        logger.info(f"Model metadata saved: {model_id}")
        return model
    
    def get_model(self, db: Session, model_id: str) -> Optional[Model]:
        """Get model from database."""
        return db.query(Model).filter(Model.model_id == model_id).first()
    
    def get_models(self, db: Session, skip: int = 0, limit: int = 100) -> List[Model]:
        """Get all models from database."""
        return db.query(Model).offset(skip).limit(limit).all()
    
    def get_models_by_dataset(self, db: Session, dataset_id: str) -> List[Model]:
        """Get models trained on a specific dataset."""
        return db.query(Model).filter(Model.dataset_id == dataset_id).all()
    
    def delete_model(self, db: Session, model_id: str) -> bool:
        """Delete model from database and filesystem."""
        model = self.get_model(db, model_id)
        if not model:
            return False
        
        # Delete model file
        model_path = Path(model.model_path)
        if model_path.exists():
            model_path.unlink()
            logger.info(f"Deleted model file: {model_path}")
        
        # Delete from database
        db.delete(model)
        db.commit()
        
        logger.info(f"Model deleted: {model_id}")
        return True
    
    def cleanup_old_models(self, db: Session, retention_days: int = None) -> int:
        """Clean up old models based on retention policy."""
        if retention_days is None:
            retention_days = settings.model_retention_days
        
        cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
        old_models = db.query(Model).filter(Model.created_at < cutoff_date).all()
        
        deleted_count = 0
        for model in old_models:
            if self.delete_model(db, model.model_id):
                deleted_count += 1
        
        logger.info(f"Cleaned up {deleted_count} old models")
        return deleted_count
    
    def get_model_stats(self, db: Session) -> Dict[str, Any]:
        """Get model statistics."""
        total_models = db.query(Model).count()
        active_models = db.query(Model).filter(Model.is_active == True).count()
        
        # Group by algorithm
        algorithm_stats = {}
        for model in db.query(Model).all():
            algo = model.algorithm
            if algo not in algorithm_stats:
                algorithm_stats[algo] = {"count": 0, "avg_accuracy": 0.0}
            algorithm_stats[algo]["count"] += 1
            algorithm_stats[algo]["avg_accuracy"] += model.accuracy
        
        # Calculate average accuracy
        for algo in algorithm_stats:
            if algorithm_stats[algo]["count"] > 0:
                algorithm_stats[algo]["avg_accuracy"] /= algorithm_stats[algo]["count"]
        
        return {
            "total_models": total_models,
            "active_models": active_models,
            "algorithm_stats": algorithm_stats
        }


class DatasetPersistence:
    """Handles dataset persistence and storage operations."""
    
    def __init__(self):
        self.upload_dir = Path(settings.upload_dir)
        self.upload_dir.mkdir(exist_ok=True)
    
    def generate_dataset_id(self) -> str:
        """Generate a unique dataset ID."""
        return str(uuid.uuid4())
    
    def save_dataset_metadata(self, 
                             db: Session,
                             dataset_id: str,
                             name: str,
                             filename: str,
                             file_path: str,
                             rows: int,
                             columns: int,
                             target_column: Optional[str] = None,
                             metadata: Optional[Dict[str, Any]] = None) -> Dataset:
        """Save dataset metadata to database."""
        
        dataset = Dataset(
            id=dataset_id,
            name=name,
            filename=filename,
            file_path=file_path,
            rows=rows,
            columns=columns,
            target_column=target_column,
            dataset_metadata=metadata,
            is_processed=False
        )
        
        db.add(dataset)
        db.commit()
        db.refresh(dataset)
        
        logger.info(f"Dataset metadata saved: {dataset_id}")
        return dataset
    
    def get_dataset(self, db: Session, dataset_id: str) -> Optional[Dataset]:
        """Get dataset from database."""
        return db.query(Dataset).filter(Dataset.id == dataset_id).first()
    
    def get_datasets(self, db: Session, skip: int = 0, limit: int = 100) -> List[Dataset]:
        """Get all datasets from database."""
        return db.query(Dataset).offset(skip).limit(limit).all()
    
    def delete_dataset(self, db: Session, dataset_id: str) -> bool:
        """Delete dataset from database and filesystem."""
        dataset = self.get_dataset(db, dataset_id)
        if not dataset:
            return False
        
        # Delete dataset file
        file_path = Path(dataset.file_path)
        if file_path.exists():
            file_path.unlink()
            logger.info(f"Deleted dataset file: {file_path}")
        
        # Delete from database
        db.delete(dataset)
        db.commit()
        
        logger.info(f"Dataset deleted: {dataset_id}")
        return True
    
    def update_dataset_processing_status(self, 
                                       db: Session, 
                                       dataset_id: str, 
                                       is_processed: bool = True) -> bool:
        """Update dataset processing status."""
        dataset = self.get_dataset(db, dataset_id)
        if not dataset:
            return False
        
        dataset.is_processed = is_processed
        dataset.updated_at = datetime.utcnow()
        db.commit()
        
        logger.info(f"Dataset processing status updated: {dataset_id}")
        return True


class TrainingJobPersistence:
    """Handles training job persistence and storage operations."""
    
    def generate_job_id(self) -> str:
        """Generate a unique job ID."""
        return str(uuid.uuid4())
    
    def create_training_job(self, 
                           db: Session,
                           job_id: str,
                           dataset_id: str,
                           algorithm: str) -> TrainingJob:
        """Create a new training job."""
        
        job = TrainingJob(
            job_id=job_id,
            dataset_id=dataset_id,
            algorithm=algorithm,
            status="queued"
        )
        
        db.add(job)
        db.commit()
        db.refresh(job)
        
        logger.info(f"Training job created: {job_id}")
        return job
    
    def update_training_job(self, 
                           db: Session,
                           job_id: str,
                           status: Optional[str] = None,
                           progress: Optional[int] = None,
                           logs: Optional[List[str]] = None,
                           error_message: Optional[str] = None,
                           model_id: Optional[str] = None) -> bool:
        """Update training job status."""
        
        job = db.query(TrainingJob).filter(TrainingJob.job_id == job_id).first()
        if not job:
            return False
        
        if status is not None:
            job.status = status
        if progress is not None:
            job.progress = progress
        if logs is not None:
            job.logs = "\n".join(logs)
        if error_message is not None:
            job.error_message = error_message
        if model_id is not None:
            job.model_id = model_id
        
        job.updated_at = datetime.utcnow()
        
        if status in ["finished", "failed"]:
            job.completed_at = datetime.utcnow()
        
        db.commit()
        
        logger.info(f"Training job updated: {job_id} - {status}")
        return True
    
    def get_training_job(self, db: Session, job_id: str) -> Optional[TrainingJob]:
        """Get training job from database."""
        return db.query(TrainingJob).filter(TrainingJob.job_id == job_id).first()
    
    def get_training_jobs(self, db: Session, skip: int = 0, limit: int = 100) -> List[TrainingJob]:
        """Get all training jobs from database."""
        return db.query(TrainingJob).offset(skip).limit(limit).all()
    
    def cleanup_old_jobs(self, db: Session, retention_days: int = 7) -> int:
        """Clean up old completed training jobs."""
        cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
        old_jobs = db.query(TrainingJob).filter(
            TrainingJob.completed_at < cutoff_date,
            TrainingJob.status.in_(["finished", "failed"])
        ).all()
        
        deleted_count = 0
        for job in old_jobs:
            db.delete(job)
            deleted_count += 1
        
        db.commit()
        
        logger.info(f"Cleaned up {deleted_count} old training jobs")
        return deleted_count
