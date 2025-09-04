import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, OneHotEncoder, StandardScaler, MinMaxScaler
from sklearn.impute import SimpleImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from app.schemas.training import PreprocessingMethod, EncodingMethod

def preprocess_data(X, y, preprocessing_method, encoding_method, categorical_features=None):
    """Preprocess data with scaling and encoding"""
    numeric_features = X.select_dtypes(include=[np.number]).columns.tolist()
    
    if categorical_features is None:
        categorical_features = X.select_dtypes(exclude=[np.number]).columns.tolist()
    
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='mean')),
    ])
    
    if encoding_method == EncodingMethod.ONEHOT:
        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
        ])
    else:
        categorical_transformer = Pipeline(steps=[
            ('imputer', SimpleImputer(strategy='most_frequent')),
            ('label', LabelEncoder())
        ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ])
    
    X_processed = preprocessor.fit_transform(X)
    
    # Apply scaling if needed
    if preprocessing_method == PreprocessingMethod.STANDARD:
        scaler = StandardScaler()
        X_processed = scaler.fit_transform(X_processed)
    elif preprocessing_method == PreprocessingMethod.MINMAX:
        scaler = MinMaxScaler()
        X_processed = scaler.fit_transform(X_processed)
    
    # Encode target if needed
    if y.dtype == 'object' or isinstance(y[0], str):
        le = LabelEncoder()
        y_processed = le.fit_transform(y)
        target_names = le.classes_.tolist()
    else:
        y_processed = y
        target_names = [str(cls) for cls in np.unique(y)]
    
    return X_processed, y_processed, preprocessor, target_names
