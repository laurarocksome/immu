"use client"

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
    // Only access localStorage on the client side
    if (typeof window !== "undefined") {
      const dietTimeline = localStorage.getItem("userDietTimeline")
      const startDate = localStorage.getItem("dietStartDate")
      const adaptationChoice = localStorage.getItem("userAdaptationChoice")

      // Check if user has adaptation period
      const hasAdaptation = adaptationChoice === "Yes"

      // Calculate days for each phase
      const adaptationDays = hasAdaptation ? 28 : 0
      const totalSelectedDays = dietTimeline ? Number.parseInt(dietTimeline) : 30
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
    }
  }, [])

  // Render different UI based on current phase
  return (
    <div className="space-y-4">
      {/* Phase Timeline */}
      <div className="relative pt-6">
        <div className="h-2 bg-gray-200 rounded-full">
          {progressData.adaptationDays > 0 && (
            <div
              className={`absolute h-2 bg-amber-400 rounded-l-full ${progressData.currentPhase !== "adaptation" ? "rounded-r-full" : ""}`}
              style={{
                width: `${(progressData.adaptationDays / (progressData.adaptationDays + progressData.eliminationDays + progressData.reintroductionDays)) * 100}%`,
                left: 0,
              }}
            ></div>
          )}
          <div
            className={`absolute h-2 bg-pink-400 ${progressData.adaptationDays > 0 ? "" : "rounded-l-full"} ${progressData.currentPhase === "reintroduction" ? "" : "rounded-r-full"}`}
            style={{
              width: `${(progressData.eliminationDays / (progressData.adaptationDays + progressData.eliminationDays + progressData.reintroductionDays)) * 100}%`,
              left: `${(progressData.adaptationDays / (progressData.adaptationDays + progressData.eliminationDays + progressData.reintroductionDays)) * 100}%`,
            }}
          ></div>
          <div
            className="absolute h-2 bg-green-400 rounded-r-full"
            style={{
              width: `${(progressData.reintroductionDays / (progressData.adaptationDays + progressData.eliminationDays + progressData.reintroductionDays)) * 100}%`,
              left: `${((progressData.adaptationDays + progressData.eliminationDays) / (progressData.adaptationDays + progressData.eliminationDays + progressData.reintroductionDays)) * 100}%`,
            }}
          ></div>
        </div>

        {/* Phase Labels */}
        {progressData.adaptationDays > 0 && (
          <div
            className="absolute text-xs font-medium text-amber-600 -top-6"
            style={{
              left: `${(progressData.adaptationDays / (progressData.adaptationDays + progressData.eliminationDays + progressData.reintroductionDays)) * 50}%`,
              transform: "translateX(-50%)",
            }}
          >
            Adaptation
          </div>
        )}
        <div
          className="absolute text-xs font-medium text-pink-600 -top-6"
          style={{
            left: `${
              (
                progressData.adaptationDays /
                  (progressData.adaptationDays + progressData.eliminationDays + progressData.reintroductionDays)
              ) *
                100 +
              (
                progressData.eliminationDays /
                  (progressData.adaptationDays + progressData.eliminationDays + progressData.reintroductionDays)
              ) *
                50
            }%`,
            transform: "translateX(-50%)",
          }}
        >
          Elimination
        </div>
        <div
          className="absolute text-xs font-medium text-green-600 -top-6"
          style={{
            left: `${
              (
                (progressData.adaptationDays + progressData.eliminationDays) /
                  (progressData.adaptationDays + progressData.eliminationDays + progressData.reintroductionDays)
              ) *
                100 +
              (
                progressData.reintroductionDays /
                  (progressData.adaptationDays + progressData.eliminationDays + progressData.reintroductionDays)
              ) *
                50
            }%`,
            transform: "translateX(-50%)",
          }}
        >
          Reintroduction
        </div>
      </div>

      {/* Current Phase Info */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-center">
          <p className="text-sm text-brand-dark/70">
            {progressData.currentPhase === "adaptation"
              ? "Adaptation Phase"
              : progressData.currentPhase === "elimination"
                ? "Elimination Phase"
                : "Reintroduction Phase"}
          </p>
          <p className="font-bold">{progressData.daysRemaining} days left</p>
        </div>

        <div className="relative w-32">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className={`h-2 rounded-full ${
                progressData.currentPhase === "adaptation"
                  ? "bg-amber-400"
                  : progressData.currentPhase === "elimination"
                    ? "bg-pink-400"
                    : "bg-green-400"
              }`}
              style={{ width: `${progressData.progressPercentage}%` }}
            ></div>
          </div>
          <div className="absolute -top-5 right-0 text-xs font-medium text-brand-dark">
            {progressData.progressPercentage}%
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-brand-dark/70">Next Phase</p>
          <p className="font-bold">
            {progressData.currentPhase === "adaptation"
              ? progressData.adaptationEndDate
              : progressData.currentPhase === "elimination"
                ? progressData.eliminationEndDate
                : progressData.reintroductionEndDate}
          </p>
        </div>
      </div>

      {/* Phase Details */}
      <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs">
        {progressData.adaptationDays > 0 && (
          <div
            className={`p-2 rounded-lg ${progressData.currentPhase === "adaptation" ? "bg-amber-100 text-amber-800" : "bg-gray-100"}`}
          >
            <p className="font-medium">Adaptation</p>
            <p>{progressData.adaptationDays} days</p>
          </div>
        )}
        <div
          className={`p-2 rounded-lg ${progressData.currentPhase === "elimination" ? "bg-pink-100 text-pink-800" : "bg-gray-100"} ${progressData.adaptationDays === 0 ? "col-span-2" : ""}`}
        >
          <p className="font-medium">Elimination</p>
          <p>{progressData.eliminationDays} days</p>
        </div>
        <div
          className={`p-2 rounded-lg ${progressData.currentPhase === "reintroduction" ? "bg-green-100 text-green-800" : "bg-gray-100"} ${progressData.adaptationDays === 0 ? "col-span-1" : ""}`}
        >
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
      <header className="p-4 flex justify-between items-center bg-brand-dark text-white">
        <button onClick={handleBack} className="flex items-center text-white/80 hover:text-white">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </button>
        <Logo />
        <div className="w-20"></div> {/* Empty div for spacing */}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
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
                    ? "border-l-4 border-green-400"
                    : event.type === "symptom"
                      ? "border-l-4 border-amber-400"
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
