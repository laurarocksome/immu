"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Logo from "@/app/components/logo"

export default function SymptomsPage() {
  const router = useRouter()
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")
  const [showAllSymptoms, setShowAllSymptoms] = useState(false)

  // Load saved symptoms from localStorage if available
  useEffect(() => {
    const savedSymptoms = localStorage.getItem("selectedSymptoms")
    if (savedSymptoms) {
      try {
        setSelectedSymptoms(JSON.parse(savedSymptoms))
      } catch (e) {
        console.error("Error parsing saved symptoms:", e)
      }
    }
  }, [])

  // Alphabetically sorted list of symptoms
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

  // Determine which symptoms to display
  const displayedSymptoms = searchTerm
    ? filteredSymptoms
    : showAllSymptoms
      ? filteredSymptoms
      : filteredSymptoms.slice(0, 5)

  const handleSymptomClick = (symptom: string) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom))
      setError("")
    } else {
      if (selectedSymptoms.length < 5) {
        setSelectedSymptoms([...selectedSymptoms, symptom])
        setError("")
      } else {
        setError("You can select only 5 symptoms")
      }
    }
  }

  const handleContinue = () => {
    if (selectedSymptoms.length === 5) {
      // Save selected symptoms
      localStorage.setItem("selectedSymptoms", JSON.stringify(selectedSymptoms))
      router.push("/onboarding/stress")
    } else {
      setError("Please select exactly 5 symptoms to continue")
    }
  }

  const handleBack = () => {
    // Navigate back to the conditions page
    router.push("/onboarding/conditions")
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  const toggleShowAllSymptoms = () => {
    setShowAllSymptoms(!showAllSymptoms)
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
        <Logo />
      </header>

      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">What symptoms are you experiencing?</h2>
            <p className="text-brand-dark/70 mb-4">
              Select 5 symptoms that you're currently experiencing. You must select exactly 5 symptoms to continue.
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
          <p className="text-sm text-brand-dark/70 mb-2">Selected: {selectedSymptoms.length}/5</p>

          {/* Symptoms list */}
          <div className="glass-card rounded-2xl p-4 mb-8 overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
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

            {/* Show more/less button */}
            {!searchTerm && filteredSymptoms.length > 5 && (
              <button
                className="w-full mt-2 py-2 text-pink-400 font-medium bg-white/80 rounded-xl hover:bg-white border border-pink-400/20"
                onClick={toggleShowAllSymptoms}
              >
                {showAllSymptoms ? "Show less" : `Show more (${filteredSymptoms.length - 5} more)`}
              </button>
            )}
          </div>

          {/* Navigation buttons */}
          <button
            className={`w-full gradient-button py-4 rounded-full ${selectedSymptoms.length !== 5 ? "opacity-70" : ""}`}
            onClick={handleContinue}
            disabled={selectedSymptoms.length !== 5}
          >
            Continue
          </button>
        </div>

        {/* Progress dots */}
        <div className="p-4 flex justify-center mt-6">
          <div className="flex space-x-2">
            <div className="w-2 h-2 rounded-full bg-pink-400"></div>
            <div className="w-2 h-2 rounded-full bg-pink-400"></div>
            <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
            <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
            <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
          </div>
        </div>
      </main>
    </div>
  )
}
