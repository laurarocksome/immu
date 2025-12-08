"use client"

import { useRouter } from "next/navigation"
import Logo from "@/app/components/logo"
import { setupTestData } from "../utils/test-utils"

export const dynamic = 'force-dynamic'

export default function GetStartedPage() {
  const router = useRouter()

  const handleGetStarted = () => {
    // Navigate directly to first onboarding step
    router.push("/onboarding/conditions")
  }

  const handleSkip = () => {
    setupTestData()
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 flex justify-center items-center bg-brand-dark text-white">
        <Logo />
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2 text-center">Get Started with IMMU</h2>
            <p className="text-brand-dark/70 text-center">Your personalized AIP journey begins here.</p>
          </div>

          {/* Get Started Button */}
          <div className="glass-card rounded-2xl p-6 space-y-4 mb-6">
            <p className="text-center mb-4">
              IMMU will guide you through the Autoimmune Protocol diet with personalized recommendations based on your
              needs.
            </p>
            <button onClick={handleGetStarted} className="w-full gradient-button py-4 rounded-full mb-4">
              Get Started
            </button>
          </div>

          {/* Skip button for testing */}
          <button
            onClick={handleSkip}
            className="w-full py-4 rounded-full border-2 border-dashed border-pink-300 bg-transparent text-pink-500 hover:bg-pink-50"
          >
            Skip (Testing)
          </button>
        </div>
      </main>
    </div>
  )
}
