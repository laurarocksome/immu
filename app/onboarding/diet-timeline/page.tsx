"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Logo from "@/app/components/logo"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { saveDietInfo } from "@/lib/user-data"
import { getSession } from "@/lib/auth"

export default function DietTimelinePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [needsAdaptation, setNeedsAdaptation] = useState(false)
  const [selectedDays, setSelectedDays] = useState(30)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const isEditMode = searchParams.get("edit") === "true"

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

  const handleContinue = async () => {
    // If adaptation is needed, store the total days (adaptation + elimination)
    // but also store that the user wants adaptation
    if (needsAdaptation) {
      localStorage.setItem("userAdaptationChoice", "Yes")
      localStorage.setItem("userDietTimeline", selectedDays.toString())
    } else {
      localStorage.setItem("userAdaptationChoice", "No")
      localStorage.setItem("userDietTimeline", selectedDays.toString())
    }

    try {
      const session = await getSession()
      if (session?.user) {
        await saveDietInfo({
          timeline: selectedDays.toString(),
          adaptationPeriod: needsAdaptation,
        })
      }
    } catch (error) {
      console.error("Error saving diet info to database:", error)
    }

    if (isEditMode) {
      router.push("/profile")
    } else {
      router.push("/onboarding/user-profile")
    }
  }

  const handleBack = () => {
    if (isEditMode) {
      router.push("/profile")
    } else {
      // Check if user came from adaptation-period page
      const vegetableHabits = localStorage.getItem("userVegetableHabits") || ""
      const caffeineHabits = localStorage.getItem("userCaffeineHabits") || ""
      const alcoholHabits = localStorage.getItem("userAlcoholHabits") || ""
      const sugarHabits = localStorage.getItem("userSugarHabits") || ""

      // Count how many habits might need adaptation
      let adaptationCount = 0

      // Check caffeine habits
      if (caffeineHabits === "3-4 cups" || caffeineHabits === "5+ cups") {
        adaptationCount++
      }

      // Check alcohol habits
      if (alcoholHabits === "Weekly (1-2 times a week)" || alcoholHabits === "Frequently (3+ times a week)") {
        adaptationCount++
      }

      // Check sugar habits
      if (sugarHabits === "Yes, daily (in coffee, tea, etc.)" || sugarHabits === "Yes, multiple times a day") {
        adaptationCount++
      }

      // Check vegetable habits
      if (vegetableHabits === "1-2 servings" || vegetableHabits === "None") {
        adaptationCount++
      }

      // If 2 or more habits need adaptation, go back to adaptation period page
      if (adaptationCount >= 2) {
        router.push("/onboarding/adaptation-period")
      } else {
        router.push("/onboarding/vegetable-habits")
      }
    }
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

            <div className="relative py-4">
              {/* Track background */}
              <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 bg-gray-200 rounded-full"></div>

              {/* Filled track */}
              <div
                className="absolute top-1/2 left-0 h-2 -translate-y-1/2 bg-pink-400 rounded-full"
                style={{
                  width: `${((selectedDays - minDays) / (maxDays - minDays)) * 100}%`,
                }}
              ></div>

              {/* Actual input slider */}
              <input
                type="range"
                min={minDays}
                max={maxDays}
                value={selectedDays}
                onChange={handleSliderChange}
                className="w-full h-2 appearance-none cursor-pointer bg-transparent relative z-10"
                style={{
                  // Custom thumb styling
                  WebkitAppearance: "none",
                }}
              />
            </div>

            <style jsx>{`
              /* Custom thumb styling for webkit browsers */
              input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #ec4899;
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              
              /* Custom thumb styling for Firefox */
              input[type=range]::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #ec4899;
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
            `}</style>

            <div className="mt-4 text-center">
              <p className="font-medium">Selected timeframe: {selectedDays} days</p>

              {needsAdaptation && (
                <p className="text-sm text-brand-dark/70 mt-2">At least 28 days will be transition into your diet.</p>
              )}
            </div>
          </div>

          {/* Next button */}
          <button onClick={handleContinue} className="w-full gradient-button py-4 rounded-full">
            {isEditMode ? "Save" : "Next"}
          </button>
        </div>
      </main>

      {/* Progress indicator - only show in onboarding mode */}
      {!isEditMode && (
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
      )}
    </div>
  )
}
