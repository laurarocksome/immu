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
  CheckCircle2,
  Circle,
  ListChecks,
} from "lucide-react"
import Logo from "@/app/components/logo"
import ConfettiCelebration from "@/app/components/confetti-celebration"
import { getSession } from "@/lib/auth"
import { saveUserProfile, saveUserConditions, saveUserSymptoms, saveDietInfo, saveUserName } from "@/lib/user-data"
import { createBrowserClient } from "@supabase/ssr"
import { Button } from "@/components/ui/button" // Assuming Button component is available
// import { getWeightLogs, type WeightLog } from "@/lib/weight-data" // Imported weight data functions - Moved import and function inline
import { WeightLogModal } from "@/components/weight-log-modal" // Imported WeightLogModal component
import { createClient } from "@/lib/supabase/client" // Import createClient from supabase client
import { subDays } from "date-fns" // Added date-fns imports

// import { getUserProfile, loadDietInfo, loadTrackedDates, calculateDietProgress } from "@/lib/dashboard-data" // Imported new functions

async function getUserProfile(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("[v0] Error loading user profile:", error)
    return null
  }
  return data
}

async function loadDietInfo(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("diet_info").select("*").eq("user_id", userId).single()

  if (error) {
    console.error("[v0] Error loading diet info:", error)
    return null
  }
  return data
}

async function loadTrackedDates(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("daily_logs")
    .select("log_date")
    .eq("user_id", userId)
    .order("log_date", { ascending: false })

  if (error) {
    console.error("[v0] Error loading tracked dates:", error)
    return []
  }
  return data?.map((log) => log.log_date) || []
}

