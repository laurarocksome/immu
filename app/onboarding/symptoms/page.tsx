"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Logo from "@/app/components/logo"
import { saveUserSymptoms } from "@/lib/user-data"
import { getSession } from "@/lib/auth"
import { createClient } from "@/lib/supabase/client"

export default function SymptomsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")
  const [showAllSymptoms, setShowAllSymptoms] = useState(false)
  const isEditMode = searchParams.get("edit") === "true"

  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const session = await getSession()
        if (session?.user) {
          const { data: symptomsData } = await createClient()
            .from("user_symptoms")
            .select("symptom")
            .eq("user_id", session.user.id)

          if (symptomsData && symptomsData.length > 0) {
            const uniqueSymptoms = Array.from(new Set(symptomsData.map((s) => s.symptom)))
            console.log("[v0] Loaded symptoms from DB:", uniqueSymptoms.length, uniqueSymptoms)
            setSelectedSymptoms(uniqueSymptoms)
            return
          }
        }

        const savedSymptoms = localStorage.getItem("selectedSymptoms")
        if (savedSymptoms) {
          const parsed = JSON.parse(savedSymptoms)
          const uniqueSymptoms = Array.from(new Set(parsed))
          console.log("[v0] Loaded symptoms from localStorage:", uniqueSymptoms.length, uniqueSymptoms)
          setSelectedSymptoms(uniqueSymptoms)
        }
      } catch (error) {
        console.error("Error loading symptoms:", error)
      }
    }

    loadExistingData()
  }, [])

  const symptomsList = [
    "Abdominal pain",
    "Acid reflux",
    "Acne",
    "Anxiety",
    "Bloating",
    "Brain fog",
    "Chest pain",
    "Constipation",
    "Coughing",
    "Depression",
    "Diarrhea",
    "Dizziness",
    "Dry eyes",
    "Dry mouth",
    "Fatigue",
    "Fever",
    "Gas",
    "Headache",
    "Heart palpitations",
    "Heartburn",
    "Hives",
    "Insomnia",
    "Irritability",
    "Itchy skin",
    "Joint pain",
    "Mood swings",
    "Muscle aches",
    "Nausea",
    "Numbness",
    "Rash",
    "Shortness of breath",
    "Sinus congestion",
    "Sore throat",
    "Stomach cramps",
    "Swelling",
    "Tingling",
    "Vomiting",
    "Weight gain",
    "Weight loss",
  ].sort()

  const filteredSymptoms = symptomsList.filter((symptom) => symptom.toLowerCase().includes(searchTerm.toLowerCase()))

  const displayedSymptoms = filteredSymptoms

  const handleSymptomClick = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom))
      setError("")
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom])
      setError("")
    }
    console.log(
      "[v0] Symptom clicked:",
      symptom,
      "New count:",
      selectedSymptoms.includes(symptom) ? selectedSymptoms.length - 1 : selectedSymptoms.length + 1,
    )
  }

  const handleContinue = async () => {
    if (selectedSymptoms.length === 0) {
      setError("Please select at least 1 symptom to continue")
    } else {
      localStorage.setItem("selectedSymptoms", JSON.stringify(selectedSymptoms))

      try {
        const session = await getSession()
        if (session?.user) {
          await saveUserSymptoms(selectedSymptoms)
        }
      } catch (error) {
        console.error("Error saving to database:", error)
      }

      if (isEditMode) {
        router.push("/profile")
      } else {
        router.push("/onboarding/stress")
      }
    }
  }

  const handleBack = () => {
    if (isEditMode) {
      router.push("/profile")
    } else {
      router.push("/onboarding/conditions")
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 flex justify-center items-center bg-brand-dark text-white relative">
        <button
          onClick={handleBack}
          className="absolute left-4 text-white/80 hover:text-white transition-colors flex items-center"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </button>
        <Logo variant="light" />
      </header>

      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">What symptoms are you experiencing?</h2>
            <p className="text-brand-dark/70 mb-4">
              Select symptoms that you're currently experiencing. You can select as many as you'd like.
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search symptoms..."
              className="w-full p-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="absolute right-3 top-3 text-gray-500" onClick={clearSearch} aria-label="Clear search">
                ✕
              </button>
            )}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-700">
              {error}
            </div>
          )}

          {/* Selected count */}
          <p className="text-sm text-brand-dark/70 mb-2">Selected: {selectedSymptoms.length}</p>

          {/* Symptoms list */}
          <div className="glass-card rounded-2xl p-4 mb-8 overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {displayedSymptoms.map((symptom) => (
                <div
                  key={symptom}
                  className={`p-3 mb-2 rounded-xl cursor-pointer transition-colors ${
                    selectedSymptoms.includes(symptom)
                      ? "bg-pink-400 text-white"
                      : "bg-white/80 border border-brand-dark/20 hover:bg-white"
                  }`}
                  onClick={() => handleSymptomClick(symptom)}
                >
                  <div className="flex items-center">
                    <span className="flex-1">{symptom}</span>
                    {selectedSymptoms.includes(symptom) && <span>✓</span>}
                  </div>
                </div>
              ))}
              {filteredSymptoms.length === 0 && <p className="text-center p-4 text-brand-dark/70">No symptoms found</p>}
            </div>
          </div>

          {/* Navigation buttons */}
          <button className={`w-full gradient-button py-4 rounded-full`} onClick={handleContinue}>
            {isEditMode ? "Save" : "Continue"}
          </button>
        </div>

        {/* Progress dots - only show in onboarding mode */}
        {!isEditMode && (
          <div className="p-4 flex justify-center mt-6">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-pink-400"></div>
              <div className="w-2 h-2 rounded-full bg-pink-400"></div>
              <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
              <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
              <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
