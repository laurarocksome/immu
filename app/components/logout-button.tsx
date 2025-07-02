"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export function LogoutButton({ className }: { className?: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      router.push("/login")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" size="sm" className={className} onClick={handleLogout} disabled={loading}>
      <Icons.logout className="h-4 w-4 mr-1" />
      {loading ? "Signing out…" : "Sign Out"}
    </Button>
  )
}

// also export as default for backward compatibility
export default LogoutButton
