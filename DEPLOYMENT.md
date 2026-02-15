# Deployment Guide - MediTriage AI Platform

This guide provide step-by-step instructions for deploying the MediTriage AI platform, including the Python backend, Next.js frontend, and necessary third-party services.

## Prerequisites
- A **Supabase** Project (Database & Realtime)
- A **Clerk** Application (Authentication)
- An **OpenAI** API Key (AI Analysis)
- A **Google Gemini** API Key (Secondary Analysis)
- A hosting provider for Python (e.g., Render, Railway, AWS)
- A hosting provider for Next.js (e.g., Vercel, Netlify)

---

## 1. Database Setup (Supabase)
1. **Create Project**: Start a new project at [supabase.com](https://supabase.com).
2. **Execute Schema**: Copy the contents of `supabase_schema.sql` (root of this project) and run it in the Supabase **SQL Editor**.
3. **Disable Email Confirmation**: In `Authentication -> Settings`, toggle off "Confirm email" for development/demo ease.
4. **Enable Realtime**: Ensure the `appointments` table has Realtime enabled (check the "Realtime" checkbox in the Table Editor).

---

## 2. Backend Deployment (Python FastAPI)
Deploy the contents of the `backend/` directory.

### Using Render (Recommended)
1. **Create Project**: Sign in to [Render.com](https://render.com) and create a **New Web Service**.
2. **Connect GitHub**: Select your `meditriage` repository.
3. **Configure Service**:
   - **Root Directory**: `backend`
   - **Environment Variables**: Add the variables listed below.
   - **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Networking**: Render will automatically expose the port based on the `$PORT` environment variable.

### Environment Variables
Set the following variables in your hosting dashboard:
- `SUPABASE_URL`: Your Supabase Project URL
- `SUPABASE_KEY`: Your Supabase Service Role Key (or Anon Key depending on RLS)
- `SUPABASE_SERVICE_ROLE_KEY`: Required for admin operations
- `OPENAI_API_KEY`: Your OpenAI Secret Key
- `GEMINI_API_KEY`: Your Gemini API Key
- `CLERK_SECRET_KEY`: Your Clerk Secret Key

### Deployment Steps
1. **Root Directory**: `backend`
2. **Install Commands**: `pip install -r requirements.txt`
3. **Start Command**: `python -m uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## 3. Frontend Deployment (Next.js)
Deploy the contents of the `frontend/` directory to Vercel or similar.

### Environment Variables
Set the following variables in your Vercel/Netlify dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon/Public Key
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk Publishable Key
- `CLERK_SECRET_KEY`: Your Clerk Secret Key
- `NEXT_PUBLIC_API_URL`: The URL of your deployed Python backend (e.g., `https://api.meditriage.com`)

### Deployment Steps
1. **Root Directory**: `frontend`
2. **Build Command**: `npm run build`
3. **Install Command**: `npm install`

---

## 4. Post-Deployment Verification
1. **Login**: Navigate to the frontend URL and sign in.
2. **Triage**: Create a "New Triage Case" and verify the AI analysis finishes.
3. **Realtime**: Generate "Simulate Traffic" from the Admin dashboard and verify the Doctor dashboard updates live.
4. **Export**: Export a report to verify CSV generation.

---

> [!IMPORTANT]
> Ensure that the `NEXT_PUBLIC_API_URL` in the frontend exactly matches the base URL of your deployed backend service. If using HTTPS, ensure the protocol is included.
