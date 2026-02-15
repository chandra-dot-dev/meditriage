from pydantic import BaseModel
from typing import List, Optional

class PatientData(BaseModel):
    name: Optional[str] = None
    age: int
    gender: str
    symptoms: List[str]
    symptoms_text: Optional[str] = None
    bp: str # e.g. "120/80"
    heart_rate: int
    temperature: float
    conditions: List[str]
    ehr_text: Optional[str] = None # Text extracted from uploaded PDF

class RiskAnalysis(BaseModel):
    risk_level: str # "Low", "Medium", "High"
    department: str # "Cardiology", "Emergency", "Neurology", "General Medicine"
    confidence: float # 0-100
    explanation: str
    contributing_factors: List[str]
    bias_warning: Optional[str] = None

# ── Doctor / Appointment models ──────────────────────────────────

class DoctorProfile(BaseModel):
    clerk_user_id: str
    name: str
    specialization: str  # Cardiology, Neurology, General Medicine, Emergency
    qualification: str   # MD, MBBS, etc.
    experience_years: int = 0
    available: bool = True

class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    available: Optional[bool] = None

class AppointmentCreate(BaseModel):
    doctor_id: str           # UUID of doctor
    clerk_patient_id: str    # Clerk user ID of patient
    patient_name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    symptoms: Optional[List[str]] = None
    symptoms_text: Optional[str] = None
    bp: Optional[str] = None
    heart_rate: Optional[int] = None
    temperature: Optional[float] = None
    conditions: Optional[List[str]] = None
    priority: str = "Medium"  # Low / Medium / High

class AppointmentUpdate(BaseModel):
    status: Optional[str] = None   # pending / confirmed / in_progress / completed
    priority: Optional[str] = None
    notes: Optional[str] = None
