"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Logo from "@/app/components/logo"
import LanguageToggle from "@/app/components/language-toggle"
import { useLanguage } from "@/lib/i18n/context"

export default function AdaptationPeriodPage() {
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
      setError(t("onboarding.adaptation.error", "Please select an option to continue"))
      return
    }

    localStorage.setItem("userAdaptationChoice", selectedOption)

    router.push("/onboarding/diet-timeline")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      <header className="p-4 border-b border-pink-200/30 flex justify-center items-center bg-gradient-to-r from-pink-300 to-peach-300 relative">
        <Logo variant="light" />
        <LanguageToggle className="absolute right-4" />
      </header>

      <main className="flex-1 px-4 pt-6 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 text-center">{t("onboarding.adaptation.title", "Adaptation Period")}</h2>
          </div>

          <div className="glass-card rounded-2xl p-6 mb-8">
            <p className="mb-4">
              {t("onboarding.adaptation.p1", "We've identified some habits that might make transitioning to the AIP diet all at once challenging. To set you up for success, we recommend an adaptational period of 4-6 weeks.")}
            </p>
            <p className="mb-4">
              {t("onboarding.adaptation.p2", "This phased approach allows your body and mind to adjust, ensuring a smoother and more sustainable transition to the AIP lifestyle.")}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-700">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 mb-8">
            <div
              className={`flex items-center p-4 rounded-xl cursor-pointer ${
                selectedOption === "Yes" ? "bg-pink-400 text-white" : "glass-card hover:bg-white"
              }`}
              onClick={() => handleOptionSelect("Yes")}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedOption === "Yes" ? "border-white" : "border-brand-dark/50"
                }`}
              >
                {selectedOption === "Yes" && <div className="w-3 h-3 rounded-full bg-white"></div>}
              </div>
              <span>{t("onboarding.adaptation.yes", "Yes, I want adaptational period.")}</span>
            </div>

            <div
              className={`flex items-center p-4 rounded-xl cursor-pointer ${
                selectedOption === "No" ? "bg-pink-400 text-white" : "glass-card hover:bg-white"
              }`}
              onClick={() => handleOptionSelect("No")}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                  selectedOption === "No" ? "border-white" : "border-brand-dark/50"
                }`}
              >
                {selectedOption === "No" && <div className="w-3 h-3 rounded-full bg-white"></div>}
              </div>
              <span>{t("onboarding.adaptation.no", "No, I don't need adaptational period.")}</span>
            </div>
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
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
        </div>
      </div>
    </div>
  )
}
