"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, Save, Globe } from "lucide-react"
import Logo from "@/app/components/logo"
import { createBrowserClient } from "@supabase/ssr"

type Translation = {
  id: string
  key: string
  locale: string
  value: string
  category: string
}

const CATEGORIES = ["all", "common", "nav", "dashboard", "logday", "profile", "foodlist", "nutrition", "food.name", "food.tooltip"]

export default function TranslationsAdmin() {
  const router = useRouter()
  const [translations, setTranslations] = useState<Translation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [saving, setSaving] = useState(false)

  // Track which cell is being edited: { key, locale }
  const [editing, setEditing] = useState<{ key: string; locale: string } | null>(null)
  const [editValue, setEditValue] = useState("")
  const [savedKey, setSavedKey] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => { loadTranslations() }, [])

  const loadTranslations = async () => {
    setLoading(true)
    const PAGE = 1000
    let all: Translation[] = []
    let from = 0
    while (true) {
      const { data } = await supabase
        .from("translations")
        .select("*")
        .order("category")
        .order("key")
        .range(from, from + PAGE - 1)
      if (!data || data.length === 0) break
      all = [...all, ...data]
      if (data.length < PAGE) break
      from += PAGE
    }
    setTranslations(all)
    setLoading(false)
  }

  const getTranslation = (key: string, locale: string) =>
    translations.find(t => t.key === key && t.locale === locale)

  const startEdit = (key: string, locale: string) => {
    const existing = getTranslation(key, locale)
    setEditing({ key, locale })
    setEditValue(existing?.value || "")
  }

  const cancelEdit = () => {
    setEditing(null)
    setEditValue("")
  }

  const saveTranslation = async (key: string, locale: string, value: string) => {
    if (!value.trim()) { cancelEdit(); return }
    setSaving(true)
    const existing = getTranslation(key, locale)
    const category = getTranslation(key, "en")?.category || getTranslation(key, "lt")?.category || "general"

    const row = { key, locale, value: value.trim(), category }
    const { data, error } = await supabase
      .from("translations")
      .upsert(row, { onConflict: "locale,key" })
      .select()
      .single()

    if (!error && data) {
      setTranslations(prev => {
        const without = prev.filter(t => !(t.key === key && t.locale === locale))
        return [...without, data as Translation].sort((a, b) => a.key.localeCompare(b.key))
      })
      setSavedKey(key + locale)
      setTimeout(() => setSavedKey(null), 2000)
    }
    setSaving(false)
    cancelEdit()
  }

  // Group by key, show EN and LT side by side
  const allKeys = [...new Set(translations.map(t => t.key))]
  const filtered = allKeys.filter(key => {
    const matchesSearch = searchQuery === "" ||
      key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      translations.filter(t => t.key === key).some(t => t.value.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || key.startsWith(selectedCategory)
    return matchesSearch && matchesCategory
  })

  const renderCell = (key: string, locale: string) => {
    const t = getTranslation(key, locale)
    const isEditing = editing?.key === key && editing?.locale === locale
    const justSaved = savedKey === key + locale

    if (isEditing) {
      return (
        <div className="flex gap-1">
          <input
            autoFocus
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") saveTranslation(key, locale, editValue)
              if (e.key === "Escape") cancelEdit()
            }}
            placeholder={locale === "lt" ? "Lietuviškas vertimas..." : "English value..."}
            className="flex-1 px-2 py-1 text-sm border border-pink-400 rounded-lg focus:outline-none"
          />
          <button
            onClick={() => saveTranslation(key, locale, editValue)}
            disabled={saving}
            className="p-1 text-green-600 hover:bg-green-50 rounded"
          >
            <Save className="h-4 w-4" />
          </button>
          <button
            onClick={cancelEdit}
            className="p-1 text-brand-dark/40 hover:bg-gray-100 rounded text-xs"
          >
            ✕
          </button>
        </div>
      )
    }

    if (!t) {
      return (
        <button
          onClick={() => startEdit(key, locale)}
          className="w-full text-left text-sm px-2 py-1 rounded hover:bg-pink-50 transition-colors group"
        >
          <span className="text-red-400 italic">missing</span>
          <span className="ml-2 text-xs text-pink-400 opacity-0 group-hover:opacity-100 transition-opacity">+ add</span>
        </button>
      )
    }

    return (
      <button
        onClick={() => startEdit(key, locale)}
        className={`w-full text-left text-sm px-2 py-1 rounded hover:bg-pink-50 transition-colors ${
          justSaved ? "bg-green-50 text-green-700" : "text-brand-dark"
        }`}
      >
        {justSaved ? "✓ " : ""}{t.value}
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-lightest to-white">
      <header className="p-4 flex items-center header-gradient text-white relative">
        <button onClick={() => router.push("/admin")} className="absolute left-4 flex items-center text-white/80 hover:text-white">
          <ArrowLeft className="h-5 w-5 mr-1" />Back
        </button>
        <div className="mx-auto"><Logo variant="light" /></div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Globe className="h-6 w-6 text-pink-400" />
          <h1 className="text-2xl font-bold text-brand-dark">Translation Management</h1>
        </div>
        <p className="text-brand-dark/60 mb-6">
          Edit EN and LT translations. Click any cell — including <span className="text-red-400 italic">missing</span> — to add or edit.
        </p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-dark/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search keys or values..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-pink-200 focus:outline-none focus:ring-2 focus:ring-pink-400 text-sm"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat ? "bg-pink-400 text-white" : "bg-pink-50 text-brand-dark hover:bg-pink-100"
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-brand-dark/50">Loading translations...</div>
        ) : (
          <div className="space-y-2">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-brand-dark/50 uppercase">
              <div className="col-span-3">Key</div>
              <div className="col-span-4">English (EN)</div>
              <div className="col-span-5">Lithuanian (LT)</div>
            </div>

            {filtered.map(key => {
              const en = getTranslation(key, "en")
              return (
                <div key={key} className="glass-card px-4 py-3 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <p className="text-xs font-mono text-pink-600 break-all">{key}</p>
                    <p className="text-xs text-brand-dark/40 mt-0.5">{en?.category}</p>
                  </div>
                  <div className="col-span-4">{renderCell(key, "en")}</div>
                  <div className="col-span-5">{renderCell(key, "lt")}</div>
                </div>
              )
            })}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-brand-dark/50">No translations found.</div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
