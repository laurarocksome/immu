"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import Logo from "@/app/components/logo"
import { createBrowserClient } from "@supabase/ssr"

const PAGES = [
  { key: "recipes", label: "Recipes", path: "/recipes" },
  { key: "nutrition", label: "Nutrition Guides", path: "/nutrition" },
  { key: "food-list", label: "Products / Food List", path: "/food-list" },
  { key: "calendar", label: "Calendar", path: "/calendar" },
  { key: "faq", label: "FAQ", path: "/faq" },
]

export default function PageVisibilityAdmin() {
  const router = useRouter()
  const [hiddenPages, setHiddenPages] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "hidden_pages")
      .single()
    if (data) setHiddenPages(data.value || [])
    setLoading(false)
  }

  const togglePage = async (pageKey: string) => {
    setSaving(pageKey)
    const newHidden = hiddenPages.includes(pageKey)
      ? hiddenPages.filter(p => p !== pageKey)
      : [...hiddenPages, pageKey]

    const { error } = await supabase
      .from("app_settings")
      .upsert({ key: "hidden_pages", value: newHidden, updated_at: new Date().toISOString() })

    if (!error) setHiddenPages(newHidden)
    setSaving(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-lightest to-white">
      <header className="p-4 flex items-center header-gradient text-white relative">
        <button onClick={() => router.push("/admin")} className="absolute left-4 flex items-center text-white/80 hover:text-white">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back
        </button>
        <div className="mx-auto"><Logo variant="light" /></div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-brand-dark mb-2">Page Visibility</h1>
        <p className="text-brand-dark/60 mb-6">Toggle pages on/off for all users.</p>

        {loading ? (
          <div className="text-center py-8 text-brand-dark/50">Loading...</div>
        ) : (
          <div className="space-y-3">
            {PAGES.map(page => {
              const isHidden = hiddenPages.includes(page.key)
              return (
                <div key={page.key} className="glass-card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-brand-dark">{page.label}</p>
                    <p className="text-xs text-brand-dark/50">{page.path}</p>
                  </div>
                  <button
                    onClick={() => togglePage(page.key)}
                    disabled={saving === page.key}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      isHidden
                        ? "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    {saving === page.key ? (
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                    ) : isHidden ? (
                      <><EyeOff className="h-4 w-4" /><span>Hidden</span></>
                    ) : (
                      <><Eye className="h-4 w-4" /><span>Visible</span></>
                    )}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
