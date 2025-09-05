from pydantic import BaseModel, Field, confloat
from typing import Optional, Dict, List, Any
from enum import Enum

class AlgorithmName(str, Enum):
    LOGISTIC_REGRESSION = "Logistic Regression"
    DECISION_TREE = "Decision Tree"
    RANDOM_FOREST = "Random Forest"
    SVM = "SVM"
    NAIVE_BAYES = "Naive Bayes"
    KNN = "KNN"
    XGBOOST = "XGBoost"
    LIGHTGBM = "LightGBM"
    CATBOOST = "CatBoost"
    NEURAL_NETWORK = "Neural Network"

class PreprocessingMethod(str, Enum):
    NONE = "none"
    STANDARD = "standard"
    MINMAX = "minmax"

class EncodingMethod(str, Enum):
    LABEL = "label"
    ONEHOT = "onehot"

class TrainRequest(BaseModel):
    algorithm: AlgorithmName
    test_size: confloat (gt=0, lt=1) = Field(0.2, description="Proportion of dataset to include in test split") # type: ignore
    random_state: int = Field(42, description="Random state for reproducibility")
    cv_folds: int = Field(5, description="Number of cross-validation folds")
    preprocessing: PreprocessingMethod = Field(PreprocessingMethod.STANDARD, description="Preprocessing method")
    encoding: EncodingMethod = Field(EncodingMethod.LABEL, description="Categorical encoding method")

class AlgorithmResponse(BaseModel):
    name: str
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    auc: Optional[float] = None
    roc_curve: Optional[Dict[str, List[float]]] = None
    pr_curve: Optional[Dict[str, List[float]]] = None
    confusion_matrix: List[List[int]]
    feature_importance: Optional[Dict[str, float]] = None
    cv_mean: Optional[float] = None
    cv_std: Optional[float] = None