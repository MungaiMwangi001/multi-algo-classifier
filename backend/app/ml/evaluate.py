import numpy as np
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix, 
    roc_curve, auc, precision_recall_curve, average_precision_score
)

def calculate_metrics(y_test, y_pred, y_prob, target_names, feature_names, model):
    """Calculate evaluation metrics for a model"""
    accuracy = accuracy_score(y_test, y_pred)
    clf_report = classification_report(y_test, y_pred, output_dict=True, target_names=target_names)
    cm = confusion_matrix(y_test, y_pred).tolist()
    
    # Calculate AUC and curves if we have probabilities
    roc_data = None
    pr_data = None
    auc_score = None
    
    if y_prob is not None and len(target_names) == 2:  # ROC is typically for binary classification
        fpr, tpr, _ = roc_curve(y_test, y_prob[:, 1])
        auc_score = auc(fpr, tpr)
        roc_data = {"fpr": fpr.tolist(), "tpr": tpr.tolist()}
        
        precision, recall, _ = precision_recall_curve(y_test, y_prob[:, 1])
        pr_data = {"precision": precision.tolist(), "recall": recall.tolist()}
    elif y_prob is not None and len(target_names) > 2:
        # For multiclass, we can calculate ROC for each class
        fpr, tpr = {}, {}
        for i in range(len(target_names)):
            fpr[i], tpr[i], _ = roc_curve((y_test == i).astype(int), y_prob[:, i])
        
        # Micro-average ROC curve
        fpr["micro"], tpr["micro"], _ = roc_curve(
            np.eye(len(target_names))[y_test].ravel(), y_prob.ravel()
        )
        auc_score = auc(fpr["micro"], tpr["micro"])
        roc_data = {
            "fpr": {str(k): v.tolist() for k, v in fpr.items()},
            "tpr": {str(k): v.tolist() for k, v in tpr.items()}
        }
    
    # Feature importance
    feature_importance = None
    if hasattr(model, "feature_importances_"):
        feature_importance = {
            feature_names[i]: float(imp) 
            for i, imp in enumerate(model.feature_importances_)
        }
    elif hasattr(model, "coef_"):
        if len(model.coef_.shape) == 1:  # Binary classification
            feature_importance = {
                feature_names[i]: float(abs(coef)) 
                for i, coef in enumerate(model.coef_)
            }
        else:  # Multiclass
            feature_importance = {
                feature_names[i]: float(abs(np.mean(coef))) 
                for i, coef in enumerate(model.coef_.T)
            }
    
    return {
        "accuracy": accuracy,
        "precision": clf_report["macro avg"]["precision"],
        "recall": clf_report["macro avg"]["recall"],
        "f1_score": clf_report["macro avg"]["f1-score"],
        "classification_report": clf_report,
        "confusion_matrix": cm,
        "feature_importance": feature_importance,
        "auc": auc_score,
        "roc_curve": roc_data,
        "pr_curve": pr_data
    }