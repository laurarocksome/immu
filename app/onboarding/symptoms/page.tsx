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
        setError("You can select up to 5 symptoms")
      }
    }
  }

  const handleContinue = () => {
    // Save selected symptoms even if empty
    localStorage.setItem("selectedSymptoms", JSON.stringify(selectedSymptoms))
    router.push("/onboarding/stress")
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-center items-center bg-brand-dark text-white relative">
        <div className="absolute left-4">
          <button
            onClick={handleBack}
            className="text-white/80 hover:text-white flex items-center"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back</span>
          </button>
        </div>
        <Logo />
      </header>

      <main className="flex-1 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-2">What symptoms are you experiencing?</h1>
        <p className="text-gray-600 mb-6">
          Select up to 5 symptoms that you're currently experiencing. You can also continue without selecting any
          symptoms.
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search symptoms..."
            className="w-full p-3 border rounded-lg"
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
        {error && <p className="text-red-500 mb-2">{error}</p>}

        {/* Selected count */}
        <p className="text-sm text-gray-600 mb-2">Selected: {selectedSymptoms.length}/5</p>

        {/* Symptoms list */}
        <div className="flex-1 mb-4 border rounded-lg p-2 overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {displayedSymptoms.map((symptom) => (
              <div
                key={symptom}
                className={`p-3 mb-2 rounded-lg cursor-pointer ${
                  selectedSymptoms.includes(symptom)
                    ? "bg-pink-100 border-pink-300 border"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
                onClick={() => handleSymptomClick(symptom)}
              >
                <div className="flex items-center">
                  <span className="flex-1">{symptom}</span>
                  {selectedSymptoms.includes(symptom) && <span className="text-pink-500">✓</span>}
                </div>
              </div>
            ))}
            {filteredSymptoms.length === 0 && <p className="text-center p-4 text-gray-500">No symptoms found</p>}
          </div>

          {/* Show more/less button */}
          {!searchTerm && filteredSymptoms.length > 5 && (
            <button
              className="w-full mt-2 py-2 text-pink-500 font-medium bg-pink-50 rounded-lg hover:bg-pink-100"
              onClick={toggleShowAllSymptoms}
            >
              {showAllSymptoms ? "Show less" : `Show more (${filteredSymptoms.length - 5} more)`}
            </button>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-3">
          <button
            className="w-full py-3 rounded-lg font-medium bg-pink-500 text-white hover:bg-pink-600"
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-2 h-2 rounded-full bg-pink-500"></div>
          <div className="w-2 h-2 rounded-full bg-pink-500"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>
      </main>
    </div>
  )
}
