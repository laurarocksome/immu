import { createClient } from "@/lib/supabase/client"

export type DietPhase = "adaptation" | "elimination" | "reintroduction"

export interface DietPhaseInfo {
  phase: DietPhase
  adaptationDay: number
  eliminationPhasePercentage: number
  reintroductionDay: number
  daysElapsed: number
  totalDays: number
  hasAdaptation: boolean
}

/**
 * Calculates the current diet phase from a diet_info DB row.
 * This is the single source of truth used by all pages.
 */
export function calcPhaseFromDietInfo(dietInfo: {
  start_date: string
  timeline_days: number
  adaptation_choice: string
}): DietPhaseInfo {
  const startDate = new Date(dietInfo.start_date)
  startDate.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const daysElapsed = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  const hasAdaptation =
    typeof dietInfo.adaptation_choice === "string" &&
    dietInfo.adaptation_choice.toLowerCase() === "yes"

  const adaptationDays = hasAdaptation ? 28 : 0
  const eliminationDays = dietInfo.timeline_days - adaptationDays
  const totalDays = dietInfo.timeline_days

  if (hasAdaptation && daysElapsed < adaptationDays) {
    return {
      phase: "adaptation",
      adaptationDay: daysElapsed + 1,
      eliminationPhasePercentage: 0,
      reintroductionDay: 0,
      daysElapsed,
      totalDays,
      hasAdaptation,
    }
  } else if (daysElapsed < adaptationDays + eliminationDays) {
    const eliminationDaysElapsed = daysElapsed - adaptationDays
    const eliminationPhasePercentage =
      eliminationDays > 0 ? Math.floor((eliminationDaysElapsed / eliminationDays) * 100) : 0
    return {
      phase: "elimination",
      adaptationDay: 0,
      eliminationPhasePercentage,
      reintroductionDay: 0,
      daysElapsed,
      totalDays,
      hasAdaptation,
    }
  } else {
    const reintroductionDaysElapsed = daysElapsed - adaptationDays - eliminationDays
    return {
      phase: "reintroduction",
      adaptationDay: 0,
      eliminationPhasePercentage: 100,
      reintroductionDay: reintroductionDaysElapsed + 1,
      daysElapsed,
      totalDays,
      hasAdaptation,
    }
  }
}

/**
 * Fetches the current user's diet phase from Supabase.
 * Falls back to localStorage if Supabase is unavailable.
 * Caches the result in localStorage so other pages can read it synchronously.
 */
export async function getDietPhase(): Promise<DietPhaseInfo> {
  const fallback: DietPhaseInfo = {
    phase: "elimination",
    adaptationDay: 0,
    eliminationPhasePercentage: 0,
    reintroductionDay: 0,
    daysElapsed: 0,
    totalDays: 90,
    hasAdaptation: false,
  }

  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return fallback

    const { data: dietInfo, error } = await supabase
      .from("diet_info")
      .select("start_date, timeline_days, adaptation_choice")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error || !dietInfo || !dietInfo.start_date) {
      return fallbackFromLocalStorage() ?? fallback
    }

    const result = calcPhaseFromDietInfo(dietInfo)

    // Write canonical keys to localStorage so synchronous callers stay in sync
    if (typeof window !== "undefined") {
      localStorage.setItem("dietStartDate", dietInfo.start_date)
      localStorage.setItem("userDietTimeline", String(dietInfo.timeline_days))
      localStorage.setItem(
        "userAdaptationChoice",
        result.hasAdaptation ? "Yes" : "No",
      )
      localStorage.setItem("_cachedDietPhase", JSON.stringify(result))
    }

    return result
  } catch {
    return fallbackFromLocalStorage() ?? fallback
  }
}

/**
 * Synchronous fallback that reads from localStorage.
 * Use this only when async is impossible (e.g., in pure helper functions).
 */
export function getDietPhaseSync(): DietPhaseInfo {
  if (typeof window === "undefined") {
    return {
      phase: "elimination",
      adaptationDay: 0,
      eliminationPhasePercentage: 0,
      reintroductionDay: 0,
      daysElapsed: 0,
      totalDays: 90,
      hasAdaptation: false,
    }
  }

  const cached = localStorage.getItem("_cachedDietPhase")
  if (cached) {
    try {
      return JSON.parse(cached)
    } catch {}
  }

  return (
    fallbackFromLocalStorage() ?? {
      phase: "elimination",
      adaptationDay: 0,
      eliminationPhasePercentage: 0,
      reintroductionDay: 0,
      daysElapsed: 0,
      totalDays: 90,
      hasAdaptation: false,
    }
  )
}

function fallbackFromLocalStorage(): DietPhaseInfo | null {
  if (typeof window === "undefined") return null

  const startDate = localStorage.getItem("dietStartDate")
  const timeline = localStorage.getItem("userDietTimeline")
  const adaptChoice = localStorage.getItem("userAdaptationChoice")

  if (!startDate) return null

  return calcPhaseFromDietInfo({
    start_date: startDate,
    timeline_days: timeline ? Number.parseInt(timeline) : 90,
    adaptation_choice: adaptChoice ?? "No",
  })
}
