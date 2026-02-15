import { type NextRequest, NextResponse } from "next/server"
import { updateSession } from "@/utils/supabase/middleware"

function isPublicRoute(path: string) {
  return (
    path === "/" ||
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/auth") ||
    path.startsWith("/api/") ||
    path.includes(".")
  )
}

function dashboardForRole(role: string | undefined) {
  if (role === "doctor") return "/doctor"
  if (role === "admin") return "/admin"
  if (role === "patient") return "/patient"
  return "/dashboard"
}

export async function proxy(request: NextRequest) {
  const { user, response } = await updateSession(request)
  const path = request.nextUrl.pathname
  const publicRoute = isPublicRoute(path)

  if (!user && !publicRoute) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("next", path)
    return NextResponse.redirect(redirectUrl)
  }

  if (!user) {
    return response
  }

  const role = user.user_metadata?.role ?? user.app_metadata?.role
  const defaultDashboard = dashboardForRole(
    typeof role === "string" ? role : undefined
  )

  if (path.startsWith("/login") || path.startsWith("/signup")) {
    return NextResponse.redirect(new URL(defaultDashboard, request.url))
  }

  if (path.startsWith("/doctor") && role !== "doctor") {
    return NextResponse.redirect(new URL(defaultDashboard, request.url))
  }
  if (path.startsWith("/patient") && role !== "patient") {
    return NextResponse.redirect(new URL(defaultDashboard, request.url))
  }
  if (path.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL(defaultDashboard, request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
