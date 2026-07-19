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

const alcoholOptions = [
  "Never",
  "Occasionally (1-2 times a month)",
  "Weekly (1-2 times a week)",
  "Frequently (3+ times a week)",
]

export default function AlcoholPage() {
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

    localStorage.setItem("userAlcoholHabits", selectedOption)

    router.push("/onboarding/sugar-habits")
  }

  const handleBack = () => {
    router.push("/onboarding/caffeine-habits")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      <header className="p-4 border-b border-pink-200/30 flex justify-between items-center bg-gradient-to-r from-pink-300 to-peach-300">
        <button
          onClick={handleBack}
          className="absolute left-4 text-white/80 hover:text-white transition-colors flex items-center"
          aria-label={t("common.goBackPrev", "Go back to previous page")}
        >
          <ArrowLeft className="h-4 w-4 text-white" />
          <span className="text-sm font-medium text-white">{t("common.back", "Back")}</span>
        </button>
        <Logo variant="light" />
        <LanguageToggle />
      </header>

      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">{t("onboarding.habits.title", "Your Habits")}</h2>
            <p className="text-brand-dark/70">{t("onboarding.habits.alcoholSubtitle", "How often do you drink alcohol?")}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 mb-8">
            {alcoholOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className={`px-4 py-3 rounded-xl text-center transition-colors ${
                  selectedOption === option ? "bg-pink-400 text-white" : "glass-card hover:bg-white"
                }`}
              >
                {t(optKey("habits.alcohol", option), option)}
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
          <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
          <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
          <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
        </div>
      </div>
    </div>
  )
}
