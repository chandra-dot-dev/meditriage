import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Construct the payload for the Python backend
    // Based on PatientData model in backend/models.py
    const payload = {
      age: Number(body.age || 30),
      gender: body.gender || 'Other',
      symptoms: body.symptoms || [],
      symptoms_text: body.symptoms_text || '',
      bp: body.bp || '120/80',
      heart_rate: Number(body.heart_rate || 75),
      temperature: Number(body.temperature || 98.6),
      conditions: body.conditions || [],
      ehr_text: body.ehr_text || ''
    }

    const BACKEND_URL =
      process.env.BACKEND_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8000'
    
    const response = await fetch(`${BACKEND_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend triage error:', errorText)
      return NextResponse.json({ error: 'Failed to connect to AI backend' }, { status: 502 })
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (e) {
    console.error('Triage API Internal Error:', e)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
