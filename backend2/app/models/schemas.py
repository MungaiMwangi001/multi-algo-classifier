from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
from enum import Enum

class AlgorithmName(str, Enum):
    LOGISTIC_REGRESSION = "logistic_regression"
    DECISION_TREE = "decision_tree"
    RANDOM_FOREST = "random_forest"
    SVM = "svm"
    KNN = "knn"
    NAIVE_BAYES = "naive_bayes"

class DatasetInfo(BaseModel):
    filename: str
    columns: List[str]
    rows: int
    dtypes: Dict[str, str]
    missing_values: Dict[str, int]
    target_column: str

class TrainingRequest(BaseModel):
    algorithms: List[AlgorithmName]
    target_column: str
    test_size: float = 0.2
    random_state: int = 42

class TrainingResult(BaseModel):
    algorithm: AlgorithmName
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    training_time: float
    model_path: Optional[str] = None

class PredictionRequest(BaseModel):
    model_id: str
    data: List[Dict[str, Any]]

class PredictionResponse(BaseModel):
    predictions: List[Any]
    probabilities: Optional[List[List[float]]] = None

class ModelInfo(BaseModel):
    model_id: str
    algorithm: AlgorithmName
    accuracy: float
    trained_at: str
    dataset_name: str