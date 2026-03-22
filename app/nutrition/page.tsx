"use client"

export const dynamic = "force-dynamic"

import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, User } from "lucide-react"
import Logo from "@/app/components/logo"
import { useState, useEffect } from "react"

export default function NutritionPage() {
  const router = useRouter()

  // Update the handlePhaseClick function to determine the current phase
  const handlePhaseClick = (phase: string) => {
    if (phase === "adaptation") {
      router.push("/nutrition/adaptation-phase")
    } else if (phase === "elimination") {
      router.push("/nutrition/elimination-phase")
    } else if (phase === "reintroduction") {
      router.push("/nutrition/reintroduction-phase")
    }
  }

  // Add a new state for the current phase
  const [currentPhase, setCurrentPhase] = useState<string | null>(null)

  // Add useEffect to determine the current phase when the component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Get diet data from localStorage
      const adaptationChoice = localStorage.getItem("userAdaptationChoice")
      const hasAdaptation = adaptationChoice === "Yes"
      const startDate = localStorage.getItem("dietStartDate")
      const dietStartDate = startDate ? new Date(startDate) : new Date()
      const dietTimeline = localStorage.getItem("userDietTimeline")
      const totalSelectedDays = dietTimeline ? Number.parseInt(dietTimeline) : 30

      // Calculate days for each phase
      const adaptationDays = hasAdaptation ? 28 : 0
      const eliminationDays = hasAdaptation ? totalSelectedDays - adaptationDays : totalSelectedDays

      // Calculate days elapsed since diet start
      const today = new Date()
      const daysElapsed = Math.floor((today.getTime() - dietStartDate.getTime()) / (1000 * 60 * 60 * 24))

      // Determine current phase
      let phase = "adaptation"

      if (hasAdaptation && daysElapsed < adaptationDays) {
        // In adaptation phase
        phase = "adaptation"
      } else if (daysElapsed < (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays)) {
        // In elimination phase
        phase = "elimination"
      } else {
        // In reintroduction phase
        phase = "reintroduction"
      }

      setCurrentPhase(phase)
    }
  }, [])

  const handleProfileClick = () => {
    router.push("/profile")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 border-b border-pink-200/30 flex justify-between items-center bg-gradient-to-r from-pink-300 to-peach-300">
        <Logo variant="light" />
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
          onClick={handleProfileClick}
        >
          <User className="h-5 w-5 text-white" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Nutrition Guides</h2>
          <p className="text-brand-dark/70">
            Select your stage in the protocol to see the guidelines tailored to you. Learn the rules, explore your food
            options, and start your journey toward better health.
          </p>
        </div>

        {/* AIP Diet Phases */}
        <div className="space-y-4">
          {/* Adaptation Phase */}
          <div
            className="glass-card rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-transform hover:scale-[1.01] relative"
            onClick={() => handlePhaseClick("adaptation")}
          >
            {currentPhase === "adaptation" && (
              <div className="absolute top-0 right-0 bg-pink-500 text-white px-3 py-1 rounded-bl-lg font-medium text-sm">
                Current diet phase
              </div>
            )}
            <div className="p-4 flex">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Adaptation phase</h3>
                <p className="text-brand-dark/70 mb-4">
                  A gentle 28-day reset to say goodbye to old habits and welcome fiber-rich foods at your own pace.
                </p>
              </div>
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-pink-100 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop"
                  alt="Adaptation phase"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Elimination Phase */}
          <div
            className="gradient-card rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-transform hover:scale-[1.01] relative"
            onClick={() => handlePhaseClick("elimination")}
          >
            {currentPhase === "elimination" && (
              <div className="absolute top-0 right-0 bg-pink-500 text-white px-3 py-1 rounded-bl-lg font-medium text-sm">
                Current diet phase
              </div>
            )}
            <div className="p-4 flex">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Elimination phase</h3>
                <p className="text-brand-dark/80">Remove triggers to find what works for you.</p>
              </div>
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-pink-200 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop"
                  alt="Elimination phase"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Reintroduction Phase */}
          <div
            className="glass-card rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-transform hover:scale-[1.01] relative"
            onClick={() => handlePhaseClick("reintroduction")}
          >
            {currentPhase === "reintroduction" && (
              <div className="absolute top-0 right-0 bg-pink-500 text-white px-3 py-1 rounded-bl-lg font-medium text-sm">
                Current diet phase
              </div>
            )}
            <div className="p-4 flex">
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">Reintroduction phase</h3>
                <p className="text-brand-dark/80">Gradually add foods back to test your body's response.</p>
              </div>
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-pink-300 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=200&h=200&fit=crop"
                  alt="Reintroduction phase"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav grid grid-cols-5 border-t border-brand-dark/10 bg-white/80 backdrop-blur-sm">
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
        <button className="flex flex-col items-center justify-center py-3 text-xs text-pink-400">
          <BookOpen className="h-5 w-5 mb-1 text-pink-400" />
          <span>Nutrition</span>
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
