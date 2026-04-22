"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Edit2, Trash2, X, Save } from "lucide-react"
import Logo from "@/app/components/logo"
import { createBrowserClient } from "@supabase/ssr"

type NutritionPlan = {
  id: string
  phase: string
  title: string
  description: string
  duration_days?: number
  week_number?: number
  content: any
  image_url?: string
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")

const planTitleKey = (title: string) => "nutritionplan." + slug(title) + ".title"
const planTaskKey = (title: string, idx: number) => "nutritionplan." + slug(title) + ".task." + idx

export default function NutritionManagement() {
  const router = useRouter()
  const [plans, setPlans] = useState<NutritionPlan[]>([])
  const [selectedPhase, setSelectedPhase] = useState<string>("Adaptation")
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<NutritionPlan | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const [formData, setFormData] = useState({
    phase: "Adaptation",
    title: "",
    titleLt: "",
    description: "",
    duration_days: "",
    week_number: "",
    content: "",
    image_url: "",
  })

  // LT translations for each step parsed from content JSON
  const [stepLt, setStepLt] = useState<string[]>([])

  useEffect(() => { loadPlans() }, [selectedPhase])

  // Derive steps from the content JSON field
  const parsedSteps: string[] = (() => {
    try {
      const obj = JSON.parse(formData.content)
      return Array.isArray(obj.steps) ? obj.steps : []
    } catch { return [] }
  })()

  // Keep stepLt array length in sync with parsedSteps
  useEffect(() => {
    setStepLt((prev) => {
      const next = [...prev]
      while (next.length < parsedSteps.length) next.push("")
      return next.slice(0, parsedSteps.length)
    })
  }, [parsedSteps.length])

  const loadPlans = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("nutrition_plans")
      .select("*")
      .eq("phase", selectedPhase)
      .order("week_number")
    if (error) console.error("[admin] Error loading nutrition plans:", error)
    else setPlans(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let contentObject
    try { contentObject = JSON.parse(formData.content) }
    catch { alert("Invalid JSON in content field. Please check your formatting."); return }

    const planData = {
      phase: formData.phase,
      title: formData.title,
      description: formData.description,
      duration_days: formData.duration_days ? Number.parseInt(formData.duration_days) : null,
      week_number: formData.week_number ? Number.parseInt(formData.week_number) : null,
      content: contentObject,
      image_url: formData.image_url || null,
    }

    let ok = false
    if (editingPlan) {
      const { error } = await supabase.from("nutrition_plans").update(planData).eq("id", editingPlan.id)
      if (error) { alert("Failed to update nutrition plan"); return }
      ok = true
    } else {
      const { error } = await supabase.from("nutrition_plans").insert(planData)
      if (error) { alert("Failed to create nutrition plan"); return }
      ok = true
    }

    if (ok) {
      // Upsert translation rows
      const tRows: any[] = [
        { key: planTitleKey(formData.title), locale: "en", value: formData.title, category: "general" },
      ]
      if (formData.titleLt.trim()) {
        tRows.push({ key: planTitleKey(formData.title), locale: "lt", value: formData.titleLt.trim(), category: "general" })
      }
      const steps: string[] = contentObject.steps || []
      steps.forEach((step: string, idx: number) => {
        tRows.push({ key: planTaskKey(formData.title, idx), locale: "en", value: step, category: "general" })
        if (stepLt[idx]?.trim()) {
          tRows.push({ key: planTaskKey(formData.title, idx), locale: "lt", value: stepLt[idx].trim(), category: "general" })
        }
      })
      await supabase.from("translations").upsert(tRows, { onConflict: "locale,key" })
      await loadPlans()
      handleCloseModal()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this nutrition plan?")) return
    const { error } = await supabase.from("nutrition_plans").delete().eq("id", id)
    if (error) alert("Failed to delete nutrition plan")
    else await loadPlans()
  }

  const handleEdit = async (plan: NutritionPlan) => {
    setEditingPlan(plan)
    const contentStr = JSON.stringify(plan.content, null, 2)

    // Load existing LT translations
    const steps: string[] = plan.content?.steps || []
    const keysToFetch = [
      planTitleKey(plan.title),
      ...steps.map((_, i) => planTaskKey(plan.title, i)),
    ]
    const { data: tRows } = await supabase
      .from("translations")
      .select("key,locale,value")
      .in("key", keysToFetch)

    const get = (key: string, locale: string) =>
      (tRows as any[])?.find((r) => r.key === key && r.locale === locale)?.value || ""

    setFormData({
      phase: plan.phase,
      title: plan.title,
      titleLt: get(planTitleKey(plan.title), "lt"),
      description: plan.description,
      duration_days: plan.duration_days?.toString() || "",
      week_number: plan.week_number?.toString() || "",
      content: contentStr,
      image_url: plan.image_url || "",
    })
    setStepLt(steps.map((_, i) => get(planTaskKey(plan.title, i), "lt")))
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingPlan(null)
    setStepLt([])
    setFormData({ phase: "Adaptation", title: "", titleLt: "", description: "", duration_days: "", week_number: "", content: "", image_url: "" })
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white">
      <header className="p-4 border-b border-pink-200/30 flex justify-between items-center bg-gradient-to-r from-pink-300 to-peach-300">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin")} className="text-white hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <Logo variant="light" />
          <span className="text-white font-medium">Nutrition Plan Management</span>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-6">
            {["Adaptation", "Elimination", "Reintroduction"].map((phase) => (
              <button key={phase} onClick={() => setSelectedPhase(phase)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  selectedPhase === phase
                    ? "bg-gradient-to-r from-pink-400 to-peach-400 text-white shadow-md"
                    : "bg-white border border-brand-dark/20 hover:bg-pink-50"
                }`}>
                {phase} Phase
              </button>
            ))}
          </div>

          <div className="mb-6">
            <button onClick={() => setShowModal(true)}
              className="gradient-button px-6 py-3 rounded-xl flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add {selectedPhase} Plan
            </button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center p-8 text-brand-dark/60">Loading...</div>
            ) : plans.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-brand-dark/60">
                No nutrition plans found for {selectedPhase} phase
              </div>
            ) : (
              plans.map((plan) => (
                <div key={plan.id} className="glass-card rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{plan.title}</h3>
                        {plan.week_number && (
                          <span className="bg-pink-100 text-brand-dark px-3 py-1 rounded-full text-sm">Week {plan.week_number}</span>
                        )}
                        {plan.duration_days && (
                          <span className="bg-yellow-100 text-brand-dark px-3 py-1 rounded-full text-sm">{plan.duration_days} days</span>
                        )}
                      </div>
                      <p className="text-brand-dark/70">{plan.description}</p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => handleEdit(plan)} className="p-2 hover:bg-pink-100 rounded-lg transition-colors">
                        <Edit2 className="h-5 w-5 text-brand-dark" />
                      </button>
                      <button onClick={() => handleDelete(plan.id)} className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-pink-50/50 rounded-lg p-4 mt-4">
                    <p className="text-sm font-medium mb-2">Content Preview:</p>
                    <pre className="text-xs text-brand-dark/70 overflow-x-auto">
                      {JSON.stringify(plan.content, null, 2).slice(0, 200)}
                      {JSON.stringify(plan.content).length > 200 && "..."}
                    </pre>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{editingPlan ? "Edit Nutrition Plan" : "Add Nutrition Plan"}</h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Phase *</label>
                    <select value={formData.phase} onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400">
                      <option value="Adaptation">Adaptation</option>
                      <option value="Elimination">Elimination</option>
                      <option value="Reintroduction">Reintroduction</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Week Number</label>
                    <input type="number" value={formData.week_number}
                      onChange={(e) => setFormData({ ...formData, week_number: e.target.value })}
                      placeholder="e.g., 1, 2, 3"
                      className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                  </div>
                </div>

                {/* Title EN + LT */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title (EN) *</label>
                    <input type="text" required value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Title (LT)</label>
                    <input type="text" value={formData.titleLt}
                      onChange={(e) => setFormData({ ...formData, titleLt: e.target.value })}
                      placeholder="Lithuanian title"
                      className="w-full px-4 py-2 rounded-lg border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea required value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duration (days)</label>
                  <input type="number" value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                    placeholder="e.g., 28"
                    className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <input type="url" value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content (JSON format) *</label>
                  <textarea required value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder='{"steps": ["Step one", "Step two"]}'
                    rows={10}
                    className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono text-sm" />
                  <p className="text-xs text-brand-dark/60 mt-1">Valid JSON with a "steps" array. Lithuanian translations appear below once steps are filled in.</p>
                </div>

                {/* Per-step LT translations — appear dynamically */}
                {parsedSteps.length > 0 && (
                  <div className="border border-pink-200 rounded-xl p-4 bg-pink-50/50">
                    <p className="text-sm font-semibold mb-3 text-pink-700">Lithuanian step translations</p>
                    <div className="space-y-3">
                      {parsedSteps.map((step, idx) => (
                        <div key={idx}>
                          <p className="text-xs text-brand-dark/50 mb-1">Step {idx + 1} (EN): {step}</p>
                          <input
                            type="text"
                            value={stepLt[idx] || ""}
                            onChange={(e) => {
                              const next = [...stepLt]
                              next[idx] = e.target.value
                              setStepLt(next)
                            }}
                            placeholder="Lithuanian translation..."
                            className="w-full px-3 py-2 rounded-lg border border-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 rounded-xl border border-brand-dark/20 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 gradient-button px-6 py-3 rounded-xl flex items-center justify-center gap-2">
                    <Save className="h-5 w-5" />
                    {editingPlan ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
