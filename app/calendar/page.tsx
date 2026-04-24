"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
import Logo from "@/app/components/logo"
import BottomNav from "@/app/components/bottom-nav"
import { useLanguage, daysWord } from "@/lib/i18n/context"
import { isPageVisible } from "@/lib/page-visibility"

// Replace the ProgressBar component with this updated version that handles all three phases

function ProgressBar() {
  const { locale, t } = useLanguage()
  const dateLocale = locale === "lt" ? "lt-LT" : "en-US"
  const ltMonths = ["saus.","vas.","kov.","bal.","geg.","bir.","lie.","rgp.","rgs.","spl.","lap.","grd."]
  const fmtDate = (d: Date) => locale === "lt"
    ? `${ltMonths[d.getMonth()]} ${d.getDate()}`
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
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

      // Calculate days elapsed since diet start (normalize to midnight to avoid time-of-day skew)
      dietStartDate.setHours(0, 0, 0, 0)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const daysElapsed = Math.floor((today.getTime() - dietStartDate.getTime()) / (1000 * 60 * 60 * 24))

      // Determine current phase and days remaining
      let currentPhase = "adaptation"
      let daysRemaining = 0
      let progressPercentage = 0

      if (hasAdaptation && daysElapsed < adaptationDays) {
        currentPhase = "adaptation"
        daysRemaining = adaptationDays - daysElapsed
        // Use daysElapsed (no +1) so day 1 shows 0% — matches dashboard
        progressPercentage = Math.max(Math.min(Math.floor((daysElapsed / adaptationDays) * 100), 100), 0)
      } else if (daysElapsed < (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays)) {
        // In elimination phase
        currentPhase = "elimination"
        const eliminationDaysElapsed = daysElapsed - (hasAdaptation ? adaptationDays : 0)
        daysRemaining = eliminationDays - eliminationDaysElapsed
        progressPercentage = Math.max(Math.min(Math.floor((eliminationDaysElapsed / eliminationDays) * 100), 100), 0)
      } else {
        // In reintroduction phase
        currentPhase = "reintroduction"
        const reintroductionDaysElapsed =
          daysElapsed - (hasAdaptation ? adaptationDays + eliminationDays : eliminationDays)
        daysRemaining = Math.max(reintroductionDays - reintroductionDaysElapsed, 0)
        progressPercentage = Math.max(Math.min(Math.floor((reintroductionDaysElapsed / reintroductionDays) * 100), 100), 0)
      }

      setProgressData({
        adaptationDays,
        eliminationDays,
        reintroductionDays,
        currentPhase,
        adaptationEndDate: hasAdaptation ? fmtDate(adaptationEndDate) : "",
        eliminationEndDate: fmtDate(eliminationEndDate),
        reintroductionEndDate: fmtDate(reintroductionEndDate),
        progressPercentage,
        daysRemaining,
      })
      } catch (e) {
        console.error("Calendar load error:", e)
      }
    }
    loadDietData()
  }, [locale])

  const phaseColor = progressData.currentPhase === "adaptation"
    ? "bg-yellow-400" : progressData.currentPhase === "elimination"
    ? "bg-pink-400" : "bg-green-400"

  const phaseLabel = progressData.currentPhase === "adaptation"
    ? t("calendar.adaptationPhase", "Adaptation Phase") : progressData.currentPhase === "elimination"
    ? t("calendar.eliminationPhase", "Elimination Phase") : t("calendar.reintroductionPhase", "Reintroduction Phase")

  const nextDate = progressData.currentPhase === "adaptation"
    ? progressData.adaptationEndDate : progressData.currentPhase === "elimination"
    ? progressData.eliminationEndDate : progressData.reintroductionEndDate

  return (
    <div className="space-y-5">
      {/* Current phase info */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-brand-dark/60">{phaseLabel}</p>
          <p className="text-xl font-bold text-brand-dark">{progressData.daysRemaining} <span className="text-sm font-normal">{locale === "lt" ? `${daysWord(progressData.daysRemaining, "lt")} liko` : "days left"}</span></p>
        </div>

        <div className="flex-1 max-w-[140px]">
          <div className="flex justify-between text-xs text-brand-dark/60 mb-1">
            <span>{t("calendar.progress", "Progress")}</span>
            <span>{progressData.progressPercentage}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full">
            <div className={`h-2 rounded-full ${phaseColor} transition-all`}
              style={{ width: `${progressData.progressPercentage}%` }} />
          </div>
        </div>

        {nextDate && (
          <div className="text-right">
            <p className="text-xs text-brand-dark/60">{t("calendar.nextPhase", "Next phase")}</p>
            <p className="font-bold text-brand-dark">{nextDate}</p>
          </div>
        )}
      </div>

      {/* Phase pills */}
      <div className="flex gap-2 flex-wrap">
        {progressData.adaptationDays > 0 && (
          <div className={`flex-1 min-w-[80px] text-center py-2 px-3 rounded-xl text-xs ${progressData.currentPhase === "adaptation" ? "bg-yellow-100 text-yellow-800 font-semibold" : "bg-gray-50 text-brand-dark/50"}`}>
            <p className="font-medium">{t("calendar.adaptation", "Adaptation")}</p>
            <p>{progressData.adaptationDays}d</p>
          </div>
        )}
        <div className={`flex-1 min-w-[80px] text-center py-2 px-3 rounded-xl text-xs ${progressData.currentPhase === "elimination" ? "bg-pink-100 text-pink-800 font-semibold" : "bg-gray-50 text-brand-dark/50"}`}>
          <p className="font-medium">{t("calendar.elimination", "Elimination")}</p>
          <p>{progressData.eliminationDays}d</p>
        </div>
        <div className={`flex-1 min-w-[80px] text-center py-2 px-3 rounded-xl text-xs ${progressData.currentPhase === "reintroduction" ? "bg-green-100 text-green-800 font-semibold" : "bg-gray-50 text-brand-dark/50"}`}>
          <p className="font-medium">{t("calendar.reintroduction", "Reintroduction")}</p>
          <p>{t("calendar.months5", "~5 months")}</p>
        </div>
      </div>
    </div>
  )
}

