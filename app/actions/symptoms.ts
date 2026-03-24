"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function logSymptomsAction(
  dailyLogId: string,
  symptoms: Array<{ symptom: string; severity: number }>
) {
  const supabase = createAdminClient()

  await supabase.from("symptom_logs").delete().eq("daily_log_id", dailyLogId)

  if (symptoms.length === 0) return { error: null }

  const unique = Array.from(
    new Map(symptoms.map((s) => [s.symptom, s])).values()
  )

  const { error } = await supabase.from("symptom_logs").insert(
    unique.map((s) => ({
      daily_log_id: dailyLogId,
      symptom: s.symptom,
      severity: s.severity,
    }))
  )

  return { error }
}

export async function saveUserSymptomsAction(
  userId: string,
  symptoms: string[]
) {
  const supabase = createAdminClient()

  await supabase.from("user_symptoms").delete().eq("user_id", userId)

  if (symptoms.length === 0) return { error: null }

  const unique = [...new Set(symptoms)]

  const { error } = await supabase.from("user_symptoms").insert(
    unique.map((symptom) => ({ user_id: userId, symptom }))
  )

  return { error }
}
