import { supabase } from "./supabase/client"

export async function signUp(email: string, password: string, name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
      emailRedirectTo:
        process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
        `${typeof window !== "undefined" ? window.location.origin : ""}/dashboard`,
    },
  })

  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data.user
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data.session
}

export async function deleteUser() {
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error("Not authenticated")

  const userId = user.data.user.id

  // Delete all user data from the database tables
  // Note: Supabase RLS policies will ensure only the user's own data is deleted
  await supabase.from("symptom_logs").delete().eq("daily_log_id", userId)
  await supabase.from("daily_logs").delete().eq("user_id", userId)
  await supabase.from("user_symptoms").delete().eq("user_id", userId)
  await supabase.from("user_conditions").delete().eq("user_id", userId)
  await supabase.from("diet_info").delete().eq("user_id", userId)
  await supabase.from("user_profiles").delete().eq("user_id", userId)
  await supabase.from("users").delete().eq("id", userId)

  // Delete the user from Supabase Auth
  const { error } = await supabase.auth.admin.deleteUser(userId)
  if (error) throw error

  // Sign out the user
  await signOut()
}
