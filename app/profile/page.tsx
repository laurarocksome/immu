"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, ArrowLeft, Edit, Trash2 } from "lucide-react"
import Logo from "@/app/components/logo"
import { deleteUser } from "@/lib/auth"

type UserProfile = {
  gender: string
  age: number
  weight: number
  weightUnit: string
  height: number
  heightUnit: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    // Load profile data
    const profileData = JSON.parse(localStorage.getItem("userProfile") || "null")
    setProfile(profileData)

    // Try to load conditions from both possible localStorage keys
    const conditions = JSON.parse(localStorage.getItem("userConditions") || "[]")
    if (conditions.length === 0) {
      // If userConditions is empty, try selectedConditions
      const selectedConditions = JSON.parse(localStorage.getItem("selectedConditions") || "[]")
      if (selectedConditions.length > 0) {
        // If found in selectedConditions, save to userConditions for future use
        localStorage.setItem("userConditions", JSON.stringify(selectedConditions))
      }
    }

    setIsLoading(false)
  }, [])

  const handleBackToDashboard = () => {
    router.push("/dashboard")
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    try {
      await deleteUser()
      // Clear all localStorage
      localStorage.clear()
      // Redirect to home page
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
        <Logo />
        <div className="w-20"></div> {/* Empty div for spacing */}
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Your Profile</h2>
          </div>

          {/* Personal Information */}
          {profile && (
            <div className="glass-card rounded-2xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Personal Information</h3>
                <button className="text-pink-400 flex items-center">
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-brand-dark/60 text-sm">Gender</p>
                  <p>{profile.gender}</p>
                </div>
                <div>
                  <p className="text-brand-dark/60 text-sm">Age</p>
                  <p>{profile.age} years</p>
                </div>
                <div>
                  <p className="text-brand-dark/60 text-sm">Weight</p>
                  <p>
                    {profile.weight} {profile.weightUnit}
                  </p>
                </div>
                <div>
                  <p className="text-brand-dark/60 text-sm">Height</p>
                  <p>
                    {profile.height} {profile.heightUnit}
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
                <p>{localStorage.getItem("userDietTimeline") || "Not set"} days</p>
              </div>
              <div>
                <p className="text-brand-dark/60 text-sm">Adaptation Period</p>
                <p>{localStorage.getItem("userAdaptationChoice") === "Yes" ? "Yes" : "No"}</p>
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
              {(() => {
                // Try to get conditions from both possible localStorage keys
                const conditions = JSON.parse(localStorage.getItem("userConditions") || "[]")
                const selectedConditions = JSON.parse(localStorage.getItem("selectedConditions") || "[]")

                // Use whichever has data, preferring userConditions
                const displayConditions = conditions.length > 0 ? conditions : selectedConditions

                return displayConditions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {displayConditions.map((condition, index) => (
                      <span key={index} className="bg-pink-200/70 text-brand-dark px-3 py-1 rounded-full text-sm">
                        {condition}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-brand-dark/60">No conditions selected</p>
                )
              })()}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => router.push("/")}
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
