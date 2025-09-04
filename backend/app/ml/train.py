import numpy as np
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.neighbors import KNeighborsClassifier
import xgboost as xgb
import lightgbm as lgb
from catboost import CatBoostClassifier
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset
from app.schemas.training import AlgorithmName
from app.ml.evaluate import calculate_metrics

# Simple Neural Network
class SimpleNN(nn.Module):
    def __init__(self, input_size, num_classes):
        super(SimpleNN, self).__init__()
        self.fc1 = nn.Linear(input_size, 64)
        self.fc2 = nn.Linear(64, 32)
        self.fc3 = nn.Linear(32, num_classes)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(0.2)
        
    def forward(self, x):
        x = self.relu(self.fc1(x))
        x = self.dropout(x)
        x = self.relu(self.fc2(x))
        x = self.dropout(x)
        x = self.fc3(x)
        return x

def train_model(algorithm, X_train, X_test, y_train, y_test, target_names, cv_folds, feature_names):
    """Train and evaluate a model"""
    models_config = {
        AlgorithmName.LOGISTIC_REGRESSION: LogisticRegression(random_state=42, max_iter=1000),
        AlgorithmName.DECISION_TREE: DecisionTreeClassifier(random_state=42),
        AlgorithmName.RANDOM_FOREST: RandomForestClassifier(random_state=42, n_estimators=100),
        AlgorithmName.SVM: SVC(random_state=42, probability=True),
        AlgorithmName.NAIVE_BAYES: GaussianNB(),
        AlgorithmName.KNN: KNeighborsClassifier(),
        AlgorithmName.XGBOOST: xgb.XGBClassifier(random_state=42, eval_metric='mlogloss', use_label_encoder=False),
        AlgorithmName.LIGHTGBM: lgb.LGBMClassifier(random_state=42),
        AlgorithmName.CATBOOST: CatBoostClassifier(random_state=42, verbose=0),
    }
    
    if algorithm not in models_config and algorithm != AlgorithmName.NEURAL_NETWORK:
        raise ValueError("Algorithm not supported")
    
    # Handle neural network separately
    if algorithm == AlgorithmName.NEURAL_NETWORK:
        # Convert to tensors
        X_train_tensor = torch.FloatTensor(X_train)
        X_test_tensor = torch.FloatTensor(X_test)
        y_train_tensor = torch.LongTensor(y_train)
        y_test_tensor = torch.LongTensor(y_test)
        
        # Create datasets and dataloaders
        train_dataset = TensorDataset(X_train_tensor, y_train_tensor)
        train_loader = DataLoader(train_dataset, batch_size=32, shuffle=True)
        
        # Initialize model
        model = SimpleNN(X_train.shape[1], len(target_names))
        criterion = nn.CrossEntropyLoss()
        optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
        
        # Train model
        model.train()
        for epoch in range(50):  # Reduced for demo purposes
            for batch_x, batch_y in train_loader:
                optimizer.zero_grad()
                outputs = model(batch_x)
                loss = criterion(outputs, batch_y)
                loss.backward()
                optimizer.step()
        
        # Predict
        model.eval()
        with torch.no_grad():
            test_outputs = model(X_test_tensor)
            y_pred = torch.argmax(test_outputs, dim=1).numpy()
            y_prob = torch.softmax(test_outputs, dim=1).numpy()
    else:
        # Train traditional model
        model = models_config[algorithm]
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test) if hasattr(model, 'predict_proba') else None
    
    # Calculate metrics
    metrics = calculate_metrics(y_test, y_pred, y_prob, target_names, feature_names, model)
    
    # Cross-validation
    cv_scores = cross_val_score(
        model, np.vstack((X_train, X_test)), np.hstack((y_train, y_test)), 
        cv=StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=42)
    )
    metrics["cv_mean"] = float(np.mean(cv_scores))
    metrics["cv_std"] = float(np.std(cv_scores))
    
    return {
        "model": model,
        **metrics
    }