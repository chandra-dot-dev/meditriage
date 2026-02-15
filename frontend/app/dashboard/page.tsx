import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"

function dashboardForRole(role: string | undefined) {
  if (role === "doctor") return "/doctor"
  if (role === "admin") return "/admin"
  return "/patient"
}

export default async function DashboardAliasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/dashboard")
  }

  const metadataRole = user.user_metadata?.role ?? user.app_metadata?.role
  if (typeof metadataRole === "string") {
    redirect(dashboardForRole(metadataRole))
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  redirect(dashboardForRole(profile?.role))
}
