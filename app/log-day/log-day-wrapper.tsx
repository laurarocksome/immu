"use client"

import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

const LogDayContent = dynamic(() => import("./log-day-content"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})

export default function LogDayWrapper() {
  return <LogDayContent />
}
