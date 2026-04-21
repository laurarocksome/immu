"use client"

import { useLanguage } from "@/lib/i18n/context"

export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage()
  const baseBtn =
    "px-2 py-1 text-xs font-semibold rounded-full transition-all"
  const activeBtn = "bg-pink-400 text-white"
  const inactiveBtn = "bg-white/10 text-white/70 hover:bg-white/20"

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`${baseBtn} ${locale === "en" ? activeBtn : inactiveBtn}`}
        aria-label="Switch to English"
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("lt")}
        className={`${baseBtn} ${locale === "lt" ? activeBtn : inactiveBtn}`}
        aria-label="Switch to Lithuanian"
      >
        LT
      </button>
    </div>
  )
}
