"use client"

import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, ArrowLeft } from "lucide-react"
import Logo from "@/app/components/logo"

export default function FAQPage() {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-brand-dark text-white">
        <button onClick={handleBack} className="flex items-center text-white/80 hover:text-white">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>Back</span>
        </button>
        <Logo />
        <div className="w-20"></div> {/* Empty div for spacing */}
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-8 overflow-auto">
        <div className="max-w-md mx-auto">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-2">What is the AIP Diet?</h3>
              <p className="text-brand-dark/80">
                The Autoimmune Protocol (AIP) diet is an elimination diet designed to help reduce inflammation and
                symptoms of autoimmune disorders. It removes potential trigger foods and then slowly reintroduces them
                to identify which ones cause symptoms.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-2">How long should I follow the AIP diet?</h3>
              <p className="text-brand-dark/80">
                The elimination phase typically lasts 30-90 days, depending on your symptoms and response. The
                reintroduction phase can take several months as you test each food group carefully.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-2">What is the adaptation period?</h3>
              <p className="text-brand-dark/80">
                The adaptation period is a 4-6 week transition phase that helps you gradually adjust to the AIP diet.
                This is especially helpful if you currently consume foods or beverages that might be difficult to
                eliminate all at once.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-2">What foods are eliminated on AIP?</h3>
              <p className="text-brand-dark/80">
                The AIP diet eliminates grains, legumes, dairy, eggs, nightshade vegetables, nuts, seeds, processed
                foods, refined sugars, and certain oils. It also removes food additives and alcohol.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-semibold text-lg mb-2">How do I track my symptoms?</h3>
              <p className="text-brand-dark/80">
                IMMU helps you track your symptoms daily. Consistent tracking is important to identify patterns and
                connections between foods and symptoms. Use the dashboard to log your meals and symptoms each day.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="grid grid-cols-5 border-t border-brand-dark/10 bg-white/80 backdrop-blur-sm">
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => router.push("/food-list")}
        >
          <List className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Food List</span>
        </button>
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => router.push("/dashboard")}
        >
          <Home className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Dashboard</span>
        </button>
        <button
          className="flex items-center justify-center rounded-full gradient-button h-14 w-14 -mt-7 mx-auto shadow-lg"
          onClick={() => router.push("/add-meal")}
        >
          <Plus className="h-6 w-6" />
        </button>
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => router.push("/nutrition")}
        >
          <BookOpen className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Nutrition</span>
        </button>
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => router.push("/recipes")}
        >
          <UtensilsCrossed className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Recipes</span>
        </button>
      </nav>
    </div>
  )
}
