import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function getDataClient() {
  const adminClient = createAdminClient()
  if (adminClient) return adminClient
  return createClient()
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await getDataClient()

    // 1. Fetch total patients (profiles with role='patient')
    const { count: totalPatients, error: pError } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'patient')

    // 2. Fetch active doctors (is_available=true)
    const { count: activeDoctors, error: dError } = await supabase
      .from('doctors')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true)

    // 3. Fetch appointments by risk level for the distribution chart
    const { data: appointmentStats, error: aError } = await supabase
      .from('appointments')
      .select('risk_level, status')

    if (pError || dError || aError) throw new Error("Failed to fetch statistics")

    // Aggregate data
    const riskDistribution = {
      High: appointmentStats?.filter(a => a.risk_level === 'High').length || 0,
      Medium: appointmentStats?.filter(a => a.risk_level === 'Medium').length || 0,
      Low: appointmentStats?.filter(a => a.risk_level === 'Low').length || 0,
    }

    const triageQueue = {
      pending: appointmentStats?.filter(a => a.status === 'pending').length || 0,
      in_progress: appointmentStats?.filter(a => a.status === 'in_progress').length || 0,
      completed: appointmentStats?.filter(a => a.status === 'completed').length || 0,
    }

    // Mock department load for the demo visualization
    const deptLoad = [
      { dept: "Emergency", patients: riskDistribution.High + 2, load: Math.min(95, (riskDistribution.High * 10) + 20), color: "red" },
      { dept: "Cardiology", patients: 8, load: 45, color: "blue" },
      { dept: "General Medicine", patients: 15, load: 12, color: "teal" },
      { dept: "Neurology", patients: 5, load: 30, color: "amber" },
    ]

    return NextResponse.json({
      stats: {
        totalPatients: totalPatients || 0,
        activeDoctors: activeDoctors || 0,
        waitTimeAvg: "18m", // Placeholder or calculated from history
        riskAlerts: riskDistribution.High
      },
      riskDistribution,
      triageQueue,
      deptLoad
    })
  } catch (error: unknown) {
    console.error('Analytics API Error:', error)
    const message = error instanceof Error ? error.message : 'Internal error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
