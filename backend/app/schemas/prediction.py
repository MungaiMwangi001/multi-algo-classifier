from pydantic import BaseModel
from typing import List, Union, Optional

class PredictionRequest(BaseModel):
    model_id: str
    data: List[List[Union[float, str]]]
    feature_names: List[str]

class PredictionResponse(BaseModel):
    predictions: List[Union[str, int]]
    probabilities: Optional[List[List[float]]] = None