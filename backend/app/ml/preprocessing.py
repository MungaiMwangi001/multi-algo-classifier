"""Data preprocessing utilities for ML operations."""

import pandas as pd
import numpy as np
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path
import logging

from ..core.logging import get_logger

logger = get_logger(__name__)


class DataPreprocessor:
    """Handles data preprocessing for ML operations."""
    
    def __init__(self):
        self.scaler = None
        self.encoders = {}
        self.feature_columns = []
        self.target_column = None
        self.is_fitted = False
    
    def load_dataset(self, file_path: str) -> pd.DataFrame:
        """Load dataset from file."""
        try:
            file_path = Path(file_path)
            
            if file_path.suffix.lower() == '.csv':
                df = pd.read_csv(file_path)
            elif file_path.suffix.lower() in ['.xlsx', '.xls']:
                df = pd.read_excel(file_path)
            else:
                raise ValueError(f"Unsupported file format: {file_path.suffix}")
            
            logger.info(f"Loaded dataset with shape {df.shape} from {file_path}")
            return df
            
        except Exception as e:
            logger.error(f"Error loading dataset: {str(e)}")
            raise
    
    def validate_dataset(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Validate dataset and return information."""
        info = {
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": list(df.columns),
            "column_types": df.dtypes.astype(str).to_dict(),
            "missing_values": df.isnull().sum().to_dict(),
            "duplicate_rows": df.duplicated().sum(),
            "memory_usage": df.memory_usage(deep=True).sum(),
        }
        
        # Check for completely empty columns
        empty_columns = df.columns[df.isnull().all()].tolist()
        if empty_columns:
            info["empty_columns"] = empty_columns
        
        # Check for constant columns (no variance)
        constant_columns = []
        for col in df.select_dtypes(include=[np.number]).columns:
            if df[col].nunique() <= 1:
                constant_columns.append(col)
        if constant_columns:
            info["constant_columns"] = constant_columns
        
        logger.info(f"Dataset validation completed: {info['rows']} rows, {info['columns']} columns")
        return info
    
    def clean_dataset(self, df: pd.DataFrame, 
                     drop_duplicates: bool = True,
                     handle_missing: str = "drop") -> pd.DataFrame:
        """Clean the dataset."""
        df_clean = df.copy()
        
        # Remove duplicates
        if drop_duplicates:
            initial_rows = len(df_clean)
            df_clean = df_clean.drop_duplicates()
            removed_rows = initial_rows - len(df_clean)
            if removed_rows > 0:
                logger.info(f"Removed {removed_rows} duplicate rows")
        
        # Handle missing values
        if handle_missing == "drop":
            initial_rows = len(df_clean)
            df_clean = df_clean.dropna()
            removed_rows = initial_rows - len(df_clean)
            if removed_rows > 0:
                logger.info(f"Removed {removed_rows} rows with missing values")
        elif handle_missing == "fill":
            # Fill numeric columns with median, categorical with mode
            for col in df_clean.columns:
                if df_clean[col].dtype in ['int64', 'float64']:
                    df_clean[col].fillna(df_clean[col].median(), inplace=True)
                else:
                    df_clean[col].fillna(df_clean[col].mode()[0] if not df_clean[col].mode().empty else "Unknown", inplace=True)
            logger.info("Filled missing values")
        
        return df_clean
    
    def prepare_features(self, df: pd.DataFrame, target_column: Optional[str] = None) -> Tuple[pd.DataFrame, pd.Series]:
        """Prepare features and target for ML."""
        df_features = df.copy()
        
        if target_column and target_column in df_features.columns:
            y = df_features.pop(target_column)
            self.target_column = target_column
        else:
            y = None
        
        # Store feature columns
        self.feature_columns = list(df_features.columns)
        
        # Handle categorical variables
        categorical_columns = df_features.select_dtypes(include=['object', 'category']).columns
        
        for col in categorical_columns:
            # Simple label encoding for now
            df_features[col] = pd.Categorical(df_features[col]).codes
        
        # Handle any remaining non-numeric columns
        for col in df_features.columns:
            if df_features[col].dtype == 'object':
                df_features[col] = pd.to_numeric(df_features[col], errors='coerce')
        
        # Fill any NaN values that might have been created
        df_features = df_features.fillna(0)
        
        logger.info(f"Prepared {len(self.feature_columns)} features for ML")
        return df_features, y
    
    def get_dataset_preview(self, df: pd.DataFrame, n_rows: int = 10) -> List[List[str]]:
        """Get a preview of the dataset."""
        preview_df = df.head(n_rows)
        
        # Convert all values to strings and handle NaN
        preview_data = []
        for _, row in preview_df.iterrows():
            row_data = []
            for value in row:
                if pd.isna(value):
                    row_data.append("")
                else:
                    row_data.append(str(value))
            preview_data.append(row_data)
        
        return preview_data
    
    def get_feature_info(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Get detailed feature information."""
        info = {
            "numeric_features": df.select_dtypes(include=[np.number]).columns.tolist(),
            "categorical_features": df.select_dtypes(include=['object', 'category']).columns.tolist(),
            "feature_ranges": {},
            "feature_stats": {}
        }
        
        # Get ranges for numeric features
        for col in info["numeric_features"]:
            info["feature_ranges"][col] = {
                "min": float(df[col].min()),
                "max": float(df[col].max()),
                "mean": float(df[col].mean()),
                "std": float(df[col].std())
            }
        
        # Get value counts for categorical features
        for col in info["categorical_features"]:
            value_counts = df[col].value_counts().head(10).to_dict()
            info["feature_stats"][col] = {
                "unique_values": int(df[col].nunique()),
                "top_values": {str(k): int(v) for k, v in value_counts.items()}
            }
        
        return info
