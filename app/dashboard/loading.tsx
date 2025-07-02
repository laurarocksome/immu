"use client"

import { Loader } from "lucide-react"

/**
 * Fallback UI shown while `app/dashboard/page.tsx`
 * finishes loading (required when using `useSearchParams()`).
 */
export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <div className="flex flex-col items-center gap-4 text-green-800">
        <Loader className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading dashboard…</p>
      </div>
    </div>
  )
}
