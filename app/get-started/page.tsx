"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Logo from "@/app/components/logo"
import { setupTestData } from "../utils/test-utils"

export default function GetStartedPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = () => {
    // Validate email
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    // Store email in localStorage for later use
    localStorage.setItem("userEmail", email)

    // Navigate to first onboarding step
    setTimeout(() => {
      router.push("/onboarding/conditions")
      setIsLoading(false)
    }, 500)
  }

  const handleSkip = () => {
    setupTestData()
    router.push("/dashboard")
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
            <h2 className="text-2xl font-bold mb-2">Get Started</h2>
            <p className="text-brand-dark/70">Enter your email to begin your personalized AIP journey.</p>
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
          </div>

          {/* Next button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full gradient-button py-4 rounded-full mb-4 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            {isLoading ? "Loading..." : "Next"}
          </button>

          {/* Skip button for testing */}
          <button
            onClick={handleSkip}
            className="w-full py-4 rounded-full border-2 border-dashed border-pink-300 bg-transparent text-pink-500 hover:bg-pink-50"
          >
            Skip (Testing)
          </button>
        </div>
      </main>
    </div>
  )
}
