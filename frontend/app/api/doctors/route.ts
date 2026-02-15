import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

type DoctorQueryRow = {
  id: string
  specialization: string | null
  experience_years: number | null
  is_available: boolean | null
  profiles: {
    full_name: string | null
    email: string | null
    avatar_url: string | null
  } | {
    full_name: string | null
    email: string | null
    avatar_url: string | null
  }[] | null
}

async function getDataClient() {
  const adminClient = createAdminClient()
  if (adminClient) return adminClient
  return createClient()
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await getDataClient()
    const specialization = req.nextUrl.searchParams.get('specialization')

    // Join profiles and doctors to get full names and specialties
    let query = supabase
      .from('doctors')
      .select(`
        id,
        specialization,
        experience_years,
        is_available,
        profiles (
          full_name,
          email,
          avatar_url
        )
      `)

    if (specialization) query = query.eq('specialization', specialization)

    const { data, error } = await query
    if (error) {
      console.error('Doctors GET error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Flatten the result for easier frontend consumption
    const doctors = ((data || []) as unknown as DoctorQueryRow[]).map((d) => {
      const profile = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles
      return ({
      id: d.id,
      name: profile?.full_name || 'Anonymous Doctor',
      email: profile?.email || 'N/A',
      avatar_url: profile?.avatar_url || '',
      specialization: d.specialization || 'General Medicine',
      experience_years: d.experience_years ?? 0,
      is_available: d.is_available ?? false
    })})

    return NextResponse.json({ doctors })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await getDataClient()
    const body = await req.json()
    
    // Check if profile exists
    const { data: profile, error: pError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', body.user_id)
      .single()

    if (pError || profile.role !== 'doctor') {
        return NextResponse.json({ error: 'Invalid user or not a doctor' }, { status: 400 })
    }

    const row = {
      id: body.user_id,
      specialization: body.specialization || 'General Medicine',
      experience_years: Number(body.experience_years ?? 0),
      is_available: body.available !== false,
      bio: body.bio || ''
    }

    const { data, error } = await supabase.from('doctors').upsert(row).select()
    if (error) {
      console.error('Doctors POST error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data?.[0])
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
  }
}
