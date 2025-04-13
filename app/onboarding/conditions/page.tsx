"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Logo from "@/components/Logo"

// List of common autoimmune conditions
const conditionsList = [
  "Hashimoto's Thyroiditis",
  "Graves' Disease",
  "Rheumatoid Arthritis",
  "Lupus (SLE)",
  "Celiac Disease",
  "Crohn's Disease",
  "Ulcerative Colitis",
  "Psoriasis",
  "Multiple Sclerosis",
  "Type 1 Diabetes",
  "Addison's Disease",
  "Sjögren's Syndrome",
  "Ankylosing Spondylitis",
  "Raynaud's Phenomenon",
  "Vasculitis",
  "Pernicious Anemia",
  "Myasthenia Gravis",
  "Guillain-Barré Syndrome",
  "Alopecia Areata",
  "Vitiligo",
  "Scleroderma",
  "Polymyalgia Rheumatica",
  "Fibromyalgia",
  "Chronic Fatigue Syndrome",
  "Irritable Bowel Syndrome",
  "Endometriosis",
  "PCOS",
  "Interstitial Cystitis",
  "Eczema",
  "Asthma",
  "Allergies",
  "Other",
]

// Updated x-axis labels to better reflect the timeline
const chartDates = ["Day 1", "Day 5", "Day 10", "Day 15", "Day 20", "Day 25", "Day 30"]

// Sample symptom tracking data for the chart with more distinct colors
const symptomHistoryData = {
  dates: chartDates,
  symptoms: [], // Will be populated based on user's selected symptoms
}

// Sample wellness data structure
const wellnessHistoryData = {
  dates: chartDates,
  scores: [0, 0, 0, 0, 0, 0, 0], // Will be populated with wellness scores
  color: "#4ade80", // Green color for wellness
  gradient: ["#4ade80", "#4ade8033"],
}

// Interface for logged symptom data
interface LoggedSymptom {
  name: string
  severity: number
  date: string
}

// Interface for logged wellness data
interface LoggedWellness {
  mood?: number
  sleep?: number
  stress?: number
  date: string
}

