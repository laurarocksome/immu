"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Logo from "@/app/components/logo"
import { ArrowLeft } from "lucide-react"
import { useLanguage } from "@/lib/i18n/context"

function optKey(prefix: string, value: string) {
  return prefix + "." + value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/, "")
}

const stressManagementOptions = [
  "Exercise",
  "Meditation",
  "Deep breathing",
  "Yoga",
  "Spending time in nature",
  "Reading",
  "Listening to music",
  "Talking to friends or family",
  "Therapy or counseling",
  "Journaling",
  "Art or creative activities",
  "Nothing helps me manage stress",
]

export default function StressPage() {
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
      setError(t("onboarding.stress.error", "Please select an option to continue"))
      return
    }

    localStorage.setItem("userStressManagement", selectedOption)

    if (selectedOption === "Nothing helps me manage stress") {
      router.push("/onboarding/no-stress-help")
    } else {
      router.push("/onboarding/activity")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      <header className="p-4 flex justify-center items-center bg-brand-dark text-white relative">
        <button
          onClick={() => router.push("/onboarding/symptoms")}
          className="absolute left-4 text-white/80 hover:text-white transition-colors flex items-center"
          aria-label="Go back to previous page"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>{t("common.back", "Back")}</span>
        </button>
        <Logo variant="light" />
      </header>

      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">{t("onboarding.stress.title", "Stress Management")}</h2>
            <p className="text-brand-dark/70">{t("onboarding.stress.subtitle", "What helps you manage stress?")}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {stressManagementOptions.map((option) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className={`px-4 py-2 rounded-full text-center transition-colors ${
                  selectedOption === option
                    ? "bg-pink-400 text-white"
                    : "bg-white/80 border border-brand-dark/20 hover:bg-white"
                }`}
              >
                {t(optKey("stress", option), option)}
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
