"use client"

import { useRouter, usePathname } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed } from "lucide-react"

export default function DesktopSidebar() {
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav className="desktop-sidebar">
      <div className="sidebar-logo">✦ IMMU</div>

      <button
        className={`sidebar-link ${isActive("/food-list") ? "active" : ""}`}
        onClick={() => router.push("/food-list")}
      >
        <List size={20} />
        Products
      </button>

      <button
        className={`sidebar-link ${isActive("/dashboard") ? "active" : ""}`}
        onClick={() => router.push("/dashboard")}
      >
        <Home size={20} />
        Dashboard
      </button>

      <button
        className={`sidebar-link ${isActive("/nutrition") ? "active" : ""}`}
        onClick={() => router.push("/nutrition")}
      >
        <BookOpen size={20} />
        Nutrition
      </button>

      <button
        className={`sidebar-link ${isActive("/recipes") ? "active" : ""}`}
        onClick={() => router.push("/recipes")}
      >
        <UtensilsCrossed size={20} />
        Recipes
      </button>

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
