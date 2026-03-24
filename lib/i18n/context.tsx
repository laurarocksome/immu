"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

type Translations = Record<string, string>

interface LanguageContextType {
  locale: string
  setLocale: (locale: string) => void
  t: (key: string, fallback?: string) => string
  loading: boolean
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key, fallback) => fallback || key,
  loading: true,
})

const cache: Record<string, Translations> = {}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<string>("en")
  const [translations, setTranslations] = useState<Translations>({})
  const [loading, setLoading] = useState(true)

  const loadTranslations = useCallback(async (loc: string) => {
    if (cache[loc]) {
      setTranslations(cache[loc])
      setLoading(false)
      return
    }
    const supabase = createClient()
    const { data } = await supabase
      .from("translations")
      .select("key, value")
      .eq("locale", loc)

    if (data) {
      const map: Translations = {}
      data.forEach(({ key, value }) => { map[key] = value })
      cache[loc] = map
      setTranslations(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem("immu_locale") || "en"
    setLocaleState(saved)
    loadTranslations(saved)

    async function loadUserLocale() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from("user_profiles")
            .select("locale")
            .eq("user_id", user.id)
            .single()
          if (data?.locale && data.locale !== saved) {
            setLocaleState(data.locale)
            localStorage.setItem("immu_locale", data.locale)
            loadTranslations(data.locale)
          }
        }
      } catch {}
    }
    loadUserLocale()
  }, [loadTranslations])

  const setLocale = useCallback(async (loc: string) => {
    setLocaleState(loc)
    localStorage.setItem("immu_locale", loc)
    setLoading(true)
    await loadTranslations(loc)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from("user_profiles")
          .update({ locale: loc })
          .eq("user_id", user.id)
      }
    } catch {}
  }, [loadTranslations])

  const t = useCallback((key: string, fallback?: string): string => {
    return translations[key] || fallback || key
  }, [translations])

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, loading }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
