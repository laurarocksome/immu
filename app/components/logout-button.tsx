"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { LogOut } from "lucide-react"

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
    >
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  )
}
