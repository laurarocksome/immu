"use client"

import Link from "next/link"
import Logo from "@/components/Logo"
import { useRouter } from "next/navigation"
import { setupTestData } from "../utils/test-utils"
import TestUsers from "../components/test-users"
import { useState } from "react"

export default function Login() {
  const router = useRouter()
  const [showTestUsers, setShowTestUsers] = useState(false)

  const handleSkip = () => {
    setupTestData()
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        {/* Logo */}
        <Logo />

        {/* Main content */}
        <div className="w-full space-y-6">
          <h2 className="text-2xl font-semibold text-center text-primary-color">Welcome Back</h2>

          <div className="glass-card p-6 space-y-5">
            <div className="space-y-3">
              <label htmlFor="email" className="text-sm text-secondary-color">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-3 rounded-xl bg-white border border-[#e4e0f0] focus:outline-none focus:ring-2 focus:ring-[#da83d2]"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="password" className="text-sm text-secondary-color">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full p-3 rounded-xl bg-white border border-[#e4e0f0] focus:outline-none focus:ring-2 focus:ring-[#da83d2]"
                placeholder="Enter your password"
              />
            </div>

            <button className="w-full gradient-button py-4 rounded-full">Log In</button>

            {/* Toggle test users section */}
            <button
              onClick={() => setShowTestUsers(!showTestUsers)}
              className="w-full py-2 text-pink-500 text-sm hover:underline"
            >
              {showTestUsers ? "Hide Test Users" : "Show Test Users"}
            </button>

            {/* Test Users Section */}
            {showTestUsers && <TestUsers />}

            {/* Skip button for testing */}
            {!showTestUsers && (
              <button
                onClick={handleSkip}
                className="w-full py-4 rounded-full border-2 border-dashed border-pink-300 bg-transparent text-pink-500 hover:bg-pink-50"
              >
                Skip (Testing)
              </button>
            )}
          </div>

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
