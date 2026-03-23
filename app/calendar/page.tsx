"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import Logo from "@/app/components/logo"

// Replace the ProgressBar component with this updated version that handles all three phases

function ProgressBar() {
  const [progressData, setProgressData] = useState({
    adaptationDays: 0,
    eliminationDays: 0,
    reintroductionDays: 150, // 5 months in days
    currentPhase: "adaptation",
    adaptationEndDate: "",
    eliminationEndDate: "",
    reintroductionEndDate: "",
    progressPercentage: 0,
    daysRemaining: 0,
  })

  useEffect(() => {
    async function checkVisibility() {
      const visible = await isPageVisible("calendar")
      if (!visible) { router.replace("/dashboard"); return }
    }
    checkVisibility()
  }, [])

  useEffect(() => {
    async function loadDietData() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const sb = createClient()
        const { data: { user } } = await sb.auth.getUser()

        let startDate: string | null = null
        let dietTimeline: string | null = null
        let adaptationChoice: string | null = null

        if (user) {
          const { data } = await sb.from("diet_info").select("start_date, timeline_days, adaptation_choice").eq("user_id", user.id).single()
          if (data) {
            startDate = data.start_date
            dietTimeline = data.timeline_days?.toString()
            adaptationChoice = data.adaptation_choice
          }
        }

        // Fallback to localStorage
        if (!startDate) startDate = localStorage.getItem("dietStartDate")
        if (!dietTimeline) dietTimeline = localStorage.getItem("userDietTimeline")
        if (!adaptationChoice) adaptationChoice = localStorage.getItem("userAdaptationChoice")

      // Check if user has adaptation period
      const hasAdaptation = adaptationChoice === "Yes" || adaptationChoice === "yes"

      // Calculate days for each phase
      const adaptationDays = hasAdaptation ? 28 : 0
      const totalSelectedDays = dietTimeline ? Number.parseInt(dietTimeline) : 90
      const eliminationDays = hasAdaptation ? totalSelectedDays - adaptationDays : totalSelectedDays
      const reintroductionDays = 150 // 5 months in days

      // Calculate start date for each phase
      const dietStartDate = startDate ? new Date(startDate) : new Date()

      // Calculate end dates for each phase
      const adaptationEndDate = new Date(dietStartDate)
      adaptationEndDate.setDate(adaptationEndDate.getDate() + adaptationDays)

      const eliminationEndDate = new Date(adaptationEndDate)
      eliminationEndDate.setDate(eliminationEndDate.getDate() + eliminationDays)

      const reintroductionEndDate = new Date(eliminationEndDate)
      reintroductionEndDate.setDate(reintroductionEndDate.getDate() + reintroductionDays)

      // Calculate days elapsed since diet start
      const today = new Date()
      const daysElapsed = Math.floor((today.getTime() - dietStartDate.getTime()) / (1000 * 60 * 60 * 24))

      // Determine current phase and days remaining
      let currentPhase = "adaptation"
      let daysRemaining = 0
      let progressPercentage = 0

      if (hasAdaptation && daysElapsed < adaptationDays) {
        // In adaptation phase
        currentPhase = "adaptation"
        daysRemaining = adaptationDays - daysElapsed
        progressPercentage = Math.min(Math.round((daysElapsed / adaptationDays) * 100), 100)
      } else if (daysElapsed < (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays)) {
        // In elimination phase
        currentPhase = "elimination"
        const eliminationDaysElapsed = daysElapsed - (hasAdaptation ? adaptationDays : 0)
        daysRemaining = eliminationDays - eliminationDaysElapsed
        progressPercentage = Math.min(Math.round((eliminationDaysElapsed / eliminationDays) * 100), 100)
      } else {
        // In reintroduction phase
        currentPhase = "reintroduction"
        const reintroductionDaysElapsed =
          daysElapsed - (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays)
        daysRemaining = Math.max(reintroductionDays - reintroductionDaysElapsed, 0)
        progressPercentage = Math.min(Math.round((reintroductionDaysElapsed / reintroductionDays) * 100), 100)
      }

      setProgressData({
        adaptationDays,
        eliminationDays,
        reintroductionDays,
        currentPhase,
        adaptationEndDate: hasAdaptation
          ? adaptationEndDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
          : "",
        eliminationEndDate: eliminationEndDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        reintroductionEndDate: reintroductionEndDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        progressPercentage,
        daysRemaining,
      })
      } catch (e) {
        console.error("Calendar load error:", e)
      }
    }
    loadDietData()
  }, [])

  // Render different UI based on current phase
  const total = progressData.adaptationDays + progressData.eliminationDays + progressData.reintroductionDays
  const adaptPct = total > 0 ? (progressData.adaptationDays / total) * 100 : 0
  const elimPct = total > 0 ? (progressData.eliminationDays / total) * 100 : 0
  const reintroPct = total > 0 ? (progressData.reintroductionDays / total) * 100 : 0

  const phaseColor = progressData.currentPhase === "adaptation"
    ? "bg-yellow-400" : progressData.currentPhase === "elimination"
    ? "bg-pink-400" : "bg-green-400"

  const phaseLabel = progressData.currentPhase === "adaptation"
    ? "Adaptation Phase" : progressData.currentPhase === "elimination"
    ? "Elimination Phase" : "Reintroduction Phase"

  const nextDate = progressData.currentPhase === "adaptation"
    ? progressData.adaptationEndDate : progressData.currentPhase === "elimination"
    ? progressData.eliminationEndDate : progressData.reintroductionEndDate

  return (
    <div className="space-y-5">
      {/* Phase bar */}
      <div>
        <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-2">
          {progressData.adaptationDays > 0 && (
            <div className={`h-full bg-yellow-400 ${progressData.currentPhase === "adaptation" ? "ring-2 ring-yellow-500 ring-offset-1" : ""}`}
              style={{ width: `${adaptPct}%` }} />
          )}
          <div className={`h-full bg-pink-400 ${progressData.currentPhase === "elimination" ? "ring-2 ring-pink-500 ring-offset-1" : ""}`}
            style={{ width: `${elimPct}%` }} />
          <div className={`h-full bg-green-300 ${progressData.currentPhase === "reintroduction" ? "ring-2 ring-green-500 ring-offset-1" : ""}`}
            style={{ width: `${reintroPct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-brand-dark/50">
          {progressData.adaptationDays > 0 && <span className="text-yellow-600">Adaptation</span>}
          <span className="text-pink-500">Elimination</span>
          <span className="text-green-600">Reintroduction</span>
        </div>
      </div>

      {/* Current phase info */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-brand-dark/60">{phaseLabel}</p>
          <p className="text-xl font-bold text-brand-dark">{progressData.daysRemaining} <span className="text-sm font-normal">days left</span></p>
        </div>

        <div className="flex-1 max-w-[140px]">
          <div className="flex justify-between text-xs text-brand-dark/60 mb-1">
            <span>Progress</span>
            <span>{progressData.progressPercentage}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full">
            <div className={`h-2 rounded-full ${phaseColor} transition-all`}
              style={{ width: `${progressData.progressPercentage}%` }} />
          </div>
        </div>

        {nextDate && (
          <div className="text-right">
            <p className="text-xs text-brand-dark/60">Next phase</p>
            <p className="font-bold text-brand-dark">{nextDate}</p>
          </div>
        )}
      </div>

      {/* Phase pills */}
      <div className="flex gap-2 flex-wrap">
        {progressData.adaptationDays > 0 && (
          <div className={`flex-1 min-w-[80px] text-center py-2 px-3 rounded-xl text-xs ${progressData.currentPhase === "adaptation" ? "bg-yellow-100 text-yellow-800 font-semibold" : "bg-gray-50 text-brand-dark/50"}`}>
            <p className="font-medium">Adaptation</p>
            <p>{progressData.adaptationDays}d</p>
          </div>
        )}
        <div className={`flex-1 min-w-[80px] text-center py-2 px-3 rounded-xl text-xs ${progressData.currentPhase === "elimination" ? "bg-pink-100 text-pink-800 font-semibold" : "bg-gray-50 text-brand-dark/50"}`}>
          <p className="font-medium">Elimination</p>
          <p>{progressData.eliminationDays}d</p>
        </div>
        <div className={`flex-1 min-w-[80px] text-center py-2 px-3 rounded-xl text-xs ${progressData.currentPhase === "reintroduction" ? "bg-green-100 text-green-800 font-semibold" : "bg-gray-50 text-brand-dark/50"}`}>
          <p className="font-medium">Reintroduction</p>
          <p>~5 months</p>
        </div>
      </div>
    </div>
  )
}

// Sample data for the calendar
const sampleEvents = [
  { date: "2023-04-08", type: "meal", title: "Breakfast", details: "Sweet potato hash, Avocado" },
  { date: "2023-04-08", type: "meal", title: "Lunch", details: "Grilled chicken, Mixed greens" },
  { date: "2023-04-08", type: "symptom", title: "Fatigue", details: "Severity: 3/5" },
  { date: "2023-04-09", type: "meal", title: "Breakfast", details: "Coconut yogurt, Berries" },
  { date: "2023-04-09", type: "milestone", title: "Elimination Phase", details: "Day 7 completed" },
  { date: "2023-04-10", type: "meal", title: "Dinner", details: "Salmon, Roasted vegetables" },
  { date: "2023-04-10", type: "symptom", title: "Joint Pain", details: "Severity: 2/5" },
]

export default function CalendarPage() {
  const router = useRouter()
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const handleBack = () => {
    router.back()
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Get events for the selected date
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0]
    return sampleEvents.filter((event) => event.date === dateString)
  }

  const selectedDateEvents = getEventsForDate(selectedDate)

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay()

    // Total days in the month
    const daysInMonth = lastDay.getDate()

    // Calendar array
    const calendar = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      calendar.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      calendar.push(date)
    }

    return calendar
  }

  const calendarDays = generateCalendarDays()
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 flex justify-center items-center header-gradient text-white relative">
        <button onClick={handleBack} className="absolute left-4 flex items-center text-white/80 hover:text-white">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </button>
        <Logo variant="light" />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Calendar</h2>
          <p className="text-brand-dark/70">Track your AIP journey</p>
        </div>

        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="p-2">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="font-bold text-lg">
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h3>
          <button onClick={handleNextMonth} className="p-2">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="glass-card rounded-2xl p-4 mb-6">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 mb-2">
            {weekdays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-brand-dark/70">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="h-10 p-1"></div>
              }

              const isToday = date.toDateString() === new Date().toDateString()
              const isSelected = date.toDateString() === selectedDate.toDateString()
              const hasEvents = sampleEvents.some((event) => event.date === date.toISOString().split("T")[0])

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`h-10 rounded-lg flex items-center justify-center relative ${
                    isSelected
                      ? "bg-pink-400 text-white"
                      : isToday
                        ? "bg-pink-100 text-brand-dark"
                        : "hover:bg-white/80"
                  }`}
                >
                  {date.getDate()}
                  {hasEvents && (
                    <div
                      className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-white" : "bg-pink-400"}`}
                    ></div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Progress Bar Section */}
        <div className="glass-card rounded-2xl p-4 mb-6">
          <h3 className="font-medium mb-4">Your Progress</h3>
          <ProgressBar />
        </div>

        {/* Selected Date Events */}
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-2">
            {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </h3>
        </div>

        {selectedDateEvents.length > 0 ? (
          <div className="space-y-3 mb-6">
            {selectedDateEvents.map((event, index) => (
              <div
                key={index}
                className={`glass-card rounded-2xl p-4 ${
                  event.type === "meal"
                    ? "border-l-4 border-pink-400"
                    : event.type === "symptom"
                      ? "border-l-4 border-yellow-400"
                      : "border-l-4 border-pink-400"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-medium">{event.title}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-lightest">
                    {event.type === "meal" ? "Meal" : event.type === "symptom" ? "Symptom" : "Milestone"}
                  </span>
                </div>
                <p className="text-sm text-brand-dark/70">{event.details}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 text-center mb-6">
            <p className="text-brand-dark/70">No events for this date</p>
          </div>
        )}

        {/* Log Day Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/log-day")}
            className="w-full py-3 gradient-button rounded-xl flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Day
          </button>
        </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav grid grid-cols-5 border-t border-brand-dark/10 bg-white/80 backdrop-blur-sm">
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
