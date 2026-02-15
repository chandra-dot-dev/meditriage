"""
Train ML models for medical triage:
  1. Risk Classifier  — predicts Low / Medium / High
  2. Department Router — predicts Emergency / Cardiology / Neurology / General Medicine

Uses Random Forest + Gradient Boosting ensemble.
Saves trained models to backend/ml/models/
"""

import os
import json
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix
import joblib

# Paths
SCRIPT_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(SCRIPT_DIR, "triage_dataset.csv")
MODEL_DIR = os.path.join(SCRIPT_DIR, "models")

os.makedirs(MODEL_DIR, exist_ok=True)


def load_and_prepare_data():
    """Load CSV and prepare features."""
    df = pd.read_csv(DATA_PATH)
    print(f"Loaded {len(df)} records")
    print(f"Risk distribution:\n{df['risk_level'].value_counts()}")
    print(f"Department distribution:\n{df['department'].value_counts()}")
    
    # Encode gender
    gender_map = {"Male": 0, "Female": 1, "Other": 2}
    df["gender_encoded"] = df["gender"].map(gender_map)
    
    # Feature columns (numerical features the model will use)
    feature_cols = [
        "age", "gender_encoded", "systolic", "diastolic",
        "heart_rate", "temperature", "num_symptoms",
        "has_critical_symptom", "has_moderate_symptom",
        "has_chronic_condition", "num_conditions",
    ]
    
    X = df[feature_cols].values
    y_risk = df["risk_level"].values
    y_dept = df["department"].values
    
    return X, y_risk, y_dept, feature_cols


def train_risk_model(X_train, X_test, y_train, y_test):
    """Train risk level classifier (Low/Medium/High)."""
    print("\n" + "=" * 60)
    print("TRAINING RISK CLASSIFIER")
    print("=" * 60)
    
    # Random Forest
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced",
    )
    
    # Gradient Boosting
    gb = GradientBoostingClassifier(
        n_estimators=150,
        max_depth=8,
        learning_rate=0.1,
        min_samples_split=5,
        random_state=42,
    )
    
    # Ensemble voting
    ensemble = VotingClassifier(
        estimators=[("rf", rf), ("gb", gb)],
        voting="soft",
    )
    
    # Cross-validation
    cv_scores = cross_val_score(ensemble, X_train, y_train, cv=5, scoring="accuracy")
    print(f"Cross-validation accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    
    # Fit on full training set
    ensemble.fit(X_train, y_train)
    
    # Evaluate
    y_pred = ensemble.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nTest accuracy: {accuracy:.4f}")
    print(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")
    print(f"Confusion Matrix:\n{confusion_matrix(y_test, y_pred)}")
    
    return ensemble, accuracy


def train_department_model(X_train, X_test, y_train, y_test):
    """Train department routing classifier."""
    print("\n" + "=" * 60)
    print("TRAINING DEPARTMENT ROUTER")
    print("=" * 60)
    
    rf = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced",
    )
    
    gb = GradientBoostingClassifier(
        n_estimators=150,
        max_depth=8,
        learning_rate=0.1,
        min_samples_split=5,
        random_state=42,
    )
    
    ensemble = VotingClassifier(
        estimators=[("rf", rf), ("gb", gb)],
        voting="soft",
    )
    
    cv_scores = cross_val_score(ensemble, X_train, y_train, cv=5, scoring="accuracy")
    print(f"Cross-validation accuracy: {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
    
    ensemble.fit(X_train, y_train)
    
    y_pred = ensemble.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nTest accuracy: {accuracy:.4f}")
    print(f"\nClassification Report:\n{classification_report(y_test, y_pred)}")
    print(f"Confusion Matrix:\n{confusion_matrix(y_test, y_pred)}")
    
    return ensemble, accuracy


def main():
    # Load data
    X, y_risk, y_dept, feature_cols = load_and_prepare_data()
    
    # Scale features
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    # Split for risk model
    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
        X_scaled, y_risk, test_size=0.2, random_state=42, stratify=y_risk
    )
    
    # Split for department model
    X_train_d, X_test_d, y_train_d, y_test_d = train_test_split(
        X_scaled, y_dept, test_size=0.2, random_state=42, stratify=y_dept
    )
    
    # Train models
    risk_model, risk_acc = train_risk_model(X_train_r, X_test_r, y_train_r, y_test_r)
    dept_model, dept_acc = train_department_model(X_train_d, X_test_d, y_train_d, y_test_d)
    
    # Encode labels for reference
    risk_labels = sorted(list(set(y_risk)))
    dept_labels = sorted(list(set(y_dept)))
    
    # Save everything
    joblib.dump(risk_model, os.path.join(MODEL_DIR, "risk_classifier.joblib"))
    joblib.dump(dept_model, os.path.join(MODEL_DIR, "department_router.joblib"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "feature_scaler.joblib"))
    
    metadata = {
        "feature_columns": feature_cols,
        "risk_labels": risk_labels,
        "department_labels": dept_labels,
        "risk_accuracy": round(risk_acc, 4),
        "department_accuracy": round(dept_acc, 4),
        "training_samples": len(X_train_r),
        "test_samples": len(X_test_r),
        "models": ["RandomForest(200 trees)", "GradientBoosting(150 trees)"],
        "ensemble": "VotingClassifier (soft vote)",
    }
    
    with open(os.path.join(MODEL_DIR, "model_metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)
    
    print("\n" + "=" * 60)
    print("MODELS SAVED SUCCESSFULLY")
    print("=" * 60)
    print(f"  Risk classifier:    {os.path.join(MODEL_DIR, 'risk_classifier.joblib')}")
    print(f"  Department router:  {os.path.join(MODEL_DIR, 'department_router.joblib')}")
    print(f"  Feature scaler:     {os.path.join(MODEL_DIR, 'feature_scaler.joblib')}")
    print(f"  Metadata:           {os.path.join(MODEL_DIR, 'model_metadata.json')}")
    print(f"\n  Risk accuracy:      {risk_acc:.4f}")
    print(f"  Department accuracy: {dept_acc:.4f}")


if __name__ == "__main__":
    main()
