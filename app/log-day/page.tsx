"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  List,
  Home,
  Plus,
  BookOpen,
  UtensilsCrossed,
  ArrowLeft,
  Calendar,
  Smile,
  Frown,
  Moon,
  Check,
  X,
} from "lucide-react"
import Logo from "@/app/components/logo"

import DietViolationOptions from "@/app/components/diet-violation-options"
import RestartConfirmation from "@/app/components/restart-confirmation"
import AdaptationPeriodQuestion from "@/app/components/adaptation-period-question"

// Sample mood options
export const dynamic = 'force-dynamic'

const moodOptions = [
  { value: 5, label: "Great", icon: Smile },
  { value: 4, label: "Good", icon: Smile },
  { value: 3, label: "Okay", icon: Smile },
  { value: 2, label: "Not Great", icon: Frown },
  { value: 1, label: "Poor", icon: Frown },
]

// Sample sleep quality options
const sleepOptions = [
  { value: 5, label: "Excellent", description: "8+ hours, woke refreshed" },
  { value: 4, label: "Good", description: "7-8 hours, minor disruptions" },
  { value: 3, label: "Fair", description: "6-7 hours, some disruptions" },
  { value: 2, label: "Poor", description: "4-6 hours, frequent waking" },
  { value: 1, label: "Very Poor", description: "<4 hours, barely slept" },
]

// Sample stress levels
const stressLevels = [
  { value: 1, label: "None", description: "Completely relaxed" },
  { value: 2, label: "Mild", description: "Slightly stressed" },
  { value: 3, label: "Moderate", description: "Noticeably stressed" },
  { value: 4, label: "High", description: "Very stressed" },
  { value: 5, label: "Severe", description: "Extremely stressed" },
]

// Period symptoms
const periodSymptoms = [
  { id: "menstrual_cramps", name: "Menstrual Cramps" },
  { id: "headaches", name: "Headaches or Migraines" },
  { id: "breast_tenderness", name: "Breast Tenderness" },
  { id: "lower_back_pain", name: "Lower Back Pain" },
  { id: "muscle_aches", name: "Muscle Aches" },
  { id: "joint_pain", name: "Joint Pain" },
]

// Digestive symptoms
const digestiveSymptoms = [
  { id: "nauseous", name: "Nauseous" },
  { id: "bloated", name: "Bloated" },
  { id: "gassy", name: "Gassy" },
  { id: "heartburn", name: "Heartburn" },
  { id: "ok", name: "OK" },
]