export default function Dashboard() {
  const router = useRouter()
  const [conditions, setConditions] = useState<string[]>([])
  const [showWelcome, setShowWelcome] = useState(false)
  const [userName, setUserName] = useState("")
  const [currentDate, setCurrentDate] = useState("")
  const [streakDays, setStreakDays] = useState(1)
  const [progress, setProgress] = useState(1)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [userSymptoms, setUserSymptoms] = useState<string[]>([])
  const [hasLoggedSymptoms, setHasLoggedSymptoms] = useState(false)
  const [hasLoggedWellness, setHasLoggedWellness] = useState(false)
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"symptoms" | "wellness">("symptoms")
  const [wellnessScore, setWellnessScore] = useState<number>(0)
  const [symptomData, setSymptomData] = useState<any[]>([])
  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState("")

  // Filter conditions based on search term
  const filteredConditions = conditionsList.filter((condition) =>
    condition.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const toggleCondition = (condition: string) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== condition))
      setError("")
    } else {
      if (selectedConditions.length >= 3) {
        setError("You can select a maximum of 3 conditions")
        return
      }
      setSelectedConditions([...selectedConditions, condition])
      setError("")
    }
  }

  const handleContinue = () => {
    if (selectedConditions.length === 0) {
      setError("Please select at least 1 condition to continue")
      return
    }

    // Save to local storage for now (in a real app, you'd save to a database)
    localStorage.setItem("userConditions", JSON.stringify(selectedConditions))

    // Navigate to the next step in the onboarding flow
    router.push("/onboarding/symptoms")
  }

  // Function to handle symptom selection
  const handleSymptomSelect = (symptomName: string) => {
    if (selectedSymptom === symptomName) {
      setSelectedSymptom(null) // Deselect if already selected
    } else {
      setSelectedSymptom(symptomName) // Select the symptom
    }
  }

  // Function to calculate wellness score (1-100) based on mood, sleep, and stress
  const calculateWellnessScore = (mood?: number, sleep?: number, stress?: number): number => {
    let score = 50 // Default middle score
    let factors = 0

    // Mood is 1-5 where 5 is best
    if (mood) {
      // Convert 1-5 scale to 0-100 (where 5 = 100, 1 = 0)
      score += ((mood - 1) / 4) * 25
      factors++
    }

    // Sleep is 1-5 where 5 is best
    if (sleep) {
      // Convert 1-5 scale to 0-100 (where 5 = 100, 1 = 0)
      score += ((sleep - 1) / 4) * 25
      factors++
    }

    // Stress is 1-5 where 1 is best (no stress)
    if (stress) {
      // Convert 1-5 scale to 0-100 (where 1 = 100, 5 = 0)
      score += ((5 - stress) / 4) * 25
      factors++
    }

    // If no factors were provided, return default score
    if (factors === 0) return 50

    // Return the average score
    return Math.round(score / factors)
  }

  useEffect(() => {
    // Format current date
    const date = new Date()
    const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }
    setCurrentDate(date.toLocaleDateString("en-US", options))

    // Check if this is the first time loading the dashboard after onboarding
    const isFirstLoad = sessionStorage.getItem("dashboardFirstLoad") !== "false"

    if (typeof window !== "undefined") {
      // Get diet timeline data
      const dietTimeline = localStorage.getItem("userDietTimeline")
      const startDate = localStorage.getItem("dietStartDate")

      // Get streak days from localStorage or calculate it
      const savedStreakDays = localStorage.getItem("streakDays")

      // If no start date is set, this is a new user - set it now
      if (!startDate) {
        localStorage.setItem("dietStartDate", new Date().toISOString())
      }

      // Calculate days elapsed since diet start
      const daysElapsed = startDate
        ? Math.floor((new Date().getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0

      // Set streak to saved value, days elapsed, or 1 for new users (minimum 1 day)
      setStreakDays(savedStreakDays ? Number.parseInt(savedStreakDays, 10) : Math.max(daysElapsed, 1))

      // Calculate progress percentage
      const totalDays = dietTimeline ? Number.parseInt(dietTimeline) : 30
      const progressPercentage = totalDays > 0 ? Math.min(Math.round((daysElapsed / totalDays) * 100), 100) : 1

      // Set progress to calculated value or 1% for new users
      setProgress(progressPercentage > 0 ? progressPercentage : 1)

      if (isFirstLoad) {
        setShowWelcome(true)
        sessionStorage.setItem("dashboardFirstLoad", "false")

        // Get user account info if available
        const accountInfo = JSON.parse(localStorage.getItem("userAccount") || "{}")
        if (accountInfo && accountInfo.name) {
          setUserName(accountInfo.name)
        }
      }

      // Retrieve the saved conditions from local storage
      const savedConditions = localStorage.getItem("userConditions")
      if (savedConditions) {
        setConditions(JSON.parse(savedConditions))
      }

      // Check if user has logged symptoms
      const loggedSymptomsStr = localStorage.getItem("loggedSymptoms")
      const hasLogged = !!loggedSymptomsStr && loggedSymptomsStr !== "[]"
      setHasLoggedSymptoms(hasLogged)

      // Retrieve the saved symptoms from local storage
      const savedSymptoms = localStorage.getItem("userSymptoms")
      if (savedSymptoms) {
        const parsedSymptoms = JSON.parse(savedSymptoms)
        setUserSymptoms(parsedSymptoms)

        // Create a new array with only the user's selected symptoms
        const userSymptomData = []

        // Define colors for the symptoms
        const colors = ["#38bdf8", "#2dd4bf", "#4ade80", "#a78bfa", "#fb7185"]

        // Get logged symptoms if available
        const loggedSymptoms: LoggedSymptom[] = loggedSymptomsStr ? JSON.parse(loggedSymptomsStr) : []

        // Generate data for each symptom
        parsedSymptoms.forEach((symptomName: string, index: number) => {
          // Find the logged severity for this symptom
          const loggedSymptom = loggedSymptoms.find((s) => s.name === symptomName)

          // For new users with no logs, use empty values
          // For users with logs, show the logged severity at Day 1 and empty for other days
          const values = [0, 0, 0, 0, 0, 0, 0]

          // If we have a logged symptom, set the first value (Day 1) to the logged severity
          if (loggedSymptom) {
            values[0] = loggedSymptom.severity // Set the first point (Day 1) to the logged severity
          }

          const colorIndex = index % colors.length
          userSymptomData.push({
            name: symptomName,
            values: values,
            color: colors[colorIndex],
            gradient: [colors[colorIndex], colors[colorIndex] + "33"],
          })
        })

        // Replace the sample data with user's data
        setSymptomData(userSymptomData)
      }

      // Process wellness data
      const loggedDayStr = localStorage.getItem("loggedDay")
      if (loggedDayStr) {
        try {
          const loggedDay = JSON.parse(loggedDayStr)
          setHasLoggedWellness(true)

          // Calculate wellness score from the logged data
          const score = calculateWellnessScore(loggedDay.mood, loggedDay.sleep, loggedDay.stress)

          setWellnessScore(score)

          // Update the wellness history data
          const updatedScores = [...wellnessHistoryData.scores]
          updatedScores[0] = score
          wellnessHistoryData.scores = updatedScores
        } catch (e) {
          console.error("Error parsing logged day data:", e)
        }
      }
    }
  }, [])

  const handleCloseWelcome = () => {
    setShowWelcome(false)
  }

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" })
  }

  // Generate dates for the date picker
  const generateDates = () => {
    const dates = []
    const today = new Date()

    // Add 3 days before today
    for (let i = 3; i > 0; i--) {
      const date = new Date()
      date.setDate(today.getDate() - i)
      dates.push(date)
    }

    // Add today
    dates.push(today)

    // Add 3 days after today
    for (let i = 1; i <= 3; i++) {
      const date = new Date()
      date.setDate(today.getDate() + i)
      dates.push(date)
    }

    return dates
  }

  const dates = generateDates()

  // Function to create smooth curve path
  const createSmoothCurvePath = (values: number[]) => {
    const points = values.map((value, i) => {
      const x = (i / (values.length - 1)) * 100
      // Invert the y value since SVG 0,0 is top-left
      const y = 100 - (value / 5) * 100
      return { x, y }
    })

    let path = `M ${points[0].x},${points[0].y}`

    for (let i = 0; i < points.length - 1; i++) {
      const x1 = points[i].x + (points[i + 1].x - points[i].x) / 3
      const y1 = points[i].y
      const x2 = points[i].x + (2 * (points[i + 1].x - points[i].x)) / 3
      const y2 = points[i + 1].y
      path += ` C ${x1},${y1} ${x2},${y2} ${points[i + 1].x},${points[i + 1].y}`
    }

    return path
  }

  // Function to create wellness curve path (scaled for 0-100)
  const createWellnessCurvePath = (values: number[]) => {
    const points = values.map((value, i) => {
      const x = (i / (values.length - 1)) * 100
      // Invert the y value since SVG 0,0 is top-left
      // Scale from 0-100 to 0-100% of chart height
      const y = 100 - value
      return { x, y }
    })

    let path = `M ${points[0].x},${points[0].y}`

    for (let i = 0; i < points.length - 1; i++) {
      const x1 = points[i].x + (points[i + 1].x - points[i].x) / 3
      const y1 = points[i].y
      const x2 = points[i].x + (2 * (points[i + 1].x - points[i].x)) / 3
      const y2 = points[i + 1].y
      path += ` C ${x1},${y1} ${x2},${y2} ${points[i + 1].x},${points[i + 1].y}`
    }

    return path
  }

  // Function to create area path (for filled area below the line)
  const createAreaPath = (values: number[]) => {
    const linePath = createSmoothCurvePath(values)
    const lastPoint = values.length - 1
    const lastX = 100 // 100% width
    const firstX = 0 // 0% width

    // Add line to bottom right, then to bottom left, then close path
    return `${linePath} L ${lastX},100 L ${firstX},100 Z`
  }

  // Function to create wellness area path (for filled area below the line)
  const createWellnessAreaPath = (values: number[]) => {
    const linePath = createWellnessCurvePath(values)
    const lastPoint = values.length - 1
    const lastX = 100 // 100% width
    const firstX = 0 // 0% width

    // Add line to bottom right, then to bottom left, then close path
    return `${linePath} L ${lastX},100 L ${firstX},100 Z`
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Welcome Overlay */}
      {showWelcome && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="glass-card p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2 text-primary-color">Welcome to IMMU!</h2>
              <p className="text-secondary-color">
                Your profile is complete and your personalized AIP journey is ready.
              </p>
            </div>

            {conditions.length > 0 && (
              <div className="mb-6">
                <p className="font-medium mb-2 text-primary-color">Your Conditions:</p>
                <div className="flex flex-wrap gap-2">
                  {conditions.map((condition, index) => (
                    <span key={index} className="bg-[#f0eaf9] text-primary-color px-3 py-1 rounded-full text-sm">
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="mb-6 text-secondary-color">
              {userName ? `Welcome, ${userName}! ` : "Welcome! "}
              We've created your personalized plan based on your selections. Track your symptoms and progress right from
              your dashboard.
            </p>

            <button onClick={handleCloseWelcome} className="w-full gradient-button py-3 rounded-full">
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="p-4 flex justify-center items-center bg-brand-dark text-white">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Your Conditions</h2>
            <p className="text-brand-dark/70">Select up to 3 conditions you're managing.</p>
          </div>

          {/* Selected conditions count */}
          <div className="text-center mb-4">
            <p>{selectedConditions.length} of 3 conditions selected</p>
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
              placeholder="Search conditions..."
              className="w-full p-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
            />
          </div>

          {/* Conditions grid */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {filteredConditions.map((condition) => (
              <button
                key={condition}
                onClick={() => toggleCondition(condition)}
                className={`p-3 rounded-xl text-center transition-colors ${
                  selectedConditions.includes(condition) ? "bg-pink-400 text-white" : "glass-card hover:bg-white"
                }`}
              >
                {condition}
              </button>
            ))}
          </div>

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
          <div className="w-2 h-2 rounded-full bg-brand-dark/30"></div>
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
