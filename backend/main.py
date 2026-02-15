from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title="AI Healthcare Triage API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from typing import List, Optional
from pydantic import BaseModel
from models import PatientData, RiskAnalysis
from services import analyze_risk, translate_text, chat_with_doctor, parse_ehr_text, ml_predict


@app.get("/")
def read_root():
    return {"message": "AI Healthcare Triage System API is running"}


@app.post("/analyze", response_model=RiskAnalysis)
def analyze_patient(data: PatientData):
    return analyze_risk(data)


@app.post("/predict")
def predict_ml(data: PatientData):
    """Direct ML model prediction with full probability breakdown."""
    result = ml_predict(data)
    if result is None:
        return {"error": "ML models not loaded. Run ml/train_models.py first.", "fallback": True}
    return result


@app.get("/ml-status")
def ml_status():
    """Check ML model health."""
    from ml.predictor import predictor
    return {
        "ml_available": predictor.is_available,
        "metadata": predictor.metadata if predictor.is_available else None,
    }


class TranslationRequest(BaseModel):
    text: str
    target_lang: str


class ChatRequest(BaseModel):
    messages: list[dict]
    patient_context: Optional[str] = None
    language: str = "English"


class ChatResponse(BaseModel):
    response: str


class WearableData(BaseModel):
    heart_rate_stream: List[int]
    oxygen_level_stream: List[int]


@app.post("/translate")
def translate(request: TranslationRequest):
    return {"translated_text": translate_text(request.text, request.target_lang)}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    reply = chat_with_doctor(
        messages=request.messages,
        patient_context=request.patient_context,
        language=request.language,
    )
    return ChatResponse(response=reply)


class EhrParseRequest(BaseModel):
    text: str


@app.post("/parse_ehr")
def parse_ehr(request: EhrParseRequest):
    result = parse_ehr_text(request.text)
    return result


@app.post("/analyze_wearable", response_model=RiskAnalysis)
def analyze_wearable(data: WearableData):
    avg_hr = sum(data.heart_rate_stream) / len(data.heart_rate_stream) if data.heart_rate_stream else 0
    avg_o2 = sum(data.oxygen_level_stream) / len(data.oxygen_level_stream) if data.oxygen_level_stream else 0

    risk = "Low"
    explanation = "Vitals within normal range."
    factors = []

    if avg_hr > 100 or max(data.heart_rate_stream, default=0) > 150:
        risk = "High"
        explanation = f"Detected Tachycardia events. Max HR: {max(data.heart_rate_stream)}"
        factors.append("High Heart Rate")

    if avg_o2 < 95:
        risk = "Medium"
        explanation += f" Low Oxygen Saturation ({avg_o2}%)."
        factors.append("Low Oxygen")
        if avg_o2 < 90:
            risk = "High"
            explanation = f"CRITICAL Hypoxia detected ({avg_o2}%)."

    return RiskAnalysis(
        risk_level=risk,
        department="Cardiology" if "Heart" in str(factors) else "General Medicine",
        confidence=90.0,
        explanation=explanation,
        contributing_factors=factors
    )
