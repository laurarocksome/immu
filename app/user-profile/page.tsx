"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Logo from "@/app/components/logo"

export default function UserProfilePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the dashboard
    router.push("/dashboard")
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      <Logo variant="light" />
      <p className="mt-4 text-brand-dark/70">Redirecting to dashboard...</p>
    </div>
  )
}
