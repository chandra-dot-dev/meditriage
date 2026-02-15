import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

async function getDataClient() {
  const adminClient = createAdminClient()
  if (adminClient) return adminClient
  return createClient()
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await getDataClient()
    const doctorId = req.nextUrl.searchParams.get('doctor_id')
    const patientId = req.nextUrl.searchParams.get('patient_id')
    const status = req.nextUrl.searchParams.get('status')
    const id = req.nextUrl.searchParams.get('id')

    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:patient_id (full_name, email),
        doctor:doctor_id (specialization, profiles(full_name))
      `)
      .order('created_at', { ascending: false })

    if (doctorId) query = query.eq('doctor_id', doctorId)
    if (patientId) query = query.eq('patient_id', patientId)
    if (status) query = query.eq('status', status)
    if (id) query = query.eq('id', id)

    const { data, error } = await query.limit(100)
    if (error) {
      console.error('Appointments GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ appointments: data })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await getDataClient()
    const body = await req.json()

    if (!body.patient_id) {
      return NextResponse.json({ error: 'patient_id is required' }, { status: 400 })
    }

    const row = {
      doctor_id: body.doctor_id || null,
      patient_id: body.patient_id,
      symptoms: Array.isArray(body.symptoms) ? body.symptoms : [],
      symptoms_text: body.symptoms_text || '',
      risk_level: body.risk_level || 'Low',
      priority_score: Number(body.priority_score ?? 0),
      status: 'pending',
      notes: '',
      scheduled_at: body.scheduled_at
    }

    const { data, error } = await supabase.from('appointments').insert(row).select()
    if (error) {
      console.error('Appointments POST error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data?.[0])
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const supabase = await getDataClient()
    const body = await req.json()
    const id = String(body.id || '').trim()

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (typeof body.notes === 'string') {
      updates.notes = body.notes
    }

    if (typeof body.status === 'string') {
      const allowed = new Set(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])
      if (!allowed.has(body.status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      updates.status = body.status
    }

    if (typeof body.doctor_id === 'string' && body.doctor_id.trim()) {
      updates.doctor_id = body.doctor_id
    }

    const { data, error } = await supabase
      .from('appointments')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Appointments PATCH error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
