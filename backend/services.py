import json
import os
from typing import List, Tuple

from openai import OpenAI

from models import PatientData, RiskAnalysis
from ml.predictor import predictor as ml_predictor


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
TRANSLATION_MODEL = os.getenv("OPENAI_TRANSLATION_MODEL", OPENAI_MODEL)

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


# ── AI Doctor Chat ──────────────────────────────────────────────

DOCTOR_SYSTEM_PROMPT = """You are Dr. MediTriage, an experienced AI medical triage doctor.

Your role:
- Greet the patient warmly and ask about their symptoms
- Ask follow-up questions to gather relevant medical information
- Assess urgency based on symptoms described
- Provide preliminary guidance (NOT diagnosis)
- Recommend when to seek emergency care
- Be empathetic, clear, and professional

Rules:
- Never provide a definitive diagnosis
- Always recommend seeing a doctor for serious symptoms
- If symptoms sound critical (chest pain, difficulty breathing, stroke signs), urge immediate emergency care
- Keep responses concise (2-4 sentences typically)
- Respond in the language specified by the user

If patient context is provided, use it to give more relevant responses."""


def chat_with_doctor(
    messages: list[dict],
    patient_context: str | None = None,
    language: str = "English",
) -> str:
    if client is None:
        return _fallback_chat_response(messages, language)

    system_content = DOCTOR_SYSTEM_PROMPT
    if patient_context:
        system_content += f"\n\nPatient Context:\n{patient_context}"
    system_content += f"\n\nRespond in: {language}"

    api_messages = [{"role": "system", "content": system_content}]
    for msg in messages:
        role = msg.get("role", "user")
        if role in ("user", "assistant"):
            api_messages.append({"role": role, "content": msg.get("content", "")})

    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=api_messages,
            temperature=0.4,
            max_tokens=500,
        )
        return response.choices[0].message.content or "I'm sorry, I couldn't process that. Could you rephrase?"
    except Exception as e:
        return _fallback_chat_response(messages, language)


def _fallback_chat_response(messages: list[dict], language: str) -> str:
    last_msg = messages[-1].get("content", "") if messages else ""
    lower = last_msg.lower()

    if not last_msg.strip():
        return "Hello! I'm Dr. MediTriage. How can I help you today? Please describe your symptoms."

    if any(w in lower for w in ["chest pain", "breathing", "stroke", "unconscious"]):
        return "⚠️ These symptoms may indicate a medical emergency. Please call emergency services or go to the nearest emergency room immediately."

    if any(w in lower for w in ["fever", "headache", "cough", "cold"]):
        return "I understand you're experiencing these symptoms. How long have you had them? Do you have any pre-existing medical conditions I should know about?"

    if any(w in lower for w in ["hello", "hi", "hey"]):
        return "Hello! I'm Dr. MediTriage, your AI medical assistant. Please tell me what symptoms you're experiencing, and I'll help assess your situation."

    return "Thank you for sharing that. Could you tell me more about when these symptoms started and how severe they are on a scale of 1-10?"


# ── EHR / PDF Parsing ──────────────────────────────────────────

def parse_ehr_text(text: str) -> dict:
    """Extract structured patient data from raw EHR/PDF text using AI."""
    if client is None:
        return _fallback_ehr_parse(text)

    prompt = f"""Extract structured patient data from this medical record text.

Text:
\"\"\"
{text[:3000]}
\"\"\"

Return JSON with these fields (use null if not found):
{{
  "name": "patient full name or null",
  "age": number or null,
  "gender": "Male" | "Female" | "Other" | null,
  "conditions": ["list of pre-existing conditions"],
  "symptoms": ["list of current symptoms"],
  "bp": "systolic/diastolic or null",
  "heart_rate": number or null,
  "temperature": number or null
}}"""

    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "Extract patient data from medical records. Output only valid JSON."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0,
        )
        content = response.choices[0].message.content or "{}"
        return json.loads(content)
    except Exception:
        return _fallback_ehr_parse(text)


