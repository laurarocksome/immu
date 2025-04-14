"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Logo from "@/app/components/logo"

export default function ConditionsPage() {
  const router = useRouter()
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")
  const [showAllConditions, setShowAllConditions] = useState(false)

  // Load saved conditions from localStorage if available
  useEffect(() => {
    const savedConditions = localStorage.getItem("selectedConditions")
    if (savedConditions) {
      try {
        setSelectedConditions(JSON.parse(savedConditions))
      } catch (e) {
        console.error("Error parsing saved conditions:", e)
      }
    }
  }, [])

  // Alphabetically sorted list of conditions
  const conditionsList = [
    "Multiple sclerosis (MS)",
    "Chronic migraines",
    "Brain fog",
    "Depression",
    "Rheumatoid arthritis (RA)",
    "Psoriatic arthritis",
    "Ankylosing spondylitis",
    "Polymyalgia rheumatica",
    "Fibromyalgia",
    "Gout",
    "Osteoarthritis",
    "Hashimoto's thyroiditis",
    "Graves' disease",
    "Lupus (SLE)",
    "Sjogren's syndrome",
    "Type 1 diabetes",
    "Autoimmune hepatitis",
    "Autoimmune gastritis",
    "Mixed connective tissue disease",
    "Myasthenia gravis",
    "Vasculitis",
    "Scleroderma",
    "Antiphospholipid syndrome",
    "Behçet's disease",
    "Relapsing polychondritis",
    "ITP (Idiopathic thrombocytopenic purpura)",
    "Crohn's disease",
    "Ulcerative colitis",
    "Celiac disease",
    "Non-celiac gluten sensitivity",
    "Irritable Bowel Syndrome (IBS)",
    "Small intestinal bacterial overgrowth (SIBO)",
    "Leaky gut (intestinal permeability)",
    "GERD",
    "Gastritis",
    "Esophagitis",
    "Gallbladder issues",
    "Chronic bloating or gas",
    "Histamine intolerance",
    "Food sensitivities/intolerances",
    "Constipation/diarrhea related to inflammation",
    "Pancreatitis",
    "Psoriasis",
    "Eczema (atopic dermatitis)",
    "Rosacea",
    "Acne (esp. inflammatory/hormonal type)",
    "Hives (chronic urticaria)",
    "Vitiligo",
    "Alopecia areata",
    "Dermatitis herpetiformis (linked to gluten sensitivity)",
    "Seborrheic dermatitis",
    "Perioral dermatitis",
    "Skin rashes of unknown origin",
    "Keratosis pilaris",
    "Raynaud's phenomenon",
    "High blood pressure",
    "Elevated CRP",
    "Anemia of chronic disease",
    "Chronic fatigue syndrome (ME/CFS)",
    "Long COVID",
    "Mast Cell Activation Syndrome (MCAS)",
    "Persistent post-viral symptoms",
    "General autoimmune/inflammatory flare-ups",
    "Systemic inflammation with no clear diagnosis",
    "Polycystic ovarian syndrome (PCOS)",
    "Endometriosis",
    "Estrogen dominance",
    "Insulin resistance",
    "Thyroid imbalances",
    "Asthma",
    "Chronic sinusitis",
    "Interstitial cystitis (bladder inflammation)",
    "Chronic pelvic pain",
    "Burning mouth syndrome",
    "Oral lichen planus",
  ].sort()

  const filteredConditions = conditionsList.filter((condition) =>
    condition.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Determine which conditions to display
  const displayedConditions = searchTerm
    ? filteredConditions
    : showAllConditions
      ? filteredConditions
      : filteredConditions.slice(0, 5)

  const handleConditionClick = (condition: string) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== condition))
      setError("")
    } else {
      if (selectedConditions.length < 3) {
        setSelectedConditions([...selectedConditions, condition])
        setError("")
      } else {
        setError("You can select up to 3 conditions")
      }
    }
  }

  const handleContinue = () => {
    // Save selected conditions even if empty
    localStorage.setItem("selectedConditions", JSON.stringify(selectedConditions))
    router.push("/onboarding/symptoms")
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  const toggleShowAllConditions = () => {
    setShowAllConditions(!showAllConditions)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-center items-center bg-brand-dark text-white">
        <Logo />
      </header>

      <main className="flex-1 p-4 flex flex-col">
        <h1 className="text-2xl font-bold mb-2">What conditions are you managing?</h1>
        <p className="text-gray-600 mb-6">
          Select up to 3 conditions that you're currently experiencing or have been diagnosed with. You can also
          continue without selecting any conditions.
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search conditions..."
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
        <p className="text-sm text-gray-600 mb-2">Selected: {selectedConditions.length}/3</p>

        {/* Conditions list */}
        <div className="flex-1 mb-4 border rounded-lg p-2 overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {displayedConditions.map((condition) => (
              <div
                key={condition}
                className={`p-3 mb-2 rounded-lg cursor-pointer ${
                  selectedConditions.includes(condition)
                    ? "bg-pink-100 border-pink-300 border"
                    : "bg-gray-50 hover:bg-gray-100"
                }`}
                onClick={() => handleConditionClick(condition)}
              >
                <div className="flex items-center">
                  <span className="flex-1">{condition}</span>
                  {selectedConditions.includes(condition) && <span className="text-pink-500">✓</span>}
                </div>
              </div>
            ))}
            {filteredConditions.length === 0 && <p className="text-center p-4 text-gray-500">No conditions found</p>}
          </div>

          {/* Show more/less button */}
          {!searchTerm && filteredConditions.length > 5 && (
            <button
              className="w-full mt-2 py-2 text-pink-500 font-medium bg-pink-50 rounded-lg hover:bg-pink-100"
              onClick={toggleShowAllConditions}
            >
              {showAllConditions ? "Show less" : `Show more (${filteredConditions.length - 5} more)`}
            </button>
          )}
        </div>

        {/* Continue button */}
        <button
          className="w-full py-3 rounded-lg font-medium bg-pink-500 text-white hover:bg-pink-600"
          onClick={handleContinue}
        >
          Continue
        </button>

        {/* Progress dots */}
        <div className="flex justify-center mt-6 space-x-2">
          <div className="w-2 h-2 rounded-full bg-pink-500"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
          <div className="w-2 h-2 rounded-full bg-gray-300"></div>
        </div>
      </main>
    </div>
  )
}
