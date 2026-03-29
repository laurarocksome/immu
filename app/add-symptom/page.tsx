"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, ArrowLeft } from "lucide-react"
import Logo from "@/app/components/logo"
import BottomNav from "@/app/components/bottom-nav"
import { useLanguage } from "@/lib/i18n/context"

function symptomKey(name: string) {
  return "symptom." + name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/, "")
}

// Sample symptoms for selection
const commonSymptoms = [
  "Fatigue",
  "Joint Pain",
  "Headache",
  "Brain Fog",
  "Digestive Issues",
  "Skin Rash",
  "Bloating",
  "Mood Swings",
  "Sleep Issues",
  "Muscle Weakness",
]

export default function AddSymptomPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [selectedSymptoms, setSelectedSymptoms] = useState<{ [key: string]: number }>({})
  const [customSymptom, setCustomSymptom] = useState("")
  const [notes, setNotes] = useState("")
  const [userSymptoms, setUserSymptoms] = useState<string[]>([])

  useEffect(() => {
    const savedSymptoms = localStorage.getItem("userSymptoms")
    if (savedSymptoms) {
      const parsedSymptoms = JSON.parse(savedSymptoms)
      setUserSymptoms(parsedSymptoms)
      const initialSelectedSymptoms: { [key: string]: number } = {}
      parsedSymptoms.forEach((symptom: string) => {
        initialSelectedSymptoms[symptom] = 3
      })
      setSelectedSymptoms(initialSelectedSymptoms)
    }
  }, [])

  const handleBack = () => {
    router.push("/dashboard")
  }

  const handleSelectSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) => {
      const newSelected = { ...prev }
      if (newSelected[symptom]) {
        delete newSelected[symptom]
      } else {
        newSelected[symptom] = 3
      }
      return newSelected
    })
  }

  const handleAddCustomSymptom = () => {
    if (customSymptom.trim()) {
      setSelectedSymptoms((prev) => ({
        ...prev,
        [customSymptom]: 3,
      }))
      setCustomSymptom("")
    }
  }

  const handleSeverityChange = (symptom: string, severity: number) => {
    setSelectedSymptoms((prev) => ({
      ...prev,
      [symptom]: severity,
    }))
  }

  const handleSaveSymptoms = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-brand-dark text-white">
        <button onClick={handleBack} className="flex items-center text-white/80 hover:text-white">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>{t("common.back", "Back")}</span>
        </button>
        <Logo />
        <div className="w-20"></div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{t("addSymptom.title", "Log Symptoms")}</h2>
          <p className="text-brand-dark/70">{t("addSymptom.subtitle", "Track how you're feeling today")}</p>
        </div>

        {/* Selected Symptoms */}
        {Object.keys(selectedSymptoms).length > 0 && (
          <div className="glass-card rounded-2xl p-4 mb-6">
            <h3 className="font-medium mb-3">{t("addSymptom.selected", "Selected Symptoms")}</h3>
            <div className="space-y-4">
              {Object.entries(selectedSymptoms).map(([symptom, severity]) => (
                <div key={symptom} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{t(symptomKey(symptom), symptom)}</span>
                    <button onClick={() => handleSelectSymptom(symptom)} className="text-red-500 text-sm">
                      {t("addSymptom.remove", "Remove")}
                    </button>
                  </div>
                  <div>
                    <p className="text-sm mb-1">{t("addSymptom.severity", "Severity")}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">{t("addSymptom.mild", "Mild")}</span>
                      <div className="flex-1 mx-2">
                        <div className="flex justify-between">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              onClick={() => handleSeverityChange(symptom, level)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                severity === level
                                  ? "bg-pink-400 text-white"
                                  : "bg-white/80 border border-brand-dark/20"
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs">{t("addSymptom.severe", "Severe")}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Symptoms */}
        <div className="glass-card rounded-2xl p-4 mb-6">
          <h3 className="font-medium mb-3">{t("addSymptom.common", "Common Symptoms")}</h3>
          <div className="flex flex-wrap gap-2">
            {userSymptoms.map((symptom) => (
              <button
                key={symptom}
                onClick={() => handleSelectSymptom(symptom)}
                className={`px-4 py-2 rounded-full text-sm ${
                  selectedSymptoms[symptom]
                    ? "bg-pink-400 text-white"
                    : "bg-white/80 border border-brand-dark/20 hover:bg-white"
                }`}
              >
                {t(symptomKey(symptom), symptom)}
              </button>
            ))}

            {commonSymptoms
              .filter((symptom) => !userSymptoms.includes(symptom))
              .map((symptom) => (
                <button
                  key={symptom}
                  onClick={() => handleSelectSymptom(symptom)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedSymptoms[symptom]
                      ? "bg-pink-400 text-white"
                      : "bg-white/80 border border-brand-dark/20 hover:bg-white"
                  }`}
                >
                  {t(symptomKey(symptom), symptom)}
                </button>
              ))}
          </div>
        </div>

        {/* Custom Symptom */}
        <div className="glass-card rounded-2xl p-4 mb-6">
          <h3 className="font-medium mb-3">{t("addSymptom.custom", "Add Custom Symptom")}</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              placeholder={t("addSymptom.placeholder", "Enter symptom name")}
              className="flex-1 p-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
              onClick={handleAddCustomSymptom}
              disabled={!customSymptom.trim()}
              className="px-4 py-2 rounded-xl gradient-button disabled:opacity-50"
            >
              {t("addSymptom.add", "Add")}
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="glass-card rounded-2xl p-4 mb-6">
          <h3 className="font-medium mb-3">{t("addSymptom.notes", "Notes")}</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t("addSymptom.notesPlaceholder", "Add any additional notes about your symptoms...")}
            className="w-full p-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400 min-h-[100px]"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveSymptoms}
          className="w-full gradient-button py-4 rounded-full mb-6"
          disabled={Object.keys(selectedSymptoms).length === 0}
        >
          {t("addSymptom.save", "Save Symptoms")}
        </button>
      </main>

      <BottomNav />
    </div>
  )
}
