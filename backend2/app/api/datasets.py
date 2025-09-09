from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import pandas as pd
from pathlib import Path
import uuid
from app.core.config import settings
from app.models.schemas import DatasetInfo

router = APIRouter()

# In-memory storage for active dataset (for demo purposes)
active_dataset = None

@router.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...), target_column: str = Form(...)):
    """Upload a CSV dataset and set it as active"""
    global active_dataset
    
    try:
        # Generate unique filename
        file_extension = Path(file.filename).suffix
        file_name = f"{uuid.uuid4()}{file_extension}"
        file_path = settings.UPLOAD_DIR / file_name
        
        # Save file
        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)
        
        # Load dataset for analysis
        df = pd.read_csv(file_path)
        
        # Validate target column exists
        if target_column not in df.columns:
            raise HTTPException(status_code=400, detail=f"Target column '{target_column}' not found in dataset")
        
        # Analyze dataset
        dataset_info = {
            "filename": file_name,
            "columns": list(df.columns),
            "rows": len(df),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
            "missing_values": df.isnull().sum().to_dict(),
            "target_column": target_column
        }
        
        # Set as active dataset
        active_dataset = {
            "path": file_path,
            "info": dataset_info
        }
        
        # Get preview data (first 10 rows)
        preview = df.head(10).to_dict(orient="records")
        
        return {
            "dataset_id": file_name,
            "preview": preview,
            "info": dataset_info
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing dataset: {str(e)}")

@router.get("/dataset-info")
async def get_dataset_info():
    """Get information about the active dataset"""
    if not active_dataset:
        raise HTTPException(status_code=404, detail="No active dataset found")
    
    return active_dataset["info"]