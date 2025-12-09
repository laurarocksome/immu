"use client"

import type React from "react"

import Link from "next/link"
import Logo from "@/components/Logo"
import { useRouter } from "next/navigation"
import { setupTestData } from "../utils/test-utils"
import { useState } from "react"
import { signIn } from "@/lib/auth"

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
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        {/* Logo */}
        <Logo />

        {/* Main content */}
        <div className="w-full space-y-6">
          <h2 className="text-2xl font-semibold text-center text-primary-color">Welcome Back</h2>

          <div className="space-y-6">
            <div className="glass-card p-6 space-y-5">
              <form onSubmit={handleLogin} className="space-y-4">
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
                    disabled={isLoading}
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
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full gradient-button py-4 rounded-full disabled:opacity-50"
                >
                  {isLoading ? "Logging in..." : "Log In"}
                </button>
              </form>
            </div>

            <button
              onClick={handleSkip}
              disabled={isLoading}
              className="w-full h-12 rounded-full border-2 border-dashed border-pink-300 bg-transparent text-pink-500 hover:bg-pink-50 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Loading..." : "Skip (Testing)"}
            </button>
          </div>

          <div className="text-center space-y-3">
            <p className="text-sm text-secondary-color">
              <Link href="/forgot-password" className="text-accent-color hover:underline">
                Forgot password?
              </Link>
            </p>
            <p className="text-sm text-secondary-color">
              Don't have an account?{" "}
              <Link href="/signup" className="text-accent-color hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
