import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
import numpy as np

def load_and_preprocess_data(file_path, target_column):
    """Load dataset and preprocess it for training"""
    df = pd.read_csv(file_path)
    
    # Separate features and target
    X = df.drop(columns=[target_column])
    y = df[target_column]
    
    # Encode categorical target if needed
    if y.dtype == 'object':
        le = LabelEncoder()
        y = le.fit_transform(y)
    
    # Handle categorical features (simple one-hot encoding)
    X = pd.get_dummies(X)
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale numerical features
    scaler = StandardScaler()
    X_train = scaler.fit_transform(X_train)
    X_test = scaler.transform(X_test)
    
    return X_train, X_test, y_train, y_test, scaler

def prepare_prediction_data(input_data, scaler, feature_columns):
    """Prepare new data for prediction using the same preprocessing"""
    df = pd.DataFrame(input_data)
    
    # Ensure all expected columns are present
    for col in feature_columns:
        if col not in df.columns:
            df[col] = 0  # Add missing columns with default value
    
    # Reorder columns to match training data
    df = df[feature_columns]
    
    # Apply scaling
    scaled_data = scaler.transform(df)
    
    return scaled_data