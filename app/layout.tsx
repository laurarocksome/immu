import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import DesktopSidebar from "./components/desktop-sidebar"
import { LanguageProvider } from "@/lib/i18n/context"

export const metadata: Metadata = {
  title: "IMMU - AIP Diet Tracking App",
  description: "Track your diet journey, monitor symptoms, and see your progress",
  generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          <DesktopSidebar />
          <div className="app-shell">
            {children}
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
}
