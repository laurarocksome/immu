"use client"

import { useEffect, useState } from "react"
import { useAuth } from "./use-auth"
import { getProfile, updateProfile, type Profile } from "@/utils/supabase/profiles"

export function useProfile() {
  const { user, isAuthenticated } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        setLoading(true)
        const profileData = await getProfile(user.id)
        setProfile(profileData)
        setError(null)
      } catch (err) {
        setError("Failed to load profile")
        console.error("Error fetching profile:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, isAuthenticated])

  const updateUserProfile = async (updates: Partial<Profile>) => {
    if (!user) return null

    try {
      const updatedProfile = await updateProfile(user.id, updates)
      if (updatedProfile) {
        setProfile(updatedProfile)
      }
      return updatedProfile
    } catch (err) {
      setError("Failed to update profile")
      console.error("Error updating profile:", err)
      return null
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile: updateUserProfile,
    isAuthenticated,
  }
}
