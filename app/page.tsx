"use client"

export const dynamic = "force-dynamic"

import type React from "react"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Logo from "@/app/components/logo"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { signIn, getSession } from "@/lib/auth"

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    async function checkSession() {
      try {
        const session = await getSession()
        if (session) {
          router.replace("/dashboard")
        }
      } catch {}
    }
    checkSession()
  }, [router])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Clear any old localStorage data
      localStorage.clear()

      await signIn(email, password)

      // Set diet start date for new login
      localStorage.setItem("dietStartDate", new Date().toISOString())

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to sign in")
      setIsLoading(false)
    }
  }


  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-6">
          {/* Logo and branding */}
          <div className="flex flex-col items-center space-y-4">
            <Logo />
            <p className="text-center text-slate-600 text-base">
              Immu Health, your personal guide to the Autoimmune Protocol diet
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* Error message */}
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            {/* Sign In button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl shadow-md transition-all"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-slate-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-pink-500 font-semibold hover:text-pink-600 transition-colors">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
        </div>
      </div>
    </main>
  )
}
