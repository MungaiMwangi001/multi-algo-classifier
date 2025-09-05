# test_imports.py
try:
    import fastapi
    import uvicorn
    import pydantic
    import loguru
    import pandas
    import numpy
    import sklearn
    import xgboost
    import lightgbm
    import catboost
    import torch
    import joblib
 
    import aiofiles
    print("All imports successful!")
except ImportError as e:
    print(f"Import error: {e}")

# run this script to verify that all necessary packages are installed correctly.
# using: python test_imports.py