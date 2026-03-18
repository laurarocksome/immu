"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Sun, Moon, Brain, Check, Plus, Minus, AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { logSymptoms, getCurrentPhaseAndDay, transitionToPhase } from "@/lib/supabase/user-tracking"

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
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // User profile
  const [userGender, setUserGender] = useState<string | null>(null)
  
  // Phase info
  const [currentPhase, setCurrentPhase] = useState<string>("Adaptation")
  const [currentDay, setCurrentDay] = useState<number>(1)
  
  // Step 1: AIP Compliance (first question)
  const [aipCompliant, setAipCompliant] = useState<boolean | null>(null)
  const [showRestartOptions, setShowRestartOptions] = useState(false)
  
  // Wellness scores (1-5)
  const [mood, setMood] = useState(3)
  const [sleep, setSleep] = useState(3)
  const [stress, setStress] = useState(3)
  
  // Period tracking
  const [onPeriod, setOnPeriod] = useState<boolean | null>(null)
  const [periodSymptoms, setPeriodSymptoms] = useState<string[]>([])
  
  // Notes
  const [notes, setNotes] = useState("")
  
  // General Symptoms
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [availableSymptoms, setAvailableSymptoms] = useState<string[]>([
    "Headache",
    "Fatigue",
    "Brain Fog",
    "Bloating",
    "Joint Pain",
    "Skin Issues",
    "Digestive Issues",
    "Mood Changes",
    "Insomnia",
    "Cravings",
    "Inflammation",
    "Muscle Aches",
  ])
  
  // Selected date
  const [selectedDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  })

  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/login")
        return
      }
      
      setUserId(user.id)
      
      // Get user profile for gender
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("gender")
        .eq("user_id", user.id)
        .maybeSingle()
      
      if (profile?.gender) {
        setUserGender(profile.gender)
      }
      
      // Get current phase info
      const phaseInfo = await getCurrentPhaseAndDay(user.id)
      if (phaseInfo) {
        setCurrentPhase(phaseInfo.phase)
        setCurrentDay(phaseInfo.day)
      }
      
      // Load user's custom symptoms from user_symptoms table
      const { data: userSymptoms } = await supabase
        .from("user_symptoms")
        .select("symptom")
        .eq("user_id", user.id)
      
      if (userSymptoms && userSymptoms.length > 0) {
        const customSymptoms = userSymptoms.map(s => s.symptom)
        setAvailableSymptoms(prev => [...new Set([...prev, ...customSymptoms])])
      }
      
      // Check if there's an existing log for today
      const { data: existingLog } = await supabase
        .from("daily_logs")
        .select("*, symptom_logs(*)")
        .eq("user_id", user.id)
        .eq("log_date", selectedDate)
        .maybeSingle()
      
      if (existingLog) {
        setMood(existingLog.mood || 3)
        setSleep(existingLog.sleep || 3)
        setStress(existingLog.stress || 3)
        setAipCompliant(existingLog.aip_compliant ?? null)
        setOnPeriod(existingLog.on_period ?? null)
        setNotes(existingLog.notes || "")
        
        if (existingLog.symptom_logs && existingLog.symptom_logs.length > 0) {
          // Separate period symptoms from general symptoms
          const allSymptoms = existingLog.symptom_logs as Array<{ id: string; symptom: string; severity: number }>
          const periodSyms = allSymptoms.filter(s => PERIOD_SYMPTOMS.includes(s.symptom)).map(s => s.symptom)
          const generalSyms = allSymptoms.filter(s => !PERIOD_SYMPTOMS.includes(s.symptom))
          
          setPeriodSymptoms(periodSyms)
          setSymptoms(generalSyms.map((s) => ({
            id: s.id,
            name: s.symptom,
            severity: s.severity,
          })))
        }
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
      const today = selectedDate
      
      // Check if entry exists
      const { data: existing } = await supabase
        .from("daily_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("log_date", today)
        .maybeSingle()
      
      let dailyLogId: string
      
      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("daily_logs")
          .update({
            mood,
            sleep,
            stress,
            aip_compliant: aipCompliant,
            on_period: onPeriod,
            notes,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single()
        
        if (error) throw error
        dailyLogId = data.id
      } else {
        // Create new
        const { data, error } = await supabase
          .from("daily_logs")
          .insert({
            user_id: userId,
            log_date: today,
            mood,
            sleep,
            stress,
            aip_compliant: aipCompliant,
            on_period: onPeriod,
            notes,
          })
          .select()
          .single()
        
        if (error) throw error
        dailyLogId = data.id
      }
      
      // Combine general symptoms and period symptoms
      const allSymptomsToSave = [
        ...symptoms.map(s => ({ symptom: s.name, severity: s.severity })),
        ...periodSymptoms.map(s => ({ symptom: s, severity: 2 })), // Default severity for period symptoms
      ]
      
      if (allSymptomsToSave.length > 0) {
        await logSymptoms(dailyLogId, allSymptomsToSave)
      }
      
      setShowSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (error) {
      console.error("[v0] Error saving log:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const addSymptom = (symptomName: string) => {
    if (symptoms.find(s => s.name === symptomName)) return
    
    setSymptoms(prev => [...prev, {
      id: crypto.randomUUID(),
      name: symptomName,
      severity: 2,
    }])
  }

  const removeSymptom = (symptomId: string) => {
    setSymptoms(prev => prev.filter(s => s.id !== symptomId))
  }

  const updateSymptomSeverity = (symptomId: string, severity: number) => {
    setSymptoms(prev => prev.map(s => 
      s.id === symptomId ? { ...s, severity: Math.max(1, Math.min(5, severity)) } : s
    ))
  }

  const togglePeriodSymptom = (symptom: string) => {
    setPeriodSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    )
  }

  const ScoreSelector = ({ 
    value, 
    onChange, 
    label, 
    icon: Icon,
    lowLabel = "Poor",
    highLabel = "Great"
  }: { 
    value: number
    onChange: (val: number) => void
    label: string
    icon: React.ComponentType<{ className?: string }>
    lowLabel?: string
    highLabel?: string
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#D4A5A5]" />
        <span className="font-medium text-foreground">{label}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{lowLabel}</span>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              onClick={() => onChange(score)}
              className={`w-10 h-10 rounded-full border-2 transition-all ${
                value === score
                  ? "bg-[#D4A5A5] border-[#D4A5A5] text-white"
                  : "border-[#D4A5A5]/30 text-foreground hover:border-[#D4A5A5]"
              }`}
            >
              {score}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">{highLabel}</span>
      </div>
    </div>
  )

  const isFemale = userGender?.toLowerCase() === "female" || userGender?.toLowerCase() === "f"

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDF5F3]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4A5A5]" />
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FDF5F3]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">Log Saved!</h2>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDF5F3]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#FDF5F3] px-4 py-4 border-b border-[#D4A5A5]/20">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="h-6 w-6 text-foreground" />
          </button>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-foreground">Log Your Day</h1>
            <p className="text-sm text-muted-foreground">
              {currentPhase} Phase - Day {currentDay}
            </p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-32">
        
        {/* STEP 1: AIP Compliance Question (First) */}
        <Card className="border-[#D4A5A5]/20 bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Did you stay AIP compliant today?</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {currentPhase === "Elimination" 
                ? "During elimination phase, staying 100% compliant is important for identifying triggers."
                : currentPhase === "Adaptation"
                ? "During adaptation, focus on gradually removing inflammatory foods."
                : "Track your compliance as you reintroduce foods."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setAipCompliant(true)
                  setShowRestartOptions(false)
                }}
                className={`flex-1 py-4 rounded-xl border-2 transition-all font-medium ${
                  aipCompliant === true
                    ? "bg-green-50 border-green-500 text-green-700"
                    : "border-gray-200 text-gray-500 hover:border-green-300"
                }`}
              >
                Yes, 100% Compliant
              </button>
              <button
                onClick={() => {
                  setAipCompliant(false)
                  if (currentPhase === "Elimination") {
                    setShowRestartOptions(true)
                  }
                }}
                className={`flex-1 py-4 rounded-xl border-2 transition-all font-medium ${
                  aipCompliant === false
                    ? "bg-orange-50 border-orange-500 text-orange-700"
                    : "border-gray-200 text-gray-500 hover:border-orange-300"
                }`}
              >
                No, I fell off
              </button>
            </div>
            
            {/* Restart Options for Elimination Phase */}
            {showRestartOptions && currentPhase === "Elimination" && (
              <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800">Diet Violation Detected</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Breaking elimination can affect your results. What would you like to do?
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleRestartElimination}
                    className="w-full py-3 px-4 bg-[#D4A5A5] text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#C49494] transition-colors"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Restart Elimination Phase
                  </button>
                  <button
                    onClick={handleStartAdaptation}
                    className="w-full py-3 px-4 bg-white border border-[#D4A5A5] text-[#D4A5A5] rounded-lg font-medium hover:bg-[#FDF5F3] transition-colors"
                  >
                    Start Adaptation Phase Instead
                  </button>
                  <button
                    onClick={handleContinueAnyway}
                    className="w-full py-2 px-4 text-gray-500 text-sm hover:text-gray-700 transition-colors"
                  >
                    Continue logging anyway
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* STEP 2: Symptom Evaluations */}
        <Card className="border-[#D4A5A5]/20 bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Symptom Evaluation</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Track any symptoms you experienced today
            </p>
            
            {/* Severity Scale Legend */}
            <div className="mb-4 p-3 bg-[#FDF5F3] rounded-lg">
              <p className="text-xs font-medium text-foreground mb-2">Severity Scale:</p>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span><strong>1</strong> = Mild</span>
                <span><strong>2</strong> = Noticeable</span>
                <span><strong>3</strong> = Moderate</span>
                <span><strong>4</strong> = Severe</span>
                <span><strong>5</strong> = Extreme</span>
              </div>
            </div>
            
            {/* Selected Symptoms */}
            {symptoms.length > 0 && (
              <div className="space-y-3 mb-4">
                {symptoms.map((symptom) => (
                  <div key={symptom.id} className="bg-[#FDF5F3] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{symptom.name}</span>
                      <button
                        onClick={() => removeSymptom(symptom.id)}
                        className="text-red-500 text-sm hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Mild</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateSymptomSeverity(symptom.id, symptom.severity - 1)}
                          className="p-1 rounded-full hover:bg-[#D4A5A5]/20"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <button
                              key={level}
                              onClick={() => updateSymptomSeverity(symptom.id, level)}
                              className={`w-8 h-8 rounded-full text-xs transition-all ${
                                symptom.severity === level
                                  ? "bg-[#D4A5A5] text-white"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => updateSymptomSeverity(symptom.id, symptom.severity + 1)}
                          className="p-1 rounded-full hover:bg-[#D4A5A5]/20"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <span className="text-xs text-muted-foreground">Extreme</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Available Symptoms */}
            <div className="flex flex-wrap gap-2">
              {availableSymptoms
                .filter(s => !symptoms.find(sym => sym.name === s))
                .map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => addSymptom(symptom)}
                    className="px-3 py-1.5 text-sm rounded-full border border-[#D4A5A5]/30 text-foreground hover:bg-[#D4A5A5]/10 transition-colors"
                  >
                    + {symptom}
                  </button>
                ))}
            </div>
            
            {symptoms.length === 0 && (
              <p className="text-center text-muted-foreground text-sm mt-4">
                No symptoms? Great! Tap above to add any you experienced.
              </p>
            )}
          </CardContent>
        </Card>

        {/* STEP 3: Mood */}
        <Card className="border-[#D4A5A5]/20 bg-white">
          <CardContent className="p-6">
            <ScoreSelector
              value={mood}
              onChange={setMood}
              label="Mood"
              icon={Sun}
              lowLabel="Low"
              highLabel="Great"
            />
          </CardContent>
        </Card>

        {/* STEP 4: Sleep Quality */}
        <Card className="border-[#D4A5A5]/20 bg-white">
          <CardContent className="p-6">
            <ScoreSelector
              value={sleep}
              onChange={setSleep}
              label="Sleep Quality"
              icon={Moon}
              lowLabel="Poor"
              highLabel="Excellent"
            />
          </CardContent>
        </Card>

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
        <Card className="border-[#D4A5A5]/20 bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Additional Notes</h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about your day, foods you ate, how you felt..."
              className="min-h-[100px] border-[#D4A5A5]/30 focus:border-[#D4A5A5]"
            />
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#FDF5F3] border-t border-[#D4A5A5]/20 p-4">
        <div className="max-w-lg mx-auto">
          <Button
            onClick={handleSave}
            disabled={isSaving || aipCompliant === null}
            className="w-full bg-[#D4A5A5] hover:bg-[#C49494] text-white py-6 text-lg rounded-full disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Log"}
          </Button>
          {aipCompliant === null && (
            <p className="text-center text-sm text-muted-foreground mt-2">
              Please answer the AIP compliance question to save
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
