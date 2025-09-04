from fastapi import APIRouter, HTTPException, UploadFile, File, Query
import pandas as pd
import io
import uuid
from datetime import datetime
from typing import Optional

from app.ml.preprocessing import preprocess_data
from app.schemas.dataset import DatasetInfo, DatasetUploadResponse

router = APIRouter()

# Global dataset storage
datasets = {}
active_dataset_id = None

@router.post("/upload-dataset", response_model=DatasetUploadResponse)
async def upload_dataset(
    file: UploadFile = File(..., description="CSV file containing the dataset"),
    target_column: Optional[str] = Query(
        None, description="Name of the target column. If not provided, the last column will be used."
    ),
    dataset_name: Optional[str] = Query("Unnamed Dataset", description="Name for the dataset")
):
    """Upload a CSV dataset"""
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))

        # Create dataset ID
        dataset_id = str(uuid.uuid4())

        # Handle target column
        if target_column:
            if target_column not in df.columns:
                raise HTTPException(status_code=400, detail="Target column not found in dataset")
            target = df[target_column]
            data = df.drop(columns=[target_column])
        else:
            # Use last column as target
            target = df.iloc[:, -1]
            data = df.iloc[:, :-1]

        # Store dataset
        datasets[dataset_id] = {
            "name": dataset_name,
            "data": data,
            "target": target,
            "upload_time": datetime.now().isoformat(),
            "feature_names": data.columns.tolist()
        }

        # Set as active dataset
        global active_dataset_id
        active_dataset_id = dataset_id

        return {"message": "Dataset uploaded successfully", "dataset_id": dataset_id}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing dataset: {str(e)}")

@router.get("/dataset-info", response_model=DatasetInfo)
def get_dataset_info(dataset_id: Optional[str] = Query(None)):
    """Get information about a dataset"""
    if dataset_id is None:
        if active_dataset_id is None:
            raise HTTPException(status_code=400, detail="No active dataset")
        dataset_id = active_dataset_id

    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")

    dataset = datasets[dataset_id]
    data = dataset["data"]
    target = dataset["target"]

    if target.dtype == 'object' or isinstance(target.iloc[0], str):
        target_names = sorted(target.unique().tolist())
    else:
        target_names = sorted([str(cls) for cls in target.unique()])

    return {
        "id": dataset_id,
        "name": dataset["name"],
        "upload_time": dataset["upload_time"],
        "samples": len(data),
        "features": data.shape[1],
        "classes": len(target_names),
        "feature_names": dataset["feature_names"],
        "target_names": target_names
    }

@router.get("/datasets", response_model=dict)
def list_datasets():
    """List all uploaded datasets"""
    dataset_list = []
    for dataset_id, dataset_data in datasets.items():
        target = dataset_data["target"]
        if target.dtype == 'object' or isinstance(target.iloc[0], str):
            target_names = sorted(target.unique().tolist())
        else:
            target_names = sorted([str(cls) for cls in target.unique()])

        dataset_list.append({
            "id": dataset_id,
            "name": dataset_data["name"],
            "upload_time": dataset_data["upload_time"],
            "samples": len(dataset_data["data"]),
            "features": dataset_data["data"].shape[1],
            "classes": len(target_names),
            "feature_names": dataset_data["feature_names"],
            "target_names": target_names
        })

    return {"datasets": dataset_list}

@router.post("/set-dataset", response_model=dict)
def set_active_dataset(dataset_id: str = Query(...)):
    """Set the active dataset for operations"""
    if dataset_id not in datasets:
        raise HTTPException(status_code=404, detail="Dataset not found")

    global active_dataset_id
    active_dataset_id = dataset_id

    return {"message": "Active dataset set successfully", "dataset_id": dataset_id}
