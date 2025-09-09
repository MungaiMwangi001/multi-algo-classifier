from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import datasets, training, models, predictions
from app.core.config import settings
from app.core.logger import setup_logging

# Setup logging
setup_logging()

app = FastAPI(title="ML Classifier API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(datasets.router, prefix="/api", tags=["datasets"])
app.include_router(training.router, prefix="/api", tags=["training"])
app.include_router(models.router, prefix="/api", tags=["models"])
app.include_router(predictions.router, prefix="/api", tags=["predictions"])

@app.get("/")
async def root():
    return {"message": "ML Classifier API"}