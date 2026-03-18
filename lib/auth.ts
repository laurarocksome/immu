import { createClient } from "./supabase/client"

// Lazy getter — never called at module load
const getSupabase = () => createClient()

export async function signUp(email: string, password: string, name: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard`,
    },
  })

  if (error) throw error

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new Error("An account with this email already exists. Please log in instead.")
  }

  if (data.user && data.user.email_confirmed_at) {
    throw new Error("An account with this email already exists. Please log in instead.")
  }

  return data
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  const supabase = getSupabase()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

export async function getSession() {
  const supabase = getSupabase()
  const { data, error } = await supabase.auth.refreshSession()
  if (error) {
    const sessionData = await supabase.auth.getSession()
    return sessionData.data.session
  }
  return data.session
}

export async function deleteUser() {
  const supabase = getSupabase()
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error("Not authenticated")

  const userId = user.data.user.id

  await supabase.from("symptom_logs").delete().eq("daily_log_id", userId)
  await supabase.from("daily_logs").delete().eq("user_id", userId)
  await supabase.from("user_symptoms").delete().eq("user_id", userId)
  await supabase.from("user_conditions").delete().eq("user_id", userId)
  await supabase.from("diet_info").delete().eq("user_id", userId)
  await supabase.from("user_profiles").delete().eq("user_id", userId)
  await supabase.from("users").delete().eq("id", userId)

  await signOut()
}
