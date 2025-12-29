import { createClient } from "@/lib/supabase/client"

/**
 * Calculate which phase and day the user is currently on
 */
export async function getCurrentPhaseAndDay(userId: string) {
  const supabase = createClient()

  const { data: dietInfo, error } = await supabase
    .from("diet_info")
    .select("start_date, current_phase, timeline_days, adaptation_choice")
    .eq("user_id", userId)
    .single()

  if (error || !dietInfo) {
    return null
  }

  const startDate = new Date(dietInfo.start_date)
  const today = new Date()
  const daysSinceStart = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  // Determine adaptation days based on choice
  const adaptationDays = dietInfo.adaptation_choice === "14-day" ? 14 : 28

  let currentPhase = "Adaptation"
  let currentDay = daysSinceStart + 1

  if (daysSinceStart >= adaptationDays) {
    currentPhase = "Elimination"
    currentDay = daysSinceStart - adaptationDays + 1
  }

  // Check if they've moved to reintroduction (manual phase change)
  if (dietInfo.current_phase === "Reintroduction") {
    currentPhase = "Reintroduction"
  }

  return {
    phase: currentPhase,
    day: currentDay,
    totalDays: daysSinceStart + 1,
    startDate: dietInfo.start_date,
    adaptationDays,
  }
}

/**
 * Log a daily entry for the user
 */
export async function logDailyEntry(
  userId: string,
  data: {
    mood: number
    sleep: number
    stress: number
    notes?: string
    aip_compliant?: boolean // Only tracked during Elimination phase
  },
) {
  const supabase = createClient()

  const today = new Date().toISOString().split("T")[0]

  const phaseInfo = await getCurrentPhaseAndDay(userId)
  const currentPhase = phaseInfo?.phase || "Adaptation"

  // Check if entry already exists for today
  const { data: existing } = await supabase
    .from("daily_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("log_date", today)
    .single()

  if (existing) {
    // Update existing entry
    const { data: updated, error } = await supabase
      .from("daily_logs")
      .update({
        mood: data.mood,
        sleep: data.sleep,
        stress: data.stress,
        notes: data.notes,
        aip_compliant: data.aip_compliant, // Include AIP compliance
        phase: currentPhase, // Track which phase this log is for
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single()

    return { data: updated, error }
  } else {
    // Create new entry
    const { data: created, error } = await supabase
      .from("daily_logs")
      .insert({
        user_id: userId,
        log_date: today,
        mood: data.mood,
        sleep: data.sleep,
        stress: data.stress,
        notes: data.notes,
        aip_compliant: data.aip_compliant, // Include AIP compliance
        phase: currentPhase, // Track which phase this log is for
      })
      .select()
      .single()

    return { data: created, error }
  }
}

/**
 * Log symptoms for a daily entry
 */
export async function logSymptoms(dailyLogId: string, symptoms: Array<{ symptom: string; severity: number }>) {
  const supabase = createClient()

  // Delete existing symptoms for this log
  await supabase.from("symptom_logs").delete().eq("daily_log_id", dailyLogId)

  // Insert new symptoms
  const { data, error } = await supabase
    .from("symptom_logs")
    .insert(
      symptoms.map((s) => ({
        daily_log_id: dailyLogId,
        symptom: s.symptom,
        severity: s.severity,
      })),
    )
    .select()

  return { data, error }
}

/**
 * Get user's daily logs with symptoms
 */
export async function getDailyLogs(userId: string, limit = 30) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("daily_logs")
    .select(`
      *,
      symptom_logs (*)
    `)
    .eq("user_id", userId)
    .order("log_date", { ascending: false })
    .limit(limit)

  return { data, error }
}

/**
 * Transition user to a new phase
 */
export async function transitionToPhase(userId: string, newPhase: string, notes?: string) {
  const supabase = createClient()

  // End the current phase
  await supabase
    .from("phase_history")
    .update({ ended_at: new Date().toISOString() })
    .eq("user_id", userId)
    .is("ended_at", null)

  // Start new phase
  const { error: phaseError } = await supabase.from("phase_history").insert({
    user_id: userId,
    phase: newPhase,
    started_at: new Date().toISOString(),
    notes,
  })

  // Update diet_info
  const { error: dietError } = await supabase
    .from("diet_info")
    .update({ current_phase: newPhase })
    .eq("user_id", userId)

  return { error: phaseError || dietError }
}
