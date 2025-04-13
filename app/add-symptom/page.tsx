"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, ArrowLeft } from "lucide-react"
import Logo from "@/app/components/logo"

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
  const [selectedSymptoms, setSelectedSymptoms] = useState<{ [key: string]: number }>({})
  const [customSymptom, setCustomSymptom] = useState("")
  const [notes, setNotes] = useState("")
  const [userSymptoms, setUserSymptoms] = useState<string[]>([])

  useEffect(() => {
    // Load user symptoms from localStorage if available
    const savedSymptoms = localStorage.getItem("userSymptoms")
    if (savedSymptoms) {
      const parsedSymptoms = JSON.parse(savedSymptoms)
      setUserSymptoms(parsedSymptoms)

      // Pre-select these symptoms with default severity
      const initialSelectedSymptoms: { [key: string]: number } = {}
      parsedSymptoms.forEach((symptom: string) => {
        initialSelectedSymptoms[symptom] = 3 // Default severity
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
        newSelected[symptom] = 3 // Default severity
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
    // In a real app, you would save the symptoms data to your database or state
    // For now, we'll just navigate back to the dashboard
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-brand-dark text-white">
        <button onClick={handleBack} className="flex items-center text-white/80 hover:text-white">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </button>
        <Logo />
        <div className="w-20"></div> {/* Empty div for spacing */}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Log Symptoms</h2>
          <p className="text-brand-dark/70">Track how you're feeling today</p>
        </div>

        {/* Selected Symptoms */}
        {Object.keys(selectedSymptoms).length > 0 && (
          <div className="glass-card rounded-2xl p-4 mb-6">
            <h3 className="font-medium mb-3">Selected Symptoms</h3>
            <div className="space-y-4">
              {Object.entries(selectedSymptoms).map(([symptom, severity]) => (
                <div key={symptom} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{symptom}</span>
                    <button onClick={() => handleSelectSymptom(symptom)} className="text-red-500 text-sm">
                      Remove
                    </button>
                  </div>
                  <div>
                    <p className="text-sm mb-1">Severity</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">Mild</span>
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
                      <span className="text-xs">Severe</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Symptoms */}
        <div className="glass-card rounded-2xl p-4 mb-6">
          <h3 className="font-medium mb-3">Common Symptoms</h3>
          <div className="flex flex-wrap gap-2">
            {/* Show user symptoms first */}
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
                {symptom}
              </button>
            ))}

            {/* Show other common symptoms that aren't in user symptoms */}
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
                  {symptom}
                </button>
              ))}
          </div>
        </div>

        {/* Custom Symptom */}
        <div className="glass-card rounded-2xl p-4 mb-6">
          <h3 className="font-medium mb-3">Add Custom Symptom</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={customSymptom}
              onChange={(e) => setCustomSymptom(e.target.value)}
              placeholder="Enter symptom name"
              className="flex-1 p-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
            <button
              onClick={handleAddCustomSymptom}
              disabled={!customSymptom.trim()}
              className="px-4 py-2 rounded-xl gradient-button disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="glass-card rounded-2xl p-4 mb-6">
          <h3 className="font-medium mb-3">Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional notes about your symptoms..."
            className="w-full p-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400 min-h-[100px]"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSaveSymptoms}
          className="w-full gradient-button py-4 rounded-full mb-6"
          disabled={Object.keys(selectedSymptoms).length === 0}
        >
          Save Symptoms
        </button>
      </main>

      {/* Bottom Navigation */}
      <nav className="grid grid-cols-5 border-t border-brand-dark/10 bg-white/80 backdrop-blur-sm">
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
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => router.push("/nutrition")}
        >
          <BookOpen className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Nutrition</span>
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
