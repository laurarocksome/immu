import type React from "react"
import "./globals.css"
import type { Metadata, Viewport } from "next"
import DesktopSidebar from "./components/desktop-sidebar"
import { LanguageProvider } from "@/lib/i18n/context"

export const metadata: Metadata = {
  title: "IMMU - AIP Diet Tracking App",
  description: "Track your AIP diet journey, monitor symptoms, and see your progress",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IMMU",
  },
  icons: {
    icon: "/pwa-icon.svg",
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#f4a6b8",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="IMMU" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body>
        <LanguageProvider>
          <DesktopSidebar />
          <div className="app-shell">
            {children}
          </div>
        </LanguageProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
