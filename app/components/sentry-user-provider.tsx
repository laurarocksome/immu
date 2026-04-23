"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export default function SentryUserProvider() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
    if (!dsn) return

    async function initAndIdentify() {
      try {
        const Sentry = await import("@sentry/nextjs")

        if (!Sentry.getClient()) {
          Sentry.init({
            dsn,
            environment: process.env.NODE_ENV,
            tracesSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,
            ignoreErrors: [
              "chrome-extension://",
              "moz-extension://",
              "safari-extension://",
              "Network request failed",
              "Failed to fetch",
              "NetworkError",
              "Load failed",
              "AuthApiError",
            ],
            beforeSend(event) {
              if (event.request?.url?.startsWith("chrome-extension://")) return null
              return event
            },
          })
        }

        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          Sentry.setUser({ id: user.id, email: user.email })
        } else {
          Sentry.setUser(null)
        }
      } catch {}
    }

    initAndIdentify()
  }, [])

  return null
}
