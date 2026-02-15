import { createClient } from "@supabase/supabase-js"

function getServiceRoleKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY
  }

  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!publicKey) return null

  try {
    const payloadPart = publicKey.split(".")[1] || ""
    const normalizedPayload = payloadPart
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payloadPart.length / 4) * 4, "=")
    const payload = JSON.parse(
      Buffer.from(normalizedPayload, "base64").toString("utf8")
    ) as { role?: string }

    if (payload.role === "service_role") {
      return publicKey
    }
  } catch {
    // Ignore parse errors and require explicit service role key.
  }

  return null
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = getServiceRoleKey()

  if (!url || !serviceRoleKey) return null

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
