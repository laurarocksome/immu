"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Logo from "@/components/Logo"
import { useRouter } from "next/navigation"
import { setupTestData } from "./utils/test-utils"
import TestUsers from "./components/test-users"
import { useState } from "react"

export default function Home() {
  const router = useRouter()
  const [showTestUsers, setShowTestUsers] = useState(false)

  const handleSkip = () => {
    setupTestData()
    router.push("/dashboard")
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-8">
        {/* Logo */}
        <Logo />

        {/* Main content */}
        <div className="w-full space-y-6">
          <p className="text-lg text-secondary-color text-center mb-8">
            Your personal guide to the Autoimmune Protocol diet
          </p>

          <div className="glass-card p-6 space-y-5">
            <Link href="/login" passHref>
              <Button className="w-full h-12 text-lg gradient-button">Login</Button>
            </Link>

            <Link href="/onboarding/conditions" passHref>
              <Button className="w-full h-12 text-lg secondary-button">Get Started</Button>
            </Link>

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
              <Button
                onClick={handleSkip}
                className="w-full h-12 text-lg border-2 border-dashed border-pink-300 bg-transparent text-pink-500 hover:bg-pink-50"
              >
                Skip (Testing)
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full pt-8 opacity-70 mt-auto">
        <p className="text-center text-sm text-secondary-color">Your journey to better health starts here</p>
      </div>
    </main>
  )
}
