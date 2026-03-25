"use client"

export const dynamic = "force-dynamic"

import { useRouter } from "next/navigation"
import BottomNav from "@/app/components/bottom-nav"
import { List, Home, Plus, BookOpen, UtensilsCrossed, User } from "lucide-react"
import Logo from "@/app/components/logo"
import { useState, useEffect } from "react"
import { isPageVisible } from "@/lib/page-visibility"
import { getDietPhase } from "@/lib/diet-phase"

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
    async function checkVisibility() {
      const visible = await isPageVisible("nutrition")
      if (!visible) { router.replace("/dashboard"); return }
    }
    checkVisibility()
  }, [])

  useEffect(() => {
    getDietPhase().then(({ phase }) => setCurrentPhase(phase))
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

      <BottomNav active="nutrition" />
    </div>
  )
}
