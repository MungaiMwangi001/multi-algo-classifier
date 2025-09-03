from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import io
from typing import List, Optional

app = FastAPI()

origins = [
    "http://localhost:5173",  # frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # or ["*"] to allow all origins (less secure)
    allow_credentials=True,
    allow_methods=["*"],    # GET, POST, etc.
    allow_headers=["*"],    # allow all headers
)
# Global dataset storage
uploaded_data = None
uploaded_target = None

# Default dataset (Iris)
iris = load_iris()
X_default = iris.data
y_default = iris.target
feature_names_default = iris.feature_names
target_names_default = iris.target_names


# Request models
class TrainRequest(BaseModel):
    algorithm: str
    test_size: float = 0.2
    random_state: int = 42


class AlgorithmResponse(BaseModel):
    name: str
    accuracy: float
    classification_report: dict
    confusion_matrix: List[List[int]]


# Train and evaluate model
def train_model(algorithm, X_train, X_test, y_train, y_test, target_names):
    models = {
        "Logistic Regression": LogisticRegression(random_state=42, max_iter=200),
        "Decision Tree": DecisionTreeClassifier(random_state=42),
        "Random Forest": RandomForestClassifier(random_state=42),
        "SVM": SVC(random_state=42, probability=True),
        "Naive Bayes": GaussianNB(),
        "KNN": KNeighborsClassifier()
    }

    if algorithm not in models:
        raise HTTPException(status_code=400, detail="Algorithm not supported")

    model = models[algorithm]
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)
    clf_report = classification_report(y_test, y_pred, output_dict=True, target_names=target_names)
    cm = confusion_matrix(y_test, y_pred).tolist()

    return {
        "accuracy": accuracy,
        "classification_report": clf_report,
        "confusion_matrix": cm
    }


@app.get("/")
def read_root():
    return {"message": "ML Classification API", "dataset": "Iris (default) or uploaded CSV"}


@app.get("/dataset-info")
def get_dataset_info():
    global uploaded_data, uploaded_target

    if uploaded_data is not None and uploaded_target is not None:
        return {
            "feature_names": uploaded_data.columns.tolist(),
            "target_names": sorted(list(set(uploaded_target))),
            "samples": len(uploaded_data),
            "features": uploaded_data.shape[1],
            "classes": len(set(uploaded_target))
        }
    else:
        return {
            "feature_names": feature_names_default,
            "target_names": target_names_default.tolist(),
            "samples": len(X_default),
            "features": len(feature_names_default),
            "classes": len(target_names_default)
        }


@app.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    """
    Accepts a CSV file. Assumes last column = target.
    """
    global uploaded_data, uploaded_target

    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode("utf-8")))

    if df.shape[1] < 2:
        raise HTTPException(status_code=400, detail="Dataset must have at least 2 columns (features + target)")

    uploaded_data = df.iloc[:, :-1]  # all but last column as features
    uploaded_target = df.iloc[:, -1]  # last column as target

    return {
        "message": "Dataset uploaded successfully",
        "feature_names": uploaded_data.columns.tolist(),
        "target_samples": uploaded_target.value_counts().to_dict()
    }


@app.post("/train", response_model=AlgorithmResponse)
def train_algorithm(request: TrainRequest):
    global uploaded_data, uploaded_target

    # Use uploaded dataset if available, else default Iris
    if uploaded_data is not None and uploaded_target is not None:
        X, y = uploaded_data.values, uploaded_target.values
        target_names = sorted(list(set(y.astype(str))))
    else:
        X, y = X_default, y_default
        target_names = target_names_default

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=request.test_size, random_state=request.random_state, stratify=y
    )

    result = train_model(request.algorithm, X_train, X_test, y_train, y_test, target_names)

    return {
        "name": request.algorithm,
        "accuracy": result["accuracy"],
        "classification_report": result["classification_report"],
        "confusion_matrix": result["confusion_matrix"]
    }


@app.post("/train-all")
def train_all_algorithms():
    global uploaded_data, uploaded_target

    if uploaded_data is not None and uploaded_target is not None:
        X, y = uploaded_data.values, uploaded_target.values
        target_names = sorted(list(set(y.astype(str))))
    else:
        X, y = X_default, y_default
        target_names = target_names_default

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    algorithms = [
        "Logistic Regression",
        "Decision Tree",
        "Random Forest",
        "SVM",
        "Naive Bayes",
        "KNN"
    ]

    results = {}
    for algo in algorithms:
        results[algo] = train_model(algo, X_train, X_test, y_train, y_test, target_names)

    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
