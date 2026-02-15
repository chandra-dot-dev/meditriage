-- Create roles enum
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  role user_role NOT NULL DEFAULT 'patient',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create doctors table (extends profiles)
CREATE TABLE public.doctors (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  specialization TEXT,
  bio TEXT,
  experience_years INTEGER,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  symptoms TEXT[],
  symptoms_text TEXT,
  risk_level TEXT, -- 'Low', 'Medium', 'High'
  priority_score INTEGER,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'
  notes TEXT,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Doctors Policies
CREATE POLICY "Doctors are viewable by everyone." ON public.doctors
  FOR SELECT USING (true);

-- Appointments Policies
CREATE POLICY "Patients can view their own appointments." ON public.appointments
  FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view their assigned appointments." ON public.appointments
  FOR SELECT USING (auth.uid() = doctor_id);

CREATE POLICY "Admins can view all appointments." ON public.appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.email,
    (new.raw_user_meta_data->>'role')::user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
