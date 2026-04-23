"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function SentryUserProvider() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return

    async function identify() {
      try {
        const Sentry = await import("@sentry/nextjs")
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          Sentry.setUser({ id: user.id, email: user.email })
        } else {
          Sentry.setUser(null)
        }
      } catch {}
    }

    identify()
  }, [])

  return null
}