export default function LogDayPage() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [symptomSeverity, setSymptomSeverity] = useState<Record<number, number>>({})
  const [mood, setMood] = useState<number | null>(null)
  const [sleep, setSleep] = useState<number | null>(null)
  const [stress, setStress] = useState<number | null>(null)
  const [notes, setNotes] = useState("")
  const [userSymptoms, setUserSymptoms] = useState<Array<{ id: number; name: string; description: string }>>([])

  // New states for diet tracking
  const [showDietQuestion, setShowDietQuestion] = useState(false)
  const [showViolationOptions, setShowViolationOptions] = useState(false)
  const [showRestartConfirmation, setShowRestartConfirmation] = useState(false)
  const [showAdaptationQuestion, setShowAdaptationQuestion] = useState(false)
  const [violationType, setViolationType] = useState<"full" | "single" | null>(null)
  const [wantToRestart, setWantToRestart] = useState<boolean | null>(null)

  // Period tracking states
  const [onPeriod, setOnPeriod] = useState<boolean | null>(null)
  const [selectedPeriodSymptoms, setSelectedPeriodSymptoms] = useState<string[]>([])
  const [customPeriodSymptom, setCustomPeriodSymptom] = useState("")
  const [showCustomSymptomInput, setShowCustomSymptomInput] = useState(false)

  // Digestive symptoms states
  const [selectedDigestiveSymptoms, setSelectedDigestiveSymptoms] = useState<string[]>([])
  const [customDigestiveSymptom, setCustomDigestiveSymptom] = useState("")
  const [showCustomDigestiveSymptomInput, setShowCustomDigestiveSymptomInput] = useState(false)

  // Add userGender state near the top of the component with other state variables
  const [userGender, setUserGender] = useState<string | null>(null)

  useEffect(() => {
    // Load user symptoms from localStorage
    const loadUserSymptoms = () => {
      try {
        // First try to get the symptoms selected during onboarding
        const selectedSymptoms = localStorage.getItem("selectedSymptoms")

        if (selectedSymptoms) {
          const parsedSymptoms = JSON.parse(selectedSymptoms)

          if (Array.isArray(parsedSymptoms) && parsedSymptoms.length > 0) {
            // Convert the string array to our symptom format
            const formattedSymptoms = parsedSymptoms.map((name, index) => ({
              id: index + 1,
              name,
              description: `Track your ${name.toLowerCase()} symptoms`,
            }))

            setUserSymptoms(formattedSymptoms)
            console.log("Loaded symptoms from onboarding:", formattedSymptoms)
            return
          }
        }

        // If no onboarding symptoms found, check for previously saved userSymptoms
        const savedSymptoms = localStorage.getItem("userSymptoms")
        if (savedSymptoms) {
          const parsedSymptoms = JSON.parse(savedSymptoms)

          if (Array.isArray(parsedSymptoms) && parsedSymptoms.length > 0) {
            // If it's already in the right format, use it directly
            if (typeof parsedSymptoms[0] === "object" && parsedSymptoms[0].id) {
              setUserSymptoms(parsedSymptoms)
              console.log("Loaded symptoms from userSymptoms (object format):", parsedSymptoms)
            } else {
              // Convert string array to our symptom format
              const formattedSymptoms = parsedSymptoms.map((name, index) => ({
                id: index + 1,
                name,
                description: `Track your ${name.toLowerCase()} symptoms`,
              }))

              setUserSymptoms(formattedSymptoms)
              console.log("Loaded symptoms from userSymptoms (string format):", formattedSymptoms)
            }
            return
          }
        }

        // If no symptoms found anywhere, use default fallback symptoms
        const defaultSymptoms = [
          { id: 1, name: "Fatigue", description: "Feeling tired or exhausted" },
          { id: 2, name: "Joint Pain", description: "Pain, stiffness, or swelling in joints" },
          { id: 3, name: "Brain Fog", description: "Difficulty concentrating or thinking clearly" },
          { id: 4, name: "Digestive Issues", description: "Bloating, gas, diarrhea, or constipation" },
          { id: 5, name: "Headaches", description: "Pain or pressure in head" },
        ]

        setUserSymptoms(defaultSymptoms)
        console.log("Using default symptoms:", defaultSymptoms)
      } catch (error) {
        console.error("Error loading user symptoms:", error)
        // Fallback to default symptoms in case of error
        const defaultSymptoms = [
          { id: 1, name: "Fatigue", description: "Feeling tired or exhausted" },
          { id: 2, name: "Joint Pain", description: "Pain, stiffness, or swelling in joints" },
          { id: 3, name: "Brain Fog", description: "Difficulty concentrating or thinking clearly" },
          { id: 4, name: "Digestive Issues", description: "Bloating, gas, diarrhea, or constipation" },
          { id: 5, name: "Headaches", description: "Pain or pressure in head" },
        ]
        setUserSymptoms(defaultSymptoms)
      }
    }

    // Load user symptoms
    loadUserSymptoms()

    // Check if the user has already logged their diet success today
    checkIfDietSuccessLoggedToday()

    // Load user profile to get gender
    const profileData = localStorage.getItem("userProfile")
    if (profileData) {
      try {
        const profile = JSON.parse(profileData)
        setUserGender(profile.gender?.toLowerCase() || null)
      } catch (e) {
        console.error("Error parsing user profile:", e)
      }
    }
  }, [])

  const checkIfDietSuccessLoggedToday = () => {
    // Get the last logged date for diet success
    const lastLoggedDate = localStorage.getItem("lastDietSuccessLogDate")

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split("T")[0]

    // If the user hasn't logged today, show the diet question
    if (lastLoggedDate !== today) {
      setShowDietQuestion(true)
    } else {
      // User already logged today, skip to the regular form
      setShowDietQuestion(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(new Date(e.target.value))
  }

  const handleSymptomSeverityChange = (symptomId: number, severity: number) => {
    setSymptomSeverity((prev) => ({
      ...prev,
      [symptomId]: severity,
    }))
  }

  const handleDietSuccess = (success: boolean) => {
    // Save today's date as the last logged date
    const today = new Date().toISOString().split("T")[0]
    localStorage.setItem("lastDietSuccessLogDate", today)

    if (success) {
      // User had a successful diet day
      incrementDietProgress()
      setShowDietQuestion(false)
    } else {
      // User had a diet violation
      setShowDietQuestion(false)
      setShowViolationOptions(true)
    }
  }

  const handleViolationType = (type: "full" | "single") => {
    setViolationType(type)
    setShowViolationOptions(false)

    if (type === "full") {
      // Full non-AIP meal - show adaptation question directly
      setShowAdaptationQuestion(true)
    } else {
      // Single non-AIP ingredient - ask if they want to restart
      setShowRestartConfirmation(true)
    }
  }

  const handleRestartConfirmation = (restart: boolean) => {
    setWantToRestart(restart)
    setShowRestartConfirmation(false)

    if (restart) {
      // User wants to restart - show adaptation question
      setShowAdaptationQuestion(true)
    } else {
      // User doesn't want to restart - continue with normal logging
      setShowDietQuestion(false)
    }
  }

  const handleAdaptationChoice = (wantAdaptation: boolean) => {
    // Reset diet and potentially add adaptation period
    resetDiet(wantAdaptation)

    // Continue with normal logging
    setShowAdaptationQuestion(false)
  }

  const incrementDietProgress = () => {
    // Get current diet data
    const startDateStr = localStorage.getItem("dietStartDate")
    const streakDays = Number.parseInt(localStorage.getItem("streakDays") || "0", 10)

    // Increment streak
    localStorage.setItem("streakDays", (streakDays + 1).toString())

    // If this is the first day, set the start date
    if (!startDateStr) {
      localStorage.setItem("dietStartDate", new Date().toISOString())
    }
  }

  const resetDiet = (withAdaptation: boolean) => {
    // Reset diet start date to today
    localStorage.setItem("dietStartDate", new Date().toISOString())

    // Reset streak
    localStorage.setItem("streakDays", "1")

    // Get the original diet timeline (this should be the elimination phase length)
    const originalTimeline = Number.parseInt(localStorage.getItem("userDietTimeline") || "30", 10)

    // If adaptation is requested, add 28 days to the timeline
    if (withAdaptation) {
      // Store the adaptation choice
      localStorage.setItem("userAdaptationChoice", "Yes")

      // If the original timeline is less than 30 days, set it to 30 days
      // This ensures we have at least 30 days of elimination after 28 days of adaptation
      const eliminationDays = Math.max(originalTimeline, 30)
      const totalDays = eliminationDays + 28 // 28 days for adaptation
      localStorage.setItem("userDietTimeline", totalDays.toString())
    } else {
      // No adaptation period
      localStorage.setItem("userAdaptationChoice", "No")
      localStorage.setItem("userDietTimeline", originalTimeline.toString())
    }
  }

  // Toggle period symptom selection
  const togglePeriodSymptom = (symptomId: string) => {
    setSelectedPeriodSymptoms((prev) => {
      if (prev.includes(symptomId)) {
        return prev.filter((id) => id !== symptomId)
      } else {
        return [...prev, symptomId]
      }
    })
  }

  // Add custom period symptom
  const handleAddCustomSymptom = () => {
    if (customPeriodSymptom.trim()) {
      setSelectedPeriodSymptoms((prev) => [...prev, `custom_${customPeriodSymptom.trim()}`])
      setCustomPeriodSymptom("")
      setShowCustomSymptomInput(false)
    }
  }

  // Get period symptom name (handles custom symptoms)
  const getPeriodSymptomName = (symptomId: string) => {
    if (symptomId.startsWith("custom_")) {
      return symptomId.replace("custom_", "")
    }

    const symptom = periodSymptoms.find((s) => s.id === symptomId)
    return symptom ? symptom.name : symptomId
  }

  // Toggle digestive symptom selection
  const toggleDigestiveSymptom = (symptomId: string) => {
    setSelectedDigestiveSymptoms((prev) => {
      if (prev.includes(symptomId)) {
        return prev.filter((id) => id !== symptomId)
      } else {
        // If "OK" is selected, clear all other selections
        if (symptomId === "ok") {
          return ["ok"]
        }
        // If another symptom is selected, remove "OK" if it's selected
        const newSelection = prev.filter((id) => id !== "ok")
        return [...newSelection, symptomId]
      }
    })
  }

  // Add custom digestive symptom
  const handleAddCustomDigestiveSymptom = () => {
    if (customDigestiveSymptom.trim()) {
      setSelectedDigestiveSymptoms((prev) => {
        // Remove "OK" if it's selected
        const newSelection = prev.filter((id) => id !== "ok")
        return [...newSelection, `custom_digestive_${customDigestiveSymptom.trim()}`]
      })
      setCustomDigestiveSymptom("")
      setShowCustomDigestiveSymptomInput(false)
    }
  }

  const handleSaveLog = () => {
    // Save the logged symptoms to localStorage
    const loggedSymptoms = Object.entries(symptomSeverity)
      .map(([symptomId, severity]) => {
        const symptom = userSymptoms.find((s) => s.id === Number(symptomId))
        return {
          name: symptom?.name || "",
          severity: severity,
          date: selectedDate.toISOString().split("T")[0],
        }
      })
      .filter((s) => s.name !== "")

    // Save symptoms to localStorage
    localStorage.setItem("loggedSymptoms", JSON.stringify(loggedSymptoms))

    // Save the user's symptoms for future use
    localStorage.setItem("userSymptoms", JSON.stringify(userSymptoms.map((s) => s.name)))

    // Make sure to include digestive symptoms in the logged day
    const loggedDay = {
      mood,
      sleep,
      stress,
      notes,
      date: selectedDate.toISOString().split("T")[0],
      onPeriod: onPeriod || false,
      periodSymptoms: onPeriod ? selectedPeriodSymptoms : [],
      digestiveSymptoms: selectedDigestiveSymptoms, // Ensure this is included
    }

    // Save wellness data to localStorage
    localStorage.setItem("loggedDay", JSON.stringify(loggedDay))

    // In a real app, you would save the data to your database or state
    // For now, we'll just navigate back to the dashboard
    router.push("/dashboard")
  }

  // Format date for input
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0]
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
      <main className="flex-1 p-4 pb-24 overflow-auto">
        {/* Diet Success Question */}
        {showDietQuestion && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h2 className="text-2xl font-bold mb-6 text-center">Did you have a successful diet day?</h2>
            <div className="flex gap-4">
              <button
                onClick={() => handleDietSuccess(true)}
                className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl bg-green-100 hover:bg-green-200 transition-colors"
              >
                <Check className="h-12 w-12 mb-2 text-green-600" />
                <span className="font-medium text-green-800">Yes</span>
                <p className="text-xs text-green-700 mt-1">I followed the AIP diet today</p>
              </button>

              <button
                onClick={() => handleDietSuccess(false)}
                className="flex-1 flex flex-col items-center justify-center p-4 rounded-xl bg-red-100 hover:bg-red-200 transition-colors"
              >
                <X className="h-12 w-12 mb-2 text-red-600" />
                <span className="font-medium text-red-800">No</span>
                <p className="text-xs text-red-700 mt-1">I had non-AIP foods today</p>
              </button>
            </div>
          </div>
        )}

        {/* Violation Type Selection */}
        {showViolationOptions && <DietViolationOptions onSelect={handleViolationType} />}

        {/* Restart Confirmation (for single ingredient) */}
        {showRestartConfirmation && <RestartConfirmation onSelect={handleRestartConfirmation} />}

        {/* Adaptation Period Question */}
        {showAdaptationQuestion && <AdaptationPeriodQuestion onSelect={handleAdaptationChoice} />}

        {/* Only show the regular logging form if we're not showing any of the diet question screens */}
        {!showDietQuestion && !showViolationOptions && !showRestartConfirmation && !showAdaptationQuestion && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Log Your Day</h2>
              <p className="text-brand-dark/70">Track your symptoms, mood, and diet compliance</p>
            </div>

            {/* Date Selection */}
            <div className="glass-card rounded-2xl p-4 mb-6">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 mr-2 text-brand-dark/70" />
                <h3 className="font-medium">Date</h3>
              </div>
              <input
                type="date"
                value={formatDateForInput(selectedDate)}
                onChange={handleDateChange}
                className="w-full p-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>

            {/* Period Tracking (shown only for female users) */}
            {userGender === "female" && (
              <div className="glass-card rounded-2xl p-4 mb-6">
                <h3 className="font-medium mb-4">Period</h3>
                <p className="text-sm text-brand-dark/70 mb-3">Are you currently on your period?</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setOnPeriod(true)}
                    className={`flex-1 py-3 px-6 rounded-full ${
                      onPeriod === true
                        ? "bg-pink-400 text-white"
                        : "bg-white/80 border border-brand-dark/20 hover:bg-white"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setOnPeriod(false)}
                    className={`flex-1 py-3 px-6 rounded-full ${
                      onPeriod === false
                        ? "bg-pink-400 text-white"
                        : "bg-white/80 border border-brand-dark/20 hover:bg-white"
                    }`}
                  >
                    No
                  </button>
                </div>

                {/* Period Symptoms (shown only if on period) */}
                {onPeriod && (
                  <div className="mt-4">
                    <p className="text-sm text-brand-dark/70 mb-3">Select any symptoms you're experiencing:</p>

                    <div className="flex flex-wrap gap-3 mb-4">
                      {periodSymptoms.map((symptom) => (
                        <button
                          key={symptom.id}
                          onClick={() => togglePeriodSymptom(symptom.id)}
                          className={`py-2 px-4 rounded-full ${
                            selectedPeriodSymptoms.includes(symptom.id)
                              ? "bg-pink-400 text-white"
                              : "bg-white/80 border border-brand-dark/20 hover:bg-white"
                          }`}
                        >
                          {symptom.name}
                        </button>
                      ))}

                      {/* Custom symptoms that user has added */}
                      {selectedPeriodSymptoms
                        .filter((id) => id.startsWith("custom_"))
                        .map((customId) => (
                          <button
                            key={customId}
                            onClick={() => togglePeriodSymptom(customId)}
                            className="py-2 px-4 rounded-full bg-pink-400 text-white"
                          >
                            {customId.replace("custom_", "")}
                          </button>
                        ))}

                      {/* Add custom symptom button */}
                      {!showCustomSymptomInput && (
                        <button
                          onClick={() => setShowCustomSymptomInput(true)}
                          className="py-2 px-4 rounded-full bg-white/80 border border-brand-dark/20 hover:bg-white flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add your symptom
                        </button>
                      )}
                    </div>

                    {/* Custom symptom input */}
                    {showCustomSymptomInput && (
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={customPeriodSymptom}
                          onChange={(e) => setCustomPeriodSymptom(e.target.value)}
                          placeholder="Enter symptom name"
                          className="flex-1 p-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                        />
                        <button
                          onClick={handleAddCustomSymptom}
                          className="py-2 px-4 rounded-lg bg-pink-400 text-white disabled:opacity-50"
                          disabled={!customPeriodSymptom.trim()}
                        >
                          Add
                        </button>
                        <button
                          onClick={() => setShowCustomSymptomInput(false)}
                          className="py-2 px-4 rounded-lg bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Symptoms Tracking */}
            <div className="glass-card rounded-2xl p-4 mb-6">
              <h3 className="font-medium mb-4">Symptoms</h3>
              <div className="space-y-6">
                {userSymptoms.map((symptom) => (
                  <div key={symptom.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{symptom.name}</p>
                        <p className="text-xs text-brand-dark/70">{symptom.description}</p>
                      </div>
                      <span className="text-sm font-medium">
                        {symptomSeverity[symptom.id]
                          ? ["None", "Very mild", "Mild", "Moderate", "Severe"][symptomSeverity[symptom.id] - 1]
                          : "Not logged"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">None</span>
                      <div className="flex-1 mx-2">
                        <div className="flex justify-between">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              onClick={() => handleSymptomSeverityChange(symptom.id, level)}
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                symptomSeverity[symptom.id] === level
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
                ))}
              </div>
            </div>

            {/* Mood Tracking */}
            <div className="glass-card rounded-2xl p-4 mb-6">
              <h3 className="font-medium mb-4">Overall Mood</h3>
              <div className="flex justify-between">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMood(option.value)}
                    className={`flex flex-col items-center p-2 rounded-xl ${
                      mood === option.value ? "bg-pink-400 text-white" : "bg-white/80 hover:bg-white"
                    }`}
                  >
                    <option.icon
                      className={`h-6 w-6 mb-1 ${mood === option.value ? "text-white" : "text-brand-dark"}`}
                    />
                    <span className="text-xs">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep Quality */}
            <div className="glass-card rounded-2xl p-4 mb-6">
              <div className="flex items-center mb-4">
                <Moon className="h-5 w-5 mr-2 text-brand-dark/70" />
                <h3 className="font-medium">Sleep Quality</h3>
              </div>
              <div className="space-y-2">
                {sleepOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSleep(option.value)}
                    className={`w-full flex justify-between items-center p-3 rounded-xl text-left ${
                      sleep === option.value ? "bg-pink-400 text-white" : "bg-white/80 hover:bg-white"
                    }`}
                  >
                    <div>
                      <p className={`font-medium ${sleep === option.value ? "text-white" : "text-brand-dark"}`}>
                        {option.label}
                      </p>
                      <p className={`text-xs ${sleep === option.value ? "text-white/80" : "text-brand-dark/70"}`}>
                        {option.description}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        sleep === option.value ? "border-white" : "border-brand-dark/30"
                      }`}
                    >
                      {sleep === option.value && <div className="w-3 h-3 rounded-full bg-white"></div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Stress Level */}
            <div className="glass-card rounded-2xl p-4 mb-6">
              <h3 className="font-medium mb-4">Stress Level</h3>
              <div className="space-y-2">
                {stressLevels.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStress(option.value)}
                    className={`w-full flex justify-between items-center p-3 rounded-xl text-left ${
                      stress === option.value ? "bg-pink-400 text-white" : "bg-white/80 hover:bg-white"
                    }`}
                  >
                    <div>
                      <p className={`font-medium ${stress === option.value ? "text-white" : "text-brand-dark"}`}>
                        {option.label}
                      </p>
                      <p className={`text-xs ${stress === option.value ? "text-white/80" : "text-brand-dark/70"}`}>
                        {option.description}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        stress === option.value ? "border-white" : "border-brand-dark/30"
                      }`}
                    >
                      {stress === option.value && <div className="w-3 h-3 rounded-full bg-white"></div>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Digestive Symptoms */}
            <div className="glass-card rounded-2xl p-4 mb-6">
              <h3 className="font-medium mb-4">Digestive Symptoms</h3>
              <p className="text-sm text-brand-dark/70 mb-3">Select any digestive symptoms you're experiencing:</p>

              <div className="flex flex-wrap gap-3 mb-4">
                {digestiveSymptoms.map((symptom) => (
                  <button
                    key={symptom.id}
                    onClick={() => toggleDigestiveSymptom(symptom.id)}
                    className={`py-2 px-4 rounded-full ${
                      selectedDigestiveSymptoms.includes(symptom.id)
                        ? "bg-pink-400 text-white"
                        : "bg-white/80 border border-brand-dark/20 hover:bg-white"
                    }`}
                  >
                    {symptom.name}
                  </button>
                ))}

                {/* Custom digestive symptoms that user has added */}
                {selectedDigestiveSymptoms
                  .filter((id) => id.startsWith("custom_digestive_"))
                  .map((customId) => (
                    <button
                      key={customId}
                      onClick={() => toggleDigestiveSymptom(customId)}
                      className="py-2 px-4 rounded-full bg-pink-400 text-white"
                    >
                      {customId.replace("custom_digestive_", "")}
                    </button>
                  ))}

                {/* Add custom digestive symptom button */}
                {!showCustomDigestiveSymptomInput && (
                  <button
                    onClick={() => setShowCustomDigestiveSymptomInput(true)}
                    className="py-2 px-4 rounded-full bg-white/80 border border-brand-dark/20 hover:bg-white flex items-center"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add symptom
                  </button>
                )}
              </div>

              {/* Custom digestive symptom input */}
              {showCustomDigestiveSymptomInput && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={customDigestiveSymptom}
                    onChange={(e) => setCustomDigestiveSymptom(e.target.value)}
                    placeholder="Enter symptom name"
                    className="flex-1 p-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                  <button
                    onClick={handleAddCustomDigestiveSymptom}
                    className="py-2 px-4 rounded-lg bg-pink-400 text-white disabled:opacity-50"
                    disabled={!customDigestiveSymptom.trim()}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowCustomDigestiveSymptomInput(false)}
                    className="py-2 px-4 rounded-lg bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="glass-card rounded-2xl p-4 mb-6">
              <h3 className="font-medium mb-2">Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes about your day..."
                className="w-full p-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400 min-h-[100px]"
              />
            </div>

            {/* Save Button */}
            <button onClick={handleSaveLog} className="w-full gradient-button py-4 rounded-full mb-6">
              Save Log
            </button>
          </>
        )}
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
