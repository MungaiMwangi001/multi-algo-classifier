from pydantic import BaseModel
from typing import List

class DatasetInfo(BaseModel):
    id: str
    name: str
    upload_time: str
    samples: int
    features: int
    classes: int
    feature_names: List[str]
    target_names: List[str]

class DatasetUploadResponse(BaseModel):
    message: str
    dataset_id: str
