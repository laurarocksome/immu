import { createClient } from "./client"
import type { Database } from "./types"

export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"]

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}

export async function createProfile(profile: ProfileInsert): Promise<Profile | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("profiles").insert(profile).select().single()

  if (error) {
    console.error("Error creating profile:", error)
    return null
  }

  return data
}

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single()

  if (error) {
    console.error("Error updating profile:", error)
    return null
  }

  return data
}

export async function upsertProfile(profile: ProfileInsert): Promise<Profile | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("profiles").upsert(profile).select().single()

  if (error) {
    console.error("Error upserting profile:", error)
    return null
  }

  return data
}
