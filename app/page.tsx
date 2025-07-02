"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Logo from "@/components/Logo"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        {/* Logo */}
        <Logo />

        {/* Main content */}
        <div className="w-full space-y-6">
          <p className="text-lg text-secondary-color text-center mb-4">
            Immu Health, your personal guide to the Autoimmune Protocol diet
          </p>

          <div className="glass-card p-6 space-y-5">
            <Link href="/login" passHref>
              <Button className="w-full h-12 text-lg gradient-button">Login</Button>
            </Link>

            <Link href="/onboarding/conditions" passHref>
              <Button className="w-full h-12 text-lg secondary-button">Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
