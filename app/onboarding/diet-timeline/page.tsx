"use client"

export const dynamic = "force-dynamic"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Logo from "@/app/components/logo"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { saveDietInfo } from "@/lib/user-data"
import { getSession } from "@/lib/auth"
import { useLanguage } from "@/lib/i18n/context"

export default function DietTimelinePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [needsAdaptation, setNeedsAdaptation] = useState(false)
  const [selectedDays, setSelectedDays] = useState(30)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const isEditMode = searchParams.get("edit") === "true"

  const minDays = needsAdaptation ? 58 : 30
  const maxDays = needsAdaptation ? 132 : 90

  useEffect(() => {
    const adaptationChoice = localStorage.getItem("userAdaptationChoice") || ""
    const needsAdapt = adaptationChoice === "Yes"
    setNeedsAdaptation(needsAdapt)

    const existingTimeline = localStorage.getItem("userDietTimeline")
    if (existingTimeline && existingTimeline !== "not-set") {
      setSelectedDays(Number.parseInt(existingTimeline))
    } else {
      setSelectedDays(needsAdapt ? 58 : 30)
    }
    setIsLoading(false)
  }, [])

  const handleAdaptationToggle = (value: boolean) => {
    setNeedsAdaptation(value)
    if (value) {
      if (selectedDays < 58) {
        setSelectedDays(58)
      }
    } else {
      if (selectedDays > 90) {
        setSelectedDays(90)
      }
    }
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDays(Number.parseInt(e.target.value))
  }

  const handleContinue = async () => {
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
        const startDate = new Date().toISOString()
        const currentPhase = needsAdaptation ? "adaptation" : "elimination"

        await saveDietInfo({
          startDate,
          timelineDays: selectedDays,
          adaptationChoice: needsAdaptation ? "yes" : "no",
          currentPhase,
        })
        console.log("[v0] Diet info saved successfully:", { selectedDays, needsAdaptation })
      }
    } catch (error) {
      console.error("[v0] Error saving diet info to database:", error)
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
      const vegetableHabits = localStorage.getItem("userVegetableHabits") || ""
      const caffeineHabits = localStorage.getItem("userCaffeineHabits") || ""
      const alcoholHabits = localStorage.getItem("userAlcoholHabits") || ""
      const sugarHabits = localStorage.getItem("userSugarHabits") || ""

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
        router.push("/onboarding/vegetable-habits")
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
        <p>{t("onboarding.dietTimeline.loading", "Loading...")}</p>
      </div>
    )
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
      </header>

      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 text-center">
              {isEditMode
                ? t("onboarding.dietTimeline.titleEdit", "Edit Your Diet Settings")
                : t("onboarding.dietTimeline.title", "Set Your Goals")}
            </h2>
            <p className="text-center">
              {isEditMode
                ? t("onboarding.dietTimeline.subtitleEdit", "Update your diet timeline and adaptation period preferences")
                : t("onboarding.dietTimeline.subtitle", "Select a period to monitor your AIP progress")}
              {!isEditMode && (
                <>
                  {t("onboarding.dietTimeline.faqRef", ". Refer to")}{" "}
                  <Link href="/faq" className="text-pink-400 underline">
                    {t("onboarding.dietTimeline.faqLink", "FAQ")}
                  </Link>{" "}
                  {t("onboarding.dietTimeline.faqSuffix", "for diet duration info.")}
                </>
              )}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-700">
              {error}
            </div>
          )}

          {isEditMode && (
            <div className="glass-card rounded-2xl p-6 mb-6">
              <h3 className="font-semibold mb-4 text-lg">{t("onboarding.dietTimeline.adaptTitle", "Adaptation Period")}</h3>
              <p className="text-sm text-brand-dark/70 mb-4">
                {t("onboarding.dietTimeline.adaptDesc", "An adaptation period helps you gradually transition into the AIP diet over 28 days before starting the full elimination phase.")}
              </p>

              <div className="flex flex-col gap-3">
                <div
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-colors ${
                    needsAdaptation ? "bg-pink-400 text-white" : "bg-white hover:bg-pink-50"
                  }`}
                  onClick={() => handleAdaptationToggle(true)}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      needsAdaptation ? "border-white" : "border-brand-dark/50"
                    }`}
                  >
                    {needsAdaptation && <div className="w-3 h-3 rounded-full bg-white"></div>}
                  </div>
                  <span>{t("onboarding.dietTimeline.yesAdapt", "Yes, include adaptation period")}</span>
                </div>

                <div
                  className={`flex items-center p-4 rounded-xl cursor-pointer transition-colors ${
                    !needsAdaptation ? "bg-pink-400 text-white" : "bg-white hover:bg-pink-50"
                  }`}
                  onClick={() => handleAdaptationToggle(false)}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center ${
                      !needsAdaptation ? "border-white" : "border-brand-dark/50"
                    }`}
                  >
                    {!needsAdaptation && <div className="w-3 h-3 rounded-full bg-white"></div>}
                  </div>
                  <span>{t("onboarding.dietTimeline.noAdapt", "No, start directly with elimination")}</span>
                </div>
              </div>
            </div>
          )}

          <div className="glass-card rounded-2xl p-6 mb-8">
            <h3 className="font-semibold mb-4 text-lg">{t("onboarding.dietTimeline.sliderTitle", "Diet Timeline")}</h3>
            <div className="flex justify-between mb-2">
              <span className="font-bold">{minDays} {t("onboarding.dietTimeline.days", "Days")}</span>
              <span className="font-bold">{maxDays} {t("onboarding.dietTimeline.days", "Days")}</span>
            </div>

            <div className="relative py-4">
              <div className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 bg-gray-200 rounded-full"></div>

              <div
                className="absolute top-1/2 left-0 h-2 -translate-y-1/2 bg-pink-400 rounded-full"
                style={{
                  width: `${((selectedDays - minDays) / (maxDays - minDays)) * 100}%`,
                }}
              ></div>

              <input
                type="range"
                min={minDays}
                max={maxDays}
                value={selectedDays}
                onChange={handleSliderChange}
                className="w-full h-2 appearance-none cursor-pointer bg-transparent relative z-10"
                style={{
                  WebkitAppearance: "none",
                }}
              />
            </div>

            <style jsx>{`
              input[type="range"]::-webkit-slider-thumb {
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

              input[type="range"]::-moz-range-thumb {
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
              <p className="font-medium">
                {t("onboarding.dietTimeline.selected", "Selected timeframe: {n} days").replace("{n}", selectedDays.toString())}
              </p>

              {needsAdaptation && (
                <p className="text-sm text-brand-dark/70 mt-2">
                  {t("onboarding.dietTimeline.includes28", "Includes 28 days of adaptation + {n} days of elimination phase").replace("{n}", (selectedDays - 28).toString())}
                </p>
              )}
            </div>
          </div>

          <button onClick={handleContinue} className="w-full gradient-button py-4 rounded-full">
            {isEditMode ? t("onboarding.dietTimeline.saveChanges", "Save Changes") : t("common.next", "Next")}
          </button>
        </div>
      </main>

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
