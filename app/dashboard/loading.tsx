"use client"

import { LoaderCircle } from "lucide-react"

/**
 * Suspense fallback for the /dashboard route.
 * Displays an animated spinner while the page’s data / components load.
 */
export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground">Loading dashboard&hellip;</p>
    </div>
  )
}
