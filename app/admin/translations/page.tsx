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

const CATEGORIES = ["all", "common", "nav", "dashboard", "logday", "profile", "foodlist", "nutrition"]

export default function TranslationsAdmin() {
  const router = useRouter()
  const [translations, setTranslations] = useState<Translation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => { loadTranslations() }, [])

  const loadTranslations = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("translations")
      .select("*")
      .order("category")
      .order("key")
    setTranslations(data || [])
    setLoading(false)
  }

  const saveTranslation = async (id: string, value: string) => {
    setSaving(true)
    const { error } = await supabase
      .from("translations")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("id", id)
    if (!error) {
      setTranslations(prev => prev.map(t => t.id === id ? { ...t, value } : t))
      setSaved(id)
      setTimeout(() => setSaved(null), 2000)
    }
    setSaving(false)
    setEditingId(null)
  }

  // Group by key, show EN and LT side by side
  const allKeys = [...new Set(translations.map(t => t.key))]
  const filtered = allKeys.filter(key => {
    const matchesSearch = searchQuery === "" || key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      translations.filter(t => t.key === key).some(t => t.value.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || key.startsWith(selectedCategory + ".")
    return matchesSearch && matchesCategory
  })

  const getTranslation = (key: string, locale: string) =>
    translations.find(t => t.key === key && t.locale === locale)

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
        <p className="text-brand-dark/60 mb-6">Edit EN and LT translations for all app content.</p>

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
              <div className="col-span-4">Lithuanian (LT)</div>
              <div className="col-span-1"></div>
            </div>

            {filtered.map(key => {
              const en = getTranslation(key, "en")
              const lt = getTranslation(key, "lt")
              return (
                <div key={key} className="glass-card px-4 py-3 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <p className="text-xs font-mono text-pink-600">{key}</p>
                    <p className="text-xs text-brand-dark/40 mt-0.5">{en?.category}</p>
                  </div>

                  {/* EN */}
                  <div className="col-span-4">
                    {editingId === en?.id ? (
                      <div className="flex gap-1">
                        <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") saveTranslation(en!.id, editValue); if (e.key === "Escape") setEditingId(null) }}
                          className="flex-1 px-2 py-1 text-sm border border-pink-400 rounded-lg focus:outline-none" />
                        <button onClick={() => saveTranslation(en!.id, editValue)} disabled={saving}
                          className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Save className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingId(en?.id || null); setEditValue(en?.value || "") }}
                        className={`w-full text-left text-sm px-2 py-1 rounded hover:bg-pink-50 transition-colors ${saved === en?.id ? "bg-green-50 text-green-700" : "text-brand-dark"}`}>
                        {en?.value || <span className="text-red-400 italic">missing</span>}
                      </button>
                    )}
                  </div>

                  {/* LT */}
                  <div className="col-span-4">
                    {editingId === lt?.id ? (
                      <div className="flex gap-1">
                        <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") saveTranslation(lt!.id, editValue); if (e.key === "Escape") setEditingId(null) }}
                          className="flex-1 px-2 py-1 text-sm border border-pink-400 rounded-lg focus:outline-none" />
                        <button onClick={() => saveTranslation(lt!.id, editValue)} disabled={saving}
                          className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <Save className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingId(lt?.id || null); setEditValue(lt?.value || "") }}
                        className={`w-full text-left text-sm px-2 py-1 rounded hover:bg-pink-50 transition-colors ${saved === lt?.id ? "bg-green-50 text-green-700" : "text-brand-dark"}`}>
                        {lt?.value || <span className="text-red-400 italic">missing</span>}
                      </button>
                    )}
                  </div>

                  <div className="col-span-1 text-xs text-brand-dark/30 text-center">
                    {saved === en?.id || saved === lt?.id ? "✓" : ""}
                  </div>
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
