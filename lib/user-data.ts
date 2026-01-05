import { supabase } from "./supabase/client"
import { createClient } from "@supabase/supabase-js" // Ensure this import is present for the new functions

// Store user profile information
export async function saveUserProfile(profileData: {
  gender?: string
  age?: number
  weight?: number
  weightUnit?: string
  height?: number
  heightUnit?: string
}) {
  console.log("[v0] Saving user profile:", profileData)
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error("Not authenticated")

  console.log("[v0] User ID for profile save:", user.data.user.id)

  const { data: existing } = await supabase.from("user_profiles").select("id").eq("user_id", user.data.user.id).single()

  const profileRecord = {
    ...(existing?.id ? { id: existing.id } : {}),
    user_id: user.data.user.id,
    gender: profileData.gender,
    age: profileData.age,
    weight: profileData.weight,
    weight_unit: profileData.weightUnit,
    height: profileData.height,
    height_unit: profileData.heightUnit,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("user_profiles").upsert(profileRecord).select()

  console.log("[v0] Profile save result:", { data, error })
  if (error) throw error
  return data
}

// Store user conditions
export async function saveUserConditions(conditions: string[]) {
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error("Not authenticated")

  // Delete existing conditions
  await supabase.from("user_conditions").delete().eq("user_id", user.data.user.id)

  // Insert new conditions
  if (conditions.length > 0) {
    const { error } = await supabase.from("user_conditions").insert(
      conditions.map((condition) => ({
        user_id: user.data.user.id,
        condition,
      })),
    )

    if (error) throw error
  }
}

// Store user symptoms
export async function saveUserSymptoms(symptoms: string[]) {
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error("Not authenticated")

  // Delete existing symptoms
  await supabase.from("user_symptoms").delete().eq("user_id", user.data.user.id)

  // Insert new symptoms
  if (symptoms.length > 0) {
    const { error } = await supabase.from("user_symptoms").insert(
      symptoms.map((symptom) => ({
        user_id: user.data.user.id,
        symptom,
      })),
    )

    if (error) throw error
  }
}

// Store diet information
export async function saveDietInfo(dietData: {
  startDate: string
  timelineDays: number
  adaptationChoice: string
  currentPhase?: string
}) {
  console.log("[v0] Saving diet info:", dietData)
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error("Not authenticated")

  console.log("[v0] User ID for diet save:", user.data.user.id)

  const { data: existing } = await supabase.from("diet_info").select("id").eq("user_id", user.data.user.id).single()

  const dietRecord = {
    ...(existing?.id ? { id: existing.id } : {}),
    user_id: user.data.user.id,
    start_date: dietData.startDate,
    timeline_days: dietData.timelineDays,
    adaptation_choice: dietData.adaptationChoice,
    current_phase: dietData.currentPhase || "adaptation",
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("diet_info").upsert(dietRecord).select()

  console.log("[v0] Diet info save result:", { data, error })
  if (error) throw error
  return data
}

// Save daily log
export async function saveDailyLog(logData: {
  logDate: string
  mood?: number
  sleep?: number
  stress?: number
  symptoms?: Array<{ symptom: string; severity: number }>
  notes?: string
}) {
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error("Not authenticated")

  // First, upsert the daily log
  const { data: logData_result, error: logError } = await supabase
    .from("daily_logs")
    .upsert({
      user_id: user.data.user.id,
      log_date: logData.logDate,
      mood: logData.mood,
      sleep: logData.sleep,
      stress: logData.stress,
      notes: logData.notes,
      updated_at: new Date().toISOString(),
    })
    .select()

  if (logError) throw logError

  // If there are symptoms, save them
  if (logData.symptoms && logData.symptoms.length > 0 && logData_result[0]) {
    // Delete existing symptom logs for this day
    await supabase.from("symptom_logs").delete().eq("daily_log_id", logData_result[0].id)

    // Insert new symptom logs
    const { error: symptomError } = await supabase.from("symptom_logs").insert(
      logData.symptoms.map((symptom) => ({
        daily_log_id: logData_result[0].id,
        symptom: symptom.symptom,
        severity: symptom.severity,
      })),
    )

    if (symptomError) throw symptomError
  }

  return logData_result
}

// Fetch user profile
export async function getUserProfile() {
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error("Not authenticated")

  const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", user.data.user.id).single()

  if (error && error.code !== "PGRST116") throw error // PGRST116 is "not found"
  return data
}

// Fetch user conditions
export async function getUserConditions() {
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error("Not authenticated")

  const { data, error } = await supabase.from("user_conditions").select("condition").eq("user_id", user.data.user.id)

  if (error) throw error
  return data?.map((c) => c.condition) || []
}

// Fetch user symptoms
export async function getUserSymptoms() {
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error("Not authenticated")

  const { data, error } = await supabase.from("user_symptoms").select("symptom").eq("user_id", user.data.user.id)

  if (error) throw error
  return data?.map((s) => s.symptom) || []
}

// Fetch diet info
export async function getDietInfo() {
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error("Not authenticated")

  const { data, error } = await supabase.from("diet_info").select("*").eq("user_id", user.data.user.id).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

// Fetch daily log
export async function getDailyLog(logDate: string) {
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("daily_logs")
    .select(
      `
    *,
    symptom_logs (
      id,
      symptom,
      severity
    )
  `,
    )
    .eq("user_id", user.data.user.id)
    .eq("log_date", logDate)
    .single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

// Fetch all daily logs for a date range
export async function getDailyLogs(startDate: string, endDate: string) {
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("daily_logs")
    .select(
      `
    *,
    symptom_logs (
      id,
      symptom,
      severity
    )
  `,
    )
    .eq("user_id", user.data.user.id)
    .gte("log_date", startDate)
    .lte("log_date", endDate)
    .order("log_date", { ascending: false })

  if (error) throw error
  return data || []
}

// Update user name in 'users' table
export async function saveUserName(name: string) {
  const user = await supabase.auth.getUser()
  if (!user.data.user) throw new Error("Not authenticated")

  const { error } = await supabase.from("users").upsert({
    id: user.data.user.id,
    email: user.data.user.email,
    name: name,
    updated_at: new Date().toISOString(),
  })

  if (error) throw error
}

export async function getUserStreak(userId: string): Promise<number> {
  const supabaseClient = createClient()

  const { data: logs, error } = await supabaseClient
    .from("daily_logs")
    .select("log_date")
    .eq("user_id", userId)
    .order("log_date", { ascending: false })

  if (error || !logs || logs.length === 0) {
    return 0
  }

  // Calculate streak from most recent date
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  let streak = 0
  const currentDate = new Date(today)

  for (const log of logs) {
    const logDate = new Date(log.log_date)
    logDate.setHours(0, 0, 0, 0)

    const diffDays = Math.floor((currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // Today's log or current checking date
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else if (diffDays === 1) {
      // Yesterday's log
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      // Gap in logging, break streak
      break
    }
  }

  return streak
}

export async function getSymptomHistory(userId: string, days = 7) {
  const supabaseClient = createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days + 1)

  const { data, error } = await supabaseClient
    .from("daily_logs")
    .select(`
      log_date,
      symptom_logs (
        symptom,
        severity
      )
    `)
    .eq("user_id", userId)
    .gte("log_date", startDate.toISOString().split("T")[0])
    .order("log_date", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching symptom history:", error)
    return []
  }

  return data || []
}

export async function getWellnessHistory(userId: string, days = 7) {
  const supabaseClient = createClient()

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days + 1)

  const { data, error } = await supabaseClient
    .from("daily_logs")
    .select("log_date, mood, sleep, stress")
    .eq("user_id", userId)
    .gte("log_date", startDate.toISOString().split("T")[0])
    .order("log_date", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching wellness history:", error)
    return []
  }

  return data || []
}
