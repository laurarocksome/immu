"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Settings, List, BookOpen, FileText, LogOut } from "lucide-react"
import Logo from "@/app/components/logo"

export default function AdminDashboard() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<"foods" | "recipes" | "nutrition">("foods")

  const handleNavigation = (section: "foods" | "recipes" | "nutrition") => {
    setActiveSection(section)
    router.push(`/admin/${section}`)
  }

  const handleLogout = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white">
      {/* Header */}
      <header className="p-4 border-b border-pink-200/30 flex justify-between items-center bg-gradient-to-r from-pink-300 to-peach-300">
        <div className="flex items-center gap-3">
          <Logo variant="light" />
          <div className="h-6 w-px bg-white/30" />
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-white" />
            <span className="text-white font-medium">Admin Panel</span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Exit Admin</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-brand-dark/70 mb-8">Manage your app content and data</p>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="glass-card rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center">
                  <List className="h-5 w-5 text-pink-500" />
                </div>
                <h3 className="font-semibold">Food Items</h3>
              </div>
              <p className="text-2xl font-bold mb-2">---</p>
              <p className="text-sm text-brand-dark/60">Total food database entries</p>
            </div>

            <div className="glass-card rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="font-semibold">Recipes</h3>
              </div>
              <p className="text-2xl font-bold mb-2">---</p>
              <p className="text-sm text-brand-dark/60">Published recipes</p>
            </div>

            <div className="glass-card rounded-2xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-calm-green" />
                </div>
                <h3 className="font-semibold">Nutrition Plans</h3>
              </div>
              <p className="text-2xl font-bold mb-2">---</p>
              <p className="text-sm text-brand-dark/60">Active diet phases</p>
            </div>
          </div>

          {/* Management Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => handleNavigation("foods")}
              className="glass-card rounded-2xl p-8 hover:shadow-lg transition-all hover:scale-105 text-left"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-300 to-pink-400 flex items-center justify-center mb-4">
                <List className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Manage Foods</h3>
              <p className="text-brand-dark/70">Add, edit, and organize food items in the database</p>
            </button>

            <button
              onClick={() => handleNavigation("recipes")}
              className="glass-card rounded-2xl p-8 hover:shadow-lg transition-all hover:scale-105 text-left"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-300 to-yellow-400 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Manage Recipes</h3>
              <p className="text-brand-dark/70">Create and update AIP-friendly recipes</p>
            </button>

            <button
              onClick={() => handleNavigation("nutrition")}
              className="glass-card rounded-2xl p-8 hover:shadow-lg transition-all hover:scale-105 text-left"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-calm-green to-green-400 flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Nutrition Plans</h3>
              <p className="text-brand-dark/70">Edit diet phase guidelines and timelines</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
