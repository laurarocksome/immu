"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check } from "lucide-react"
import Logo from "@/app/components/logo"

export default function NoStressHelpPage() {
  const router = useRouter()
  const [acknowledged, setAcknowledged] = useState(false)
  const [error, setError] = useState("")

  const handleContinue = () => {
    if (!acknowledged) {
      setError("Please acknowledge that you understand before continuing")
      return
    }

    // Navigate directly to the activity page
    router.push("/onboarding/activity")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 flex justify-center items-center bg-brand-dark text-white">
        <Logo variant="light" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-pink-400 flex items-center justify-center">
                <Check className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-4">Stress Management is Important</h2>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-8">
            <p className="mb-4">
              Chronic stress can significantly impact your autoimmune symptoms and overall health. Finding effective
              ways to manage stress is an important part of your healing journey.
            </p>
            <p className="mb-4">
              Even small steps like deep breathing for 5 minutes daily, gentle movement, or connecting with supportive
              people can make a difference.
            </p>
            <p>
              We encourage you to explore different stress management techniques as part of your AIP journey. Your IMMU
              app will provide resources and reminders to help you incorporate stress management into your routine.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-700">
              {error}
            </div>
          )}

          {/* Acknowledgment checkbox */}
          <div className="flex items-center mb-8">
            <input
              type="checkbox"
              id="acknowledge"
              checked={acknowledged}
              onChange={() => setAcknowledged(!acknowledged)}
              className="h-5 w-5 rounded border-brand-dark/30 bg-white/80 text-pink-400 focus:ring-pink-400"
            />
            <label htmlFor="acknowledge" className="ml-2 text-brand-dark">
              I understand.
            </label>
          </div>

          {/* Continue button */}
          <button onClick={handleContinue} className="w-full gradient-button py-4 rounded-full">
            Continue
          </button>
        </div>
      </main>

      {/* Progress indicator */}
      <div className="p-4 flex justify-center">
        <div className="flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
          <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
          <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
          <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
          <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
          <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
        </div>
      </div>
    </div>
  )
}