// Imported weight data functions inline
async function getWeightLogs(userId: string, days: number) {
  const supabase = createClient()
  const thirtyDaysAgo = subDays(new Date(), days)
  const { data, error } = await supabase
    .from("weight_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("log_date", thirtyDaysAgo.toISOString())
    .order("log_date", { ascending: true })

  if (error) {
    console.error("Error fetching weight logs:", error)
    return []
  }
  return data || []
}

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
  color: "#f4a6b8",
  gradient: ["#f4a6b8", "#f4a6b833"],
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

// Interface for to-do item
interface TodoItem {
  id: string
  text: string
  isSpecial?: boolean
}

// Interface for completed to-do items
interface CompletedTodos {
  date: string
  completedIds: string[]
}

// Type for weight data for the chart
interface WeightChartData {
  date: string
  weight: number
}

// Renamed component to DashboardPage
export default function DashboardPage() {
  // Changed from Dashboard to DashboardPage
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
  const [activeTab, setActiveTab] = useState<"symptoms" | "wellness" | "weight">("symptoms")
  const [wellnessScore, setWellnessScore] = useState<number>(0)
  const [symptomData, setSymptomData] = useState<any[]>([])
  const [loggedPeriodSymptoms, setLoggedPeriodSymptoms] = useState<string[]>([])
  const [loggedDigestiveSymptoms, setLoggedDigestiveSymptoms] = useState<string[]>([])
  const [isOnPeriod, setIsOnPeriod] = useState<boolean>(false)

  // Weight tracking states
  const [weightData, setWeightData] = useState<WeightChartData[]>([])
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [currentWeight, setCurrentWeight] = useState<number | undefined>()
  const [weightUnit, setWeightUnit] = useState<string>("lbs")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  // </CHANGE> Removed isUpdatingWeight and weightUpdateSuccess states - using modal for all weight updates
  const [userId, setUserId] = useState<string>("")
  const [dietInfo, setDietInfo] = useState<any>(null) // State to store diet information

  // To-do list states
  const [isAdaptationPhase, setIsAdaptationPhase] = useState(false)
  const [adaptationDay, setAdaptationDay] = useState(1)
  const [todoItems, setTodoItems] = useState<TodoItem[]>([])
  const [completedTodoIds, setCompletedTodoIds] = useState<string[]>([])
  const [showConfetti, setShowConfetti] = useState(false)

  // Add a new state for elimination phase percentage
  const [eliminationPhasePercentage, setEliminationPhasePercentage] = useState(0)

  // Add a new state for reintroduction phase day
  const [reintroductionDay, setReintroductionDay] = useState(0)
  const [currentPhase, setCurrentPhase] = useState<"adaptation" | "elimination" | "reintroduction">("elimination")

  // Add a state for wellness data
  const [wellnessData, setWellnessData] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])

  // Supabase client initialization (assuming it's needed for weight logs)
  const supabase =
    typeof window !== "undefined"
      ? createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      : null

  const syncPendingDataToSupabase = async () => {
    if (typeof window === "undefined") return

    const pendingSync = localStorage.getItem("pendingSync")
    if (pendingSync !== "true") return

    try {
      const session = await getSession()
      if (!session) return // User not authenticated yet

      // Get all data from localStorage
      const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}")
      const userAccount = JSON.parse(localStorage.getItem("userAccount") || "{}")
      const selectedConditions = JSON.parse(localStorage.getItem("selectedConditions") || "[]")
      const selectedSymptoms = JSON.parse(localStorage.getItem("selectedSymptoms") || "[]")
      const dietTimeline = localStorage.getItem("dietTimeline") || "90"
      const adaptationChoice = localStorage.getItem("adaptationChoice") || "yes"
      const dietStartDate = localStorage.getItem("dietStartDate") || new Date().toISOString()

      // Sync name
      if (userAccount.name) {
        await saveUserName(userAccount.name)
      }

      // Sync profile
      if (userProfile.gender || userProfile.age || userProfile.weight || userProfile.height) {
        await saveUserProfile({
          gender: userProfile.gender,
          age: userProfile.age,
          weight: userProfile.weight,
          weightUnit: userProfile.weightUnit || "kg",
          height: userProfile.height,
          heightUnit: userProfile.heightUnit || "cm",
        })
      }

      // Sync conditions
      if (selectedConditions.length > 0) {
        await saveUserConditions(selectedConditions)
      }

      // Sync symptoms
      if (selectedSymptoms.length > 0) {
        await saveUserSymptoms(selectedSymptoms)
      }

      // Sync diet info
      await saveDietInfo({
        startDate: dietStartDate,
        timelineDays: Number.parseInt(dietTimeline),
        adaptationChoice: adaptationChoice,
        currentPhase: "adaptation",
      })

      // Clear the pending sync flag
      localStorage.removeItem("pendingSync")
      console.log("Successfully synced pending data to Supabase")
    } catch (err) {
      console.error("Error syncing pending data:", err)
      // Don't remove pendingSync flag so it retries next time
    }
  }

  // Function to handle symptom selection
  const handleSymptomSelect = (symptomName: string) => {
    console.log("[v0] Symptom clicked:", symptomName, "Current selection:", selectedSymptom)
    if (selectedSymptom === symptomName) {
      setSelectedSymptom(null) // Deselect if already selected
      console.log("[v0] Deselected symptom")
    } else {
      setSelectedSymptom(symptomName) // Select the symptom
      console.log("[v0] Selected symptom:", symptomName)
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
    const colors = ["#f4a6b8", "#f6c1b0", "#f9cdd9", "#e87a97", "#f09f88"]

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
        setCurrentWeight(profile.weight) // Changed to number
      }
    }
  }

  // Function to update user weight
  // </CHANGE> Removed the standalone updateWeight function - using modal's save function instead

  // Modify the determineAdaptationPhase function to also determine elimination phase percentage
  const determinePhases = () => {
    if (typeof window === "undefined") return

    const adaptationChoice = localStorage.getItem("userAdaptationChoice")
    const hasAdaptation = adaptationChoice === "Yes"
    const startDate = localStorage.getItem("dietStartDate")

    if (!startDate) {
      setIsAdaptationPhase(false)
      setCurrentPhase("elimination")
      return
    }

    const dietStartDate = new Date(startDate)
    const today = new Date()
    const daysElapsed = Math.floor((today.getTime() - dietStartDate.getTime()) / (1000 * 60 * 60 * 24))

    // Get diet timeline
    const dietTimeline = localStorage.getItem("userDietTimeline")
    const totalSelectedDays = dietTimeline ? Number.parseInt(dietTimeline) : 30

    // Calculate adaptation and elimination days
    const adaptationDays = hasAdaptation ? 28 : 0
    const eliminationDays = hasAdaptation ? totalSelectedDays - adaptationDays : totalSelectedDays

    // Determine current phase
    if (hasAdaptation && daysElapsed < adaptationDays) {
      // In adaptation phase
      setIsAdaptationPhase(true)
      setAdaptationDay(daysElapsed + 1) // +1 because day 1 is the first day
      setEliminationPhasePercentage(0) // Not in elimination phase yet
      setReintroductionDay(0) // Not in reintroduction phase yet
      setCurrentPhase("adaptation")
    } else if (daysElapsed < (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays)) {
      // In elimination phase
      setIsAdaptationPhase(false)
      setCurrentPhase("elimination")

      // Calculate elimination phase percentage
      const eliminationDaysElapsed = daysElapsed - (hasAdaptation ? adaptationDays : 0)
      const percentage = Math.floor((eliminationDaysElapsed / eliminationDays) * 100)
      setEliminationPhasePercentage(percentage)
      setReintroductionDay(0) // Not in reintroduction phase yet
    } else {
      // In reintroduction phase
      setIsAdaptationPhase(false)
      setEliminationPhasePercentage(100) // Elimination phase completed
      setCurrentPhase("reintroduction")

      // Calculate reintroduction day
      const reintroductionDaysElapsed =
        daysElapsed - (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays)
      setReintroductionDay(reintroductionDaysElapsed + 1) // +1 because day 1 is the first day
    }
  }

  // Function to generate to-do items for the reintroduction phase
  const generateReintroductionTodoItems = () => {
    if (currentPhase !== "reintroduction" || reintroductionDay === 0) return []

    // Common items for all days
    const commonItems = [
      { id: "water", text: "Drink 1.5–2L water" },
      { id: "walk", text: "Walk 30 minutes" },
      { id: "sleep", text: "Sleep 7–8 hours" },
    ]

    // Day-specific items
    switch (reintroductionDay) {
      case 1:
        return [
          { id: "reintroduce_egg_yolk", text: "Reintroduce egg yolk (boiled or poached)", isSpecial: true },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times today (mood, digestion, energy)" },
        ]
      case 2:
        return [
          { id: "rest_day", text: "Rest day — no new food", isSpecial: true },
          ...commonItems,
          { id: "observe_symptoms", text: "Observe for any delayed symptoms" },
          { id: "update_product_list", text: "Update the product list with 'Can eat' or 'Can't eat'" },
        ]
      case 3:
        return [
          { id: "reintroduce_peas", text: "Reintroduce green peas or sugar snap peas", isSpecial: true },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times" },
        ]
      case 4:
        return [
          { id: "eat_vegetables", text: "Eat a variety of vegetables today" },
          ...commonItems,
          { id: "update_product_list", text: "Update the product list with 'Can eat' or 'Can't eat'" },
        ]
      case 5:
        return [
          { id: "reintroduce_ghee", text: "Reintroduce ghee (1 tsp with a warm meal)", isSpecial: true },
          ...commonItems,
          { id: "lemon_water", text: "Drink lemon water in the morning" },
          { id: "log_feelings", text: "Log how you feel 2–3 times" },
          { id: "calming_music", text: "Play calming music in the evening" },
        ]
      case 6:
        return [
          { id: "stretching", text: "Do a stretching session" },
          ...commonItems,
          { id: "update_product_list", text: "Update the product list with 'Can eat' or 'Can't eat'" },
        ]
      case 7:
        return [
          {
            id: "reintroduce_spices",
            text: "Reintroduce cumin or coriander (use sparingly in cooking)",
            isSpecial: true,
          },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times" },
          { id: "meditate", text: "Meditate for 10 minutes" },
        ]
      case 8:
        return [
          { id: "cook_dinner", text: "Cook a nourishing veggie-based dinner" },
          ...commonItems,
          { id: "update_product_list", text: "Update the product list with 'Can eat' or 'Can't eat'" },
        ]
      case 9:
        return [
          { id: "reintroduce_cocoa", text: "Reintroduce unsweetened cocoa (1 tsp max)", isSpecial: true },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times" },
        ]
      case 10:
        return [
          { id: "mocktail", text: "Try a mocktail as a reward" },
          ...commonItems,
          { id: "update_product_list", text: "Update the product list with 'Can eat' or 'Can't eat'" },
        ]
      case 11:
        return [
          {
            id: "reintroduce_nut_oil",
            text: "Reintroduce nut/seed oil (e.g., walnut or sesame, 1 tsp)",
            isSpecial: true,
          },
          ...commonItems,
          { id: "extra_water", text: "Drink extra water" },
          { id: "log_feelings", text: "Log how you feel 2–3 times" },
        ]
      case 12:
        return [
          ...commonItems,
          { id: "update_product_list", text: "Update the product list with 'Can eat' or 'Can't eat'" },
        ]
      case 13:
        return [
          { id: "reintroduce_sprouts", text: "Reintroduce legume sprouts (e.g., pea shoots)", isSpecial: true },
          ...commonItems,
          { id: "new_vegetables", text: "Add three new vegetables to your plate" },
          { id: "log_feelings", text: "Log how you feel 2–3 times" },
        ]
      case 14:
        return [
          { id: "meditate_longer", text: "Meditate for 20 minutes" },
          ...commonItems,
          { id: "update_product_list", text: "Update the product list with 'Can eat' or 'Can't eat'" },
        ]
      case 15:
        return [
          { id: "reintroduce_almonds", text: "Reintroduce almonds (start small, preferably soaked)", isSpecial: true },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
        ]
      case 16:
      case 17:
        return [
          { id: "eat_almonds", text: "Eat almonds (start small, preferably soaked)" },
          ...commonItems,
          { id: "almond_milk", text: "Use a splash of almond milk" },
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
          ...(reintroductionDay === 17 ? [{ id: "update_product_list", text: "Update the product list" }] : []),
        ]
      case 18:
        return [
          { id: "reintroduce_seeds", text: "Reintroduce seeds (tahini or raw seeds, one type only)", isSpecial: true },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
        ]
      case 19:
      case 20:
        return [
          { id: "eat_seeds", text: "Eat seeds (tahini or raw seeds, one type only)" },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
          ...(reintroductionDay === 20
            ? [
                { id: "avoid_mixing", text: "Avoid mixing seeds" },
                { id: "update_product_list", text: "Update the product list" },
              ]
            : []),
        ]
      case 21:
        return [
          {
            id: "reintroduce_egg_whites",
            text: "Reintroduce egg whites (start small, gradually increase)",
            isSpecial: true,
          },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
        ]
      case 22:
        return [
          { id: "eat_egg_whites", text: "Eat egg whites (start small, gradually increase)" },
          ...commonItems,
          { id: "grounding", text: "Add grounding practices: journaling, stretching, slow walks" },
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
        ]
      case 23:
        return [
          { id: "eat_whole_egg", text: "Eat a whole egg" },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
          { id: "update_product_list", text: "Update the product list" },
        ]
      case 24:
        return [
          {
            id: "reintroduce_butter",
            text: "Reintroduce grass-fed butter (do not combine with other dairy)",
            isSpecial: true,
          },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
        ]
      case 25:
      case 26:
        return [
          { id: "eat_butter", text: "Eat grass-fed butter (do not combine with other dairy)" },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
          ...(reintroductionDay === 26 ? [{ id: "update_product_list", text: "Update the product list" }] : []),
        ]
      case 27:
        return [
          { id: "review_list", text: "Review your personal 'Can eat' list" },
          ...commonItems,
          { id: "calming_activity", text: "Plan a calming activity" },
        ]
      case 28:
        return [
          { id: "reintroduce_cashews", text: "Reintroduce plain, unroasted cashews", isSpecial: true },
          ...commonItems,
          { id: "tea", text: "Add lemon or ginger tea to support digestion" },
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
        ]
      case 29:
        return [
          { id: "eat_cashews", text: "Eat plain, unroasted cashews" },
          ...commonItems,
          { id: "tea", text: "Add lemon or ginger tea to support digestion" },
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
          { id: "update_product_list", text: "Update the product list" },
        ]
      case 30:
        return [
          { id: "reintroduce_potato", text: "Reintroduce cooked potato (white, peeled)", isSpecial: true },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times" },
          { id: "update_product_list", text: "Update the product list" },
        ]
      case 31:
        return [
          { id: "reintroduce_pepper", text: "Reintroduce sweet red pepper (roasted or sautéed)", isSpecial: true },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
        ]
      case 32:
      case 33:
        return [
          { id: "eat_pepper", text: "Eat sweet red pepper (roasted or sautéed)" },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
          ...(reintroductionDay === 33 ? [{ id: "update_product_list", text: "Update the product list" }] : []),
        ]
      case 34:
        return [
          { id: "reintroduce_paprika", text: "Reintroduce paprika (use a small pinch in meals)", isSpecial: true },
          ...commonItems,
          { id: "no_new_food", text: "Do not introduce any other new food during this time" },
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
        ]
      case 35:
      case 36:
        return [
          { id: "eat_paprika", text: "Eat paprika (use a small pinch in meals)" },
          ...commonItems,
          { id: "no_new_food", text: "Do not introduce any other new food during this time" },
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
          ...(reintroductionDay === 36 ? [{ id: "update_product_list", text: "Update the product list" }] : []),
        ]
      case 37:
        return [
          { id: "reintroduce_eggplant", text: "Reintroduce cooked eggplant (start with 1/4 cup)", isSpecial: true },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times" },
          { id: "update_product_list", text: "Update the product list" },
        ]
      case 38:
        return [
          { id: "reintroduce_rice", text: "Reintroduce white rice (start with 2 tbsp cooked)", isSpecial: true },
          ...commonItems,
          { id: "deep_breathing", text: "Add deep breathing after meals" },
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
          { id: "relaxing_ritual", text: "End day with a relaxing ritual (bath, walk, etc.)" },
        ]
      case 39:
      case 40:
        return [
          { id: "eat_rice", text: "Eat white rice" },
          ...commonItems,
          { id: "deep_breathing", text: "Add deep breathing after meals" },
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
          ...(reintroductionDay === 40
            ? [
                { id: "relaxing_ritual", text: "End day with a relaxing ritual (bath, walk, etc.)" },
                { id: "update_product_list", text: "Update the product list" },
              ]
            : []),
        ]
      case 41:
        return [
          {
            id: "reintroduce_yogurt",
            text: "Reintroduce grass-fed yogurt or kefir (unsweetened, small portion)",
            isSpecial: true,
          },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
        ]
      case 42:
      case 43:
        return [
          { id: "eat_yogurt", text: "Eat grass-fed yogurt or kefir (unsweetened, small portion)" },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
          ...(reintroductionDay === 43 ? [{ id: "update_product_list", text: "Update the product list" }] : []),
        ]
      case 44:
        return [
          {
            id: "reintroduce_tomato",
            text: "Reintroduce cooked and peeled tomato (start with 1 tbsp)",
            isSpecial: true,
          },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
        ]
      case 45:
        return [
          { id: "eat_tomato", text: "Eat cooked and peeled tomato (start with 1 tbsp)" },
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
          { id: "update_product_list", text: "Update the product list" },
        ]
      default:
        // For days beyond 45, provide general maintenance tasks
        return [
          ...commonItems,
          { id: "log_feelings", text: "Log how you feel 2–3 times per day" },
          {
            id: "continue_reintroductions",
            text: "Continue with your personalized reintroduction schedule",
            isSpecial: true,
          },
        ]
    }
  }

  // Function to generate to-do items for the elimination phase
  const generateEliminationTodoItems = () => {
    if (isAdaptationPhase || eliminationPhasePercentage === 0) return []

    let items: TodoItem[] = []

    // Common items for all percentage ranges
    const commonItems = [
      { id: "track_symptoms", text: "Track your symptoms" },
      { id: "sleep", text: "Maintain 7-8h of sleep" },
      { id: "water", text: "Drink 1.5–2L water" },
    ]

    // Add percentage-specific items
    if (eliminationPhasePercentage <= 20) {
      // 0-20% days of the elimination diet phase
      items = [
        ...commonItems,
        { id: "protein", text: "Have protein with every meal" },
        { id: "yoga", text: "Try a gentle yoga or breathwork session" },
      ]
    } else if (eliminationPhasePercentage <= 40) {
      // 21-40% days of the elimination diet phase
      items = [
        ...commonItems,
        { id: "new_aip", text: "Try one new AIP recipe" },
        { id: "eft", text: "Research EFT tapping stress relief method" },
        { id: "meditation", text: "Listen to a 10 minute calming playlist or guided meditation" },
      ]
    } else if (eliminationPhasePercentage <= 60) {
      // 41-60% days of the elimination diet phase
      items = [
        ...commonItems,
        { id: "mindful_eating", text: "Try eating your meals more mindfully (no phone, chew slowly)" },
        { id: "journal", text: "Journal about changes in mood, sleep, digestion" },
      ]
    } else if (eliminationPhasePercentage <= 80) {
      // 61-80% days of the elimination diet phase
      items = [
        ...commonItems,
        { id: "new_veggies", text: "Explore new veggies or safe fruits you haven't tried yet" },
        { id: "strength_training", text: "Start light strength training at home" },
      ]
    } else {
      // 81-100% days of the elimination diet phase
      items = [
        ...commonItems,
        {
          id: "journal_end",
          text: "Journal your feelings now that Elimination phase is coming to an end",
          isSpecial: true,
        },
        { id: "review_logs", text: "Review your food and symptom logs — are any patterns clear?", isSpecial: true },
      ]
    }

    return items
  }

  // Function to generate to-do items based on adaptation day
  const generateAdaptationTodoItems = () => {
    if (!isAdaptationPhase) return []

    let items: TodoItem[] = []

    // Base items for days 1-7
    if (adaptationDay >= 1) {
      items = [
        { id: "water", text: "Drink water (1-1.5L)" },
        { id: "walk", text: "Walk 30 minutes" },
        { id: "caffeine", text: "No caffeine consumption" },
        { id: "sleep", text: "Sleep 8 hours" },
      ]
    }

    // Add items for days 8-14
    if (adaptationDay >= 8) {
      items.push({ id: "alcohol", text: "No alcohol consumption" })
    }

    // Add items for days 15-21
    if (adaptationDay >= 15) {
      items.push({ id: "sugar", text: "No sugar consumption" })
    }

    // Add items for days 22-28
    if (adaptationDay >= 22) {
      items.push({ id: "vegetables", text: "Eat more vegetables (for snacks and with your main meal)" })
    }

    // Special items for specific days
    if (adaptationDay === 10) {
      items.push({
        id: "journal",
        text: "Try to write down your feelings and thoughts on a piece of paper",
        isSpecial: true,
      })
    } else if (adaptationDay === 18) {
      items.push({
        id: "meditation",
        text: "Try meditation",
        isSpecial: true,
      })
    } else if (adaptationDay === 24) {
      items.push({
        id: "mocktail",
        text: "Try a mocktail, celebrate, you almost finished one phase!",
        isSpecial: true,
      })
    }

    return items
  }

  // Modify the generateTodoItems function to handle all phases
  const generateTodoItems = () => {
    let items: TodoItem[] = []

    if (isAdaptationPhase) {
      // Generate adaptation phase to-do items
      items = generateAdaptationTodoItems()
    } else if (currentPhase === "elimination") {
      // Generate elimination phase to-do items
      items = generateEliminationTodoItems()
    } else if (currentPhase === "reintroduction") {
      // Generate reintroduction phase to-do items
      items = generateReintroductionTodoItems()
    }

    setTodoItems(items)
  }

  // Function to load completed to-dos from local storage
  const loadCompletedTodos = () => {
    if (typeof window === "undefined") return

    const completedTodosStr = localStorage.getItem("completedTodos")
    if (completedTodosStr) {
      try {
        const completedTodos: CompletedTodos[] = JSON.parse(completedTodosStr)
        const today = new Date().toISOString().split("T")[0] // Get today's date in YYYY-MM-DD format

        // Find the completed todos for today
        const todayCompleted = completedTodos.find((item) => item.date === today)

        // If we have completed todos for today, set the completed ids
        if (todayCompleted) {
          setCompletedTodoIds(todayCompleted.completedIds)
        } else {
          setCompletedTodoIds([]) // No completed todos for today
        }
      } catch (e) {
        console.error("Error parsing completed todos:", e)
        setCompletedTodoIds([]) // Error, so set to empty
      }
    } else {
      setCompletedTodoIds([]) // No completed todos saved
    }
  }

  // Function to toggle to-do completion status
  const toggleTodoCompletion = (id: string) => {
    if (typeof window === "undefined") return

    const today = new Date().toISOString().split("T")[0] // Get today's date in YYYY-MM-DD format
    const isCompleted = completedTodoIds.includes(id)

    let updatedCompletedIds: string[] = []

    if (isCompleted) {
      // Remove the id from the completed list
      updatedCompletedIds = completedTodoIds.filter((todoId) => todoId !== id)
    } else {
      // Add the id to the completed list
      updatedCompletedIds = [...completedTodoIds, id]
    }

    // Update state
    setCompletedTodoIds(updatedCompletedIds)

    // Load existing completed todos from localStorage
    const completedTodosStr = localStorage.getItem("completedTodos")
    let completedTodos: CompletedTodos[] = []

    if (completedTodosStr) {
      try {
        completedTodos = JSON.parse(completedTodosStr)
      } catch (e) {
        console.error("Error parsing completed todos:", e)
      }
    }

    // Find if we have an entry for today
    const todayIndex = completedTodos.findIndex((item) => item.date === today)

    if (todayIndex !== -1) {
      // Update existing entry for today
      completedTodos[todayIndex] = { date: today, completedIds: updatedCompletedIds }
    } else {
      // Add a new entry for today
      completedTodos.push({ date: today, completedIds: updatedCompletedIds })
    }

    // Save updated completed todos to localStorage
    localStorage.setItem("completedTodos", JSON.stringify(completedTodos))

    // Show confetti if all items are completed
    if (updatedCompletedIds.length === todoItems.length) {
      setShowConfetti(true)
    }
  }

  // Helper function to load all user data
  async function loadUserData() {
    // Sync pending data to Supabase on initial load
    await syncPendingDataToSupabase()

    // Format current date
    const date = new Date()
    const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }
    setCurrentDate(date.toLocaleDateString("en-US", options))

    // Check if this is the first time loading the dashboard after onboarding
    const isFirstLoad = sessionStorage.getItem("dashboardFirstLoad") !== "false"

    if (typeof window !== "undefined") {
      // Get session and redirect if not authenticated
      const session = await getSession()
      if (!session) {
        router.push("/auth/signin")
        return
      }

      // Load user-specific data
      const supabase = createClient()
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("Error loading user:", error)
        return
      }

      if (user?.id) {
        setUserId(user.id)

        // Load user-specific data
        const [dietInfoData, trackedDates, profile] = await Promise.all([
          loadDietInfo(user.id),
          loadTrackedDates(user.id),
          getUserProfile(user.id),
        ])

        if (dietInfoData) {
          setDietInfo(dietInfoData)
          // calculateDietProgress(dietInfoData) // Removed as it's not defined in the provided snippet
        }

        if (profile) {
          setUserProfile(profile)
        }

        // Load symptoms
        await loadSymptomData()
      }

      // Load user profile data
      loadUserProfile()

      // Determine phases
      determinePhases()

      // Get diet timeline data
      const dietTimeline = localStorage.getItem("userDietTimeline")
      const startDate = localStorage.getItem("dietStartDate")

      // Get streak days from localStorage or calculate it
      const savedStreakDays = localStorage.getItem("streakDays")

      if (!startDate) {
        const today = new Date().toISOString()
        localStorage.setItem("dietStartDate", today)
        // Set streak to 1 for new users
        setStreakDays(1)
        setProgress(1)
        // return // Removed return to allow other loading logic to proceed
      }

      // Calculate days elapsed since diet start
      const daysElapsed = Math.floor((new Date().getTime() - new Date(startDate!).getTime()) / (1000 * 60 * 60 * 24))

      setStreakDays(Math.max(daysElapsed + 1, 1))

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
          setWellnessData(updatedScores) // Update the wellnessData state

          // Store period data
          if (loggedDay.onPeriod === true) {
            setIsOnPeriod(true)
            if (loggedDay.periodSymptoms && Array.isArray(loggedDay.periodSymptoms)) {
              setLoggedPeriodSymptoms(loggedDay.periodSymptoms)
            }
          }

          // Store digestive symptoms - FIX THE BUG HERE
          if (loggedDay.digestiveSymptoms && Array.isArray(loggedDay.digestiveSymptoms)) {
            setLoggedDigestiveSymptoms(loggedDay.digestiveSymptoms)
          }
        } catch (e) {
          console.error("Error parsing logged day data:", e)
        }
      }
    }
  }

  useEffect(() => {
    const loadWeightData = async () => {
      if (!userId) return

      console.log("[v0] Loading weight logs for user:", userId)
      const weights = await getWeightLogs(userId, 30)
      console.log("[v0] Weight logs loaded:", weights)

      if (weights.length > 0) {
        const formattedWeights = weights.map((log) => ({
          date: new Date(log.log_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          weight: Number(log.weight),
        }))
        setWeightData(formattedWeights)
        setCurrentWeight(Number(weights[weights.length - 1].weight))
        setWeightUnit(weights[weights.length - 1].weight_unit)
      }
    }

    loadWeightData()
  }, [userId]) // Run when userId changes

  useEffect(() => {
    loadUserData()
  }, [])

  // Effect to generate to-do items when adaptation phase or day changes
  useEffect(() => {
    generateTodoItems()
  }, [isAdaptationPhase, adaptationDay, eliminationPhasePercentage, reintroductionDay, currentPhase])

  // Effect to load completed to-dos when to-do items change
  useEffect(() => {
    if (todoItems.length > 0) {
      loadCompletedTodos()
    }
  }, [todoItems])

  // Add an effect to reload symptom data when the component is focused
  useEffect(() => {
    // Function to handle when the window gets focus
    const handleFocus = () => {
      loadSymptomData()
      loadUserProfile()
      loadCompletedTodos()
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

  // Function to create wellness area path (for filled area below the line)
  const createWellnessAreaPath = (values: number[]) => {
    const linePath = createWellnessCurvePath(values)
    const lastPoint = values.length - 1
    const lastX = 100 // 100% width
    const firstX = 0 // 0% width

    // Add line to bottom right, then to bottom left, then close path
    return `${linePath} L ${lastX},100 L ${firstX},100 Z`
  }

  // Find the getDigestiveSymptomTip function and ensure it's properly implemented
  // This function should return specific tips for each digestive symptom

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

  // Update the generateDailyObservations function to properly handle digestive symptoms
  const generateDailyObservations = () => {
    // If no symptoms are logged, return null
    if (!hasLoggedSymptoms && !hasLoggedWellness) {
      return null
    }

    const observations = []

    // Add period-related observations only for female users
    const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}")
    const userGender = userProfile.gender?.toLowerCase()

    if (userGender === "female") {
      if (isOnPeriod) {
        if (loggedPeriodSymptoms.length > 0) {
          const symptomNames = loggedPeriodSymptoms.map(getPeriodSymptomName).join(", ")
          observations.push(`Your period symptoms (${symptomNames}) may affect your overall wellness score today.`)
        } else {
          observations.push("You're on your period today, which may affect your energy levels and comfort.")
        }
      }
    }

    // Add digestive-related observations
    if (loggedDigestiveSymptoms && loggedDigestiveSymptoms.length > 0) {
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

    // Always add some default observations if we have no specific ones
    if (observations.length === 0) {
      observations.push("Remember to stay hydrated throughout the day for optimal health.")
      observations.push("Consider adding more leafy greens to your meals for additional nutrients.")
      observations.push("Taking short breaks during the day can help reduce stress and improve focus.")
    }

    return observations
  }

  // Get the observations
  const dailyObservations = generateDailyObservations()

  // Initialize nextPhaseDate outside the scope of the JSX
  const nextPhaseDate = new Date()

  // Function to get the phase display text
  const getPhaseDisplayText = () => {
    if (isAdaptationPhase) {
      return `Adaptation Phase - Day ${adaptationDay}`
    } else if (currentPhase === "elimination") {
      return `Elimination Phase - ${eliminationPhasePercentage}% complete`
    } else {
      return `Reintroduction Phase - Day ${reintroductionDay}`
    }
  }

  const createWeightCurvePath = (data: WeightChartData[]) => {
    if (data.length === 0) return ""
    if (data.length === 1) {
      const y =
        100 -
        ((data[0].weight - Math.min(...data.map((d) => d.weight))) /
          (Math.max(...data.map((d) => d.weight)) - Math.min(...data.map((d) => d.weight)) || 1)) *
          100
      return `M 0 ${y} L 100 ${y}`
    }

    const minWeight = Math.min(...data.map((d) => d.weight))
    const maxWeight = Math.max(...data.map((d) => d.weight))
    const range = maxWeight - minWeight || 1

    const points = data.map((item, i) => {
      const x = (i / (data.length - 1)) * 100
      const y = 100 - ((item.weight - minWeight) / range) * 100
      return { x, y }
    })

    let path = `M ${points[0].x} ${points[0].y}`

    for (let i = 0; i < points.length - 1; i++) {
      const current = points[i]
      const next = points[i + 1]
      const controlX = (current.x + next.x) / 2

      path += ` Q ${controlX} ${current.y}, ${controlX} ${(current.y + next.y) / 2}`
      path += ` Q ${controlX} ${next.y}, ${next.x} ${next.y}`
    }

    return path
  }

  const createWeightAreaPath = (data: WeightChartData[]) => {
    if (data.length === 0) return ""

    const curvePath = createWeightCurvePath(data)
    return `${curvePath} L 100 100 L 0 100 Z`
  }

  const handleWeightSaved = async () => {
    // Reload user data to update the chart and current weight
    await loadUserData()
    setShowWeightModal(false) // Close the modal after saving
  }

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
                    <span key={index} className="bg-pink-100 text-primary-color px-3 py-1 rounded-full text-sm">
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
                  <div className="h-2 bg-pink-100 rounded-full">
                    <div className="h-2 bg-pink-400 rounded-full" style={{ width: `${progress}%` }}></div>
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
                      const currentPhase = "adaptation"

                      if (hasAdaptation && daysElapsed < adaptationDays) {
                        // In adaptation phase, next is elimination
                        nextPhaseDate.setDate(dietStartDate.getDate() + adaptationDays)
                      } else if (daysElapsed < (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays)) {
                        // In elimination phase, next is reintroduction
                        nextPhaseDate.setDate(
                          dietStartDate.getDate() +
                            (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays),
                        )
                      } else {
                        // In reintroduction phase, next is completion
                        const reintroductionDays = 150 // 5 months
                        nextPhaseDate.setDate(
                          dietStartDate.getDate() +
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
          <div className="flex border-b border-pink-200 mb-4">
            <button
              onClick={() => setActiveTab("symptoms")}
              className={`pb-2 px-4 font-medium text-lg transition-colors ${
                activeTab === "symptoms"
                  ? "border-b-2 border-pink-400 text-pink-600"
                  : "text-secondary-color hover:text-primary-color"
              }`}
            >
              Symptom Improvement
            </button>
            <button
              onClick={() => setActiveTab("wellness")}
              className={`pb-2 px-4 font-medium text-lg transition-colors ${
                activeTab === "wellness"
                  ? "border-b-2 border-peach-400 text-peach-600"
                  : "text-secondary-color hover:text-primary-color"
              }`}
            >
              Wellness Score
            </button>
            <button
              onClick={() => setActiveTab("weight")}
              className={`pb-2 px-4 font-medium text-lg transition-colors ${
                activeTab === "weight"
                  ? "border-b-2 border-green-400 text-green-600"
                  : "text-secondary-color hover:text-primary-color"
              }`}
            >
              Weight
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex justify-between items-center mb-4">
            <button className="text-accent-color text-sm flex items-center" onClick={() => router.push("/log-day")}>
              Log Day
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {/* Symptom Chart */}
          {activeTab === "symptoms" && (
            <div className="relative">
              {symptomData.length === 0 ? (
                // Show empty state without chart when no data
                <div className="text-center text-sm text-secondary-color p-6 bg-pink-50 rounded-lg min-h-[200px] flex items-center justify-center">
                  <p className="max-w-md">
                    Log your first day to start tracking your symptoms. You can log your symptom severity daily and
                    watch how they improve over time.
                  </p>
                </div>
              ) : (
                <>
                  <div className="relative min-h-[280px] md:min-h-[320px]">
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 bottom-8 w-10 md:w-16 flex flex-col justify-between text-[10px] md:text-xs text-secondary-color py-4">
                      <span className="leading-tight">Severe</span>
                      <span className="leading-tight">Moderate</span>
                      <span className="leading-tight">Mild</span>
                      <span className="leading-tight">Very mild</span>
                      <span className="leading-tight">None</span>
                    </div>

                    {/* Vertical grid lines */}
                    <div className="absolute left-10 md:left-16 right-0 top-0 bottom-8 flex justify-between">
                      {symptomHistoryData.dates.map((date, index) => (
                        <div
                          key={index}
                          className="h-full border-r border-pink-100 flex flex-col justify-end items-center"
                          style={{ width: `${100 / symptomHistoryData.dates.length}%` }}
                        >
                          <span className="text-[10px] md:text-xs text-secondary-color mb-2 whitespace-nowrap">
                            {date}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Chart area */}
                    <div className="absolute left-10 md:left-16 right-0 top-0 bottom-8 px-2 md:px-4 pt-4">
                      {/* Grid lines */}
                      <div className="absolute inset-0">
                        <div className="border-b border-pink-100 absolute top-[20%] left-0 right-0"></div>
                        <div className="border-b border-pink-100 absolute top-[40%] left-0 right-0"></div>
                        <div className="border-b border-pink-100 absolute top-[60%] left-0 right-0"></div>
                        <div className="border-b border-pink-100 absolute top-[80%] left-0 right-0"></div>
                      </div>

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
                            {/* Line */}
                            <path
                              d={createSmoothCurvePath(symptom.values)}
                              fill="none"
                              stroke={symptom.color}
                              strokeWidth="0.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            {/* Add dots for data points */}
                            {symptom.values.map((value, i) => {
                              if (value === 0) return null // Don't show dots for zero values

                              const x = (i / (symptom.values.length - 1)) * 100
                              const y = 100 - (value / 5) * 100

                              return (
                                <circle
                                  key={i}
                                  cx={x}
                                  cy={y}
                                  r="0.8"
                                  fill={symptom.color}
                                  stroke="white"
                                  strokeWidth="0.5"
                                />
                              )
                            })}
                          </svg>
                        )
                      })}
                    </div>
                  </div>

                  {/* Symptom Selector */}
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {symptomData.map((symptom) => (
                      <button
                        key={symptom.name}
                        onClick={() => handleSymptomSelect(symptom.name)}
                        className={`flex items-center px-2 md:px-3 py-1 rounded-full text-xs md:text-sm border ${
                          selectedSymptom === symptom.name ? "ring-2 ring-offset-2 ring-pink-300" : ""
                        }`}
                        style={{
                          borderColor: symptom.color,
                          backgroundColor: selectedSymptom === symptom.name ? symptom.color : "transparent",
                          color: selectedSymptom === symptom.name ? "white" : symptom.color,
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full mr-1 md:mr-2"
                          style={{ backgroundColor: symptom.color }}
                        ></div>
                        <span className="truncate max-w-[100px] md:max-w-none">{symptom.name}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Wellness Chart */}
          {activeTab === "wellness" && (
            <div className="relative">
              {wellnessData.every((score) => score === 0) ? (
                // Show empty state without chart when no data
                <div className="text-center text-sm text-secondary-color p-6 bg-peach-50 rounded-lg min-h-[200px] flex items-center justify-center">
                  <p className="max-w-md">
                    Log your first day to start tracking your wellness. Your wellness score is calculated from sleep
                    quality, stress levels, and overall mood.
                  </p>
                </div>
              ) : (
                <div className="relative min-h-[280px] md:min-h-[320px]">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-8 w-10 md:w-16 flex flex-col justify-between text-[10px] md:text-xs text-secondary-color py-4 z-10">
                    <span className="leading-tight">100</span>
                    <span className="leading-tight">75</span>
                    <span className="leading-tight">50</span>
                    <span className="leading-tight">25</span>
                    <span className="leading-tight">0</span>
                  </div>

                  {/* Vertical grid lines */}
                  <div className="absolute left-10 md:left-16 right-0 top-0 bottom-8 flex justify-between z-0">
                    {wellnessHistoryData.dates.map((date, index) => (
                      <div
                        key={index}
                        className="h-full border-r border-peach-100 flex flex-col justify-end items-center"
                        style={{ width: `${100 / wellnessHistoryData.dates.length}%` }}
                      >
                        <span className="text-[10px] md:text-xs text-secondary-color mb-2 whitespace-nowrap">
                          {date}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Chart area */}
                  <div className="absolute left-10 md:left-16 right-0 top-0 bottom-8 px-2 md:px-4 pt-4 z-0">
                    {/* Grid lines */}
                    <div className="absolute inset-0">
                      <div className="border-b border-pink-100 absolute top-[20%] left-0 right-0"></div>
                      <div className="border-b border-pink-100 absolute top-[40%] left-0 right-0"></div>
                      <div className="border-b border-pink-100 absolute top-[60%] left-0 right-0"></div>
                      <div className="border-b border-pink-100 absolute top-[80%] left-0 right-0"></div>
                    </div>

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
                      <path d={createWellnessAreaPath(wellnessData)} fill="url(#wellness-gradient)" opacity="0.8" />

                      {/* Line on top */}
                      <path
                        d={createWellnessCurvePath(wellnessData)}
                        fill="none"
                        stroke={wellnessHistoryData.color}
                        strokeWidth="0.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Add dots for data points */}
                      {wellnessData.map((value, i) => {
                        if (value === 0) return null // Don't show dots for zero values

                        const x = (i / (wellnessData.length - 1)) * 100
                        const y = 100 - value

                        return (
                          <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="0.8"
                            fill="white"
                            stroke={wellnessHistoryData.color}
                            strokeWidth="0.8"
                          />
                        )
                      })}
                    </svg>
                  </div>

                  {/* Wellness Score Display */}
                  <div className="flex items-center justify-center mt-12 relative z-20">
                    <div className="text-center">
                      <p className="text-sm text-secondary-color mb-2">Current Wellness Score</p>
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                        style={{
                          backgroundColor:
                            wellnessScore >= 75
                              ? "#9bb8a0"
                              : wellnessScore >= 50
                                ? "#f6d84c"
                                : wellnessScore >= 25
                                  ? "#f6c1b0"
                                  : "#f4a6b8",
                        }}
                      >
                        {wellnessScore}
                      </div>
                    </div>
                  </div>

                  {/* Wellness Factors */}
                  <div className="flex flex-wrap gap-4 mt-4 justify-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2 bg-pink-400"></div>
                      <span className="text-sm text-primary-color">Mood</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2 bg-peach-400"></div>
                      <span className="text-sm text-primary-color">Sleep</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2 bg-yellow-400"></div>
                      <span className="text-sm text-primary-color">Stress</span>
                    </div>
                  </div>

                  {/* Message for users who haven't logged wellness yet */}
                  {!hasLoggedWellness && (
                    <div className="mt-4 text-center text-sm text-secondary-color p-2 bg-pink-50 rounded-lg">
                      Log your first day to start tracking your wellness score over time. Your score is calculated from
                      your mood, sleep quality, and stress levels.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "weight" && (
            <div className="relative">
              {weightData.length === 0 ? (
                <div className="text-center text-sm text-secondary-color p-6 bg-green-50 rounded-lg min-h-[200px] flex items-center justify-center">
                  <div>
                    <p className="max-w-md mb-4">
                      Start tracking your weight to see how your body responds to the AIP diet. Log your weight
                      regularly to see trends over time.
                    </p>
                    <Button
                      onClick={() => setShowWeightModal(true)}
                      className="bg-green-400 hover:bg-green-500 text-white"
                    >
                      Log First Weight
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="relative min-h-[280px] md:min-h-[320px]">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-8 w-10 md:w-16 flex flex-col justify-between text-[10px] md:text-xs text-secondary-color py-4">
                    <span className="leading-tight">{Math.max(...weightData.map((d) => d.weight)).toFixed(1)}</span>
                    <span className="leading-tight">
                      {(
                        (Math.max(...weightData.map((d) => d.weight)) + Math.min(...weightData.map((d) => d.weight))) /
                        2
                      ).toFixed(1)}
                    </span>
                    <span className="leading-tight">{Math.min(...weightData.map((d) => d.weight)).toFixed(1)}</span>
                  </div>

                  {/* Vertical grid lines */}
                  <div className="absolute left-10 md:left-16 right-0 top-0 bottom-8 flex justify-between">
                    {weightData.map((item, index) => (
                      <div
                        key={index}
                        className="h-full border-r border-green-100 flex flex-col justify-end items-center"
                        style={{ width: `${100 / weightData.length}%` }}
                      >
                        <span className="text-[10px] md:text-xs text-secondary-color mb-2 whitespace-nowrap">
                          {item.date}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Chart area */}
                  <div className="absolute left-10 md:left-16 right-0 top-0 bottom-8 px-2 md:px-4 pt-4">
                    {/* Grid lines */}
                    <div className="absolute inset-0">
                      <div className="border-b border-green-100 absolute top-[25%] left-0 right-0"></div>
                      <div className="border-b border-green-100 absolute top-[50%] left-0 right-0"></div>
                      <div className="border-b border-green-100 absolute top-[75%] left-0 right-0"></div>
                    </div>

                    {/* Weight curve */}
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {/* Filled area */}
                      <defs>
                        <linearGradient id="weight-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#86efac" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#86efac" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>

                      {/* Area fill */}
                      <path d={createWeightAreaPath(weightData)} fill="url(#weight-gradient)" />

                      {/* Line on top */}
                      <path
                        d={createWeightCurvePath(weightData)}
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="0.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Add dots for data points */}
                      {weightData.map((item, i) => {
                        const minWeight = Math.min(...weightData.map((d) => d.weight))
                        const maxWeight = Math.max(...weightData.map((d) => d.weight))
                        const range = maxWeight - minWeight || 1

                        const x = (i / (weightData.length - 1)) * 100
                        const y = 100 - ((item.weight - minWeight) / range) * 100

                        return <circle key={i} cx={x} cy={y} r="0.8" fill="white" stroke="#22c55e" strokeWidth="0.8" />
                      })}
                    </svg>
                  </div>

                  {/* Current Weight Display */}
                  <div className="flex items-center justify-center mt-12">
                    <div className="text-center">
                      <p className="text-sm text-secondary-color mb-2">Current Weight</p>
                      <div className="text-3xl font-bold text-green-600">
                        {currentWeight?.toFixed(1)} {weightUnit}
                      </div>
                      {weightData.length > 1 && (
                        <p className="text-xs text-secondary-color mt-2">
                          {weightData[weightData.length - 1].weight > weightData[0].weight ? "+" : ""}
                          {(weightData[weightData.length - 1].weight - weightData[0].weight).toFixed(1)} {weightUnit}{" "}
                          from start
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Log Weight Button */}
                  <div className="flex justify-center mt-4">
                    <Button
                      onClick={() => setShowWeightModal(true)}
                      className="bg-green-400 hover:bg-green-500 text-white"
                    >
                      Update Weight
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Daily Observations Module */}
        {/* Update the Daily Observations Module section to ensure it's displaying content */}
        <div className="glass-card p-6 mb-6">
          <div className="flex items-center mb-4">
            <LightbulbIcon className="h-5 w-5 mr-2 text-amber-500" />
            <h3 className="font-medium text-xl text-primary-color">Daily Observations</h3>
          </div>

          {dailyObservations === null ? (
            <div className="text-center text-sm text-secondary-color p-4 bg-pink-50 rounded-lg">
              Log your symptoms to see daily insights.
            </div>
          ) : dailyObservations.length === 0 ? (
            <div className="text-center text-sm text-secondary-color p-4 bg-pink-50 rounded-lg">
              No insights for today. Try logging your symptoms and wellness data.
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

        {/* To Do List Module */}
        {todoItems.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center mb-4">
              <ListChecks className="h-5 w-5 mr-2 text-blue-500" />
              <h3 className="font-medium text-xl text-primary-color">Daily To-Do List</h3>
            </div>

            <div className="mb-2">
              <p className="text-sm text-secondary-color">{getPhaseDisplayText()}</p>
            </div>

            <ul className="space-y-3">
              {todoItems.map((item) => (
                <li key={item.id} className={`flex items-start ${item.isSpecial ? "bg-pink-50 p-3 rounded-lg" : ""}`}>
                  <button
                    onClick={() => toggleTodoCompletion(item.id)}
                    className="mt-0.5 mr-3 flex-shrink-0 text-primary-color hover:text-accent-color transition-colors"
                    aria-label={completedTodoIds.includes(item.id) ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {completedTodoIds.includes(item.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>
                  <span
                    className={`text-sm ${
                      completedTodoIds.includes(item.id)
                        ? "text-gray-400 line-through"
                        : item.isSpecial
                          ? "text-pink-700 font-medium"
                          : "text-primary-color"
                    }`}
                  >
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 text-center">
              <p className="text-xs text-secondary-color">Check off items as you complete them throughout the day</p>
            </div>
          </div>
        )}
      </main>

      {/* Confetti celebration */}
      <ConfettiCelebration active={showConfetti} onComplete={() => setShowConfetti(false)} duration={4000} />

      {/* Bottom Navigation */}
      <nav className="grid grid-cols-5 border-t border-pink-200 bg-white/80 backdrop-blur-sm">
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

      {showWeightModal &&
        userId && ( // Only show modal when userId is available
          <WeightLogModal
            userId={userId} // Pass userId from state
            currentWeight={currentWeight}
            currentUnit={weightUnit}
            onClose={() => setShowWeightModal(false)}
            onSave={handleWeightSaved}
          />
        )}
    </div>
  )
}