def _fallback_ehr_parse(text: str) -> dict:
    """Simple regex-based extraction when OpenAI is unavailable."""
    import re
    result: dict = {
        "name": None, "age": None, "gender": None,
        "conditions": [], "symptoms": [], "bp": None,
        "heart_rate": None, "temperature": None,
    }

    # Try to find name
    name_match = re.search(r"(?:patient|name)[:\s]+([A-Z][a-z]+ [A-Z][a-z]+)", text, re.IGNORECASE)
    if name_match:
        result["name"] = name_match.group(1)

    # Age
    age_match = re.search(r"(?:age)[:\s]+(\d{1,3})", text, re.IGNORECASE)
    if age_match:
        result["age"] = int(age_match.group(1))

    # Gender
    if re.search(r"\b(female|woman)\b", text, re.IGNORECASE):
        result["gender"] = "Female"
    elif re.search(r"\b(male|man)\b", text, re.IGNORECASE):
        result["gender"] = "Male"

    # BP
    bp_match = re.search(r"(\d{2,3})\s*/\s*(\d{2,3})\s*(?:mm\s*Hg)?", text)
    if bp_match:
        result["bp"] = f"{bp_match.group(1)}/{bp_match.group(2)}"

    # Heart rate
    hr_match = re.search(r"(?:heart rate|hr|pulse)[:\s]+(\d{2,3})", text, re.IGNORECASE)
    if hr_match:
        result["heart_rate"] = int(hr_match.group(1))

    # Temperature
    temp_match = re.search(r"(?:temp|temperature)[:\s]+(\d{2,3}\.?\d?)", text, re.IGNORECASE)
    if temp_match:
        result["temperature"] = float(temp_match.group(1))

    # Common conditions
    condition_keywords = [
        "diabetes", "hypertension", "asthma", "copd", "heart disease",
        "thyroid", "arthritis", "cancer", "kidney disease", "liver disease",
    ]
    for kw in condition_keywords:
        if kw in text.lower():
            result["conditions"].append(kw.title())

    return result


# ── ML-Based Prediction ────────────────────────────────────────

def ml_predict(data: PatientData) -> dict | None:
    """Run ML model prediction on patient data."""
    if not ml_predictor.is_available:
        return None
    return ml_predictor.predict(
        age=data.age,
        gender=data.gender,
        bp=data.bp,
        heart_rate=data.heart_rate,
        temperature=data.temperature,
        symptoms=data.symptoms,
        conditions=data.conditions,
    )


# ── Risk Analysis (Hybrid ML + AI) ─────────────────────────────

def analyze_risk(data: PatientData) -> RiskAnalysis:
    systolic, diastolic = _parse_bp(data.bp)

    # Critical override — immediate emergency
    if data.heart_rate > 150 or systolic > 180 or data.temperature > 104:
        return RiskAnalysis(
            risk_level="High",
            department="Emergency",
            confidence=95.0,
            explanation="Critical vitals detected (HR > 150 or BP > 180/x or Temp > 104F). Immediate attention required.",
            contributing_factors=["Critical Vitals"],
        )

    # Try ML model first
    ml_result = ml_predict(data)
    if ml_result:
        # If OpenAI is available, enhance the explanation
        if client:
            try:
                enhance_prompt = (
                    f"A triage ML model predicted {ml_result['risk_level']} risk for a "
                    f"{data.age}yo {data.gender} with symptoms: {', '.join(data.symptoms)}. "
                    f"Vitals: BP {data.bp}, HR {data.heart_rate}, Temp {data.temperature}F. "
                    f"Conditions: {', '.join(data.conditions) if data.conditions else 'None'}. "
                    f"Predicted department: {ml_result['department']}. "
                    f"Write a concise 2-3 sentence clinical explanation for why this risk level "
                    f"and department are appropriate. Be specific about which vitals/symptoms "
                    f"drove the decision."
                )
                response = client.chat.completions.create(
                    model=OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": "You are a medical triage assistant. Write concise clinical explanations."},
                        {"role": "user", "content": enhance_prompt},
                    ],
                    temperature=0.2,
                    max_tokens=200,
                )
                enhanced = response.choices[0].message.content
                if enhanced:
                    ml_result["explanation"] = enhanced
            except Exception:
                pass  # Keep original ML explanation

        # Bias check
        bias_warning = None
        if client:
            prompt_text = f"Age: {data.age}, Gender: {data.gender}, Symptoms: {', '.join(data.symptoms)}"
            bias_warning = _run_bias_check(data, prompt_text, {"risk_level": ml_result["risk_level"]})

        return RiskAnalysis(
            risk_level=ml_result["risk_level"],
            department=ml_result["department"],
            confidence=ml_result["confidence"],
            explanation=ml_result["explanation"],
            contributing_factors=ml_result["contributing_factors"],
            bias_warning=bias_warning,
        )

    # Fallback: OpenAI only
    if client is None:
        return _rule_based_fallback(data, "ML models unavailable, OpenAI key missing. Used deterministic triage rules.")

    prompt = f"""
You are an expert medical triage AI. Analyze the patient data and determine risk level and department.

Patient Data:
Age: {data.age}
Gender: {data.gender}
Symptoms: {', '.join(data.symptoms)}
Free Text Symptoms: {data.symptoms_text or 'None'}
Vitals: BP {data.bp}, HR {data.heart_rate}, Temp {data.temperature}F
Conditions: {', '.join(data.conditions)}
Medical History Text: {data.ehr_text or 'None'}

Output JSON format:
{{
  "risk_level": "Low" | "Medium" | "High",
  "department": "Cardiology" | "Emergency" | "Neurology" | "General Medicine",
  "confidence": number,
  "explanation": "concise explanation for doctor",
  "contributing_factors": ["factor1", "factor2"]
}}
"""

    try:
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a medical triage assistant. Output only valid JSON."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0.1,
        )
        content = response.choices[0].message.content or "{}"
        result = json.loads(content)

        bias_warning = _run_bias_check(data, prompt, result)
        if bias_warning:
            result["bias_warning"] = bias_warning

        return RiskAnalysis(**result)
    except Exception:
        return _rule_based_fallback(data, "LLM analysis unavailable. Used deterministic triage rules.")


