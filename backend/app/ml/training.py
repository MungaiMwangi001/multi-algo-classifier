"""ML training utilities and model management."""

import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from datetime import datetime
import uuid

from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    roc_curve, auc, roc_auc_score
)

from ..core.logging import get_logger
from ..core.config import settings

logger = get_logger(__name__)


class MLTrainer:
    """Handles ML model training and evaluation."""
    
    def __init__(self):
        self.models = {
            "logistic_regression": LogisticRegression,
            "random_forest": RandomForestClassifier,
            "decision_tree": DecisionTreeClassifier,
            "gradient_boosting": GradientBoostingClassifier,
            "svm": SVC
        }
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.is_fitted = False
    
    def get_available_algorithms(self) -> List[str]:
        """Get list of available ML algorithms."""
        return list(self.models.keys())
    
    def get_algorithm_params(self, algorithm: str) -> Dict[str, Any]:
        """Get default parameters for an algorithm."""
        default_params = {
            "logistic_regression": {
                "max_iter": 1000,
                "random_state": 42,
                "solver": "liblinear"
            },
            "random_forest": {
                "n_estimators": 100,
                "random_state": 42,
                "max_depth": 10
            },
            "decision_tree": {
                "random_state": 42,
                "max_depth": 10
            },
            "gradient_boosting": {
                "n_estimators": 100,
                "random_state": 42,
                "max_depth": 3
            },
            "svm": {
                "random_state": 42,
                "kernel": "rbf",
                "probability": True
            }
        }
        return default_params.get(algorithm, {})
    
    def train_model(self, 
                   X: pd.DataFrame, 
                   y: pd.Series, 
                   algorithm: str,
                   params: Optional[Dict[str, Any]] = None,
                   test_size: float = 0.2,
                   random_state: int = 42) -> Dict[str, Any]:
        """Train a model and return results."""
        
        if algorithm not in self.models:
            raise ValueError(f"Unsupported algorithm: {algorithm}")
        
        # Get parameters
        if params is None:
            params = self.get_algorithm_params(algorithm)
        
        logger.info(f"Training {algorithm} with params: {params}")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Encode target if needed
        if y.dtype == 'object':
            y_train_encoded = self.label_encoder.fit_transform(y_train)
            y_test_encoded = self.label_encoder.transform(y_test)
        else:
            y_train_encoded = y_train
            y_test_encoded = y_test
        
        # Train model
        model_class = self.models[algorithm]
        model = model_class(**params)
        model.fit(X_train_scaled, y_train_encoded)
        
        # Make predictions
        y_pred = model.predict(X_test_scaled)
        y_pred_proba = None
        
        # Get probabilities if available
        if hasattr(model, 'predict_proba'):
            y_pred_proba = model.predict_proba(X_test_scaled)
        
        # Calculate metrics
        accuracy = accuracy_score(y_test_encoded, y_pred)
        
        # Confusion matrix
        cm = confusion_matrix(y_test_encoded, y_pred)
        
        # ROC curve data
        fpr, tpr, roc_auc = self._calculate_roc_curve(y_test_encoded, y_pred_proba)
        
        # Feature importance
        feature_importance = self._get_feature_importance(model, X.columns.tolist())
        
        # Classification report
        class_report = classification_report(
            y_test_encoded, y_pred, 
            output_dict=True, 
            zero_division=0
        )
        
        # Prepare results
        results = {
            "model": model,
            "scaler": self.scaler,
            "label_encoder": self.label_encoder,
            "accuracy": float(accuracy),
            "confusion_matrix": cm.tolist(),
            "fpr": fpr.tolist(),
            "tpr": tpr.tolist(),
            "roc_auc": float(roc_auc),
            "feature_importance": feature_importance,
            "classification_report": class_report,
            "test_size": test_size,
            "random_state": random_state,
            "algorithm": algorithm,
            "params": params,
            "feature_columns": X.columns.tolist(),
            "target_classes": self.label_encoder.classes_.tolist() if hasattr(self.label_encoder, 'classes_') else None
        }
        
        self.is_fitted = True
        logger.info(f"Training completed. Accuracy: {accuracy:.4f}")
        
        return results
    
    def _calculate_roc_curve(self, y_true: np.ndarray, y_pred_proba: Optional[np.ndarray]) -> Tuple[np.ndarray, np.ndarray, float]:
        """Calculate ROC curve data."""
        if y_pred_proba is None or len(y_pred_proba.shape) == 1:
            # Binary classification or no probabilities
            if y_pred_proba is not None:
                fpr, tpr, _ = roc_curve(y_true, y_pred_proba)
                roc_auc = auc(fpr, tpr)
            else:
                # Fallback for models without probabilities
                fpr = np.array([0, 1])
                tpr = np.array([0, 1])
                roc_auc = 0.5
        else:
            # Multi-class classification
            fpr, tpr, _ = roc_curve(y_true, y_pred_proba[:, 1])
            roc_auc = auc(fpr, tpr)
        
        return fpr, tpr, roc_auc
    
    def _get_feature_importance(self, model: Any, feature_names: List[str]) -> List[Dict[str, Any]]:
        """Get feature importance from model."""
        importance = []
        
        if hasattr(model, 'feature_importances_'):
            # Tree-based models
            for name, imp in zip(feature_names, model.feature_importances_):
                importance.append({"feature": name, "importance": float(imp)})
        elif hasattr(model, 'coef_'):
            # Linear models
            coef = model.coef_[0] if len(model.coef_.shape) > 1 else model.coef_
            for name, coef_val in zip(feature_names, coef):
                importance.append({"feature": name, "importance": float(abs(coef_val))})
        else:
            # No feature importance available
            for name in feature_names:
                importance.append({"feature": name, "importance": 0.0})
        
        # Sort by importance
        importance.sort(key=lambda x: x["importance"], reverse=True)
        return importance
    
    def save_model(self, 
                  model: Any, 
                  scaler: Any, 
                  label_encoder: Any,
                  model_id: str,
                  algorithm: str,
                  dataset_id: str,
                  accuracy: float,
                  metrics: Dict[str, Any],
                  params: Dict[str, Any]) -> str:
        """Save trained model to disk."""
        
        # Create models directory
        models_dir = Path(settings.models_dir)
        models_dir.mkdir(exist_ok=True)
        
        # Create model file path
        model_path = models_dir / f"{model_id}.joblib"
        
        # Prepare model data
        model_data = {
            "model": model,
            "scaler": scaler,
            "label_encoder": label_encoder,
            "algorithm": algorithm,
            "dataset_id": dataset_id,
            "accuracy": accuracy,
            "metrics": metrics,
            "params": params,
            "created_at": datetime.utcnow().isoformat(),
            "model_id": model_id
        }
        
        # Save model
        joblib.dump(model_data, model_path)
        
        logger.info(f"Model saved to {model_path}")
        return str(model_path)
    
    def load_model(self, model_path: str) -> Dict[str, Any]:
        """Load trained model from disk."""
        try:
            model_data = joblib.load(model_path)
            logger.info(f"Model loaded from {model_path}")
            return model_data
        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            raise
    
    def predict(self, 
               model_data: Dict[str, Any], 
               X: pd.DataFrame) -> Dict[str, Any]:
        """Make predictions using a trained model."""
        
        model = model_data["model"]
        scaler = model_data["scaler"]
        label_encoder = model_data["label_encoder"]
        
        # Scale features
        X_scaled = scaler.transform(X)
        
        # Make predictions
        predictions = model.predict(X_scaled)
        
        # Get probabilities if available
        probabilities = None
        if hasattr(model, 'predict_proba'):
            probabilities = model.predict_proba(X_scaled)
        
        # Decode predictions if needed
        if hasattr(label_encoder, 'classes_'):
            predictions_decoded = label_encoder.inverse_transform(predictions)
        else:
            predictions_decoded = predictions
        
        # Prepare results
        results = {
            "predictions": predictions_decoded.tolist(),
            "probabilities": probabilities.tolist() if probabilities is not None else None,
            "model_id": model_data["model_id"],
            "algorithm": model_data["algorithm"]
        }
        
        return results
