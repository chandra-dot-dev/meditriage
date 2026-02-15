# AI Healthcare Triage System

AI-based triage platform that classifies patient risk (Low/Medium/High), recommends department routing, and provides explainable outputs to reduce triage delay and improve prioritization.

## Problem Focus
- Increasing patient load and limited staffing
- Delayed early-risk detection with manual triage
- Inconsistent prioritization and operational strain

## Implemented Scope
- Patient intake: age, gender, symptoms, vitals, pre-existing conditions
- EHR/EMR document upload with PDF text extraction
- Hybrid risk engine (rule-based safety checks + LLM reasoning)
- Department recommendation engine
- Explainability layer: confidence + contributing factors
- Live dashboard: queue, risk distribution, department insights

## Innovation Features (Compulsory)
- Real-time triage simulation (synthetic case streaming into queue)
- Voice-based symptom input
- Bias and fairness monitoring
- Multilingual support (translation in workflow)
- Wearable device JSON integration

## Tech Stack
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: FastAPI (Python), uvicorn
- **Database**: Supabase (PostgreSQL + RLS)
- **Auth**: Supabase Auth (Unified Patient/Doctor/Admin)

## Local Setup

### 1. Backend
```powershell
cd backend
# Create venv if not exists
python -m venv venv
# Activate venv
.\venv\Scripts\Activate.ps1
# Install dependencies
pip install -r requirements.txt
# Run server
python -m uvicorn main:app --reload
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Main Routes
- `/` - Professional Landing Page
- `/login` & `/signup` - Role-based Authentication
- `/patient` - Patient Dashboard (Booking, History, Health Portal)
- `/doctor` - Clinical Dashboard (Patient Queue, Assessment View)
- `/admin` - Hospital Admin (Monitoring, Staff Management, Config)
