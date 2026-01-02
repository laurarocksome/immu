import { createClient } from "@/lib/supabase/client"

// Fetch user profile by user ID
export async function getUserProfile(userId: string) {
  if (!userId) return null

  const supabase = createClient()
  const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") {
    console.error("[v0] Error loading user profile:", error)
    return null
  }
  return data
}

// Fetch diet info by user ID
export async function loadDietInfo(userId: string) {
  if (!userId) return null

  const supabase = createClient()
  const { data, error } = await supabase.from("diet_info").select("*").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") {
    console.error("[v0] Error loading diet info:", error)
    return null
  }
  return data
}

// Fetch tracked dates (daily logs) for a user
export async function loadTrackedDates(userId: string) {
  if (!userId) return []

  const supabase = createClient()
  const { data, error } = await supabase
    .from("daily_logs")
    .select("log_date")
    .eq("user_id", userId)
    .order("log_date", { ascending: false })

  if (error) {
    console.error("[v0] Error loading tracked dates:", error)
    return []
  }

  return data?.map((log) => log.log_date) || []
}

// Calculate diet progress and return phase information
export function calculateDietProgress(dietInfo: any) {
  if (!dietInfo) return null

  const { start_date, timeline_days, adaptation_choice } = dietInfo
  if (!start_date || !timeline_days) return null

  const hasAdaptation = adaptation_choice === "yes"
  const dietStartDate = new Date(start_date)
  const today = new Date()
  const daysElapsed = Math.floor((today.getTime() - dietStartDate.getTime()) / (1000 * 60 * 60 * 24))

  // Calculate adaptation and elimination days
  const adaptationDays = hasAdaptation ? 28 : 0
  const eliminationDays = hasAdaptation ? timeline_days - adaptationDays : timeline_days

  // Determine current phase
  let currentPhase = "elimination"
  let isAdaptationPhase = false
  let adaptationDay = 0
  let eliminationPhasePercentage = 0
  let reintroductionDay = 0

  if (hasAdaptation && daysElapsed < adaptationDays) {
    // In adaptation phase
    currentPhase = "adaptation"
    isAdaptationPhase = true
    adaptationDay = daysElapsed + 1
  } else if (daysElapsed < (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays)) {
    // In elimination phase
    currentPhase = "elimination"
    const eliminationDaysElapsed = daysElapsed - (hasAdaptation ? adaptationDays : 0)
    eliminationPhasePercentage = Math.floor((eliminationDaysElapsed / eliminationDays) * 100)
  } else {
    // In reintroduction phase
    currentPhase = "reintroduction"
    eliminationPhasePercentage = 100
    const reintroductionDaysElapsed = daysElapsed - (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays)
    reintroductionDay = reintroductionDaysElapsed + 1
  }

  return {
    currentPhase,
    isAdaptationPhase,
    adaptationDay,
    eliminationPhasePercentage,
    reintroductionDay,
    daysElapsed,
  }
}
