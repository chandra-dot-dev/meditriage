"""
ML Predictor — loads trained models and provides inference.
Used by services.py for real-time triage predictions.
"""

import os
import json
import joblib
import numpy as np
from typing import Optional

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

# ── Symptom classification sets (mirrors generate_data.py) ─────

CRITICAL_SYMPTOMS = {
    "chest pain", "shortness of breath", "stroke signs", "seizure",
    "severe bleeding", "loss of consciousness", "difficulty breathing",
    "crushing chest pressure", "sudden numbness",
    # common alternate phrasings
    "chest_pain", "shortness_of_breath", "stroke_signs",
    "severe_bleeding", "loss_of_consciousness", "difficulty_breathing",
    "crushing_chest_pressure", "sudden_numbness",
}

MODERATE_SYMPTOMS = {
    "dizziness", "palpitations", "persistent headache", "high fever",
    "abdominal pain", "vomiting", "blurred vision", "fainting",
    "rapid heartbeat", "chest tightness",
    "persistent_headache", "high_fever", "abdominal_pain",
    "blurred_vision", "rapid_heartbeat", "chest_tightness",
}


class TriagePredictor:
    """Wraps trained ML models for live inference."""

    def __init__(self):
        self.risk_model = None
        self.dept_model = None
        self.scaler = None
        self.metadata = None
        self._loaded = False
        self._load_models()

    def _load_models(self):
        risk_path = os.path.join(MODEL_DIR, "risk_classifier.joblib")
        dept_path = os.path.join(MODEL_DIR, "department_router.joblib")
        scaler_path = os.path.join(MODEL_DIR, "feature_scaler.joblib")
        meta_path = os.path.join(MODEL_DIR, "model_metadata.json")

        if not all(os.path.exists(p) for p in [risk_path, dept_path, scaler_path, meta_path]):
            print("[ML] Models not found — predictor disabled. Run ml/train_models.py first.")
            return

        try:
            self.risk_model = joblib.load(risk_path)
            self.dept_model = joblib.load(dept_path)
            self.scaler = joblib.load(scaler_path)
            with open(meta_path, "r") as f:
                self.metadata = json.load(f)
            self._loaded = True
            print(f"[ML] Models loaded — Risk acc: {self.metadata.get('risk_accuracy')}, "
                  f"Dept acc: {self.metadata.get('department_accuracy')}")
        except Exception as e:
            print(f"[ML] Failed to load models: {e}")

    @property
    def is_available(self) -> bool:
        return self._loaded

    def _extract_features(
        self,
        age: int,
        gender: str,
        systolic: int,
        diastolic: int,
        heart_rate: int,
        temperature: float,
        symptoms: list[str],
        conditions: list[str],
    ) -> np.ndarray:
        """Convert patient data to feature vector matching training format."""
        gender_map = {"male": 0, "female": 1, "other": 2}
        gender_encoded = gender_map.get(gender.lower(), 2)

        symptom_blob = " ".join(s.lower() for s in symptoms)
        has_critical = 1 if any(s in symptom_blob for s in CRITICAL_SYMPTOMS) else 0
        has_moderate = 1 if any(s in symptom_blob for s in MODERATE_SYMPTOMS) else 0
        num_symptoms = len(symptoms) if symptoms else 1
        has_chronic = 1 if any(c.lower() not in ("none", "") for c in conditions) else 0
        num_conditions = len([c for c in conditions if c.lower() not in ("none", "")])

        features = np.array([[
            age, gender_encoded, systolic, diastolic,
            heart_rate, temperature, num_symptoms,
            has_critical, has_moderate, has_chronic, num_conditions,
        ]])

        return self.scaler.transform(features)

    def predict(
        self,
        age: int,
        gender: str,
        bp: str,
        heart_rate: int,
        temperature: float,
        symptoms: list[str],
        conditions: list[str],
    ) -> Optional[dict]:
        """Run ML prediction. Returns dict with risk_level, department, confidences."""
        if not self._loaded:
            return None

        # Parse BP
        try:
            systolic, diastolic = [int(x) for x in bp.split("/")]
        except Exception:
            systolic, diastolic = 120, 80

        features = self._extract_features(
            age, gender, systolic, diastolic,
            heart_rate, temperature, symptoms, conditions,
        )

        # Risk prediction with probabilities
        risk_pred = self.risk_model.predict(features)[0]
        risk_proba = self.risk_model.predict_proba(features)[0]
        risk_classes = self.risk_model.classes_
        risk_confidence = float(max(risk_proba)) * 100

        # Department prediction with probabilities
        dept_pred = self.dept_model.predict(features)[0]
        dept_proba = self.dept_model.predict_proba(features)[0]
        dept_classes = self.dept_model.classes_
        dept_confidence = float(max(dept_proba)) * 100

        # Build probability breakdown
        risk_breakdown = {cls: round(float(p) * 100, 1) for cls, p in zip(risk_classes, risk_proba)}
        dept_breakdown = {cls: round(float(p) * 100, 1) for cls, p in zip(dept_classes, dept_proba)}

        # Contributing factors
        factors = []
        if systolic > 160:
            factors.append("Elevated Blood Pressure")
        if heart_rate > 110:
            factors.append("High Heart Rate")
        if temperature > 100:
            factors.append("Fever")
        if any(s.lower().replace("_", " ") in CRITICAL_SYMPTOMS for s in symptoms):
            factors.append("Critical Symptom Detected")
        if any(s.lower().replace("_", " ") in MODERATE_SYMPTOMS for s in symptoms):
            factors.append("Moderate Symptom Pattern")
        if age > 65:
            factors.append("Elderly Patient")
        if not factors:
            factors.append("Stable Vitals")

        return {
            "risk_level": risk_pred,
            "department": dept_pred,
            "confidence": round(risk_confidence, 1),
            "risk_probabilities": risk_breakdown,
            "department_probabilities": dept_breakdown,
            "contributing_factors": factors,
            "model_type": "ML Ensemble (Random Forest + Gradient Boosting)",
            "explanation": (
                f"ML model predicts {risk_pred} risk ({risk_confidence:.0f}% confidence). "
                f"Recommended department: {dept_pred} ({dept_confidence:.0f}% confidence). "
                f"Key factors: {', '.join(factors)}."
            ),
        }


# Singleton instance
predictor = TriagePredictor()