# ── Translation ─────────────────────────────────────────────────

def translate_text(text: str, target_lang: str) -> str:
    if not text.strip():
        return text

    if client is None:
        return text

    try:
        response = client.chat.completions.create(
            model=TRANSLATION_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": f"Translate medical text to {target_lang} with clinical accuracy. Return only translated text.",
                },
                {"role": "user", "content": text},
            ],
            temperature=0.1,
        )
        return response.choices[0].message.content or text
    except Exception:
        return text


# ── Bias Check ──────────────────────────────────────────────────

def _run_bias_check(data: PatientData, base_prompt: str, current_result: dict) -> str | None:
    if client is None:
        return None

    gender = data.gender.lower()
    if gender not in {"male", "female"}:
        return None

    flipped_gender = "Female" if gender == "male" else "Male"
    bias_prompt = (
        f"{base_prompt}\n\nRepeat the analysis with same patient but gender is {flipped_gender}. "
        "Return ONLY JSON with risk_level."
    )

    try:
        bias_response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[{"role": "user", "content": bias_prompt}],
            response_format={"type": "json_object"},
            temperature=0,
        )
        bias_result = json.loads(bias_response.choices[0].message.content or "{}")
        if bias_result.get("risk_level") != current_result.get("risk_level"):
            return f"Potential bias detected: risk changed when gender was flipped to {flipped_gender}."
    except Exception:
        return None

    return None


# ── Rule-based Fallback ────────────────────────────────────────

def _rule_based_fallback(data: PatientData, note: str) -> RiskAnalysis:
    systolic, diastolic = _parse_bp(data.bp)
    risk_level = "Low"
    department = "General Medicine"
    confidence = 72.0
    factors: List[str] = []

    if systolic >= 160 or diastolic >= 100:
        risk_level = "High"
        department = "Cardiology"
        factors.append("Severe Hypertension")
    elif systolic >= 140 or diastolic >= 90:
        risk_level = "Medium"
        department = "Cardiology"
        factors.append("Elevated Blood Pressure")

    if data.heart_rate >= 120:
        risk_level = "High"
        department = "Emergency"
        factors.append("Tachycardia")
    elif data.heart_rate >= 100 and risk_level == "Low":
        risk_level = "Medium"
        factors.append("Elevated Heart Rate")

    if data.temperature >= 102:
        risk_level = "High" if risk_level == "Medium" else risk_level
        department = "Emergency" if risk_level == "High" else department
        factors.append("High Fever")

    symptom_blob = f"{' '.join(data.symptoms)} {data.symptoms_text or ''}".lower()
    if any(token in symptom_blob for token in ["chest pain", "shortness of breath", "stroke", "seizure"]):
        risk_level = "High"
        department = "Emergency"
        factors.append("Critical Symptom Pattern")
    elif any(token in symptom_blob for token in ["dizziness", "palpitation", "headache"]):
        if risk_level == "Low":
            risk_level = "Medium"
        if "headache" in symptom_blob:
            department = "Neurology"
        factors.append("Moderate Symptom Pattern")

    if not factors:
        factors.append("Stable Vitals")

    return RiskAnalysis(
        risk_level=risk_level,
        department=department,
        confidence=confidence,
        explanation=f"{'; '.join(factors)}. {note}",
        contributing_factors=factors,
    )


def _parse_bp(bp: str) -> Tuple[int, int]:
    try:
        if "/" not in bp:
            return 0, 0
        systolic_text, diastolic_text = bp.split("/", 1)
        return int(systolic_text), int(diastolic_text)
    except Exception:
        return 0, 0
