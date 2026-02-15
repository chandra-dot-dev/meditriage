"""
Generate synthetic medical triage training data.
Produces a CSV with 10,000 patient records with realistic
vital signs, symptoms, conditions, and labeled risk + department.
"""

import csv
import random
import os

OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "triage_dataset.csv")

# ── Symptom pools by severity ──────────────────────────────────

CRITICAL_SYMPTOMS = [
    "chest_pain", "shortness_of_breath", "stroke_signs", "seizure",
    "severe_bleeding", "loss_of_consciousness", "difficulty_breathing",
    "crushing_chest_pressure", "sudden_numbness",
]

MODERATE_SYMPTOMS = [
    "dizziness", "palpitations", "persistent_headache", "high_fever",
    "abdominal_pain", "vomiting", "blurred_vision", "fainting",
    "rapid_heartbeat", "chest_tightness",
]

MILD_SYMPTOMS = [
    "cough", "mild_fever", "fatigue", "body_aches", "runny_nose",
    "sore_throat", "mild_headache", "nausea", "joint_pain",
    "skin_rash", "mild_back_pain", "congestion",
]

# ── Conditions ──────────────────────────────────────────────────

CONDITIONS = [
    "diabetes", "hypertension", "asthma", "copd", "heart_disease",
    "thyroid", "arthritis", "kidney_disease", "liver_disease",
    "obesity", "anemia", "none",
]

# ── Department mapping logic ────────────────────────────────────

CARDIO_SYMPTOMS = {"chest_pain", "palpitations", "rapid_heartbeat", "chest_tightness", "crushing_chest_pressure"}
NEURO_SYMPTOMS = {"stroke_signs", "seizure", "persistent_headache", "sudden_numbness", "blurred_vision", "fainting"}
EMERGENCY_SYMPTOMS = {"severe_bleeding", "loss_of_consciousness", "difficulty_breathing"}


def generate_patient():
    """Generate a single synthetic patient record."""
    age = random.randint(1, 95)
    gender = random.choice(["Male", "Female", "Other"])
    
    # Decide risk level with some randomness
    risk_roll = random.random()
    
    if risk_roll < 0.25:
        risk_level = "High"
    elif risk_roll < 0.60:
        risk_level = "Medium"
    else:
        risk_level = "Low"
    
    # Generate symptoms based on risk level
    symptoms = []
    if risk_level == "High":
        symptoms += random.sample(CRITICAL_SYMPTOMS, k=random.randint(1, 3))
        if random.random() > 0.5:
            symptoms += random.sample(MODERATE_SYMPTOMS, k=random.randint(0, 2))
    elif risk_level == "Medium":
        symptoms += random.sample(MODERATE_SYMPTOMS, k=random.randint(1, 3))
        if random.random() > 0.6:
            symptoms += random.sample(MILD_SYMPTOMS, k=random.randint(0, 2))
    else:
        symptoms += random.sample(MILD_SYMPTOMS, k=random.randint(1, 3))
    
    # Generate vitals based on risk level
    if risk_level == "High":
        systolic = random.randint(160, 220)
        diastolic = random.randint(95, 130)
        heart_rate = random.randint(110, 180)
        temperature = round(random.uniform(100.0, 106.0), 1)
    elif risk_level == "Medium":
        systolic = random.randint(130, 170)
        diastolic = random.randint(80, 100)
        heart_rate = random.randint(85, 130)
        temperature = round(random.uniform(99.0, 103.0), 1)
    else:
        systolic = random.randint(100, 140)
        diastolic = random.randint(60, 90)
        heart_rate = random.randint(55, 100)
        temperature = round(random.uniform(97.0, 99.5), 1)
    
    bp = f"{systolic}/{diastolic}"
    
    # Conditions (older people more likely to have conditions)
    num_conditions = 0
    if age > 50:
        num_conditions = random.randint(0, 3)
    elif age > 30:
        num_conditions = random.randint(0, 2)
    else:
        num_conditions = random.randint(0, 1)
    
    conditions = random.sample([c for c in CONDITIONS if c != "none"], k=min(num_conditions, len(CONDITIONS) - 1))
    if not conditions:
        conditions = ["none"]
    
    # Determine department
    symptom_set = set(symptoms)
    if risk_level == "High" and (symptom_set & EMERGENCY_SYMPTOMS or heart_rate > 150 or systolic > 200):
        department = "Emergency"
    elif symptom_set & CARDIO_SYMPTOMS:
        department = "Cardiology"
    elif symptom_set & NEURO_SYMPTOMS:
        department = "Neurology"
    elif risk_level == "High":
        department = "Emergency"
    else:
        department = "General Medicine"
    
    # Age factor: elderly with moderate symptoms get escalated
    if age > 70 and risk_level == "Low" and random.random() < 0.3:
        risk_level = "Medium"
    
    # Condition escalation
    if "heart_disease" in conditions and risk_level != "High" and symptom_set & CARDIO_SYMPTOMS:
        risk_level = "High"
        department = "Emergency"
    
    # ── Feature engineering (for model training) ──
    has_critical_symptom = 1 if symptom_set & (CRITICAL_SYMPTOMS_SET) else 0
    has_moderate_symptom = 1 if symptom_set & (MODERATE_SYMPTOMS_SET) else 0
    num_symptoms = len(symptoms)
    has_chronic_condition = 1 if any(c != "none" for c in conditions) else 0
    num_conditions_count = len([c for c in conditions if c != "none"])
    
    return {
        "age": age,
        "gender": gender,
        "systolic": systolic,
        "diastolic": diastolic,
        "heart_rate": heart_rate,
        "temperature": temperature,
        "num_symptoms": num_symptoms,
        "has_critical_symptom": has_critical_symptom,
        "has_moderate_symptom": has_moderate_symptom,
        "has_chronic_condition": has_chronic_condition,
        "num_conditions": num_conditions_count,
        "symptoms": "|".join(symptoms),
        "conditions": "|".join(conditions),
        "risk_level": risk_level,
        "department": department,
    }


# Pre-compute sets for fast lookup
CRITICAL_SYMPTOMS_SET = set(CRITICAL_SYMPTOMS)
MODERATE_SYMPTOMS_SET = set(MODERATE_SYMPTOMS)


def main():
    random.seed(42)
    
    fieldnames = [
        "age", "gender", "systolic", "diastolic", "heart_rate", "temperature",
        "num_symptoms", "has_critical_symptom", "has_moderate_symptom",
        "has_chronic_condition", "num_conditions",
        "symptoms", "conditions", "risk_level", "department",
    ]
    
    records = [generate_patient() for _ in range(10000)]
    
    with open(OUTPUT_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
    
    # Print stats
    risk_counts = {}
    dept_counts = {}
    for r in records:
        risk_counts[r["risk_level"]] = risk_counts.get(r["risk_level"], 0) + 1
        dept_counts[r["department"]] = dept_counts.get(r["department"], 0) + 1
    
    print(f"Generated {len(records)} records -> {OUTPUT_PATH}")
    print(f"Risk distribution: {risk_counts}")
    print(f"Department distribution: {dept_counts}")


if __name__ == "__main__":
    main()
