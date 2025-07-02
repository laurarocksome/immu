"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, ArrowLeft, Edit } from "lucide-react"
import Logo from "@/app/components/logo"
import { useAuth } from "@/hooks/use-auth"
import { getProfile, type Profile } from "@/utils/supabase/profiles"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProfile = async () => {
      if (authLoading) return

      if (user) {
        // Load from Supabase if authenticated
        const supabaseProfile = await getProfile(user.id)
        if (supabaseProfile) {
          setProfile(supabaseProfile)
        }
      } else {
        // Fallback to localStorage for test users
        const localProfile = localStorage.getItem("userProfile")
        if (localProfile) {
          const parsedProfile = JSON.parse(localProfile)
          setProfile({
            id: "test-user",
            email: "test@example.com",
            gender: parsedProfile.gender,
            age: parsedProfile.age,
            weight: parsedProfile.weight,
            weight_unit: parsedProfile.weightUnit,
            height: parsedProfile.height,
            height_unit: parsedProfile.heightUnit,
            diet_timeline: null,
            adaptation_period: null,
            conditions: null,
            stress_level: null,
            activity_level: null,
            caffeine_habits: null,
            alcohol_habits: null,
            sugar_habits: null,
            vegetable_habits: null,
            athlete_info: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      }

      setIsLoading(false)
    }

    loadProfile()
  }, [user, authLoading])

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  const handleLogout = async () => {
    if (user) {
      const { createClient } = await import("@/utils/supabase/client")
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    router.push("/")
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-brand-dark text-white">
        <button onClick={handleBackToDashboard} className="flex items-center text-white/80 hover:text-white">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </button>
        <Logo />
        <div className="w-20"></div> {/* Empty div for spacing */}
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Your Profile</h2>
            {user && <p className="text-brand-dark/60 text-sm">Authenticated User</p>}
          </div>

          {/* Personal Information */}
          {profile && (
            <div className="glass-card rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <button
                  className="text-pink-400 flex items-center"
                  onClick={() => router.push("/onboarding/user-profile")}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-brand-dark/60 text-sm">Email</p>
                  <p>{profile.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-brand-dark/60 text-sm">Gender</p>
                  <p>{profile.gender || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-brand-dark/60 text-sm">Age</p>
                  <p>{profile.age ? `${profile.age} years` : "Not provided"}</p>
                </div>
                <div>
                  <p className="text-brand-dark/60 text-sm">Weight</p>
                  <p>
                    {profile.weight && profile.weight_unit
                      ? `${profile.weight} ${profile.weight_unit}`
                      : "Not provided"}
                  </p>
                </div>
                <div>
                  <p className="text-brand-dark/60 text-sm">Height</p>
                  <p>
                    {profile.height && profile.height_unit
                      ? `${profile.height} ${profile.height_unit}`
                      : "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Diet Information */}
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Diet Information</h3>
              <button className="text-pink-400 flex items-center">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-brand-dark/60 text-sm">Diet Timeline</p>
                <p>{profile?.diet_timeline ? `${profile.diet_timeline} days` : "Not set"}</p>
              </div>
              <div>
                <p className="text-brand-dark/60 text-sm">Adaptation Period</p>
                <p>{profile?.adaptation_period ? "Yes" : "No"}</p>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Conditions</h3>
              <button className="text-pink-400 flex items-center" onClick={() => router.push("/onboarding/conditions")}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
            </div>

            <div>
              {profile?.conditions && profile.conditions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.conditions.map((condition, index) => (
                    <span key={index} className="bg-pink-200/70 text-brand-dark px-3 py-1 rounded-full text-sm">
                      {condition}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-brand-dark/60">No conditions selected</p>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full border border-brand-dark/30 text-brand-dark hover:bg-white/50 py-3 rounded-full transition-colors"
          >
            {user ? "Log Out" : "Back to Home"}
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="grid grid-cols-5 border-t border-brand-dark/10 bg-white/80 backdrop-blur-sm">
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => router.push("/food-list")}
        >
          <List className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Products</span>
        </button>
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => router.push("/dashboard")}
        >
          <Home className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Dashboard</span>
        </button>
        <button
          className="flex items-center justify-center rounded-full gradient-button h-14 w-14 -mt-7 mx-auto shadow-lg"
          onClick={() => router.push("/log-day")}
        >
          <Plus className="h-6 w-6" />
        </button>
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => router.push("/nutrition")}
        >
          <BookOpen className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Nutrition</span>
        </button>
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => router.push("/recipes")}
        >
          <UtensilsCrossed className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Recipes</span>
        </button>
      </nav>
    </div>
  )
}
