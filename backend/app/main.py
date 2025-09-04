from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware  
from app.core.config import settings
from app.core.logger import setup_logging
from app.api import datasets, training, prediction, models

# Setup logging
logger = setup_logging()

# Create FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="A comprehensive API for training and comparing multiple ML algorithms",
    version="1.0.0",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(datasets.router, prefix=settings.API_V1_STR, tags=["datasets"])
app.include_router(training.router, prefix=settings.API_V1_STR, tags=["training"])
app.include_router(prediction.router, prefix=settings.API_V1_STR, tags=["prediction"])
app.include_router(models.router, prefix=settings.API_V1_STR, tags=["models"])

@app.get("/")
async def root():
    logger.info("Root endpoint called")
    return {"message": "ML Classification API", "version": settings.API_V1_STR}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
