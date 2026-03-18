"use client"

import type React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { setupTestData } from "../utils/test-utils"
import { useState } from "react"
import { signIn } from "@/lib/auth"
import ImmuLogo from "@/app/components/immu-logo"

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      localStorage.clear()
      await signIn(email, password)
      const today = new Date().toISOString()
      localStorage.setItem("dietStartDate", today)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to login. Please check your credentials.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    setIsLoading(true)
    try {
      localStorage.clear()
      setupTestData()
      router.push("/dashboard")
    } catch (err) {
      console.error("Error:", err)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ImmuLogo />
            <h1 className="text-3xl font-bold text-primary-color">IMMU</h1>
          </div>
          <p className="text-center text-slate-600 text-sm leading-relaxed">
            Immu Health, your personal guide to the Autoimmune Protocol diet
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl gradient-button text-white font-semibold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-slate-600 text-sm mt-6">
          Don't have an account?{" "}
          <Link href="/signup" className="text-pink-500 font-semibold hover:text-pink-600 transition-colors">
            Sign Up
          </Link>
        </p>
      </div>

      <button
        onClick={handleSkip}
        disabled={isLoading}
        className="mt-8 text-sm text-slate-500 hover:text-slate-700 underline transition-colors disabled:opacity-50"
      >
        {isLoading ? "Loading..." : "Skip (Testing)"}
      </button>
    </div>
  )
}
