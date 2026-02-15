import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

const DEPARTMENTS = ["Cardiology", "Emergency", "Neurology", "General Medicine"]
const SYMPTOMS_MAP: Record<string, string[]> = {
  "Cardiology": ["Chest pain", "Palpitations", "Shortness of breath", "Dizziness"],
  "Emergency": ["Severe trauma", "Difficulty breathing", "Loss of consciousness", "High fever"],
  "Neurology": ["Severe headache", "Numbness", "Seizures", "Confusion"],
  "General Medicine": ["Cough", "Mild fever", "Fatigue", "Runny nose"]
}

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateVitals(department: string) {
  let bp = "120/80"
  let heart_rate = Math.floor(Math.random() * (100 - 60) + 60)
  let temperature = parseFloat((Math.random() * (99.5 - 97.5) + 97.5).toFixed(1))

  if (department === "Emergency" || Math.random() > 0.8) {
    bp = `${Math.floor(Math.random() * (190 - 140) + 140)}/${Math.floor(Math.random() * (110 - 90) + 90)}`
    heart_rate = Math.floor(Math.random() * (160 - 110) + 110)
    temperature = parseFloat((Math.random() * (105 - 102) + 102).toFixed(1))
  }

  return { bp, heart_rate, temperature }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient() ?? await createClient()
    const { count = 1 } = await req.json()
    const safeCount = Math.max(1, Math.min(Number(count) || 1, 25))

    const createdPatients = []
    const { data: patients } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'patient')
      .limit(200)

    const patientIds = (patients || []).map((p) => p.id)

    for (let i = 0; i < safeCount; i++) {
        const dept = getRandomElement(DEPARTMENTS)
        const symptoms = SYMPTOMS_MAP[dept].slice(0, 2)
        const vitals = generateVitals(dept)
        const risk_level = vitals.heart_rate > 110 ? "High" : (Math.random() > 0.6 ? "Medium" : "Low")
        const patientId = patientIds.length > 0 ? getRandomElement(patientIds) : null

        const { data, error } = await supabase.from('appointments').insert({
          patient_id: patientId,
          symptoms,
          symptoms_text: `Simulated case for ${dept}.`,
          risk_level,
          priority_score: risk_level === "High" ? 90 : (risk_level === "Medium" ? 50 : 20),
          status: 'pending',
          notes: `Simulator generated route suggestion: ${dept}`,
          scheduled_at: new Date().toISOString()
        }).select().single()

        if (error) throw error
        createdPatients.push(data)
    }

    return NextResponse.json({ success: true, patients: createdPatients })
  } catch (error: unknown) {
    console.error('Simulator Error:', error)
    const message = error instanceof Error ? error.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
