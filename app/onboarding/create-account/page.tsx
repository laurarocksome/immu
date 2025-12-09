"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Logo from "@/app/components/logo"
import { saveUserProfile, saveUserConditions, saveUserSymptoms, saveDietInfo } from "@/lib/user-data"
import { getCurrentUser } from "@/lib/auth"

export default function CreateAccountPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async () => {
    // Validate inputs
    if (!name.trim()) {
      setError("Please enter your name")
      return
    }

    if (!email.trim()) {
      setError("Please enter your email")
      return
    }

    if (!password.trim() || password.length < 6) {
      setError("Please enter a password (minimum 6 characters)")
      return
    }

    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // Check if user is authenticated
      const user = await getCurrentUser()

      if (!user) {
        setError("Please sign up or log in first")
        setIsLoading(false)
        return
      }

      const today = new Date().toISOString()

      // Get all data from localStorage
      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}")
      const selectedConditions = JSON.parse(localStorage.getItem("selectedConditions") || "[]")
      const selectedSymptoms = JSON.parse(localStorage.getItem("selectedSymptoms") || "[]")
      const dietTimeline = localStorage.getItem("dietTimeline") || "90"
      const adaptationChoice = localStorage.getItem("adaptationChoice") || "yes"

      console.log("[v0] Saving user data to Supabase...", {
        profile: userProfile,
        conditions: selectedConditions,
        symptoms: selectedSymptoms,
      })

      // Save user profile with name
      await saveUserProfile({
        name,
        gender: userProfile.gender,
        age: userProfile.age,
        weight: userProfile.weight,
        weightUnit: userProfile.weightUnit || "kg",
        height: userProfile.height,
        heightUnit: userProfile.heightUnit || "cm",
      })

      // Save conditions
      if (selectedConditions.length > 0) {
        await saveUserConditions(selectedConditions)
      }

      // Save symptoms
      if (selectedSymptoms.length > 0) {
        await saveUserSymptoms(selectedSymptoms)
      }

      // Save diet info
      await saveDietInfo({
        startDate: today,
        timelineDays: Number.parseInt(dietTimeline),
        adaptationChoice: adaptationChoice,
        currentPhase: "adaptation",
      })

      // Keep dietStartDate in localStorage for compatibility
      localStorage.setItem("dietStartDate", today)

      console.log("[v0] Successfully saved all data to Supabase")

      // Navigate to dashboard
      router.push("/dashboard")
    } catch (err: any) {
      console.error("[v0] Error saving user data:", err)
      setError(err.message || "Failed to save your data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 flex justify-center items-center bg-brand-dark text-white">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
            <p className="text-brand-dark/70">Register to save your data and track progress.</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="glass-card rounded-2xl p-6 space-y-4 mb-6">
            <div>
              <label htmlFor="name" className="block mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                placeholder="Create a password"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={() => setAgreedToTerms(!agreedToTerms)}
                className="h-5 w-5 rounded border-brand-dark/30 bg-white/80 text-pink-400 focus:ring-pink-400"
              />
              <label htmlFor="terms" className="ml-2 text-brand-dark">
                I agree to{" "}
                <a href="/terms" className="text-pink-500 hover:underline">
                  terms and conditions
                </a>
              </label>
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full gradient-button py-4 rounded-full ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? "Creating Account..." : "Next"}
          </button>
        </div>
      </main>

      {/* Progress indicator */}
      <div className="p-4 flex justify-center">
        <div className="flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
        </div>
      </div>
    </div>
  )
}
