"use client"

import type React from "react"

import Link from "next/link"
import Logo from "@/components/Logo"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/utils/supabase/client"

export const dynamic = 'force-dynamic'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        {/* Logo */}
        <Logo />

        {/* Main content */}
        <div className="w-full space-y-6">
          <h2 className="text-2xl font-semibold text-center text-primary-color">Welcome Back</h2>

          <form onSubmit={handleLogin} className="glass-card p-6 space-y-5">
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-center text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <label htmlFor="email" className="text-sm text-secondary-color">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-white border border-[#e4e0f0] focus:outline-none focus:ring-2 focus:ring-[#da83d2]"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="text-sm text-secondary-color">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded-xl bg-white border border-[#e4e0f0] focus:outline-none focus:ring-2 focus:ring-[#da83d2]"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-button py-4 rounded-full disabled:opacity-50"
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <div className="text-center space-y-3">
            <p className="text-sm text-secondary-color">
              <Link href="/forgot-password" className="text-accent-color hover:underline">
                Forgot password?
              </Link>
            </p>
            <p className="text-sm text-secondary-color">
              Don't have an account?{" "}
              <Link href="/onboarding/conditions" className="text-accent-color hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
