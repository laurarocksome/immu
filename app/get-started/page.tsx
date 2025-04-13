"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function GetStartedRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect directly to the first onboarding question
    router.push("/onboarding/conditions")
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#2a3158] text-white">
      <p>Redirecting...</p>
    </div>
  )
}
