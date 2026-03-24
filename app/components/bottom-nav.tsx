"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type ActivePage = "food-list" | "dashboard" | "nutrition" | "recipes" | "other"

interface BottomNavProps {
  active?: ActivePage
}

export default function BottomNav({ active = "other" }: BottomNavProps) {
  const router = useRouter()
  const [hiddenPages, setHiddenPages] = useState<string[]>([])

  useEffect(() => {
    async function load() {
      try {
        const sb = createClient()
        const { data } = await sb.from("app_settings").select("value").eq("key", "hidden_pages").single()
        if (data) setHiddenPages(data.value || [])
      } catch {}
    }
    load()
  }, [])

  const btn = (page: string) =>
    `flex flex-col items-center justify-center py-3 text-xs ${active === page ? "text-pink-400" : "text-brand-dark"}`

  const icon = (page: string) =>
    `h-5 w-5 mb-1 ${active === page ? "text-pink-400" : "text-brand-dark"}`

  return (
    <nav className="bottom-nav grid grid-cols-5 border-t border-brand-dark/10 bg-white/80 backdrop-blur-sm">
      {!hiddenPages.includes("food-list") ? (
        <button className={btn("food-list")} onClick={() => router.push("/food-list")}>
          <List className={icon("food-list")} />
          <span>Products</span>
        </button>
      ) : <div />}

      <button className={btn("dashboard")} onClick={() => router.push("/dashboard")}>
        <Home className={icon("dashboard")} />
        <span>Dashboard</span>
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
          <span>Nutrition</span>
        </button>
      ) : <div />}

      {!hiddenPages.includes("recipes") ? (
        <button className={btn("recipes")} onClick={() => router.push("/recipes")}>
          <UtensilsCrossed className={icon("recipes")} />
          <span>Recipes</span>
        </button>
      ) : <div />}
    </nav>
  )
}
