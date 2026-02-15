"use server"

import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient, type SupabaseClient, type User } from '@supabase/supabase-js'

type UserRole = 'doctor' | 'patient' | 'admin'

function dashboardForRole(role: string | undefined, fallback = '/dashboard') {
  if (role === 'doctor') return '/doctor'
  if (role === 'admin') return '/admin'
  if (role === 'patient') return '/patient'
  return fallback
}

async function resolveUserRole(supabase: SupabaseClient, user: User | null) {
  if (!user) return undefined

  const metadataRole = user.user_metadata?.role ?? user.app_metadata?.role
  if (typeof metadataRole === 'string') {
    return metadataRole
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return typeof profile?.role === 'string' ? profile.role : undefined
}

function getServiceRoleKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY
  }

  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!publicKey) return null

  try {
    const payloadPart = publicKey.split('.')[1] || ''
    const normalizedPayload = payloadPart
      .replace(/-/g, '+')
      .replace(/_/g, '/')
      .padEnd(Math.ceil(payloadPart.length / 4) * 4, '=')

    const payload = JSON.parse(
      Buffer.from(normalizedPayload, 'base64').toString('utf8')
    ) as { role?: string }

    if (payload.role === 'service_role') {
      return publicKey
    }
  } catch {
    // Ignore invalid key formats and fall back to standard confirmation flow.
  }

  return null
}

function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = getServiceRoleKey()

  if (!url || !serviceKey) return null

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

async function tryAutoConfirmUser(userId: string) {
  const adminClient = createAdminClient()
  if (!adminClient) return false

  const { error } = await adminClient.auth.admin.updateUserById(userId, {
    email_confirm: true,
  })

  return !error
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const next = formData.get('next') as string || '/dashboard'

  const supabase = await createClient()

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    const loginError = error.message.toLowerCase().includes('email not confirmed')
      ? 'Email not confirmed. Check your inbox for the verification link.'
      : error.message

    return redirect(`/login?error=${encodeURIComponent(loginError)}`)
  }

  const role = await resolveUserRole(supabase, data.user)
  return redirect(dashboardForRole(role, next))
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string
  const role = formData.get('role') as UserRole // 'patient' or 'doctor' (Admins created via DB/Console)

  if (!['patient', 'doctor'].includes(role)) {
    return redirect('/signup?error=Invalid+role+selected')
  }

  const supabase = await createClient()

  const { error, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,
        full_name: fullName,
      },
    },
  })

  if (error) {
    return redirect(`/signup?error=${encodeURIComponent(error.message)}`)
  }

  // If session is established immediately (email confirmation disabled)
  if (data.session && data.user) {
    return redirect(dashboardForRole(role))
  }

  // If email confirmation is required, try auto-confirming when admin key is configured.
  if (data.user) {
    const autoConfirmed = await tryAutoConfirmUser(data.user.id)
    if (autoConfirmed) {
      const signInResult = await supabase.auth.signInWithPassword({ email, password })
      if (!signInResult.error) {
        const resolvedRole = await resolveUserRole(supabase, signInResult.data.user)
        return redirect(dashboardForRole(resolvedRole || role))
      }
    }
  }

  return redirect('/login?message=Account+created.+Please+confirm+your+email+to+sign+in')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return redirect('/login')
}
