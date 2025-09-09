from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.models.schemas import TrainingRequest, TrainingResult, AlgorithmName
from app.ml.classifier import MLClassifier
from app.ml.preprocessing import load_and_preprocess_data
from app.ml.persistence import save_model
import pandas as pd
import uuid

router = APIRouter()
classifier = MLClassifier()

@router.post("/train", response_model=list[TrainingResult])
async def train_model(request: TrainingRequest, background_tasks: BackgroundTasks):
    """Train one or multiple models"""
    global active_dataset
    
    if not active_dataset:
        raise HTTPException(status_code=404, detail="No active dataset found")
    
    try:
        # Load and preprocess data
        X_train, X_test, y_train, y_test, scaler = load_and_preprocess_data(
            active_dataset["path"], request.target_column
        )
        
        results = []
        
        # Train requested algorithms
        for algorithm in request.algorithms:
            try:
                # Train model
                model, training_time = classifier.train_model(algorithm, X_train, y_train)
                
                # Evaluate model
                accuracy, precision, recall, f1 = classifier.evaluate_model(model, X_test, y_test)
                
                # Generate unique model ID
                model_id = f"{algorithm}_{uuid.uuid4().hex[:8]}"
                
                # Save model (in background to avoid blocking)
                feature_columns = list(pd.read_csv(active_dataset["path"]).drop(
                    columns=[request.target_column]).columns)
                
                # Save model in background
                background_tasks.add_task(
                    save_model, 
                    model, model_id, algorithm, accuracy, 
                    active_dataset["info"]["filename"], scaler, feature_columns
                )
                
                results.append(TrainingResult(
                    algorithm=AlgorithmName(algorithm),
                    accuracy=accuracy,
                    precision=precision,
                    recall=recall,
                    f1_score=f1,
                    training_time=training_time,
                    model_path=model_id
                ))
                
            except Exception as e:
                # Log error but continue with other algorithms
                print(f"Error training {algorithm}: {str(e)}")
                continue
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during training: {str(e)}")