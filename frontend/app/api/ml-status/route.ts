import { NextResponse } from "next/server"

export async function GET() {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/ml-status`)
    if (!response.ok) {
      return NextResponse.json({ ml_available: false }, { status: 200 })
    }
    return NextResponse.json(await response.json())
  } catch {
    return NextResponse.json({ ml_available: false }, { status: 200 })
  }
}
