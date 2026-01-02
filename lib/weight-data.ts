import { createClient } from "@/lib/supabase/client"

export interface WeightLog {
  id: string
  user_id: string
  weight: number
  weight_unit: string
  log_date: string
  created_at: string
}

export async function getWeightLogs(userId: string, limit = 30): Promise<WeightLog[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", userId)
    .order("log_date", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching weight logs:", error)
    return []
  }

  return data || []
}

export async function saveWeightLog(userId: string, weight: number, weightUnit: string, logDate?: string) {
  const supabase = createClient()
  const dateToLog = logDate || new Date().toISOString().split("T")[0]

  console.log("[v0] Saving weight log:", { userId, weight, weightUnit, logDate: dateToLog })

  const { data: existing } = await supabase
    .from("weight_logs")
    .select("id")
    .eq("user_id", userId)
    .eq("log_date", dateToLog)
    .single()

  let result
  if (existing) {
    // Update existing entry
    console.log("[v0] Updating existing weight log:", existing.id)
    const { data, error } = await supabase
      .from("weight_logs")
      .update({
        weight,
        weight_unit: weightUnit,
      })
      .eq("id", existing.id)
      .select()
      .single()

    if (error) {
      console.error("[v0] Error updating weight log:", error)
      throw error
    }
    result = data
  } else {
    // Insert new entry
    console.log("[v0] Inserting new weight log")
    const { data, error } = await supabase
      .from("weight_logs")
      .insert({
        user_id: userId,
        weight,
        weight_unit: weightUnit,
        log_date: dateToLog,
      })
      .select()
      .single()

    if (error) {
      console.error("[v0] Error inserting weight log:", error)
      throw error
    }
    result = data
  }

  console.log("[v0] Weight log saved successfully:", result)
  return result
}

export async function getLatestWeight(userId: string): Promise<WeightLog | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", userId)
    .order("log_date", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error("[v0] Error fetching latest weight:", error)
    return null
  }

  return data
}
