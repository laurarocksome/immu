"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Logo from "@/app/components/logo"
import { saveUserProfile, saveUserConditions, saveUserSymptoms, saveDietInfo, saveUserName } from "@/lib/user-data"
import { createClient } from "@/lib/supabase/client"

export default function CreateAccountPage() {
  const router = useRouter()
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const userAccount = JSON.parse(localStorage.getItem("userAccount") || "{}")
    if (userAccount.name) {
      setUserName(userAccount.name)
    }
  }, [])

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const today = new Date().toISOString()

      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}")
      const userAccount = JSON.parse(localStorage.getItem("userAccount") || "{}")
      const selectedConditions = JSON.parse(localStorage.getItem("selectedConditions") || "[]")
      const selectedSymptoms = JSON.parse(localStorage.getItem("selectedSymptoms") || "[]")
      const dietTimeline = localStorage.getItem("userDietTimeline") || "90"
      const adaptationChoice = localStorage.getItem("userAdaptationChoice") || "No"

      // Use getUser() directly - works even with unconfirmed email
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setError("Session not found. Please go back and sign up again.")
        setIsLoading(false)
        return
      }

      const name = userAccount.name || userName
      if (name) {
        await saveUserName(name)
      }

      await saveUserProfile({
        gender: userProfile.gender,
        age: userProfile.age,
        weight: userProfile.weight,
        weightUnit: userProfile.weightUnit || "kg",
        height: userProfile.height,
        heightUnit: userProfile.heightUnit || "cm",
      })

      if (selectedConditions.length > 0) {
        await saveUserConditions(selectedConditions)
      }

      if (selectedSymptoms.length > 0) {
        await saveUserSymptoms(selectedSymptoms)
      }

      await saveDietInfo({
        startDate: today,
        timelineDays: Number.parseInt(dietTimeline),
        adaptationChoice: adaptationChoice,
        currentPhase: adaptationChoice === "Yes" ? "adaptation" : "elimination",
      })

      localStorage.setItem("dietStartDate", today)
      localStorage.setItem("onboardingComplete", "true")

      router.push("/dashboard")
    } catch (err: any) {
      console.error("Error saving user data:", err)
      setError(err.message || "Failed to save your data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      <header className="p-4 flex justify-center items-center bg-brand-dark text-white">
        <Logo variant="light" />
      </header>

      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Almost Done{userName ? `, ${userName}` : ""}!</h2>
            <p className="text-brand-dark/70">Review and confirm to start your AIP journey.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-700">
              {error}
            </div>
          )}

          <div className="glass-card rounded-2xl p-6 space-y-4 mb-6">
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-400 to-pink-500 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg">Your profile is ready</h3>
              <p className="text-sm text-brand-dark/60 mt-2">
                We've collected all the information needed to personalize your AIP diet experience.
              </p>
              <div className="mt-4 p-3 bg-pink-50 border border-pink-200 rounded-lg">
                <p className="text-sm text-pink-700">
                  <span className="font-medium">Check your email!</span> We've sent you a confirmation link to verify
                  your account. Please confirm your email to sync your data across devices.
                </p>
              </div>
            </div>

            <div className="border-t border-brand-dark/10 pt-4">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={() => setAgreedToTerms(!agreedToTerms)}
                  className="h-5 w-5 mt-0.5 rounded border-brand-dark/30 bg-white/80 text-pink-400 focus:ring-pink-400"
                />
                <label htmlFor="terms" className="ml-3 text-sm text-brand-dark">
                  I agree to the{" "}
                  <a href="/terms" className="text-pink-500 hover:underline">
                    terms and conditions
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-pink-500 hover:underline">
                    privacy policy
                  </a>
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full gradient-button py-4 rounded-full ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? "Setting up..." : "Start My AIP Journey"}
          </button>
        </div>
      </main>

      <div className="p-4 flex justify-center">
        <div className="flex space-x-2">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-pink-400"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
