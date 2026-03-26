"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useLanguage } from "@/lib/i18n/context"

const CACHE_KEY = "immu_hidden_pages"

type ActivePage = "food-list" | "dashboard" | "nutrition" | "recipes" | "other"

interface BottomNavProps {
  active?: ActivePage
}

export default function BottomNav({ active = "other" }: BottomNavProps) {
  const router = useRouter()
  const { t } = useLanguage()

  const [hiddenPages, setHiddenPages] = useState<string[]>(() => {
    if (typeof window === "undefined") return []
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })

  const [loaded, setLoaded] = useState(() => {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem(CACHE_KEY)
  })

  useEffect(() => {
    async function load() {
      try {
        const sb = createClient()
        const { data } = await sb.from("app_settings").select("value").eq("key", "hidden_pages").single()
        const pages = data?.value || []
        setHiddenPages(pages)
        localStorage.setItem(CACHE_KEY, JSON.stringify(pages))
      } catch {}
      setLoaded(true)
    }
    load()
  }, [])

  const btn = (page: string) =>
    `flex flex-col items-center justify-center py-3 text-xs ${active === page ? "text-pink-400" : "text-brand-dark"}`

  const icon = (page: string) =>
    `h-5 w-5 mb-1 ${active === page ? "text-pink-400" : "text-brand-dark"}`

  if (!loaded) {
    return (
      <nav className="bottom-nav grid grid-cols-5 border-t border-brand-dark/10 bg-white/80 backdrop-blur-sm">
        <div />
        <button className={btn("dashboard")} onClick={() => router.push("/dashboard")}>
          <Home className={icon("dashboard")} />
          <span>{t("nav.dashboard", "Dashboard")}</span>
        </button>
        <button
          className="flex items-center justify-center rounded-full gradient-button h-14 w-14 -mt-7 mx-auto shadow-lg"
          onClick={() => router.push("/log-day")}
        >
          <Plus className="h-6 w-6" />
        </button>
        <div />
        <div />
      </nav>
    )
  }

  return (
    <nav className="bottom-nav grid grid-cols-5 border-t border-brand-dark/10 bg-white/80 backdrop-blur-sm">
      {!hiddenPages.includes("food-list") ? (
        <button className={btn("food-list")} onClick={() => router.push("/food-list")}>
          <List className={icon("food-list")} />
          <span>{t("nav.products", "Products")}</span>
        </button>
      ) : <div />}

      <button className={btn("dashboard")} onClick={() => router.push("/dashboard")}>
        <Home className={icon("dashboard")} />
        <span>{t("nav.dashboard", "Dashboard")}</span>
      </button>

      <button
        className="flex items-center justify-center rounded-full gradient-button h-14 w-14 -mt-7 mx-auto shadow-lg"
        onClick={() => router.push("/log-day")}
      >
        <Plus className="h-6 w-6" />
      </button>

      {!hiddenPages.includes("nutrition") ? (
        <button className={btn("nutrition")} onClick={() => router.push("/nutrition")}>
          <BookOpen className={icon("nutrition")} />
          <span>{t("nav.nutrition", "Nutrition")}</span>
        </button>
      ) : <div />}

      {!hiddenPages.includes("recipes") ? (
        <button className={btn("recipes")} onClick={() => router.push("/recipes")}>
          <UtensilsCrossed className={icon("recipes")} />
          <span>{t("nav.recipes", "Recipes")}</span>
        </button>
      ) : <div />}
    </nav>
  )
}
