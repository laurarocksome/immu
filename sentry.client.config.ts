import * as Sentry from "@sentry/nextjs"

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.replayIntegration(),
    ],
    ignoreErrors: [
      "chrome-extension://",
      "moz-extension://",
      "safari-extension://",
      "Network request failed",
      "Failed to fetch",
      "NetworkError",
      "Load failed",
    ],
    beforeSend(event) {
      if (event.request?.url?.startsWith("chrome-extension://")) return null
      return event
    },
  })
}
