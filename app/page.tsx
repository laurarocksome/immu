"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Logo from "@/components/Logo"
import { useRouter } from "next/navigation"
import { setupTestData } from "./utils/test-utils"

export default function Home() {
  const router = useRouter()

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

            <Link href="/get-started" passHref>
              <Button className="w-full h-12 text-lg secondary-button">Get Started</Button>
            </Link>

            {/* Skip button for testing */}
            <Button
              onClick={handleSkip}
              className="w-full h-12 text-lg border-2 border-dashed border-pink-300 bg-transparent text-pink-500 hover:bg-pink-50"
            >
              Skip (Testing)
            </Button>
          </div>
        </div>
      </div>

      <div className="w-full pt-8 opacity-70 mt-auto">
        <p className="text-center text-sm text-secondary-color">Your journey to better health starts here</p>
      </div>
    </main>
  )
}