type DayNote = { date: string; notes: string }

export default function CalendarPage() {
  const router = useRouter()
  const { locale, t } = useLanguage()
  const dateLocale = locale === "lt" ? "lt-LT" : "en-US"
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [dayNotes, setDayNotes] = useState<DayNote[]>([])

  useEffect(() => {
    isPageVisible("calendar").then(visible => {
      if (!visible) router.replace("/dashboard")
    })
  }, [])

  // Load notes from daily_logs for the visible month
  useEffect(() => {
    async function loadNotes() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const sb = createClient()
        const { data: { user } } = await sb.auth.getUser()
        if (!user) return

        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const monthStart = new Date(year, month, 1).toISOString().split("T")[0]
        const monthEnd = new Date(year, month + 1, 0).toISOString().split("T")[0]

        const { data } = await sb
          .from("daily_logs")
          .select("log_date, notes")
          .eq("user_id", user.id)
          .gte("log_date", monthStart)
          .lte("log_date", monthEnd)

        if (data) {
          setDayNotes(
            data
              .filter((row: any) => row.notes && row.notes.trim().length > 0)
              .map((row: any) => ({ date: row.log_date, notes: row.notes }))
          )
        }
      } catch (e) {
        console.error("Calendar notes load error:", e)
      }
    }
    loadNotes()
  }, [currentMonth])

  const handleBack = () => {
    router.back()
  }

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // Format a Date to a YYYY-MM-DD string in local time (matches log_date stored by log-day)
  const toLocalDateString = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, "0")
    const d = String(date.getDate()).padStart(2, "0")
    return `${y}-${m}-${d}`
  }

  const selectedDateString = toLocalDateString(selectedDate)
  const selectedNote = dayNotes.find((n) => n.date === selectedDateString)

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)

    // Day of the week for the first day, Monday-first (0 = Monday, 6 = Sunday)
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7

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
  const weekdays = [
    t("calendar.weekday.mon", "Mon"),
    t("calendar.weekday.tue", "Tue"),
    t("calendar.weekday.wed", "Wed"),
    t("calendar.weekday.thu", "Thu"),
    t("calendar.weekday.fri", "Fri"),
    t("calendar.weekday.sat", "Sat"),
    t("calendar.weekday.sun", "Sun"),
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 flex justify-center items-center header-gradient text-white relative">
        <button onClick={handleBack} className="absolute left-4 flex items-center text-white/80 hover:text-white">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>{t("common.back", "Back")}</span>
        </button>
        <Logo variant="light" />
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{t("calendar.title", "Calendar")}</h2>
          <p className="text-brand-dark/70">{t("calendar.trackJourney", "Track your AIP journey")}</p>
        </div>

        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={handlePrevMonth} className="p-2">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="font-bold text-lg">
            {currentMonth.toLocaleDateString(dateLocale, { month: "long", year: "numeric" })}
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
              const hasEvents = dayNotes.some((n) => n.date === toLocalDateString(date))

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
          <h3 className="font-medium mb-4">{t("calendar.yourProgress", "Your Progress")}</h3>
          <ProgressBar />
        </div>

        {/* Selected Date Events */}
        <div className="mb-4">
          <h3 className="font-bold text-lg mb-2">
            {selectedDate.toLocaleDateString(dateLocale, { weekday: "long", month: "long", day: "numeric" })}
          </h3>
        </div>

        {selectedNote ? (
          <div className="glass-card rounded-2xl p-4 mb-6 border-l-4 border-pink-400">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">{t("calendar.notes", "Notes")}</h4>
            </div>
            <p className="text-sm text-brand-dark/80 whitespace-pre-wrap">{selectedNote.notes}</p>
          </div>
        ) : (
          <div className="glass-card rounded-2xl p-6 text-center mb-6">
            <p className="text-brand-dark/70">{t("calendar.noNotes", "No notes for this date")}</p>
          </div>
        )}

        {/* Log Day Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/log-day")}
            className="w-full py-3 gradient-button rounded-xl flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t("calendar.log_day", "Log Day").replace(/^\+\s*/, "")}
          </button>
        </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
