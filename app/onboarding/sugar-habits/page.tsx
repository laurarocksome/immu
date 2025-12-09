"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Logo from "@/app/components/logo"
import { ArrowLeft } from "lucide-react"

// Sugar consumption options
const sugarOptions = [
  "No, I avoid added sugar",
  "Yes, occasionally (1-2 times per week)",
  "Yes, daily (in coffee, tea, etc.)",
  "Yes, multiple times a day",
]

export default function SugarPage() {
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [error, setError] = useState("")

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option)
    setError("")
  }

  const handleContinue = () => {
    if (!selectedOption) {
      setError("Please select an option to continue")
      return
    }

    // Save to local storage
    localStorage.setItem("userSugarHabits", selectedOption)

    // Continue to the vegetable habits page
    router.push("/onboarding/vegetable-habits")
  }

  const handleBack = () => {
    router.push("/onboarding/alcohol-habits")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 flex justify-center items-center bg-brand-dark text-white relative">
        <button
          onClick={handleBack}
          className="absolute left-4 text-white/80 hover:text-white transition-colors flex items-center"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </button>
        <Logo variant="light" />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Your Habits</h2>
            <p className="text-brand-dark/70">Do you consume foods or drinks with added sugar?</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-700">
              {error}
            </div>
          )}

          {/* Sugar options */}
          <div className="flex flex-col gap-3 mb-8">
            {sugarOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className={`px-4 py-3 rounded-xl text-center transition-colors ${
                  selectedOption === option ? "bg-pink-400 text-white" : "glass-card hover:bg-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Next button */}
          <button onClick={handleContinue} className="w-full gradient-button py-4 rounded-full">
            Next
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
          <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
          <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
        </div>
      </div>
    </div>
  )
}
