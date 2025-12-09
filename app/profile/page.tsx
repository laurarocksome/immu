"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, ArrowLeft, Edit, Trash2 } from "lucide-react"
import Logo from "@/app/components/logo"
import { deleteUser, getSession } from "@/lib/auth"
import { supabase } from "@/lib/supabase/client"

type UserProfile = {
  gender: string
  age: number
  weight: number
  weightUnit: string
  height: number
  heightUnit: string
}

type DietInfo = {
  timeline: string
  adaptationPeriod: boolean
}

export default function ProfilePage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string>("")
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [dietInfo, setDietInfo] = useState<DietInfo | null>(null)
  const [conditions, setConditions] = useState<string[]>([])
  const [symptoms, setSymptoms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First try to load from Supabase
        const session = await getSession()

        if (session?.user) {
          const userId = session.user.id

          // Load user name from users table
          const { data: userData } = await supabase.from("users").select("name").eq("id", userId).single()

          if (userData?.name) {
            setUserName(userData.name)
          }

          // Load profile from user_profiles table
          const { data: profileData } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single()

          if (profileData) {
            setProfile({
              gender: profileData.gender || "",
              age: profileData.age || 0,
              weight: profileData.weight || 0,
              weightUnit: profileData.weight_unit || "kg",
              height: profileData.height || 0,
              heightUnit: profileData.height_unit || "cm",
            })
          }

          // Load diet info
          const { data: dietData } = await supabase.from("diet_info").select("*").eq("user_id", userId).single()

          if (dietData) {
            setDietInfo({
              timeline: dietData.diet_timeline?.toString() || "Not set",
              adaptationPeriod: dietData.adaptation_period || false,
            })
          }

          // Load conditions
          const { data: conditionsData } = await supabase
            .from("user_conditions")
            .select("condition_name")
            .eq("user_id", userId)

          if (conditionsData && conditionsData.length > 0) {
            setConditions(conditionsData.map((c) => c.condition_name))
          }

          // Load symptoms
          const { data: symptomsData } = await supabase
            .from("user_symptoms")
            .select("symptom_name")
            .eq("user_id", userId)

          if (symptomsData && symptomsData.length > 0) {
            setSymptoms(symptomsData.map((s) => s.symptom_name))
          }
        }

        // Fall back to localStorage if Supabase data not available
        if (!profile) {
          const profileData = JSON.parse(localStorage.getItem("userProfile") || "null")
          if (profileData) setProfile(profileData)
        }

        if (!dietInfo) {
          setDietInfo({
            timeline: localStorage.getItem("userDietTimeline") || "Not set",
            adaptationPeriod: localStorage.getItem("userAdaptationChoice") === "Yes",
          })
        }

        if (conditions.length === 0) {
          const storedConditions = JSON.parse(localStorage.getItem("userConditions") || "[]")
          const selectedConditions = JSON.parse(localStorage.getItem("selectedConditions") || "[]")
          setConditions(storedConditions.length > 0 ? storedConditions : selectedConditions)
        }

        if (symptoms.length === 0) {
          const storedSymptoms = JSON.parse(localStorage.getItem("userSymptoms") || "[]")
          setSymptoms(storedSymptoms)
        }

        if (!userName) {
          const storedName = localStorage.getItem("userName") || ""
          setUserName(storedName)
        }
      } catch (error) {
        console.error("Error loading user data:", error)
        // Fall back to localStorage on error
        const profileData = JSON.parse(localStorage.getItem("userProfile") || "null")
        setProfile(profileData)
        setDietInfo({
          timeline: localStorage.getItem("userDietTimeline") || "Not set",
          adaptationPeriod: localStorage.getItem("userAdaptationChoice") === "Yes",
        })
        const storedConditions = JSON.parse(localStorage.getItem("userConditions") || "[]")
        setConditions(storedConditions)
        const storedSymptoms = JSON.parse(localStorage.getItem("userSymptoms") || "[]")
        setSymptoms(storedSymptoms)
        setUserName(localStorage.getItem("userName") || "")
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await deleteUser()
      localStorage.clear()
      router.push("/")
    } catch (error) {
      console.error("Error deleting account:", error)
      alert("Failed to delete account. Please try again.")
      setIsDeleting(false)
    }
  }

  if (isLoading) {
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
        <Logo variant="light" />
        <div className="w-20"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Your Profile</h2>
            {userName && <p className="text-brand-dark/70">Welcome, {userName}!</p>}
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
                  <p className="text-brand-dark/60 text-sm">Gender</p>
                  <p>{profile.gender || "Not set"}</p>
                </div>
                <div>
                  <p className="text-brand-dark/60 text-sm">Age</p>
                  <p>{profile.age ? `${profile.age} years` : "Not set"}</p>
                </div>
                <div>
                  <p className="text-brand-dark/60 text-sm">Weight</p>
                  <p>{profile.weight ? `${profile.weight} ${profile.weightUnit}` : "Not set"}</p>
                </div>
                <div>
                  <p className="text-brand-dark/60 text-sm">Height</p>
                  <p>{profile.height ? `${profile.height} ${profile.heightUnit}` : "Not set"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Diet Information */}
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Diet Information</h3>
              <button
                className="text-pink-400 flex items-center"
                onClick={() => router.push("/onboarding/diet-timeline")}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-brand-dark/60 text-sm">Diet Timeline</p>
                <p>{dietInfo?.timeline || "Not set"} days</p>
              </div>
              <div>
                <p className="text-brand-dark/60 text-sm">Adaptation Period</p>
                <p>{dietInfo?.adaptationPeriod ? "Yes" : "No"}</p>
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
              {conditions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {conditions.map((condition, index) => (
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

          {/* Symptoms */}
          <div className="glass-card rounded-2xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Symptoms to Track</h3>
              <button className="text-pink-400 flex items-center" onClick={() => router.push("/onboarding/symptoms")}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </button>
            </div>

            <div>
              {symptoms.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((symptom, index) => (
                    <span key={index} className="bg-purple-200/70 text-brand-dark px-3 py-1 rounded-full text-sm">
                      {symptom}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-brand-dark/60">No symptoms selected</p>
              )}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.clear()
              router.push("/")
            }}
            className="w-full border border-brand-dark/30 text-brand-dark hover:bg-white/50 py-3 rounded-full transition-colors mb-3"
          >
            Log Out
          </button>

          {/* Delete Account Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full border border-red-500/50 text-red-600 hover:bg-red-50 py-3 rounded-full transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-2 text-brand-dark">Delete Account?</h3>
            <p className="text-brand-dark/70 mb-6">
              This will permanently delete your account and all your data including logs, symptoms, and conditions. This
              action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 border border-brand-dark/30 text-brand-dark hover:bg-white/50 py-3 rounded-full transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 bg-red-600 text-white hover:bg-red-700 py-3 rounded-full transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

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
