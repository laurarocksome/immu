"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Sun, Moon, Brain, Check, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { logDailyEntry, logSymptoms, getCurrentPhaseAndDay } from "@/lib/supabase/user-tracking"

interface Symptom {
  id: string
  name: string
  severity: number
}

export default function LogDayContent() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  
  // Wellness scores (1-5)
  const [mood, setMood] = useState(3)
  const [sleep, setSleep] = useState(3)
  const [stress, setStress] = useState(3)
  
  // Phase info
  const [currentPhase, setCurrentPhase] = useState<string>("Adaptation")
  const [currentDay, setCurrentDay] = useState<number>(1)
  
  // AIP compliance (for elimination phase)
  const [aipCompliant, setAipCompliant] = useState(true)
  
  // Period tracking
  const [onPeriod, setOnPeriod] = useState(false)
  
  // Notes
  const [notes, setNotes] = useState("")
  
  // Symptoms
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
      
      let customSymptoms: string[] = []
      if (userSymptoms && userSymptoms.length > 0) {
        customSymptoms = userSymptoms.map(s => s.symptom)
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
        setAipCompliant(existingLog.aip_compliant ?? true)
        setOnPeriod(existingLog.on_period ?? false)
        setNotes(existingLog.notes || "")
        
        if (existingLog.symptom_logs && existingLog.symptom_logs.length > 0) {
          setSymptoms(existingLog.symptom_logs.map((s: { id: string; symptom: string; severity: number }) => ({
            id: s.id,
            name: s.symptom,
            severity: s.severity,
          })))
        }
      } else if (customSymptoms.length > 0) {
        // No log yet for today — pre-load user's onboarding symptoms for rating
        setSymptoms(customSymptoms.map(name => ({
          id: crypto.randomUUID(),
          name,
          severity: 1,
        })))
      }
      
      setIsLoading(false)
    }
    
    loadUserData()
  }, [router, selectedDate])

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
      
      // Save symptoms
      if (symptoms.length > 0) {
        await logSymptoms(dailyLogId, symptoms.map(s => ({
          symptom: s.name,
          severity: s.severity,
        })))
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
              {currentPhase} - Day {currentDay}
            </p>
          </div>
          <div className="w-10" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Wellness Scores */}
        <Card className="border-[#D4A5A5]/20 bg-white">
          <CardContent className="p-6 space-y-6">
            <h2 className="text-lg font-semibold text-foreground">How are you feeling?</h2>
            
            <ScoreSelector
              value={mood}
              onChange={setMood}
              label="Mood"
              icon={Sun}
              lowLabel="Low"
              highLabel="Great"
            />
            
            <ScoreSelector
              value={sleep}
              onChange={setSleep}
              label="Sleep Quality"
              icon={Moon}
              lowLabel="Poor"
              highLabel="Excellent"
            />
            
            <ScoreSelector
              value={stress}
              onChange={setStress}
              label="Stress Level"
              icon={Brain}
              lowLabel="High"
              highLabel="Low"
            />
          </CardContent>
        </Card>

        {/* AIP Compliance (only for Elimination phase) */}
        {currentPhase === "Elimination" && (
          <Card className="border-[#D4A5A5]/20 bg-white">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">AIP Compliance</h2>
              <div className="flex gap-3">
                <button
                  onClick={() => setAipCompliant(true)}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                    aipCompliant
                      ? "bg-green-50 border-green-500 text-green-700"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  100% Compliant
                </button>
                <button
                  onClick={() => setAipCompliant(false)}
                  className={`flex-1 py-3 rounded-lg border-2 transition-all ${
                    !aipCompliant
                      ? "bg-orange-50 border-orange-500 text-orange-700"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  Had exceptions
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Period Tracking */}
        <Card className="border-[#D4A5A5]/20 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">On Period?</h2>
              <button
                onClick={() => setOnPeriod(!onPeriod)}
                className={`w-14 h-8 rounded-full transition-all ${
                  onPeriod ? "bg-[#D4A5A5]" : "bg-gray-200"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform ${
                    onPeriod ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Symptoms */}
        <Card className="border-[#D4A5A5]/20 bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Symptoms</h2>
            
            {/* Selected Symptoms */}
            {symptoms.length > 0 && (
              <div className="space-y-3 mb-4">
                {symptoms.map((symptom) => (
                  <div key={symptom.id} className="flex items-center justify-between bg-[#FDF5F3] rounded-lg p-3">
                    <span className="font-medium text-foreground">{symptom.name}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateSymptomSeverity(symptom.id, symptom.severity - 1)}
                        className="p-1 rounded-full hover:bg-[#D4A5A5]/20"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center font-medium">{symptom.severity}</span>
                      <button
                        onClick={() => updateSymptomSeverity(symptom.id, symptom.severity + 1)}
                        className="p-1 rounded-full hover:bg-[#D4A5A5]/20"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeSymptom(symptom.id)}
                        className="ml-2 text-red-500 text-sm"
                      >
                        Remove
                      </button>
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
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="border-[#D4A5A5]/20 bg-white">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Notes</h2>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about your day..."
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
            disabled={isSaving}
            className="w-full bg-[#D4A5A5] hover:bg-[#C49494] text-white py-6 text-lg rounded-full"
          >
            {isSaving ? "Saving..." : "Save Log"}
          </Button>
        </div>
      </div>
    </div>
  )
}
