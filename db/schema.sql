-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Patients Table
create table if not exists patients (
    id uuid primary key default uuid_generate_v4(),
    user_id text, -- Clerk User ID or creating staff ID
    
    -- Demographics
    age integer not null,
    gender text not null,
    
    -- Vitals
    bp text, -- Blood Pressure (e.g., "120/80")
    heart_rate integer,
    temperature numeric(4,1), -- e.g., 98.6
    
    -- Clinical Data
    symptoms jsonb, -- Array of selected symptoms Strings
    symptoms_text text, -- Free text description
    conditions text[], -- Array of pre-existing conditions
    ehr_text text, -- Extracted text from PDF
    
    -- Triage Output (AI/Rule Generated)
    risk_level text check (risk_level in ('Low', 'Medium', 'High')),
    department text,
    confidence numeric(5,2), -- 0.00 to 100.00
    explanation text,
    contributing_factors text[],
    
    created_at timestamp with time zone default now()
);

-- Realtime subscription policy (Enable for all authenticated users for now)
alter publication supabase_realtime add table patients;

-- RLS Policies (Simplified for Hackathon: Public read/write or Authenticated)
alter table patients enable row level security;

create policy "Enable functionality for all users"
on patients for all
using (true)
with check (true);
