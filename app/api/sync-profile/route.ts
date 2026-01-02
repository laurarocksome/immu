import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { profile, dietInfo, conditions, symptoms } = body

    // Insert user profile
    if (profile) {
      const { error: profileError } = await supabase.from("user_profiles").upsert(
        {
          user_id: user.id,
          age: profile.age ? Number.parseInt(profile.age) : null,
          weight: profile.weight ? Number.parseFloat(profile.weight) : null,
          weight_unit: profile.weightUnit || "kg",
          height: profile.height ? Number.parseInt(profile.height) : null,
          height_unit: profile.heightUnit || "cm",
          gender: profile.gender,
          activity_level: profile.activityLevel,
          athlete_type: profile.athleteType,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )

      if (profileError) {
        console.error("[v0] Profile sync error:", profileError)
      }
    }

    // Insert diet info
    if (dietInfo) {
      const { error: dietError } = await supabase.from("diet_info").upsert(
        {
          user_id: user.id,
          diet_timeline: dietInfo.dietTimeline || "not-set",
          adaptation_period: dietInfo.adaptationPeriod === "true" || dietInfo.adaptationPeriod === true,
          start_date: new Date().toISOString().split("T")[0],
          current_phase: "Adaptation",
          timeline_days: dietInfo.dietTimeline === "not-set" ? 0 : Number.parseInt(dietInfo.dietTimeline) || 0,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )

      if (dietError) {
        console.error("[v0] Diet info sync error:", dietError)
      }
    }

    // Insert conditions
    if (conditions && Array.isArray(conditions)) {
      // Delete existing conditions first
      await supabase.from("user_conditions").delete().eq("user_id", user.id)

      // Insert new conditions
      for (const condition of conditions) {
        await supabase.from("user_conditions").insert({
          user_id: user.id,
          condition: condition,
        })
      }
    }

    // Insert symptoms
    if (symptoms && Array.isArray(symptoms)) {
      // Delete existing symptoms first
      await supabase.from("user_symptoms").delete().eq("user_id", user.id)

      // Insert new symptoms
      for (const symptom of symptoms) {
        await supabase.from("user_symptoms").insert({
          user_id: user.id,
          symptom: symptom,
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Sync error:", error)
    return NextResponse.json({ error: "Failed to sync profile" }, { status: 500 })
  }
}
