"use client"

export const dynamic = "force-dynamic"

import { useRouter } from "next/navigation"
import { ArrowLeft, Check } from "lucide-react"
import Logo from "@/app/components/logo"

const DIETS = [
  {
    name: "AIP",
    fullName: "Autoimmune Protocol",
    active: true,
  },
  {
    name: "Whole30",
    fullName: "Whole30",
    active: false,
  },
  {
    name: "Low-FODMAP",
    fullName: "Low-FODMAP",
    active: false,
  },
  {
    name: "SCD",
    fullName: "Specific Carbohydrate Diet",
    active: false,
  },
  {
    name: "Elimination Diet",
    fullName: "Elimination Diet",
    active: false,
  },
  {
    name: "GAPS",
    fullName: "Gut and Psychology Syndrome",
    active: false,
  },
]

export default function MyDietPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      <header className="p-4 border-b border-pink-200/30 flex justify-between items-center bg-gradient-to-r from-pink-300 to-peach-300">
        <button
          onClick={() => router.push("/profile")}
          className="mr-2 w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-white" />
        </button>
        <Logo variant="light" />
        <div className="w-8" />
      </header>

      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="my-8 text-center">
            <h2 className="text-3xl font-bold mb-2 text-brand-dark">My Diet</h2>
            <p className="text-brand-dark/50 text-sm">Your current diet plan</p>
          </div>

          <div className="space-y-3">
            {DIETS.map((diet) =>
              diet.active ? (
                <div
                  key={diet.name}
                  className="bg-white rounded-3xl p-5 shadow-soft border-2 border-pink-400 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-pink-400 to-pink-300 px-3 py-1 rounded-bl-2xl flex items-center gap-1">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    <span className="text-white text-xs font-semibold">Active</span>
                  </div>
                  <p className="font-bold text-brand-dark text-lg pr-20">{diet.name}</p>
                  <p className="text-brand-dark/50 text-sm mt-0.5">{diet.fullName}</p>
                </div>
              ) : (
                <div
                  key={diet.name}
                  className="bg-white/60 rounded-3xl p-5 border-2 border-brand-dark/10 relative overflow-hidden opacity-60"
                >
                  <div className="absolute top-0 right-0 bg-brand-dark/10 px-3 py-1 rounded-bl-2xl">
                    <span className="text-brand-dark/50 text-xs font-medium">Coming Soon</span>
                  </div>
                  <p className="font-bold text-brand-dark/50 text-lg pr-24">{diet.name}</p>
                  <p className="text-brand-dark/30 text-sm mt-0.5">{diet.fullName}</p>
                </div>
              )
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
