import { NextRequest, NextResponse } from "next/server"

// Proxy chat requests to the FastAPI backend to avoid CORS issues
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

    const response = await fetch(`${backendUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json(
        { error: "Backend error", detail: errText },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to reach backend", detail: message },
      { status: 502 }
    )
  }
}
