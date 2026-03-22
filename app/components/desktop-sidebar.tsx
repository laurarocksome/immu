"use client"

import { useRouter, usePathname } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed } from "lucide-react"
import { useEffect, useState } from "react"

export default function DesktopSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const [hiddenPages, setHiddenPages] = useState<string[]>([])

  const isActive = (path: string) => pathname === path

  const hidden = pathname === "/login" || pathname === "/signup" || pathname === "/get-started" || pathname === "/" || pathname.startsWith("/onboarding")

  useEffect(() => {
    const shell = document.querySelector(".app-shell")
    if (!shell) return
    if (hidden) {
      shell.classList.remove("has-sidebar")
    } else {
      shell.classList.add("has-sidebar")
    }
  }, [hidden])

  useEffect(() => {
    async function loadHiddenPages() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const sb = createClient()
        const { data } = await sb.from("app_settings").select("value").eq("key", "hidden_pages").single()
        if (data) setHiddenPages(data.value || [])
      } catch {}
    }
    loadHiddenPages()
  }, [])

  if (hidden) return null

  return (
    <nav className="desktop-sidebar">
      {!hiddenPages.includes("food-list") && (
        <button
          className={`sidebar-link ${isActive("/food-list") ? "active" : ""}`}
          onClick={() => router.push("/food-list")}
        >
          <List size={20} />
          Products
        </button>
      )}

      <button
        className={`sidebar-link ${isActive("/dashboard") ? "active" : ""}`}
        onClick={() => router.push("/dashboard")}
      >
        <Home size={20} />
        Dashboard
      </button>

      {!hiddenPages.includes("nutrition") && (
        <button
          className={`sidebar-link ${isActive("/nutrition") ? "active" : ""}`}
          onClick={() => router.push("/nutrition")}
        >
          <BookOpen size={20} />
          Nutrition
        </button>
      )}

      {!hiddenPages.includes("recipes") && (
        <button
          className={`sidebar-link ${isActive("/recipes") ? "active" : ""}`}
          onClick={() => router.push("/recipes")}
        >
          <UtensilsCrossed size={20} />
          Recipes
        </button>
      )}

      <button
        className="sidebar-log-btn"
        onClick={() => router.push("/log-day")}
      >
        <Plus size={20} />
        Log Day
      </button>
    </nav>
  )
}
