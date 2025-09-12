"""Database configuration and models."""

from datetime import datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text,
    create_engine,
    JSON,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from .config import settings

# Database setup
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


class Dataset(Base):
    """Dataset model for storing uploaded datasets."""
    
    __tablename__ = "datasets"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    rows = Column(Integer, nullable=False)
    columns = Column(Integer, nullable=False)
    target_column = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_processed = Column(Boolean, default=False)
    dataset_metadata = Column(JSON, nullable=True)  # Store additional dataset info


class Model(Base):
    """Model for storing trained ML models."""
    
    __tablename__ = "models"
    
    model_id = Column(String, primary_key=True, index=True)
    algorithm = Column(String, nullable=False)
    dataset_id = Column(String, nullable=False)
    accuracy = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    model_path = Column(String, nullable=False)
    params = Column(JSON, nullable=True)
    metrics = Column(JSON, nullable=True)
    is_active = Column(Boolean, default=True)


class TrainingJob(Base):
    """Model for tracking training jobs."""
    
    __tablename__ = "training_jobs"
    
    job_id = Column(String, primary_key=True, index=True)
    dataset_id = Column(String, nullable=False)
    algorithm = Column(String, nullable=False)
    status = Column(String, nullable=False, default="queued")  # queued, running, finished, failed
    progress = Column(Integer, default=0)
    logs = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    model_id = Column(String, nullable=True)


# Create all tables
def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)


# Dependency to get database session
def get_db():
    """Get database session dependency."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
