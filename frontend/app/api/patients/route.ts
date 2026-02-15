import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/admin'

async function getDataClient() {
    const adminClient = createAdminClient()
    if (adminClient) return adminClient
    return createClient()
}

type PatientInsertPayload = {
    age?: number
    gender?: string
    symptoms?: string[]
    symptoms_text?: string
    bp?: string
    heart_rate?: number
    temperature?: number
    conditions?: string[]
    ehr_text?: string
    risk_level?: string
    department?: string
    confidence?: number
    explanation?: string
    contributing_factors?: string[]
}

export async function POST(req: Request) {
    try {
        const supabase = await getDataClient()
        const body = (await req.json()) as PatientInsertPayload

        const row = {
            age: Number(body.age ?? 0),
            gender: body.gender ?? "Unknown",
            symptoms: Array.isArray(body.symptoms) ? body.symptoms : [],
            symptoms_text: body.symptoms_text ?? "",
            bp: body.bp ?? "",
            heart_rate: Number(body.heart_rate ?? 0),
            temperature: Number(body.temperature ?? 0),
            conditions: Array.isArray(body.conditions) ? body.conditions : [],
            ehr_text: body.ehr_text ?? "",
            risk_level: body.risk_level ?? "Medium",
            department: body.department ?? "General Medicine",
            confidence: Number(body.confidence ?? 0),
            explanation: body.explanation ?? "",
            contributing_factors: Array.isArray(body.contributing_factors) ? body.contributing_factors : [],
        }
        
        const { data, error } = await supabase
            .from('patients')
            .insert(row)
            .select()

        if (error) {
            console.error(error)
            return new NextResponse("Database Error", { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error(error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function GET() {
    try {
        const supabase = await getDataClient()
        const { data, error } = await supabase
            .from('patients')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(200)

        if (error) {
            console.error(error)
            return new NextResponse("Database Error", { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error(error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
