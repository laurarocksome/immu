"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Logo from "@/app/components/logo"
import Link from "next/link"

export default function DietTimelinePage() {
  const router = useRouter()
  const [needsAdaptation, setNeedsAdaptation] = useState(false)
  const [selectedDays, setSelectedDays] = useState(30)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Min and max days based on adaptation period
  const minDays = needsAdaptation ? 58 : 30
  const maxDays = needsAdaptation ? 132 : 90

  useEffect(() => {
    // Check if user selected adaptation period
    const adaptationChoice = localStorage.getItem("userAdaptationChoice") || ""
    const needsAdapt = adaptationChoice === "Yes"
    setNeedsAdaptation(needsAdapt)

    // Set initial selected days based on adaptation period
    // If adaptation is needed, the minimum is 58 days (28 adaptation + 30 elimination)
    // Otherwise, minimum is 30 days (elimination only)
    setSelectedDays(needsAdapt ? 58 : 30)
    setIsLoading(false)
  }, [])

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDays(Number.parseInt(e.target.value))
  }

  const handleContinue = () => {
    // If adaptation is needed, store the total days (adaptation + elimination)
    // but also store that the user wants adaptation
    if (needsAdaptation) {
      localStorage.setItem("userAdaptationChoice", "Yes")
      localStorage.setItem("userDietTimeline", selectedDays.toString())
    } else {
      localStorage.setItem("userAdaptationChoice", "No")
      localStorage.setItem("userDietTimeline", selectedDays.toString())
    }

    // Continue to the user profile page
    router.push("/onboarding/user-profile")
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
        <p>Loading...</p>
      </div>
    )
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
            <h2 className="text-2xl font-bold mb-2 text-center">Set Your Goals</h2>
            <p className="text-center">
              Select a period to monitor your AIP progress. Refer to{" "}
              <Link href="#" className="text-pink-400 underline">
                FAQ
              </Link>{" "}
              for diet duration info.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-700">
              {error}
            </div>
          )}

          {/* Slider */}
          <div className="glass-card rounded-2xl p-6 mb-8">
            <div className="flex justify-between mb-2">
              <span className="font-bold">{minDays} Days</span>
              <span className="font-bold">{maxDays} Days</span>
            </div>

            <input
              type="range"
              min={minDays}
              max={maxDays}
              value={selectedDays}
              onChange={handleSliderChange}
              className="w-full h-2 bg-white/50 rounded-lg appearance-none cursor-pointer accent-pink-400"
            />

            <div className="mt-4 text-center">
              <p className="font-medium">Selected timeframe: {selectedDays} days</p>

              {needsAdaptation && (
                <p className="text-sm text-brand-dark/70 mt-2">At least 28 days will be transition into your diet.</p>
              )}
            </div>
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
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
        </div>
      </div>
    </div>
  )
}
