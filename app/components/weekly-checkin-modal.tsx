"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/i18n/context"
import { createClient } from "@/lib/supabase/client"

const STORAGE_KEY = "immu_weekly_checkin_shown"

function getTodayString(): string {
  const d = new Date()
  return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-")
}

function getThisSundayString(): string {
  const d = new Date()
  const day = d.getDay() // 0=Sun
  const sunday = new Date(d)
  sunday.setDate(d.getDate() - day)
  return [sunday.getFullYear(), String(sunday.getMonth() + 1).padStart(2, "0"), String(sunday.getDate()).padStart(2, "0")].join("-")
}

interface Props {
  userId: string | null
}

export default function WeeklyCheckinModal({ userId }: Props) {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!userId) return
    const today = new Date()
    if (today.getDay() !== 0) return // Only Sundays

    const thisSunday = getThisSundayString()
    const lastShown = localStorage.getItem(STORAGE_KEY)
    if (lastShown === thisSunday) return // Already shown this Sunday

    setVisible(true)
  }, [userId])

  const handleSkip = () => {
    localStorage.setItem(STORAGE_KEY, getThisSundayString())
    setVisible(false)
  }

  const handleSave = async () => {
    if (!userId || !notes.trim()) {
      handleSkip()
      return
    }
    setSaving(true)
    try {
      const supabase = createClient()
      const today = getTodayString() // This is Sunday since we only show on Sundays
      const header = `📅 ${t("weeklyCheckin.noteHeader", "Weekly check-in")}`
      const line = `${header}\n${notes.trim()}`

      const { data: existing } = await supabase
        .from("daily_logs")
        .select("id, notes")
        .eq("user_id", userId)
        .eq("log_date", today)
        .maybeSingle()

      const existingNotes = existing?.notes?.trim() || ""
      const updatedNotes = existingNotes ? `${existingNotes}\n\n${line}` : line

      if (existing?.id) {
        await supabase.from("daily_logs").update({ notes: updatedNotes, updated_at: new Date().toISOString() }).eq("id", existing.id)
      } else {
        await supabase.from("daily_logs").insert({ user_id: userId, log_date: today, notes: updatedNotes })
      }

      localStorage.setItem(STORAGE_KEY, getThisSundayString())
      setSaved(true)
      setTimeout(() => setVisible(false), 2000)
    } catch (e) {
      console.error("Weekly check-in save error:", e)
    } finally {
      setSaving(false)
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4 pb-8">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-pink-400 to-purple-400 p-5">
          <div className="text-2xl mb-1">📅</div>
          <h2 className="text-white font-bold text-xl">{t("weeklyCheckin.title", "Weekly check-in")}</h2>
          <p className="text-white/80 text-sm mt-1">{t("weeklyCheckin.subtitle", "How was your week?")}</p>
        </div>

        <div className="p-5">
          {saved ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-brand-dark font-medium">{t("weeklyCheckin.saved", "Saved to your calendar!")}</p>
            </div>
          ) : (
            <>
              <p className="text-brand-dark/70 text-sm mb-3 leading-relaxed">
                {t("weeklyCheckin.prompt", "Share how you're feeling, any new symptoms noticed, what foods worked or didn't, and anything else worth noting this week.")}
              </p>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={t("weeklyCheckin.placeholder", "Write your weekly overview here...")}
                rows={5}
                className="w-full border-2 border-pink-100 rounded-2xl p-3 text-sm text-brand-dark resize-none focus:outline-none focus:border-pink-300 bg-pink-50/30"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSkip}
                  className="flex-1 py-3 rounded-full border-2 border-brand-dark/20 text-brand-dark/60 font-medium text-sm"
                >
                  {t("weeklyCheckin.skip", "Skip")}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-2 px-6 py-3 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 text-white font-medium text-sm disabled:opacity-60"
                >
                  {saving ? "..." : t("weeklyCheckin.submit", "Save to calendar")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
