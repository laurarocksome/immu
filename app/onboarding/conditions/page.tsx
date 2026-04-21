"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Logo from "@/app/components/logo"
import LanguageToggle from "@/app/components/language-toggle"
import { saveUserConditions } from "@/lib/user-data"
import { getSession } from "@/lib/auth"
import { useLanguage } from "@/lib/i18n/context"

function conditionKey(value: string) {
  return "condition." + value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/, "")
}

export default function ConditionsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { t } = useLanguage()
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")
  const [showAllConditions, setShowAllConditions] = useState(false)
  const isEditMode = searchParams.get("edit") === "true"

  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const session = await getSession()
        if (session?.user) {
          const { supabase } = await import("@/lib/supabase/client")
          const { data: conditionsData } = await supabase
            .from("user_conditions")
            .select("condition")
            .eq("user_id", session.user.id)

          if (conditionsData && conditionsData.length > 0) {
            setSelectedConditions(conditionsData.map((c) => c.condition))
            return
          }
        }

        const savedConditions = localStorage.getItem("selectedConditions")
        if (savedConditions) {
          setSelectedConditions(JSON.parse(savedConditions))
        }
      } catch (error) {
        console.error("Error loading conditions:", error)
      }
    }

    loadExistingData()
  }, [])

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
    "Joint Pain",
  ].sort()

  const filteredConditions = conditionsList.filter((condition) => {
    const translated = t(conditionKey(condition), condition)
    return (
      condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translated.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

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
        setError(t("onboarding.conditions.max", "You can select up to 3 conditions"))
      }
    }
  }

  const handleContinue = async () => {
    localStorage.setItem("selectedConditions", JSON.stringify(selectedConditions))
    localStorage.setItem("userConditions", JSON.stringify(selectedConditions))

    try {
      const session = await getSession()
      if (session?.user) {
        await saveUserConditions(selectedConditions)
      }
    } catch (error) {
      console.error("Error saving to database:", error)
    }

    if (isEditMode) {
      router.push("/profile")
    } else {
      router.push("/onboarding/symptoms")
    }
  }

  const handleBack = () => {
    if (isEditMode) {
      router.push("/profile")
    } else {
      router.push("/")
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
  }

  const toggleShowAllConditions = () => {
    setShowAllConditions(!showAllConditions)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      <header className="p-4 flex justify-center items-center bg-brand-dark text-white relative">
        <button
          onClick={handleBack}
          className="absolute left-4 text-white/80 hover:text-white transition-colors flex items-center"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>{t("common.back", "Back")}</span>
        </button>
        <Logo variant="light" />
        <LanguageToggle className="absolute right-4 top-1/2 -translate-y-1/2" />
      </header>

      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">{t("onboarding.conditions.title", "What conditions are you managing?")}</h2>
            <p className="text-brand-dark/70 mb-4">
              {t("onboarding.conditions.subtitle", "Select up to 3 conditions (optional). You can continue without selecting any, or choose 1-3 conditions that you're currently experiencing.")}
            </p>
          </div>

          <div className="relative mb-4">
            <input
              type="text"
              placeholder={t("onboarding.conditions.search", "Search conditions...")}
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

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-700">
              {error}
            </div>
          )}

          <p className="text-sm text-brand-dark/70 mb-2">
            {t("onboarding.conditions.selected", "Selected:")} {selectedConditions.length}/3{" "}
            {selectedConditions.length === 0 && t("onboarding.conditions.optional", "(optional)")}
          </p>

          <div className="glass-card rounded-2xl p-4 mb-8 overflow-hidden">
            <div className="max-h-64 overflow-y-auto">
              {displayedConditions.map((condition) => (
                <div
                  key={condition}
                  className={`p-3 mb-2 rounded-xl cursor-pointer transition-colors ${
                    selectedConditions.includes(condition)
                      ? "bg-pink-400 text-white"
                      : "bg-white/80 border border-brand-dark/20 hover:bg-white"
                  }`}
                  onClick={() => handleConditionClick(condition)}
                >
                  <div className="flex items-center">
                    <span className="flex-1">{t(conditionKey(condition), condition)}</span>
                    {selectedConditions.includes(condition) && <span>✓</span>}
                  </div>
                </div>
              ))}
              {filteredConditions.length === 0 && (
                <p className="text-center p-4 text-brand-dark/70">{t("onboarding.conditions.none", "No conditions found")}</p>
              )}
            </div>

            {!searchTerm && filteredConditions.length > 5 && (
              <button
                className="w-full mt-2 py-2 text-pink-400 font-medium bg-white/80 rounded-xl hover:bg-white border border-pink-400/20"
                onClick={toggleShowAllConditions}
              >
                {showAllConditions
                  ? t("onboarding.conditions.showLess", "Show less")
                  : t("onboarding.conditions.showMore", "Show more")}
              </button>
            )}
          </div>

          <button className="w-full gradient-button py-4 rounded-full" onClick={handleContinue}>
            {isEditMode ? t("common.save", "Save") : t("common.continue", "Continue")}
          </button>
        </div>

        {!isEditMode && (
          <div className="p-4 flex justify-center mt-6">
            <div className="flex space-x-2">
              <div className="w-2 h-2 rounded-full bg-pink-400"></div>
              <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
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
