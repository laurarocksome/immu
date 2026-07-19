"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle } from "lucide-react"
import Logo from "@/app/components/logo"
import LanguageToggle from "@/app/components/language-toggle"
import { useLanguage } from "@/lib/i18n/context"

export default function AthleteInfoPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [acknowledged, setAcknowledged] = useState(false)
  const [error, setError] = useState("")

  const handleContinue = () => {
    if (!acknowledged) {
      setError(t("onboarding.athleteInfo.error", "Please acknowledge that you understand before continuing"))
      return
    }

    router.push("/onboarding/caffeine-habits")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      <header className="p-4 border-b border-pink-200/30 flex justify-center items-center bg-gradient-to-r from-pink-300 to-peach-300 relative">
        <Logo variant="light" />
        <LanguageToggle className="absolute right-4" />
      </header>

      <main className="flex-1 px-4 pt-6 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-amber-400 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">{t("onboarding.athleteInfo.title", "Important Note for Athletes")}</h2>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-8">
            <p className="mb-4">
              {t("onboarding.athleteInfo.p1", "As an athlete, you may be engaging in high-intensity physical activity. For optimal results with the AIP diet, it's often recommended to temporarily reduce strenuous exercise.")}
            </p>
            <p className="mb-4">
              {t("onboarding.athleteInfo.p2", "Intense physical activity can elevate stress and inflammation, potentially impacting your progress.")}
            </p>
            <p>
              {t("onboarding.athleteInfo.p3", "We suggest consulting with a healthcare professional to adjust your activity level for the best outcomes on your AIP journey.")}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center mb-8">
            <input
              type="checkbox"
              id="acknowledge"
              checked={acknowledged}
              onChange={() => setAcknowledged(!acknowledged)}
              className="h-5 w-5 rounded border-brand-dark/30 bg-white/80 text-pink-400 focus:ring-pink-400"
            />
            <label htmlFor="acknowledge" className="ml-2 text-brand-dark">
              {t("onboarding.athleteInfo.acknowledge", "I understand.")}
            </label>
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
