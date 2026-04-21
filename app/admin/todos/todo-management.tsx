"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Save, CheckSquare, X } from "lucide-react"
import Logo from "@/app/components/logo"
import { createBrowserClient } from "@supabase/ssr"

type Translation = {
  id: string
  key: string
  locale: string
  value: string
  category: string
}

// Metadata that describes WHEN and WHERE each tip is shown to the user.
// Keep in sync with generateAdaptationTodoItems / generateEliminationTodoItems
// / generateReintroductionTodoItems in app/dashboard/page.tsx.
const TODO_METADATA: Record<string, { phase: string; when: string; phaseColor: string }> = {
  // --- Adaptation phase (28 days, only if user opted in) ---
  "dashboard.todo.water1_5":        { phase: "Adaptation",     when: "Days 1–28 (every day)",   phaseColor: "bg-yellow-100 text-yellow-800" },
  "dashboard.todo.walk30":          { phase: "Adaptation",     when: "Days 1–28 (every day)",   phaseColor: "bg-yellow-100 text-yellow-800" },
  "dashboard.todo.noCaffeine":      { phase: "Adaptation",     when: "Days 1–28 (every day)",   phaseColor: "bg-yellow-100 text-yellow-800" },
  "dashboard.todo.sleep8":          { phase: "Adaptation",     when: "Days 1–28 (every day)",   phaseColor: "bg-yellow-100 text-yellow-800" },
  "dashboard.todo.noAlcohol":       { phase: "Adaptation",     when: "Days 8–28",                phaseColor: "bg-yellow-100 text-yellow-800" },
  "dashboard.todo.noSugar":         { phase: "Adaptation",     when: "Days 15–28",               phaseColor: "bg-yellow-100 text-yellow-800" },
  "dashboard.todo.moreVeg":         { phase: "Adaptation",     when: "Days 22–28",               phaseColor: "bg-yellow-100 text-yellow-800" },
  "dashboard.todo.journalFeelings": { phase: "Adaptation",     when: "Day 10 only",              phaseColor: "bg-yellow-100 text-yellow-800" },
  "dashboard.todo.tryMeditation":   { phase: "Adaptation",     when: "Day 18 only",              phaseColor: "bg-yellow-100 text-yellow-800" },
  "dashboard.todo.mocktail":        { phase: "Adaptation",     when: "Day 24 only",              phaseColor: "bg-yellow-100 text-yellow-800" },

  // --- Elimination phase (percentage-based) ---
  "dashboard.todo.trackSymptoms":   { phase: "Elimination",    when: "Every day (0–100%)",       phaseColor: "bg-pink-100 text-pink-800" },
  "dashboard.todo.sleep78":         { phase: "Elimination",    when: "Every day (0–100%)",       phaseColor: "bg-pink-100 text-pink-800" },
  "dashboard.todo.water1_5_2":      { phase: "Elimination",    when: "Every day (0–100%)",       phaseColor: "bg-pink-100 text-pink-800" },
  "dashboard.todo.proteinMeal":     { phase: "Elimination",    when: "0–20% of phase",           phaseColor: "bg-pink-100 text-pink-800" },
  "dashboard.todo.yoga":            { phase: "Elimination",    when: "0–20% of phase",           phaseColor: "bg-pink-100 text-pink-800" },
  "dashboard.todo.newAipRecipe":    { phase: "Elimination",    when: "21–40% of phase",          phaseColor: "bg-pink-100 text-pink-800" },
  "dashboard.todo.eft":             { phase: "Elimination",    when: "21–40% of phase",          phaseColor: "bg-pink-100 text-pink-800" },
  "dashboard.todo.meditation10":    { phase: "Elimination",    when: "21–40% of phase",          phaseColor: "bg-pink-100 text-pink-800" },
  "dashboard.todo.mindfulEating":   { phase: "Elimination",    when: "41–60% of phase",          phaseColor: "bg-pink-100 text-pink-800" },
  "dashboard.todo.journalMoodSleep":{ phase: "Elimination",    when: "41–60% of phase",          phaseColor: "bg-pink-100 text-pink-800" },
  "dashboard.todo.newVeggies":      { phase: "Elimination",    when: "61–80% of phase",          phaseColor: "bg-pink-100 text-pink-800" },
  "dashboard.todo.strengthTraining":{ phase: "Elimination",    when: "61–80% of phase",          phaseColor: "bg-pink-100 text-pink-800" },
  "dashboard.todo.journalEnd":      { phase: "Elimination",    when: "81–100% of phase",         phaseColor: "bg-pink-100 text-pink-800" },
  "dashboard.todo.reviewLogs":      { phase: "Elimination",    when: "81–100% of phase",         phaseColor: "bg-pink-100 text-pink-800" },

  // --- Reintroduction phase ---
  "dashboard.todo.logFeelings":     { phase: "Reintroduction", when: "Most reintroduction days", phaseColor: "bg-green-100 text-green-800" },
  "dashboard.todo.updateProductList":{ phase: "Reintroduction", when: "End of each food trial", phaseColor: "bg-green-100 text-green-800" },
  "dashboard.todo.noNewFood":       { phase: "Reintroduction", when: "Days 34–36 (paprika trial)", phaseColor: "bg-green-100 text-green-800" },
  "dashboard.todo.observeReactions":{ phase: "Reintroduction", when: "After each new food",     phaseColor: "bg-green-100 text-green-800" },
  "dashboard.todo.continueAip":     { phase: "Reintroduction", when: "Default fallback tip",    phaseColor: "bg-green-100 text-green-800" },
  "dashboard.todo.continueSchedule":{ phase: "Reintroduction", when: "Day 45+ (maintenance)",   phaseColor: "bg-green-100 text-green-800" },

  // --- UI / Shared ---
  "dashboard.todo.title":           { phase: "UI",             when: "Section header",           phaseColor: "bg-gray-100 text-gray-700" },
  "dashboard.todo.subtitle":        { phase: "UI",             when: "Section subtitle",         phaseColor: "bg-gray-100 text-gray-700" },
}

