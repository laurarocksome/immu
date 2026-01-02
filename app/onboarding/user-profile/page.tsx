"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronDown, ArrowLeft } from "lucide-react"
import Logo from "@/app/components/logo"
import { saveUserProfile } from "@/lib/user-data"
import { getSession } from "@/lib/auth"

type WeightUnit = "kg" | "lb"
type HeightUnit = "cm" | "ft"

export default function UserProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [gender, setGender] = useState<string | null>(null)
  const [age, setAge] = useState<string>("")
  const [weight, setWeight] = useState<string>("")
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("kg")
  const [height, setHeight] = useState<string>("")
  const [heightUnit, setHeightUnit] = useState<HeightUnit>("cm")
  const [showWeightDropdown, setShowWeightDropdown] = useState(false)
  const [showHeightDropdown, setShowHeightDropdown] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const isEditMode = searchParams.get("edit") === "true"

  useEffect(() => {
    const loadExistingData = async () => {
      try {
        const session = await getSession()
        if (session?.user) {
          const { supabase } = await import("@/lib/supabase/client")
          const { data: profileData } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", session.user.id)
            .single()

          if (profileData) {
            setGender(profileData.gender || null)
            setAge(profileData.age?.toString() || "")
            setWeight(profileData.weight?.toString() || "")
            setWeightUnit((profileData.weight_unit as WeightUnit) || "kg")
            setHeight(profileData.height?.toString() || "")
            setHeightUnit((profileData.height_unit as HeightUnit) || "cm")
          }
        }

        const storedProfile = localStorage.getItem("userProfile")
        if (storedProfile && !gender) {
          const profile = JSON.parse(storedProfile)
          setGender(profile.gender || null)
          setAge(profile.age?.toString() || "")
          setWeight(profile.weight?.toString() || "")
          setWeightUnit(profile.weightUnit || "kg")
          setHeight(profile.height?.toString() || "")
          setHeightUnit(profile.heightUnit || "cm")
        }
      } catch (error) {
        console.error("Error loading profile data:", error)
      }
    }

    loadExistingData()
  }, [])

  const handleGenderSelect = (selectedGender: string) => {
    setGender(selectedGender)
  }

  const toggleWeightDropdown = () => {
    setShowWeightDropdown(!showWeightDropdown)
    if (showHeightDropdown) setShowHeightDropdown(false)
  }

  const toggleHeightDropdown = () => {
    setShowHeightDropdown(!showHeightDropdown)
    if (showWeightDropdown) setShowWeightDropdown(false)
  }

  const selectWeightUnit = (unit: WeightUnit) => {
    setWeightUnit(unit)
    setShowWeightDropdown(false)
  }

  const selectHeightUnit = (unit: HeightUnit) => {
    setHeightUnit(unit)
    setShowHeightDropdown(false)
  }

  const validateInputs = () => {
    if (!gender) {
      setError("Please select your gender")
      return false
    }

    if (!age || isNaN(Number(age)) || Number(age) <= 0 || Number(age) > 120) {
      setError("Please enter a valid age")
      return false
    }

    if (!weight || isNaN(Number(weight)) || Number(weight) <= 0) {
      setError("Please enter a valid weight")
      return false
    }

    if (!height || isNaN(Number(height)) || Number(height) <= 0) {
      setError("Please enter a valid height")
      return false
    }

    return true
  }

  const handleContinue = async () => {
    if (!validateInputs()) return

    setIsLoading(true)

    const userProfile = {
      gender,
      age: Number(age),
      weight: Number(weight),
      weightUnit,
      height: Number(height),
      heightUnit,
    }

    localStorage.setItem("userProfile", JSON.stringify(userProfile))

    try {
      const session = await getSession()
      if (session?.user) {
        await saveUserProfile(userProfile)
      }
    } catch (error) {
      console.error("Error saving to database:", error)
    }

    setTimeout(() => {
      if (isEditMode) {
        router.push("/profile")
      } else {
        router.push("/onboarding/create-account")
      }
      setIsLoading(false)
    }, 800)
  }

  const handleBack = () => {
    if (isEditMode) {
      router.push("/profile")
    } else {
      router.push("/onboarding/diet-timeline")
    }
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
          <span>Back</span>
        </button>
        <Logo variant="light" />
      </header>

      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold mb-2">About You</h2>
            <p className="text-brand-dark/70">Please enter some basic information to personalize your experience.</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-700">
              {error}
            </div>
          )}

          <div className="glass-card rounded-2xl p-6 space-y-6">
            <div>
              <label className="block mb-2">Your gender at birth</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => handleGenderSelect("Female")}
                  className={`py-3 rounded-xl transition-colors ${
                    gender === "Female"
                      ? "bg-pink-400 text-white"
                      : "bg-white/80 border border-brand-dark/20 hover:bg-white"
                  }`}
                >
                  Female
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderSelect("Male")}
                  className={`py-3 rounded-xl transition-colors ${
                    gender === "Male"
                      ? "bg-pink-400 text-white"
                      : "bg-white/80 border border-brand-dark/20 hover:bg-white"
                  }`}
                >
                  Male
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="age" className="block mb-2">
                Age
              </label>
              <input
                type="number"
                id="age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
                className="w-full p-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                min="1"
                max="120"
              />
            </div>

            <div>
              <label className="block mb-2 text-center">Weight</label>
              <div className="flex">
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight"
                  className="flex-1 p-3 rounded-l-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  min="1"
                />
                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleWeightDropdown}
                    className="flex items-center justify-between w-32 p-3 bg-white/80 border border-brand-dark/20 rounded-r-xl"
                  >
                    <span>{weightUnit}</span>
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </button>

                  {showWeightDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-brand-dark/20 rounded-xl shadow-lg z-10">
                      <button
                        type="button"
                        onClick={() => selectWeightUnit("kg")}
                        className="block w-full text-left px-4 py-2 hover:bg-brand-lightest"
                      >
                        kg
                      </button>
                      <button
                        type="button"
                        onClick={() => selectWeightUnit("lb")}
                        className="block w-full text-left px-4 py-2 hover:bg-brand-lightest"
                      >
                        lb
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2 text-center">Height</label>
              <div className="flex">
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Enter height"
                  className="flex-1 p-3 rounded-l-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  min="1"
                />
                <div className="relative">
                  <button
                    type="button"
                    onClick={toggleHeightDropdown}
                    className="flex items-center justify-between w-32 p-3 bg-white/80 border border-brand-dark/20 rounded-r-xl"
                  >
                    <span>{heightUnit}</span>
                    <ChevronDown className="h-4 w-4 ml-2" />
                  </button>

                  {showHeightDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-brand-dark/20 rounded-xl shadow-lg z-10">
                      <button
                        type="button"
                        onClick={() => selectHeightUnit("cm")}
                        className="block w-full text-left px-4 py-2 hover:bg-brand-lightest"
                      >
                        cm
                      </button>
                      <button
                        type="button"
                        onClick={() => selectHeightUnit("ft")}
                        className="block w-full text-left px-4 py-2 hover:bg-brand-lightest"
                      >
                        ft
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleContinue}
            disabled={isLoading}
            className="w-full gradient-button py-4 rounded-full mt-8"
          >
            {isLoading ? "Saving..." : isEditMode ? "Save" : "Next"}
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
