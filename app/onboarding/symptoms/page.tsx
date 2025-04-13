"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Logo from "@/app/components/logo"

// List of common symptoms
const allSymptoms = [
  "Puffy Face",
  "Swelling in the Neck",
  "Weight Gain",
  "Cold Intolerance",
  "Heat Intolerance",
  "Hair Thinning",
  "Hair Loss",
  "Brittle Nails",
  "Dry or Itchy Skin",
  "Muscle Cramps",
  "Joint Stiffness",
  "Slow Heart Rate",
  "Hoarseness",
  "Rapid Heart Rate",
  "Constipation",
  "Brain Fog",
  "Sluggishness",
  "Anxiety",
  "Depression",
  "Insomnia",
  "Frequent Infections",
  "Low Libido",
  "Acne",
  "Bloating",
  "Vision Problems",
  "Slow Wound Healing",
  "Chronic Pain",
  "Face Redness",
  "Restless Legs",
  "Eczema",
  "Fatigue",
  "Headaches",
  "Dizziness",
  "Nausea",
  "Digestive Issues",
  "Joint Pain",
  "Muscle Weakness",
  "Memory Problems",
  "Mood Swings",
  "Irregular Periods",
]

// Initial symptoms to show (first 12)
const initialSymptoms = allSymptoms.slice(0, 12)

export default function SymptomsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [showAllSymptoms, setShowAllSymptoms] = useState(false)
  const [filteredSymptoms, setFilteredSymptoms] = useState<string[]>(initialSymptoms)
  const [error, setError] = useState("")

  // Handle search and filtering
  useEffect(() => {
    if (searchTerm) {
      const filtered = allSymptoms.filter((symptom) => symptom.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredSymptoms(filtered)
      setShowAllSymptoms(true) // Show all matching results when searching
    } else {
      setFilteredSymptoms(showAllSymptoms ? allSymptoms : initialSymptoms)
    }
  }, [searchTerm, showAllSymptoms])

  const toggleSymptom = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom))
      setError("")
    } else {
      if (selectedSymptoms.length >= 5) {
        setError("You can select a maximum of 5 symptoms")
        return
      }
      setSelectedSymptoms([...selectedSymptoms, symptom])
      setError("")
    }
  }

  const handleShowMore = () => {
    setShowAllSymptoms(true)
    setFilteredSymptoms(allSymptoms)
  }

  const handleShowLess = () => {
    setShowAllSymptoms(false)
    setFilteredSymptoms(initialSymptoms)
    setSearchTerm("")
  }

  const handleContinue = () => {
    if (selectedSymptoms.length === 0) {
      setError("Please select at least 1 symptom to continue")
      return
    }

    // Save to local storage for now (in a real app, you'd save to a database)
    localStorage.setItem("userSymptoms", JSON.stringify(selectedSymptoms))

    // Navigate to the next step in the onboarding flow
    router.push("/onboarding/stress")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 flex justify-center items-center bg-brand-dark text-white">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Identify Your Symptoms</h2>
            <p className="text-brand-dark/70">Select up to 5 symptoms you experience most frequently.</p>
          </div>

          {/* Selected symptoms count */}
          <div className="text-center mb-4">
            <p>{selectedSymptoms.length} of 5 symptoms selected</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-700">
              {error}
            </div>
          )}

          {/* Search bar */}
          <div className="mb-8">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search symptoms..."
              className="w-full p-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Symptoms tag cloud */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {filteredSymptoms.map((symptom) => (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`px-4 py-2 rounded-full text-center transition-colors ${
                  selectedSymptoms.includes(symptom)
                    ? "bg-pink-400 text-white"
                    : "bg-white/80 border border-brand-dark/20 hover:bg-white"
                }`}
              >
                {symptom}
              </button>
            ))}
          </div>

          {/* Show more/less button */}
          {!searchTerm && (
            <div className="flex justify-center mb-8">
              {!showAllSymptoms ? (
                <button onClick={handleShowMore} className="text-pink-400 hover:text-pink-500 underline">
                  Show more symptoms
                </button>
              ) : (
                <button onClick={handleShowLess} className="text-pink-400 hover:text-pink-500 underline">
                  Show less
                </button>
              )}
            </div>
          )}

          {/* Next button */}
          <button onClick={handleContinue} className="w-full gradient-button py-4 rounded-full">
            Next
          </button>
        </div>
      </main>

      {/* Progress indicator */}
      <div className="p-4 flex justify-center">
        <div className="flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-pink-400"></div>
          <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
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
