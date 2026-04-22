"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

type Translations = Record<string, string>

interface LanguageContextType {
  locale: string
  setLocale: (locale: string) => void
  t: (key: string, fallback?: string) => string
  loading: boolean
  translations: Record<string, string>
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key, fallback) => fallback || key,
  loading: true,
  translations: {},
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
    const map: Translations = {}
    const PAGE = 1000
    let from = 0
    let done = false
    while (!done) {
      const { data, error } = await supabase
        .from("translations")
        .select("key, value")
        .eq("locale", loc)
        .range(from, from + PAGE - 1)
      if (error) {
        console.error("[i18n] Failed to load translations for locale:", loc, error)
        break
      }
      if (data && data.length > 0) {
        data.forEach(({ key, value }) => { map[key] = value })
      }
      if (!data || data.length < PAGE) {
        done = true
      } else {
        from += PAGE
      }
    }
    console.log("[i18n] Loaded", Object.keys(map).length, "translations for locale:", loc)
    if (Object.keys(map).length > 0) {
      cache[loc] = map
      setTranslations(map)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    const storedLocale = localStorage.getItem("immu_locale")
    const saved = storedLocale || "en"
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

          if (storedLocale) {
            // User has an explicit local preference — sync DB to match if needed
            if (data?.locale !== storedLocale) {
              await supabase.from("user_profiles").update({ locale: storedLocale }).eq("user_id", user.id)
            }
          } else if (data?.locale && data.locale !== saved) {
            // No local preference yet — load from DB (e.g. user logging in on a new device)
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
    <LanguageContext.Provider value={{ locale, setLocale, t, loading, translations }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)

// Lithuanian plural form for "day": 1 = diena, 2-9 (not 12-19) = dienos, otherwise dienų.
export function daysWord(n: number, locale: string): string {
  if (locale === "lt") {
    const lastTwo = Math.abs(n) % 100
    const last = Math.abs(n) % 10
    if (lastTwo >= 11 && lastTwo <= 19) return "dienų"
    if (last === 1) return "diena"
    if (last >= 2 && last <= 9) return "dienos"
    return "dienų"
  }
  return n === 1 ? "day" : "days"
}

// Full localized "X days left" string.
export function daysLeftText(n: number, locale: string): string {
  if (locale === "lt") return `${n} ${daysWord(n, "lt")} liko`
  return `${n} ${daysWord(n, "en")} left`
}

// Slug helper used to derive translation keys from raw English values
// (e.g. "Abdominal pain" -> "abdominal_pain"). Mirrors the conditionKey/optKey
// pattern used elsewhere.
export function slugifyKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/, "")
}
