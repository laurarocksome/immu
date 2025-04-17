"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  List,
  Home,
  Plus,
  BookOpen,
  UtensilsCrossed,
  User,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  LightbulbIcon,
  HelpCircle,
  ExternalLink,
  Scale,
  Check,
} from "lucide-react"
import Logo from "@/components/Logo"

// Update the chart dates to show daily data
const chartDates = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"]

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
  onPeriod?: boolean
  periodSymptoms?: string[]
  digestiveSymptoms?: string[]
}

// Interface for user profile data
interface UserProfile {
  gender: string
  age: number
  weight: number
  weightUnit: "kg" | "lb"
  height: number
  heightUnit: string
  weightHistory?: Array<{ date: string; weight: number }>
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
  const [loggedPeriodSymptoms, setLoggedPeriodSymptoms] = useState<string[]>([])
  const [loggedDigestiveSymptoms, setLoggedDigestiveSymptoms] = useState<string[]>([])
  const [isOnPeriod, setIsOnPeriod] = useState<boolean>(false)

  // Weight tracking states
  const [currentWeight, setCurrentWeight] = useState<string>("")
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isUpdatingWeight, setIsUpdatingWeight] = useState(false)
  const [weightUpdateSuccess, setWeightUpdateSuccess] = useState(false)

  // Function to handle symptom selection
  const handleSymptomSelect = (symptomName: string) => {
    if (selectedSymptom === symptomName) {
      setSelectedSymptom(null) // Deselect if already selected
    } else {
      setSelectedSymptom(symptomName) // Select the symptom
    }
  }

  // Function to calculate wellness score (1-100) based on mood, sleep, stress, and symptoms
  const calculateWellnessScore = (
    mood?: number,
    sleep?: number,
    stress?: number,
    symptoms?: { name: string; severity: number }[],
  ): number => {
    let totalScore = 0
    let factors = 0

    // Mood is 1-5 where 5 is best
    if (mood !== undefined) {
      // Convert 1-5 scale to 0-100 (where 5 = 100, 1 = 0)
      totalScore += ((mood - 1) / 4) * 100
      factors++
    }

    // Sleep is 1-5 where 5 is best
    if (sleep !== undefined) {
      // Convert 1-5 scale to 0-100 (where 5 = 100, 1 = 0)
      totalScore += ((sleep - 1) / 4) * 100
      factors++
    }

    // Stress is 1-5 where 1 is best (no stress)
    if (stress !== undefined) {
      // Convert 1-5 scale to 0-100 (where 1 = 100, 5 = 0)
      totalScore += ((5 - stress) / 4) * 100
      factors++
    }

    // Include symptoms in the calculation (if provided)
    if (symptoms && symptoms.length > 0) {
      const validSymptoms = symptoms.filter((s) => s.severity > 0)
      if (validSymptoms.length > 0) {
        const totalSeverity = validSymptoms.reduce((sum, s) => sum + s.severity, 0)
        const avgSeverity = totalSeverity / validSymptoms.length
        totalScore += ((5 - avgSeverity) / 4) * 100
        factors++
      }
    }

    // If no factors were provided, return middle score
    if (factors === 0) return 50

    // Return the average score
    return Math.round(totalScore / factors)
  }

  // Function to get period symptom name (handles custom symptoms)
  const getPeriodSymptomName = (symptomId: string) => {
    if (symptomId.startsWith("custom_")) {
      return symptomId.replace("custom_", "")
    }

    // Default period symptoms mapping
    const periodSymptoms = [
      { id: "menstrual_cramps", name: "Menstrual Cramps" },
      { id: "headaches", name: "Headaches or Migraines" },
      { id: "breast_tenderness", name: "Breast Tenderness" },
      { id: "lower_back_pain", name: "Lower Back Pain" },
      { id: "muscle_aches", name: "Muscle Aches" },
      { id: "joint_pain", name: "Joint Pain" },
    ]

    const symptom = periodSymptoms.find((s) => s.id === symptomId)
    return symptom ? symptom.name : symptomId
  }

  // Function to get digestive symptom name (handles custom symptoms)
  const getDigestiveSymptomName = (symptomId: string) => {
    if (symptomId.startsWith("custom_digestive_")) {
      return symptomId.replace("custom_digestive_", "")
    }

    // Default digestive symptoms mapping
    const digestiveSymptoms = [
      { id: "nauseous", name: "Nauseous" },
      { id: "bloated", name: "Bloated" },
      { id: "gassy", name: "Gassy" },
      { id: "heartburn", name: "Heartburn" },
      { id: "ok", name: "OK" },
    ]

    const symptom = digestiveSymptoms.find((s) => s.id === symptomId)
    return symptom ? symptom.name : symptomId
  }

  // Function to load and process symptom data
  const loadSymptomData = () => {
    if (typeof window === "undefined") return

    // Get logged symptoms from localStorage
    const loggedSymptomsStr = localStorage.getItem("loggedSymptoms")
    const hasLogged = !!loggedSymptomsStr && loggedSymptomsStr !== "[]"
    setHasLoggedSymptoms(hasLogged)

    // Parse logged symptoms
    const loggedSymptoms: LoggedSymptom[] = loggedSymptomsStr ? JSON.parse(loggedSymptomsStr) : []

    // If we have logged symptoms but no user symptoms set, extract them from logged symptoms
    if (loggedSymptoms.length > 0 && userSymptoms.length === 0) {
      const symptomNames = [...new Set(loggedSymptoms.map((s) => s.name))]
      setUserSymptoms(symptomNames)

      // Save to localStorage for consistency
      localStorage.setItem("userSymptoms", JSON.stringify(symptomNames))
    }

    // Define colors for the symptoms
    const colors = ["#38bdf8", "#2dd4bf", "#4ade80", "#a78bfa", "#fb7185"]

    // Get the symptoms to display (either from user preferences or from logged symptoms)
    const symptomsToDisplay = userSymptoms.length > 0 ? userSymptoms : [...new Set(loggedSymptoms.map((s) => s.name))]

    // Create symptom data for chart
    const userSymptomData = symptomsToDisplay.map((symptomName, index) => {
      // Find the logged severity for this symptom
      const loggedSymptom = loggedSymptoms.find((s) => s.name === symptomName)

      // For new users with no logs, use empty values
      // For users with logs, show the logged severity at Day 1 and empty for other days
      const values = [0, 0, 0, 0, 0, 0, 0]

      // If we have a logged symptom, set the first value (Day 1) to the logged severity
      if (loggedSymptom) {
        values[0] = loggedSymptom.severity
      }

      const colorIndex = index % colors.length
      return {
        name: symptomName,
        values: values,
        color: colors[colorIndex],
        gradient: [colors[colorIndex], colors[colorIndex] + "33"],
      }
    })

    // Update symptom data state
    setSymptomData(userSymptomData)
  }

  // Function to load user profile data
  const loadUserProfile = () => {
    if (typeof window === "undefined") return

    const profileData = localStorage.getItem("userProfile")
    if (profileData) {
      const profile = JSON.parse(profileData) as UserProfile
      setUserProfile(profile)
      setWeightUnit(profile.weightUnit)

      // Set current weight from profile
      if (profile.weight) {
        setCurrentWeight(profile.weight.toString())
      }
    }
  }

  // Function to update user weight
  const updateWeight = () => {
    if (!currentWeight || isNaN(Number(currentWeight)) || Number(currentWeight) <= 0) {
      return
    }

    setIsUpdatingWeight(true)

    // Get current profile data
    const profileData = localStorage.getItem("userProfile")
    if (profileData) {
      const profile = JSON.parse(profileData) as UserProfile

      // Update weight
      profile.weight = Number(currentWeight)
      profile.weightUnit = weightUnit

      // Add to weight history if it doesn't exist
      if (!profile.weightHistory) {
        profile.weightHistory = []
      }

      // Add current weight to history
      profile.weightHistory.push({
        date: new Date().toISOString(),
        weight: Number(currentWeight),
      })

      // Save updated profile
      localStorage.setItem("userProfile", JSON.stringify(profile))
      setUserProfile(profile)

      // Show success message
      setWeightUpdateSuccess(true)
      setTimeout(() => {
        setWeightUpdateSuccess(false)
        setIsUpdatingWeight(false)
      }, 2000)
    } else {
      setIsUpdatingWeight(false)
    }
  }

  useEffect(() => {
    // Format current date
    const date = new Date()
    const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }
    setCurrentDate(date.toLocaleDateString("en-US", options))

    // Check if this is the first time loading the dashboard after onboarding
    const isFirstLoad = sessionStorage.getItem("dashboardFirstLoad") !== "false"

    if (typeof window !== "undefined") {
      // Load user profile data
      loadUserProfile()

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

      // Retrieve the saved symptoms from local storage
      const savedSymptoms = localStorage.getItem("userSymptoms")
      if (savedSymptoms) {
        const parsedSymptoms = JSON.parse(savedSymptoms)
        setUserSymptoms(parsedSymptoms)
      }

      // Load symptom data
      loadSymptomData()

      // Process wellness data
      const loggedDayStr = localStorage.getItem("loggedDay")
      const loggedSymptomsStr = localStorage.getItem("loggedSymptoms")

      if (loggedDayStr) {
        try {
          const loggedDay = JSON.parse(loggedDayStr)
          setHasLoggedWellness(true)

          // Get logged symptoms if available
          const loggedSymptoms: LoggedSymptom[] = loggedSymptomsStr ? JSON.parse(loggedSymptomsStr) : []

          // Calculate wellness score from the logged data
          const score = calculateWellnessScore(loggedDay.mood, loggedDay.sleep, loggedDay.stress, loggedSymptoms)

          setWellnessScore(score)

          // Update the wellness history data
          const updatedScores = [...wellnessHistoryData.scores]
          updatedScores[0] = score
          wellnessHistoryData.scores = updatedScores

          // Store period data
          if (loggedDay.onPeriod === true) {
            setIsOnPeriod(true)
            if (loggedDay.periodSymptoms && Array.isArray(loggedDay.periodSymptoms)) {
              setLoggedPeriodSymptoms(loggedDay.periodSymptoms)
            }
          }

          // Store digestive symptoms
          if (loggedDay.digestiveSymptoms && Array.isArray(loggedDay.digestiveSymptoms)) {
            setLoggedDigestiveSymptoms(loggedDay.digestiveSymptoms)
          }
        } catch (e) {
          console.error("Error parsing logged day data:", e)
        }
      }
    }
  }, [])

  // Add an effect to reload symptom data when the component is focused
  useEffect(() => {
    // Function to handle when the window gets focus
    const handleFocus = () => {
      loadSymptomData()
      loadUserProfile()
    }

    // Add event listener for focus
    window.addEventListener("focus", handleFocus)

    // Clean up
    return () => {
      window.removeEventListener("focus", handleFocus)
    }
  }, [userSymptoms]) // Re-run when userSymptoms changes

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

  // Function to get digestive symptom tip
  const getDigestiveSymptomTip = (symptomId: string) => {
    switch (symptomId) {
      case "nauseous":
        return {
          tip: "If you feel nauseous, try increasing healthy fats, check for food sensitivities, and stay hydrated.",
          link: "/faq#digestive-nauseous",
        }
      case "bloated":
        return {
          tip: "Bloating may be caused by too much fiber, fermented foods, coconut, or stress. Try adjusting your diet.",
          link: "/faq#digestive-bloated",
        }
      case "gassy":
        return {
          tip: "Gas can be caused by fiber, coconut, large portions, or cruciferous vegetables. Try cooking vegetables well.",
          link: "/faq#digestive-gassy",
        }
      case "heartburn":
        return {
          tip: "Heartburn may be triggered by high-fat foods, large portions, or eating too close to bedtime.",
          link: "/faq#digestive-heartburn",
        }
      default:
        return null
    }
  }

  // Function to generate daily observations based on logged symptoms
  const generateDailyObservations = () => {
    // If no symptoms are logged, return null
    if (!hasLoggedSymptoms && !hasLoggedWellness) {
      return null
    }

    // If no period or digestive symptoms are logged, return empty array
    if (loggedPeriodSymptoms.length === 0 && loggedDigestiveSymptoms.length === 0 && !isOnPeriod) {
      return []
    }

    const observations = []

    // Add period-related observations
    if (isOnPeriod) {
      if (loggedPeriodSymptoms.length > 0) {
        const symptomNames = loggedPeriodSymptoms.map(getPeriodSymptomName).join(", ")
        observations.push(`Your period symptoms (${symptomNames}) may affect your overall wellness score today.`)
      } else {
        observations.push("You're on your period today, which may affect your energy levels and comfort.")
      }
    }

    // Add digestive-related observations
    if (loggedDigestiveSymptoms.length > 0) {
      // Filter out "OK" if it exists
      const relevantSymptoms = loggedDigestiveSymptoms.filter((s) => s !== "ok")

      if (relevantSymptoms.length > 0) {
        // Add general observation about digestive symptoms
        const symptomNames = relevantSymptoms.map(getDigestiveSymptomName).join(", ")
        observations.push(`Your digestive symptoms (${symptomNames}) may be related to recent dietary changes.`)

        // Add specific tips for each digestive symptom
        relevantSymptoms.forEach((symptomId) => {
          const tipInfo = getDigestiveSymptomTip(symptomId)
          if (tipInfo) {
            observations.push({
              text: tipInfo.tip,
              link: tipInfo.link,
              linkText: "Learn more",
            })
          }
        })
      }
    }

    // Add a general observation about wellness if we have a score
    if (wellnessScore > 0) {
      if (wellnessScore >= 75) {
        observations.push("Your wellness score is excellent today! Keep up the good habits.")
      } else if (wellnessScore >= 50) {
        observations.push("Your wellness score is good. Consider focusing on sleep quality to improve further.")
      } else {
        observations.push("Your wellness score indicates you might benefit from stress reduction techniques today.")
      }
    }

    return observations
  }

  // Get the observations
  const dailyObservations = generateDailyObservations()

  return (
    <div className="min-h-screen app-gradient flex flex-col">
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
      <header className="p-4 flex justify-between items-center header-gradient text-white">
        <Logo />
        <div className="flex items-center">
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors mr-2"
            onClick={() => router.push("/faq")}
            aria-label="FAQ"
          >
            <HelpCircle className="h-5 w-5 text-white" />
          </button>
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
            onClick={handleProfileClick}
            aria-label="Profile"
          >
            <User className="h-5 w-5 text-white" />
          </button>
        </div>
      </header>
      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Date and Greeting */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-primary-color">Hello!</h2>
          <p className="text-secondary-color">{currentDate}</p>
        </div>

        {/* Date Picker and Streak in one row */}
        <div className="flex flex-row gap-4 mb-6 overflow-x-auto">
          {/* Date Picker */}
          <div className="glass-card p-4 flex items-center justify-between min-w-[200px]">
            <button
              onClick={() => {
                const prevDate = new Date(selectedDate)
                prevDate.setDate(prevDate.getDate() - 1)
                setSelectedDate(prevDate)
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-primary-color shadow-sm"
              aria-label="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex flex-col items-center">
              <span className="text-sm font-medium text-secondary-color">
                {selectedDate.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="text-2xl font-bold text-primary-color">{selectedDate.getDate()}</span>
              <span className="text-xs text-secondary-color">
                {selectedDate.toLocaleDateString("en-US", { month: "short" })}
              </span>
            </div>

            <button
              onClick={() => {
                const nextDate = new Date(selectedDate)
                nextDate.setDate(nextDate.getDate() + 1)
                setSelectedDate(nextDate)
              }}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-primary-color shadow-sm"
              aria-label="Next day"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Streak Card */}
          <div className="glass-card p-4 min-w-[120px]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm text-secondary-color">Streak</h3>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Active</span>
            </div>
            <div className="flex items-end">
              <p className="text-2xl font-bold text-primary-color">{streakDays}</p>
              <p className="ml-1 text-sm text-secondary-color">days</p>
            </div>
          </div>
        </div>

        {/* Calendar Section */}
        <div className="glass-card p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-primary-color">Calendar</h3>
            <button className="text-accent-color text-sm flex items-center" onClick={() => router.push("/calendar")}>
              View Calendar
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          <div className="flex items-center justify-between">
            {typeof window !== "undefined" && (
              <>
                <div className="text-center">
                  {(() => {
                    // Get diet data from localStorage
                    const adaptationChoice = localStorage.getItem("userAdaptationChoice")
                    const hasAdaptation = adaptationChoice === "Yes"
                    const startDate = localStorage.getItem("dietStartDate")
                    const dietStartDate = startDate ? new Date(startDate) : new Date()
                    const dietTimeline = localStorage.getItem("userDietTimeline")
                    const totalSelectedDays = dietTimeline ? Number.parseInt(dietTimeline) : 30

                    // Calculate days for each phase
                    const adaptationDays = hasAdaptation ? 28 : 0
                    const eliminationDays = hasAdaptation ? totalSelectedDays - adaptationDays : totalSelectedDays

                    // Calculate days elapsed since diet start
                    const today = new Date()
                    const daysElapsed = Math.floor((today.getTime() - dietStartDate.getTime()) / (1000 * 60 * 60 * 24))

                    // Determine current phase
                    let currentPhase = "adaptation"
                    let daysRemaining = 0

                    if (hasAdaptation && daysElapsed < adaptationDays) {
                      // In adaptation phase
                      currentPhase = "adaptation"
                      daysRemaining = adaptationDays - daysElapsed
                    } else if (daysElapsed < (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays)) {
                      // In elimination phase
                      currentPhase = "elimination"
                      const eliminationDaysElapsed = daysElapsed - (hasAdaptation ? adaptationDays : 0)
                      daysRemaining = eliminationDays - eliminationDaysElapsed
                    } else {
                      // In reintroduction phase
                      currentPhase = "reintroduction"
                      const reintroductionDays = 150 // 5 months
                      const reintroductionDaysElapsed =
                        daysElapsed - (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays)
                      daysRemaining = Math.max(reintroductionDays - reintroductionDaysElapsed, 0)
                    }

                    return (
                      <>
                        <p className="text-sm text-secondary-color">
                          {currentPhase === "adaptation"
                            ? "Adaptation Phase"
                            : currentPhase === "elimination"
                              ? "Elimination Phase"
                              : "Reintroduction Phase"}
                        </p>
                        <p className="font-bold text-primary-color">{daysRemaining} days left</p>
                      </>
                    )
                  })()}
                </div>

                <div className="relative w-32">
                  <div className="h-2 bg-[#e4e0f0] rounded-full">
                    <div className="h-2 bg-[#da83d2] rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="absolute -top-5 right-0 text-xs font-medium text-primary-color">{progress}%</div>
                </div>

                <div className="text-center">
                  <p className="text-sm text-secondary-color">
                    {(() => {
                      // Get diet data from localStorage
                      const adaptationChoice = localStorage.getItem("userAdaptationChoice")
                      const hasAdaptation = adaptationChoice === "Yes"
                      const startDate = localStorage.getItem("dietStartDate")
                      const dietStartDate = startDate ? new Date(startDate) : new Date()
                      const dietTimeline = localStorage.getItem("userDietTimeline")
                      const totalSelectedDays = dietTimeline ? Number.parseInt(dietTimeline) : 30

                      // Calculate days for each phase
                      const adaptationDays = hasAdaptation ? 28 : 0
                      const eliminationDays = totalSelectedDays - adaptationDays

                      // Calculate days elapsed since diet start
                      const today = new Date()
                      const daysElapsed = Math.floor(
                        (today.getTime() - dietStartDate.getTime()) / (1000 * 60 * 60 * 24),
                      )

                      // Determine current phase
                      let currentPhase = "adaptation"
                      let nextPhase = "elimination"

                      if (hasAdaptation && daysElapsed < adaptationDays) {
                        // In adaptation phase
                        currentPhase = "adaptation"
                        nextPhase = "elimination"
                      } else if (daysElapsed < (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays)) {
                        // In elimination phase
                        currentPhase = "elimination"
                        nextPhase = "reintroduction"
                      } else {
                        // In reintroduction phase
                        currentPhase = "reintroduction"
                        nextPhase = "completed"
                      }

                      return nextPhase === "completed"
                        ? "Diet Completion"
                        : `${nextPhase.charAt(0).toUpperCase() + nextPhase.slice(1)}`
                    })()}
                  </p>
                  <p className="font-bold text-primary-color">
                    {(() => {
                      // Get diet data from localStorage
                      const adaptationChoice = localStorage.getItem("userAdaptationChoice")
                      const hasAdaptation = adaptationChoice === "Yes"
                      const startDate = localStorage.getItem("dietStartDate")
                      const dietStartDate = startDate ? new Date(startDate) : new Date()
                      const dietTimeline = localStorage.getItem("userDietTimeline")
                      const totalSelectedDays = dietTimeline ? Number.parseInt(dietTimeline) : 30

                      // Calculate days for each phase
                      const adaptationDays = hasAdaptation ? 28 : 0
                      const eliminationDays = totalSelectedDays - adaptationDays

                      // Calculate days elapsed since diet start
                      const today = new Date()
                      const daysElapsed = Math.floor(
                        (today.getTime() - dietStartDate.getTime()) / (1000 * 60 * 60 * 24),
                      )

                      // Determine current phase and calculate next phase date
                      const nextPhaseDate = new Date(dietStartDate)

                      if (hasAdaptation && daysElapsed < adaptationDays) {
                        // In adaptation phase, next is elimination
                        nextPhaseDate.setDate(nextPhaseDate.getDate() + adaptationDays)
                      } else if (daysElapsed < (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays)) {
                        // In elimination phase, next is reintroduction
                        nextPhaseDate.setDate(
                          nextPhaseDate.getDate() +
                            (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays),
                        )
                      } else {
                        // In reintroduction phase, next is completion
                        const reintroductionDays = 150 // 5 months
                        nextPhaseDate.setDate(
                          nextPhaseDate.getDate() +
                            (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays) +
                            reintroductionDays,
                        )
                      }

                      return nextPhaseDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    })()}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Chart Tabs */}
        <div className="glass-card p-6 mb-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#e4e0f0] mb-4">
            <button
              onClick={() => setActiveTab("symptoms")}
              className={`pb-2 px-4 font-medium text-lg transition-colors ${
                activeTab === "symptoms"
                  ? "border-b-2 border-[#38bdf8] text-[#38bdf8]"
                  : "text-secondary-color hover:text-primary-color"
              }`}
            >
              Symptom Improvement
            </button>
            <button
              onClick={() => setActiveTab("wellness")}
              className={`pb-2 px-4 font-medium text-lg transition-colors ${
                activeTab === "wellness"
                  ? "border-b-2 border-[#4ade80] text-[#4ade80]"
                  : "text-secondary-color hover:text-primary-color"
              }`}
            >
              Wellness Score
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium text-xl text-[#38bdf8]">
              {activeTab === "symptoms" ? "Symptom Improvement" : "Wellness Score"}
            </h3>
            <button className="text-accent-color text-sm flex items-center" onClick={() => router.push("/log-day")}>
              Log Day
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {/* Symptom Chart */}
          {activeTab === "symptoms" && (
            <>
              {/* Chart Container */}
              <div className="h-64 relative mb-8 bg-white rounded-lg shadow-sm">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-secondary-color py-4">
                  <span>Severe</span>
                  <span>Moderate</span>
                  <span>Mild</span>
                  <span>Very mild</span>
                  <span>None</span>
                </div>

                {/* Vertical grid lines */}
                <div className="absolute left-12 right-0 top-0 bottom-0 flex justify-between">
                  {symptomHistoryData.dates.map((date, index) => (
                    <div
                      key={index}
                      className="h-full border-r border-[#f0eaf9] flex flex-col justify-end items-center"
                      style={{ width: `${100 / symptomHistoryData.dates.length}%` }}
                    >
                      <span className="text-xs text-secondary-color mb-2">{date}</span>
                    </div>
                  ))}
                </div>

                {/* Chart area */}
                <div className="absolute left-12 right-0 top-0 bottom-8 px-4 pt-4">
                  {/* Only show the selected symptom or all if none selected */}
                  {symptomData.map((symptom, index) => {
                    // Only render if this is the selected symptom or no selection
                    if (selectedSymptom !== null && selectedSymptom !== symptom.name) {
                      return null
                    }

                    return (
                      <svg
                        key={index}
                        className="absolute inset-0 h-full w-full transition-opacity duration-300"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        {/* Filled area */}
                        <defs>
                          <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={symptom.gradient[0]} />
                            <stop offset="100%" stopColor={symptom.gradient[1]} />
                          </linearGradient>
                        </defs>

                        {/* Area fill */}
                        <path d={createAreaPath(symptom.values)} fill={`url(#gradient-${index})`} opacity="0.8" />

                        {/* Line on top */}
                        <path
                          d={createSmoothCurvePath(symptom.values)}
                          fill="none"
                          stroke={symptom.color}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />

                        {/* Add dots for data points */}
                        {symptom.values.map((value, i) => {
                          if (value === 0) return null // Don't show dots for zero values

                          const x = (i / (symptom.values.length - 1)) * 100
                          const y = 100 - (value / 5) * 100

                          return (
                            <circle key={i} cx={x} cy={y} r="3" fill="white" stroke={symptom.color} strokeWidth="2" />
                          )
                        })}
                      </svg>
                    )
                  })}
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-4">
                {symptomData.slice(0, 5).map((symptom, index) => (
                  <button
                    key={index}
                    className={`flex items-center transition-opacity duration-200 ${
                      selectedSymptom !== null && selectedSymptom !== symptom.name ? "opacity-50" : "opacity-100"
                    }`}
                    onClick={() => handleSymptomSelect(symptom.name)}
                  >
                    <div
                      className={`w-3 h-3 rounded-full mr-2 ${
                        selectedSymptom === symptom.name ? "ring-2 ring-offset-2 ring-[#e4e0f0]" : ""
                      }`}
                      style={{ backgroundColor: symptom.color }}
                    ></div>
                    <span className="text-sm text-primary-color">{symptom.name}</span>
                  </button>
                ))}
              </div>

              {/* Message for users who haven't logged symptoms yet */}
              {!hasLoggedSymptoms && userSymptoms.length > 0 && (
                <div className="mt-4 text-center text-sm text-secondary-color p-2 bg-[#f0eaf9] rounded-lg">
                  Log your first day to start tracking your symptom improvement over time.
                </div>
              )}
            </>
          )}

          {/* Wellness Chart */}
          {activeTab === "wellness" && (
            <>
              {/* Chart Container */}
              <div className="h-64 relative mb-8 bg-white rounded-lg shadow-sm">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-secondary-color py-4">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>

                {/* Vertical grid lines */}
                <div className="absolute left-12 right-0 top-0 bottom-0 flex justify-between">
                  {wellnessHistoryData.dates.map((date, index) => {
                    // Check if this date has a period logged
                    // For the first day (index 0), we'll use the current logged data
                    const hasPeriod =
                      index === 0
                        ? (() => {
                            try {
                              const loggedDay = JSON.parse(localStorage.getItem("loggedDay") || "{}")
                              return loggedDay.onPeriod === true
                            } catch (e) {
                              return false
                            }
                          })()
                        : false // For demo purposes, only show for the first day

                    return (
                      <div
                        key={index}
                        className="h-full border-r border-[#f0eaf9] flex flex-col justify-end items-center relative group"
                        style={{ width: `${100 / wellnessHistoryData.dates.length}%` }}
                      >
                        <span
                          className={`text-xs mb-2 ${
                            hasPeriod ? "text-red-500 font-semibold" : "text-secondary-color"
                          }`}
                        >
                          {date}
                        </span>

                        {/* Tooltip */}
                        {hasPeriod && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white rounded shadow-md text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
                            Period logged on this day
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Chart area */}
                <div className="absolute left-12 right-0 top-0 bottom-8 px-4 pt-4">
                  {/* Wellness curve */}
                  <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Filled area */}
                    <defs>
                      <linearGradient id="wellness-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={wellnessHistoryData.gradient[0]} />
                        <stop offset="100%" stopColor={wellnessHistoryData.gradient[1]} />
                      </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <path
                      d={createWellnessAreaPath(wellnessHistoryData.scores)}
                      fill="url(#wellness-gradient)"
                      opacity="0.8"
                    />

                    {/* Line on top */}
                    <path
                      d={createWellnessCurvePath(wellnessHistoryData.scores)}
                      fill="none"
                      stroke={wellnessHistoryData.color}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Add dots for data points */}
                    {wellnessHistoryData.scores.map((value, i) => {
                      if (value === 0) return null // Don't show dots for zero values

                      const x = (i / (wellnessHistoryData.scores.length - 1)) * 100
                      const y = 100 - value

                      return (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="3"
                          fill="white"
                          stroke={wellnessHistoryData.color}
                          strokeWidth="2"
                        />
                      )
                    })}
                  </svg>
                </div>
              </div>

              {/* Wellness Score Display */}
              <div className="flex justify-center items-center mb-4">
                <div className="text-center">
                  <p className="text-sm text-secondary-color mb-1">Current Wellness Score</p>
                  <div className="flex items-center justify-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                      style={{
                        backgroundColor:
                          wellnessScore >= 75
                            ? "#4ade80"
                            : wellnessScore >= 50
                              ? "#facc15"
                              : wellnessScore >= 25
                                ? "#fb923c"
                                : "#f87171",
                      }}
                    >
                      {wellnessScore}
                    </div>
                  </div>
                </div>
              </div>

              {/* Wellness Factors */}
              <div className="flex flex-wrap gap-4 mt-4 justify-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-green-400"></div>
                  <span className="text-sm text-primary-color">Mood</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-blue-400"></div>
                  <span className="text-sm text-primary-color">Sleep</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2 bg-amber-400"></div>
                  <span className="text-sm text-primary-color">Stress</span>
                </div>
              </div>

              {/* Message for users who haven't logged wellness yet */}
              {!hasLoggedWellness && (
                <div className="mt-4 text-center text-sm text-secondary-color p-2 bg-[#f0eaf9] rounded-lg">
                  Log your first day to start tracking your wellness score over time. Your score is calculated from your
                  mood, sleep quality, and stress levels.
                </div>
              )}
            </>
          )}
        </div>

        {/* Weight Tracking Module */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center mb-4">
            <Scale className="h-5 w-5 mr-2 text-pink-500" />
            <h3 className="font-medium text-xl text-primary-color">Weight Tracking</h3>
          </div>

          <div className="flex flex-col">
            {userProfile && (
              <div className="mb-4">
                <p className="text-sm text-secondary-color mb-1">Current Weight</p>
                <p className="font-bold text-primary-color">
                  {userProfile.weight} {userProfile.weightUnit}
                </p>
              </div>
            )}

            <div className="flex items-end gap-2 mb-4">
              <div className="flex-1">
                <label htmlFor="weight" className="block text-sm text-secondary-color mb-1">
                  Update Weight
                </label>
                <input
                  type="number"
                  id="weight"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  placeholder="Enter weight"
                  className="w-full p-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  min="1"
                />
              </div>
              <div className="w-24">
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as "kg" | "lb")}
                  className="w-full p-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                >
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </div>
              <button
                onClick={updateWeight}
                disabled={isUpdatingWeight || !currentWeight}
                className="p-3 rounded-xl gradient-button flex items-center justify-center min-w-[80px]"
              >
                {isUpdatingWeight ? "Saving..." : weightUpdateSuccess ? <Check className="h-5 w-5" /> : "Update"}
              </button>
            </div>

            {userProfile?.weightHistory && userProfile.weightHistory.length > 0 && (
              <div>
                <p className="text-sm text-secondary-color mb-2">Weight History</p>
                <div className="max-h-32 overflow-y-auto">
                  {userProfile.weightHistory
                    .slice()
                    .reverse()
                    .slice(0, 5)
                    .map((entry, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-brand-dark/10">
                        <span className="text-sm text-primary-color">
                          {new Date(entry.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span className="font-medium text-primary-color">
                          {entry.weight} {userProfile.weightUnit}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Daily Observations Module */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center mb-4">
            <LightbulbIcon className="h-5 w-5 mr-2 text-amber-500" />
            <h3 className="font-medium text-xl text-primary-color">Daily Observations</h3>
          </div>

          {dailyObservations === null ? (
            <div className="text-center text-sm text-secondary-color p-4 bg-[#f0eaf9] rounded-lg">
              Log your symptoms to see daily insights.
            </div>
          ) : dailyObservations.length === 0 ? (
            <div className="text-center text-sm text-secondary-color p-4 bg-[#f0eaf9] rounded-lg">
              No insights for today.
            </div>
          ) : (
            <ul className="space-y-3">
              {dailyObservations.map((observation, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-2 h-2 rounded-full bg-pink-400 mt-1.5 mr-3 flex-shrink-0"></span>
                  {typeof observation === "string" ? (
                    <span className="text-sm text-primary-color">{observation}</span>
                  ) : (
                    <div className="text-sm text-primary-color">
                      {observation.text}{" "}
                      <button
                        onClick={() => router.push(observation.link)}
                        className="text-accent-color inline-flex items-center"
                      >
                        {observation.linkText}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="grid grid-cols-5 border-t border-[#e4e0f0] bg-white/80 backdrop-blur-sm">
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => router.push("/food-list")}
        >
          <List className="h-5 w-5 mb-1 text-primary-color" />
          <span className="text-primary-color">Products</span>
        </button>
        <button className="flex flex-col items-center justify-center py-3 text-xs text-accent-color">
          <Home className="h-5 w-5 mb-1 text-accent-color" />
          <span>Dashboard</span>
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
          <BookOpen className="h-5 w-5 mb-1 text-primary-color" />
          <span className="text-primary-color">Nutrition</span>
        </button>
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => router.push("/recipes")}
        >
          <UtensilsCrossed className="h-5 w-5 mb-1 text-primary-color" />
          <span className="text-primary-color">Recipes</span>
        </button>
      </nav>
    </div>
  )
}
