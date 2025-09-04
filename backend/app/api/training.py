from fastapi import APIRouter, HTTPException, BackgroundTasks
from sklearn.model_selection import train_test_split
import time
import uuid

from app.schemas.training import TrainRequest, AlgorithmResponse
from app.ml.preprocessing import preprocess_data
from app.ml.train import train_model

router = APIRouter()

# Global model storage
models = {}

@router.post("/train", response_model=AlgorithmResponse)
def train_algorithm(request: TrainRequest):
    """Train a machine learning model"""
    try:
        from app.api.datasets import datasets, active_dataset_id
        
        if active_dataset_id is None:
            raise HTTPException(status_code=400, detail="No active dataset")
        
        dataset = datasets[active_dataset_id]
        X = dataset["data"]
        y = dataset["target"]
        
        # Preprocess data
        X_processed, y_processed, preprocessor, target_names = preprocess_data(
            X, y, request.preprocessing, request.encoding
        )
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_processed, y_processed, 
            test_size=request.test_size, 
            random_state=request.random_state, 
            stratify=y_processed
        )
        
        # Train model
        start_time = time.time()
        result = train_model(
            request.algorithm, X_train, X_test, y_train, y_test, 
            target_names, request.cv_folds, dataset["feature_names"]
        )
        training_time = time.time() - start_time
        
        # Create model ID
        model_id = str(uuid.uuid4())
        
        # Store model
        models[model_id] = {
            "model": result["model"],
            "algorithm": request.algorithm,
            "dataset_id": active_dataset_id,
            "training_time": training_time,
            "metrics": {
                "accuracy": result["accuracy"],
                "precision": result["precision"],
                "recall": result["recall"],
                "f1_score": result["f1_score"],
                "auc": result["auc"],
                "classification_report": result["classification_report"],
                "confusion_matrix": result["confusion_matrix"],
                "roc_curve": result["roc_curve"],
                "pr_curve": result["pr_curve"],
                "feature_importance": result["feature_importance"]
            },
            "preprocessor": preprocessor,
            "target_names": target_names,
            "feature_names": dataset["feature_names"]
        }
        
        return {
            "name": request.algorithm.value,
            "accuracy": result["accuracy"],
            "precision": result["precision"],
            "recall": result["recall"],
            "f1_score": result["f1_score"],
            "auc": result["auc"],
            "roc_curve": result["roc_curve"],
            "pr_curve": result["pr_curve"],
            "confusion_matrix": result["confusion_matrix"],
            "feature_importance": result["feature_importance"],
            "cv_mean": result["cv_mean"],
            "cv_std": result["cv_std"]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error training model: {str(e)}")

@router.post("/train-all", response_model=dict)
def train_all_algorithms(
    test_size: float = 0.2,
    random_state: int = 42,
    cv_folds: int = 5,
    preprocessing: str = "standard",
    encoding: str = "label"
):
    """Train all available algorithms and return results"""
    try:
        from app.api.datasets import datasets, active_dataset_id
        from app.schemas.training import PreprocessingMethod, EncodingMethod, AlgorithmName
        
        if active_dataset_id is None:
            raise HTTPException(status_code=400, detail="No active dataset")
        
        dataset = datasets[active_dataset_id]
        X = dataset["data"]
        y = dataset["target"]
        
        # Preprocess data
        X_processed, y_processed, preprocessor, target_names = preprocess_data(
            X, y, PreprocessingMethod(preprocessing), EncodingMethod(encoding)
        )
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X_processed, y_processed, 
            test_size=test_size, 
            random_state=random_state, 
            stratify=y_processed
        )
        
        results = {}
        
        # Train all algorithms
        for algorithm in AlgorithmName:
            try:
                start_time = time.time()
                result = train_model(
                    algorithm, X_train, X_test, y_train, y_test, 
                    target_names, cv_folds, dataset["feature_names"]
                )
                training_time = time.time() - start_time
                
                # Create model ID
                model_id = str(uuid.uuid4())
                
                # Store model
                models[model_id] = {
                    "model": result["model"],
                    "algorithm": algorithm,
                    "dataset_id": active_dataset_id,
                    "training_time": training_time,
                    "metrics": {
                        "accuracy": result["accuracy"],
                        "precision": result["precision"],
                        "recall": result["recall"],
                        "f1_score": result["f1_score"],
                        "auc": result["auc"],
                        "classification_report": result["classification_report"],
                        "confusion_matrix": result["confusion_matrix"],
                        "roc_curve": result["roc_curve"],
                        "pr_curve": result["pr_curve"],
                        "feature_importance": result["feature_importance"]
                    },
                    "preprocessor": preprocessor,
                    "target_names": target_names,
                    "feature_names": dataset["feature_names"]
                }
                
                results[algorithm.value] = {
                    "id": model_id,
                    "algorithm": algorithm.value,
                    "dataset_id": active_dataset_id,
                    "training_time": training_time,
                    "accuracy": result["accuracy"],
                    "precision": result["precision"],
                    "recall": result["recall"],
                    "f1_score": result["f1_score"],
                    "auc": result["auc"],
                    "confusion_matrix": result["confusion_matrix"],
                    "feature_importance": result["feature_importance"],
                    "cv_mean": result["cv_mean"],
                    "cv_std": result["cv_std"]
                }
                
            except Exception as e:
                # Continue with other algorithms even if one fails
                continue
        
        return results
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error training all models: {str(e)}")