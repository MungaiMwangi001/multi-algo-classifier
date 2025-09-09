from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import time

class MLClassifier:
    def __init__(self):
        self.models = {
            "logistic_regression": LogisticRegression(),
            "decision_tree": DecisionTreeClassifier(),
            "random_forest": RandomForestClassifier(),
            "svm": SVC(probability=True),
            "knn": KNeighborsClassifier(),
            "naive_bayes": GaussianNB()
        }
    
    def train_model(self, algorithm, X_train, y_train):
        """Train a specific model"""
        if algorithm not in self.models:
            raise ValueError(f"Algorithm {algorithm} not supported")
        
        start_time = time.time()
        model = self.models[algorithm]
        model.fit(X_train, y_train)
        training_time = time.time() - start_time
        
        return model, training_time
    
    def evaluate_model(self, model, X_test, y_test):
        """Evaluate model performance"""
        y_pred = model.predict(X_test)
        
        # For multi-class classification, use weighted average
        average_method = 'binary' if len(set(y_test)) == 2 else 'weighted'
        
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average=average_method, zero_division=0)
        recall = recall_score(y_test, y_pred, average=average_method, zero_division=0)
        f1 = f1_score(y_test, y_pred, average=average_method, zero_division=0)
        
        return accuracy, precision, recall, f1