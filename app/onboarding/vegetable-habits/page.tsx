"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Logo from "@/app/components/logo"
import LanguageToggle from "@/app/components/language-toggle"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"

function optKey(prefix: string, value: string) {
  return prefix + "." + value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/, "")
}

const vegetableOptions = ["5+ servings", "3-4 servings", "1-2 servings", "None"]

export default function VegetablePage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [error, setError] = useState("")

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option)
    setError("")
  }

  const handleContinue = () => {
    if (!selectedOption) {
      setError(t("onboarding.habits.error", "Please select an option to continue"))
      return
    }

    localStorage.setItem("userVegetableHabits", selectedOption)

    checkAdaptationNeeded()
  }

  const checkAdaptationNeeded = () => {
    const caffeineHabits = localStorage.getItem("userCaffeineHabits") || ""
    const alcoholHabits = localStorage.getItem("userAlcoholHabits") || ""
    const sugarHabits = localStorage.getItem("userSugarHabits") || ""
    const vegetableHabits = selectedOption || ""

    let adaptationCount = 0

    if (caffeineHabits === "3-4 cups" || caffeineHabits === "5+ cups") {
      adaptationCount++
    }

    if (alcoholHabits === "Weekly (1-2 times a week)" || alcoholHabits === "Frequently (3+ times a week)") {
      adaptationCount++
    }

    if (sugarHabits === "Yes, daily (in coffee, tea, etc.)" || sugarHabits === "Yes, multiple times a day") {
      adaptationCount++
    }

    if (vegetableHabits === "1-2 servings" || vegetableHabits === "None") {
      adaptationCount++
    }

    if (adaptationCount >= 2) {
      router.push("/onboarding/adaptation-period")
    } else {
      router.push("/onboarding/diet-timeline")
    }
  }

  const handleBack = () => {
    router.push("/onboarding/sugar-habits")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      <header className="p-4 flex justify-center items-center bg-brand-dark text-white relative">
        <button
          onClick={handleBack}
          className="absolute left-4 text-white/80 hover:text-white transition-colors flex items-center"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>{t("common.back", "Back")}</span>
        </button>
        <Logo variant="light" />
        <LanguageToggle className="absolute right-4 top-1/2 -translate-y-1/2" />
      </header>

      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">{t("onboarding.habits.title", "Your Habits")}</h2>
            <p className="text-brand-dark/70">{t("onboarding.habits.vegetableSubtitle", "How many servings of vegetables do you eat daily?")}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 mb-8">
            {vegetableOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className={`px-4 py-3 rounded-xl text-center transition-colors ${
                  selectedOption === option ? "bg-pink-400 text-white" : "glass-card hover:bg-white"
                }`}
              >
                {t(optKey("habits.vegetable", option), option)}
              </button>
            ))}
          </div>

          <button onClick={handleContinue} className="w-full gradient-button py-4 rounded-full">
            {t("common.next", "Next")}
          </button>
        </div>
      </main>

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
          <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
        </div>
      </div>
    </div>
  )
}
