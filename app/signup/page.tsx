"use client"

export const dynamic = "force-dynamic"

import type React from "react"

import Link from "next/link"
import Logo from "@/components/Logo"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { signUp } from "@/lib/auth"
import LanguageToggle from "@/app/components/language-toggle"
import { useLanguage } from "@/lib/i18n/context"

export default function SignUp() {
  const router = useRouter()
  const { t } = useLanguage()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError(t("signup.error.passwordMismatch", "Passwords do not match"))
      return
    }

    if (password.length < 6) {
      setError(t("signup.error.passwordShort", "Password must be at least 6 characters long"))
      return
    }

    setIsLoading(true)

    try {
      console.log("[v0] Starting signup for:", email)
      const result = await signUp(email, password, name)
      console.log("[v0] Signup result:", result)

      if (!result.user) {
        throw new Error(t("signup.error.createFailed", "Failed to create account. Please try again."))
      }

      console.log("[v0] User created successfully:", result.user.id)
      localStorage.clear()
      const today = new Date().toISOString()
      localStorage.setItem("dietStartDate", today)
      localStorage.setItem("userAccount", JSON.stringify({ name, email, createdAt: today }))
      router.push("/onboarding/conditions")
    } catch (err: any) {
      console.log("[v0] Signup error:", err)
      if (err.message?.includes("already exists")) {
        setError(t("signup.error.alreadyExists", "An account with this email already exists. Please log in instead."))
      } else {
        setError(err.message || t("signup.error.createFailed", "Failed to create account. Please try again."))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6 relative">
      <div className="absolute top-4 right-4">
        <div className="bg-brand-dark/80 backdrop-blur-sm rounded-full px-2 py-1">
          <LanguageToggle />
        </div>
      </div>
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        <Logo />

        <div className="w-full space-y-6">
          <h2 className="text-2xl font-semibold text-center text-primary-color">
            {t("signup.title", "Create Account")}
          </h2>

          <div className="glass-card p-6 space-y-5">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-3">
                <label htmlFor="name" className="text-sm text-secondary-color">
                  {t("signup.fullName", "Full Name")}
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-[#e4e0f0] focus:outline-none focus:ring-2 focus:ring-[#da83d2]"
                  placeholder={t("signup.fullNamePlaceholder", "Enter your full name")}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="email" className="text-sm text-secondary-color">
                  {t("signup.email", "Email")}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-[#e4e0f0] focus:outline-none focus:ring-2 focus:ring-[#da83d2]"
                  placeholder={t("signup.emailPlaceholder", "Enter your email")}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="password" className="text-sm text-secondary-color">
                  {t("signup.password", "Password")}
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-[#e4e0f0] focus:outline-none focus:ring-2 focus:ring-[#da83d2]"
                  placeholder={t("signup.passwordPlaceholder", "Create a password (min 6 characters)")}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="confirm-password" className="text-sm text-secondary-color">
                  {t("signup.confirmPassword", "Confirm Password")}
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white border border-[#e4e0f0] focus:outline-none focus:ring-2 focus:ring-[#da83d2]"
                  placeholder={t("signup.confirmPasswordPlaceholder", "Confirm your password")}
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
                {isLoading
                  ? t("signup.creating", "Creating Account...")
                  : t("signup.submit", "Create Account")}
              </button>
            </form>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-secondary-color">
              {t("signup.haveAccount", "Already have an account?")}{" "}
              <Link href="/login" className="text-accent-color hover:underline">
                {t("signup.login", "Log in")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