const PHASE_FILTERS = ["All", "Adaptation", "Elimination", "Reintroduction", "UI"] as const
type PhaseFilter = (typeof PHASE_FILTERS)[number]

export default function TodoManagement() {
  const router = useRouter()
  const [translations, setTranslations] = useState<Translation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("All")
  const [editing, setEditing] = useState<{ key: string; locale: "en" | "lt" } | null>(null)
  const [editEn, setEditEn] = useState("")
  const [editLt, setEditLt] = useState("")
  const [saving, setSaving] = useState(false)
  const [savedKey, setSavedKey] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => { loadTodos() }, [])

  const loadTodos = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("translations")
      .select("*")
      .like("key", "dashboard.todo.%")
      .order("key")
    setTranslations(data || [])
    setLoading(false)
  }

  const get = (key: string, locale: "en" | "lt") =>
    translations.find(t => t.key === key && t.locale === locale)

  const allKeys = useMemo(() => Object.keys(TODO_METADATA), [])
  const filteredKeys = useMemo(() => {
    return allKeys.filter(key => {
      const meta = TODO_METADATA[key]
      if (phaseFilter !== "All" && meta.phase !== phaseFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        if (key.toLowerCase().includes(q)) return true
        const en = get(key, "en")?.value || ""
        const lt = get(key, "lt")?.value || ""
        return en.toLowerCase().includes(q) || lt.toLowerCase().includes(q)
      }
      return true
    })
  }, [allKeys, phaseFilter, searchQuery, translations])

  const beginEdit = (key: string, locale: "en" | "lt") => {
    setEditing({ key, locale })
    setEditEn(get(key, "en")?.value || "")
    setEditLt(get(key, "lt")?.value || "")
  }

  const cancelEdit = () => setEditing(null)

  const saveBoth = async (key: string) => {
    setSaving(true)
    const enRow = get(key, "en")
    const ltRow = get(key, "lt")
    const updates: Promise<any>[] = []
    const inserts: any[] = []

    if (enRow) {
      if (editEn !== enRow.value) {
        updates.push(
          supabase.from("translations")
            .update({ value: editEn, updated_at: new Date().toISOString() })
            .eq("id", enRow.id)
        )
      }
    } else if (editEn.trim()) {
      inserts.push({ key, locale: "en", value: editEn, category: "general" })
    }

    if (ltRow) {
      if (editLt !== ltRow.value) {
        updates.push(
          supabase.from("translations")
            .update({ value: editLt, updated_at: new Date().toISOString() })
            .eq("id", ltRow.id)
        )
      }
    } else if (editLt.trim()) {
      inserts.push({ key, locale: "lt", value: editLt, category: "general" })
    }

    if (inserts.length > 0) {
      updates.push(supabase.from("translations").upsert(inserts, { onConflict: "locale,key" }))
    }

    await Promise.all(updates)
    await loadTodos()
    setSavedKey(key)
    setTimeout(() => setSavedKey(null), 2000)
    setSaving(false)
    setEditing(null)
  }

  // Group filtered keys by phase for nicer display
  const grouped = useMemo(() => {
    const g: Record<string, string[]> = {}
    filteredKeys.forEach(k => {
      const phase = TODO_METADATA[k].phase
      if (!g[phase]) g[phase] = []
      g[phase].push(k)
    })
    return g
  }, [filteredKeys])

  const phaseOrder = ["Adaptation", "Elimination", "Reintroduction", "UI"]

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-lightest to-white">
      <header className="p-4 flex items-center header-gradient text-white relative">
        <button onClick={() => router.push("/admin")} className="absolute left-4 flex items-center text-white/80 hover:text-white">
          <ArrowLeft className="h-5 w-5 mr-1" />Back
        </button>
        <div className="mx-auto"><Logo variant="light" /></div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <CheckSquare className="h-6 w-6 text-pink-400" />
          <h1 className="text-2xl font-bold text-brand-dark">Daily Tasks &amp; Tips</h1>
        </div>
        <p className="text-brand-dark/60 mb-6">
          Edit the wording of every tip shown to users in the &quot;Daily Tasks&quot; (Dienos užduotys) section.
          Each tip&apos;s phase and timing is shown so you know exactly when users will see it.
        </p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-dark/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by key or wording..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {PHASE_FILTERS.map(p => (
              <button
                key={p}
                onClick={() => setPhaseFilter(p)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  phaseFilter === p ? "bg-pink-400 text-white" : "bg-pink-50 text-brand-dark hover:bg-pink-100"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-brand-dark/50">Loading tips...</div>
        ) : filteredKeys.length === 0 ? (
          <div className="text-center py-12 text-brand-dark/50">No tips match your filters.</div>
        ) : (
          <div className="space-y-8">
            {phaseOrder
              .filter(p => grouped[p]?.length)
              .map(phase => (
                <section key={phase}>
                  <h2 className="text-lg font-bold text-brand-dark mb-3">
                    {phase} <span className="text-sm font-normal text-brand-dark/50">({grouped[phase].length})</span>
                  </h2>
                  <div className="space-y-2">
                    {grouped[phase].map(key => {
                      const meta = TODO_METADATA[key]
                      const en = get(key, "en")
                      const lt = get(key, "lt")
                      const isEditing = editing?.key === key
                      const wasSaved = savedKey === key
                      return (
                        <div key={key} className={`glass-card rounded-xl p-4 transition-all ${wasSaved ? "ring-2 ring-green-400" : ""}`}>
                          <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.phaseColor}`}>{meta.phase}</span>
                              <span className="text-xs text-brand-dark/60">{meta.when}</span>
                            </div>
                            <code className="text-[10px] font-mono text-pink-500/70">{key}</code>
                          </div>

                          {isEditing ? (
                            <div className="space-y-2">
                              <div>
                                <label className="text-[10px] uppercase font-semibold text-brand-dark/50">English</label>
                                <textarea
                                  value={editEn}
                                  onChange={e => setEditEn(e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 text-sm border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 resize-y"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] uppercase font-semibold text-brand-dark/50">Lithuanian</label>
                                <textarea
                                  value={editLt}
                                  onChange={e => setEditLt(e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 text-sm border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400 resize-y"
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={cancelEdit}
                                  disabled={saving}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-brand-dark/70 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                  <X className="h-3.5 w-3.5" />Cancel
                                </button>
                                <button
                                  onClick={() => saveBoth(key)}
                                  disabled={saving}
                                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-pink-400 text-white hover:bg-pink-500 rounded-lg transition-colors disabled:opacity-50"
                                >
                                  <Save className="h-3.5 w-3.5" />{saving ? "Saving..." : "Save"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <button
                                onClick={() => beginEdit(key, "en")}
                                className="text-left px-3 py-2 rounded-lg hover:bg-pink-50/60 transition-colors group"
                              >
                                <p className="text-[10px] uppercase font-semibold text-brand-dark/40 mb-0.5">English</p>
                                <p className="text-sm text-brand-dark">
                                  {en?.value || <span className="italic text-red-400">missing — click to add</span>}
                                </p>
                              </button>
                              <button
                                onClick={() => beginEdit(key, "lt")}
                                className="text-left px-3 py-2 rounded-lg hover:bg-pink-50/60 transition-colors group"
                              >
                                <p className="text-[10px] uppercase font-semibold text-brand-dark/40 mb-0.5">Lithuanian</p>
                                <p className="text-sm text-brand-dark">
                                  {lt?.value || <span className="italic text-red-400">missing — click to add</span>}
                                </p>
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </section>
              ))}
          </div>
        )}
      </main>
    </div>
  )
}
