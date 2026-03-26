"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Sun, Moon, Brain } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { logSymptoms, getCurrentPhaseAndDay } from "@/lib/supabase/user-tracking"
import { saveDietInfo } from "@/lib/user-data"
import { useLanguage } from "@/lib/i18n/context"
import Logo from "@/app/components/logo"

interface Symptom {
  id: string
  name: string
  severity: number
}

const PERIOD_SYMPTOMS = [
  "Cramps",
  "Back Pain",
  "Bloating",
  "Headache",
  "Fatigue",
  "Mood Swings",
  "Breast Tenderness",
  "Nausea",
]

export default function LogDayContent() {
  const router = useRouter()
  const { t } = useLanguage()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [mood, setMood] = useState(3)
  const [sleep, setSleep] = useState(3)
  const [stress, setStress] = useState(3)

  const [currentPhase, setCurrentPhase] = useState<string>("Adaptation")
  const [currentDay, setCurrentDay] = useState<number>(1)

  const [aipCompliant, setAipCompliant] = useState(true)
  const [showRestartModal, setShowRestartModal] = useState(false)
  const [restartPhase, setRestartPhase] = useState<"adaptation" | "elimination">("elimination")
  const [restartDays, setRestartDays] = useState(90)

  const [onPeriod, setOnPeriod] = useState(false)
  const [notes, setNotes] = useState("")

  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [availableSymptoms, setAvailableSymptoms] = useState<string[]>([])
  const loadedRef = useRef(false)

  const [selectedDate] = useState(() => new Date().toISOString().split("T")[0])

  useEffect(() => {
    if (loadedRef.current) return
    loadedRef.current = true
    async function loadUserData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      setUserId(user.id)

      const phaseInfo = await getCurrentPhaseAndDay(user.id)
      if (phaseInfo) { setCurrentPhase(phaseInfo.phase); setCurrentDay(phaseInfo.day) }

      const { data: userSymptoms } = await supabase
        .from("user_symptoms").select("symptom").eq("user_id", user.id)

      const DEFAULT_SYMPTOMS = ["Headache","Fatigue","Brain Fog","Bloating","Joint Pain","Skin Issues","Digestive Issues","Mood Changes","Insomnia","Cravings"]
      let customSymptoms: string[] = []
      if (userSymptoms && userSymptoms.length > 0) {
        customSymptoms = [...new Set(userSymptoms.map(s => s.symptom))]
        setAvailableSymptoms([...new Set([...customSymptoms, ...DEFAULT_SYMPTOMS])])
      } else {
        setAvailableSymptoms(DEFAULT_SYMPTOMS)
      }

      const { data: existingLog } = await supabase
        .from("daily_logs").select("*, symptom_logs(*)")
        .eq("user_id", user.id).eq("log_date", selectedDate).maybeSingle()

      if (existingLog) {
        setMood(existingLog.mood || 3)
        setSleep(existingLog.sleep || 3)
        setStress(existingLog.stress || 3)
        setAipCompliant(existingLog.aip_compliant ?? null)
        setOnPeriod(existingLog.on_period ?? null)
        setNotes(existingLog.notes || "")
        if (existingLog.symptom_logs?.length > 0) {
          setSymptoms(existingLog.symptom_logs.map((s: any) => ({ id: s.id, name: s.symptom, severity: s.severity })))
        }
      } else if (customSymptoms.length > 0) {
        setSymptoms([...new Set(customSymptoms)].map(name => ({ id: crypto.randomUUID(), name, severity: 1 })))
      }
      setIsLoading(false)
    }
    loadUserData()
  }, [router, selectedDate])

  const handleRestartElimination = async () => {
    if (!userId) return
    
    await transitionToPhase(userId, "Elimination", "User restarted elimination after diet violation")
    setShowRestartOptions(false)
    setCurrentPhase("Elimination")
    setCurrentDay(1)
  }

  const handleStartAdaptation = async () => {
    if (!userId) return
    
    await transitionToPhase(userId, "Adaptation", "User started adaptation phase after diet violation")
    setShowRestartOptions(false)
    setCurrentPhase("Adaptation")
    setCurrentDay(1)
  }

  const handleContinueAnyway = () => {
    setShowRestartOptions(false)
  }

  const handleSave = async () => {
    if (!userId) return
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { data: existing } = await supabase
        .from("daily_logs").select("id")
        .eq("user_id", userId).eq("log_date", selectedDate).maybeSingle()

      let dailyLogId: string
      if (existing) {
        const { data, error } = await supabase.from("daily_logs")
          .update({ mood, sleep, stress, aip_compliant: aipCompliant, on_period: onPeriod, notes, updated_at: new Date().toISOString() })
          .eq("id", existing.id).select().single()
        if (error) throw error
        dailyLogId = data.id
      } else {
        const { data, error } = await supabase.from("daily_logs")
          .insert({ user_id: userId, log_date: selectedDate, mood, sleep, stress, aip_compliant: aipCompliant, on_period: onPeriod, notes })
          .select().single()
        if (error) throw error
        dailyLogId = data.id
      }
      if (symptoms.length > 0) {
        await logSymptoms(dailyLogId, symptoms.map(s => ({ symptom: s.name, severity: s.severity })))
      }
      setShowSuccess(true)
      setTimeout(() => router.push("/dashboard"), 1500)
    } catch (error) {
      console.error("Error saving log:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const addSymptom = (name: string) => {
    if (symptoms.find(s => s.name === name)) return
    setSymptoms(prev => [...prev, { id: crypto.randomUUID(), name, severity: 1 }])
  }

  const removeSymptom = (id: string) => setSymptoms(prev => prev.filter(s => s.id !== id))
  const updateSymptomSeverity = (id: string, severity: number) =>
    setSymptoms(prev => prev.map(s => s.id === id ? { ...s, severity: Math.max(1, Math.min(5, severity)) } : s))

  const ScoreRow = ({ label, icon: Icon, value, onChange, lowLabel, highLabel }: {
    label: string; icon: any; value: number; onChange: (v: number) => void; lowLabel: string; highLabel: string
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-pink-400" />
        <span className="font-medium text-brand-dark">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-brand-dark/50 w-10">{lowLabel}</span>
        <div className="flex gap-2">
          {[1,2,3,4,5].map(score => (
            <button key={score} onClick={() => onChange(score)}
              className={`w-10 h-10 rounded-full border-2 font-medium transition-all text-sm ${
                value === score
                  ? "bg-pink-400 border-pink-400 text-white"
                  : "border-pink-200 text-brand-dark hover:border-pink-400"
              }`}
            >{score}</button>
          ))}
        </div>
        <span className="text-xs text-brand-dark/50 w-10 text-right">{highLabel}</span>
      </div>
    </div>
  )

  if (isLoading) return (
    <div className="min-h-screen app-gradient flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400" />
    </div>
  )

  if (showSuccess) return (
    <div className="min-h-screen app-gradient flex items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
          <svg className="h-8 w-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-brand-dark">Log Saved!</h2>
        <p className="text-brand-dark/60">Redirecting to dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen app-gradient flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-center items-center header-gradient text-white relative">
        <button onClick={() => router.back()}
          className="absolute left-4 text-white/80 hover:text-white transition-colors flex items-center">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </button>
        <Logo variant="light" />
      </header>

      {/* Phase indicator */}
      <div className="text-center pt-4 pb-2">
        <p className="text-sm text-brand-dark/60">{currentPhase} – Day {currentDay}</p>
        <h1 className="text-2xl font-bold text-brand-dark">Log Your Day</h1>
      </div>

      <main className="flex-1 px-4 pb-32 max-w-lg mx-auto w-full space-y-4 pt-4">

        {/* Wellness */}
        <div className="glass-card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-brand-dark">How are you feeling?</h2>
          <ScoreRow label="Mood" icon={Sun} value={mood} onChange={setMood} lowLabel="Low" highLabel="Great" />
          <ScoreRow label="Sleep Quality" icon={Moon} value={sleep} onChange={setSleep} lowLabel="Poor" highLabel="Great" />
          <ScoreRow label="Stress Level" icon={Brain} value={stress} onChange={setStress} lowLabel="High" highLabel="Low" />
        </div>

        {/* AIP Compliance */}
        {currentPhase === "Elimination" && (
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-brand-dark mb-4">AIP Compliance</h2>
            <div className="flex gap-3">
              <button onClick={() => setAipCompliant(true)}
                className={`flex-1 py-3 rounded-full border-2 font-medium transition-all ${
                  aipCompliant ? "bg-green-50 border-green-400 text-green-700" : "border-pink-200 text-brand-dark/60"
                }`}>
                100% Compliant
              </button>
              <button onClick={() => { setAipCompliant(false); setShowRestartModal(true) }}
                className={`flex-1 py-3 rounded-full border-2 font-medium transition-all ${
                  !aipCompliant ? "bg-orange-50 border-orange-400 text-orange-700" : "border-pink-200 text-brand-dark/60"
                }`}>
                Had exceptions
              </button>
            </div>
          </div>
        )}

        {/* Restart modal */}
        {currentPhase === "Elimination" && showRestartModal && (
          <div className="glass-card p-6 border-orange-200 bg-orange-50">
            <h2 className="text-lg font-semibold text-orange-800 mb-2">Restart Your Diet?</h2>
            <p className="text-sm text-orange-700 mb-5">
              AIP allows zero exceptions during elimination. To get accurate results, restart from Day 1.
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <button onClick={() => { setRestartPhase("elimination"); setRestartDays(90) }}
                  className={`flex-1 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                    restartPhase === "elimination" ? "bg-pink-100 border-pink-400 text-pink-800" : "border-gray-200 text-brand-dark/60"
                  }`}>Elimination</button>
                <button onClick={() => { setRestartPhase("adaptation"); setRestartDays(118) }}
                  className={`flex-1 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                    restartPhase === "adaptation" ? "bg-pink-100 border-pink-400 text-pink-800" : "border-gray-200 text-brand-dark/60"
                  }`}>Adaptation + Elimination</button>
              </div>
              <div>
                <label className="block text-sm text-brand-dark/70 mb-1">
                  Elimination duration: {restartPhase === "adaptation" ? restartDays - 28 : restartDays} days
                </label>
                <input type="range"
                  min={restartPhase === "adaptation" ? 58 : 30}
                  max={restartPhase === "adaptation" ? 118 : 90}
                  value={restartDays}
                  onChange={e => setRestartDays(Number(e.target.value))}
                  className="w-full accent-pink-400" />
              </div>
              <div className="flex gap-3">
                <button onClick={async () => {
                  if (!userId) return
                  const today = new Date().toISOString()
                  await saveDietInfo({ startDate: today, timelineDays: restartDays, adaptationChoice: restartPhase === "adaptation" ? "Yes" : "No", currentPhase: restartPhase })
                  localStorage.setItem("dietStartDate", today)
                  localStorage.setItem("userDietTimeline", restartDays.toString())
                  localStorage.setItem("userAdaptationChoice", restartPhase === "adaptation" ? "Yes" : "No")
                  setShowRestartModal(false)
                  router.push("/dashboard")
                }} className="flex-1 gradient-button text-center">Restart Diet</button>
                <button onClick={() => { setShowRestartModal(false); setAipCompliant(true) }}
                  className="flex-1 secondary-button text-center">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Period Tracking */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-brand-dark">On Period?</h2>
            <button onClick={() => setOnPeriod(!onPeriod)}
              className={`w-14 h-8 rounded-full transition-all ${onPeriod ? "bg-pink-400" : "bg-gray-200"}`}>
              <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform mx-1 ${onPeriod ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>
        </div>

        {/* Symptoms */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-brand-dark mb-4">Symptoms</h2>

          {symptoms.length > 0 && (
            <div className="space-y-5 mb-5">
              {symptoms.map(symptom => (
                <div key={symptom.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-brand-dark">{symptom.name}</span>
                    <button onClick={() => removeSymptom(symptom.id)}
                      className="text-xs text-pink-400 hover:text-pink-600">Remove</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-brand-dark/50 w-10">None</span>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(score => (
                        <button key={score} onClick={() => updateSymptomSeverity(symptom.id, score)}
                          className={`w-10 h-10 rounded-full border-2 font-medium transition-all text-sm ${
                            symptom.severity === score
                              ? "bg-pink-400 border-pink-400 text-white"
                              : "border-pink-200 text-brand-dark hover:border-pink-400"
                          }`}>{score}</button>
                      ))}
                    </div>
                    <span className="text-xs text-brand-dark/50 w-10 text-right">Severe</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {availableSymptoms
              .filter(s => !symptoms.find(sym => sym.name === s))
              .map(symptom => (
                <button key={symptom} onClick={() => addSymptom(symptom)}
                  className="px-3 py-1.5 text-sm rounded-full border border-pink-200 text-brand-dark hover:bg-pink-50 transition-colors">
                  + {symptom}
                </button>
              ))}
          </div>
        </div>

        {/* STEP 5: Stress */}
        <Card className="border-[#D4A5A5]/20 bg-white">
          <CardContent className="p-6">
            <ScoreSelector
              value={stress}
              onChange={setStress}
              label="Stress Level"
              icon={Brain}
              lowLabel="High Stress"
              highLabel="Low Stress"
            />
          </CardContent>
        </Card>

        {/* STEP 6: Period Tracking (Only for Female Users) */}
        {isFemale && (
          <Card className="border-[#D4A5A5]/20 bg-white">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Period Tracking</h2>
              
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium text-foreground">Are you on your period?</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setOnPeriod(true)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      onPeriod === true
                        ? "bg-[#D4A5A5] border-[#D4A5A5] text-white"
                        : "border-gray-200 text-gray-500 hover:border-[#D4A5A5]"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => {
                      setOnPeriod(false)
                      setPeriodSymptoms([])
                    }}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      onPeriod === false
                        ? "bg-gray-100 border-gray-300 text-gray-700"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
              
              {/* Period Symptoms (only shown if on period) */}
              {onPeriod === true && (
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-medium text-foreground mb-3">Period Symptoms</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select any period-related symptoms you are experiencing
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PERIOD_SYMPTOMS.map((symptom) => (
                      <button
                        key={symptom}
                        onClick={() => togglePeriodSymptom(symptom)}
                        className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                          periodSymptoms.includes(symptom)
                            ? "bg-[#D4A5A5]/10 border-[#D4A5A5] text-[#D4A5A5]"
                            : "border-gray-200 text-gray-600 hover:border-[#D4A5A5]/50"
                        }`}
                      >
                        {periodSymptoms.includes(symptom) ? "✓ " : "+ "}
                        {symptom}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-brand-dark mb-4">Notes</h2>
          <textarea value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Any additional notes about your day..."
            className="w-full min-h-[100px] p-3 rounded-xl bg-white/80 border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-brand-dark resize-none" />
        </div>
      </main>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-pink-100 p-4">
        <div className="max-w-lg mx-auto">
          <button onClick={handleSave} disabled={isSaving}
            className="w-full gradient-button py-4 text-lg disabled:opacity-60">
            {isSaving ? "Saving..." : "Save Log"}
          </button>
        </div>
      </div>
    </div>
  )
}
