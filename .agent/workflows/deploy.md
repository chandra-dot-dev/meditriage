---
description: Steps to deploy the MediTriage platform
---

# MediTriage Deployment Workflow

Follow these steps to deploy the full-stack system.

## Phase 1: Infrastructure
1. Create a Supabase project at supabase.com.
2. Run `supabase_schema.sql` in the SQL Editor.
3. Create a Clerk account and setup an application.

## Phase 2: Backend
1. Link your `backend/` folder to a service like Render or Railway.
2. Configure Environment Variables using the list in `DEPLOYMENT.md`.
// turbo
3. Deploy and verify the `/health` endpoint or equivalent.

## Phase 3: Frontend
1. Link your `frontend/` folder to Vercel.
2. Add all `NEXT_PUBLIC_` variables including the URL of the deployed backend.
// turbo
3. Run `npm run build` and deploy.
