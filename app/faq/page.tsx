"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, ArrowLeft, ChevronDown, ChevronUp } from "lucide-react"
import Logo from "@/app/components/logo"

// FAQ item interface
interface FAQItem {
  question: string
  answer: React.ReactNode
}

export default function FAQPage() {
  const router = useRouter()
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

  const handleBack = () => {
    router.back()
  }

  const toggleExpand = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null)
    } else {
      setExpandedIndex(index)
    }
  }

  // FAQ data
  const faqItems: FAQItem[] = [
    {
      question: "What is the AIP Diet?",
      answer: (
        <p className="text-brand-dark/80">
          The Autoimmune Protocol (AIP) diet is an elimination diet designed to help reduce inflammation and symptoms of
          autoimmune disorders. It removes potential trigger foods and then slowly reintroduces them to identify which
          ones cause symptoms.
        </p>
      ),
    },
    {
      question: "How long should I follow the AIP diet?",
      answer: (
        <p className="text-brand-dark/80">
          The elimination phase typically lasts 30-90 days, depending on your symptoms and response. The reintroduction
          phase can take several months as you test each food group carefully.
        </p>
      ),
    },
    {
      question: "What is the adaptation period?",
      answer: (
        <p className="text-brand-dark/80">
          The adaptation period is a 4-6 week transition phase that helps you gradually adjust to the AIP diet. This is
          especially helpful if you currently consume foods or beverages that might be difficult to eliminate all at
          once.
        </p>
      ),
    },
    {
      question: "What foods are eliminated on AIP?",
      answer: (
        <p className="text-brand-dark/80">
          The AIP diet eliminates grains, legumes, dairy, eggs, nightshade vegetables, nuts, seeds, processed foods,
          refined sugars, and certain oils. It also removes food additives and alcohol.
        </p>
      ),
    },
    {
      question: "How do I manage stress during AIP?",
      answer: (
        <div>
          <p className="text-brand-dark/80 mb-2">
            Stress management is a crucial part of the AIP protocol. Chronic stress can trigger inflammation and worsen
            autoimmune symptoms.
          </p>
          <h4 className="font-medium text-base mt-3 mb-1">Recommended light exercises:</h4>
          <ul className="list-disc pl-5 text-brand-dark/80 mb-2">
            <li>Walking in nature (20-30 minutes daily)</li>
            <li>Gentle swimming (avoid competitive swimming)</li>
            <li>Restorative yoga or gentle stretching</li>
            <li>Tai chi or qigong</li>
          </ul>
          <p className="text-brand-dark/80 italic mb-2">
            Note: Strenuous activities should be avoided during AIP as they can increase inflammation and stress
            hormones.
          </p>

          <h4 className="font-medium text-base mt-3 mb-1">Deep breathing techniques:</h4>
          <p className="text-brand-dark/80 mb-2">
            Deep breathing activates your parasympathetic nervous system (rest and digest mode). Try the 4-7-8 method:
            inhale for 4 seconds, hold for 7 seconds, exhale for 8 seconds. Practice for 5 minutes daily.
          </p>

          <h4 className="font-medium text-base mt-3 mb-1">Journaling for stress reduction:</h4>
          <ul className="list-disc pl-5 text-brand-dark/80">
            <li>Record daily gratitude (3 things you're thankful for)</li>
            <li>Track your symptoms alongside emotional states</li>
            <li>Write about challenging situations and possible solutions</li>
            <li>Note positive experiences and small victories</li>
          </ul>
        </div>
      ),
    },
    {
      question: "Why is caffeine not allowed on AIP?",
      answer: (
        <div>
          <p className="text-brand-dark/80 mb-3">
            Caffeine is eliminated during the initial phase of AIP for several important reasons:
          </p>
          <ul className="list-disc pl-5 text-brand-dark/80 mb-3">
            <li>It can irritate the gut lining, compromising intestinal barrier integrity</li>
            <li>It stimulates the adrenals, potentially disrupting hormone balance</li>
            <li>It masks fatigue instead of addressing the underlying cause</li>
            <li>It can directly trigger autoimmune symptoms in sensitive individuals</li>
          </ul>
          <p className="text-brand-dark/80 mb-3">Coffee specifically is problematic because coffee beans are:</p>
          <ul className="list-disc pl-5 text-brand-dark/80 mb-3">
            <li>Seeds, which are eliminated on AIP (like nuts, legumes, etc.)</li>
            <li>Known to cross-react with gluten for some people (the immune system treats it like gluten)</li>
          </ul>
          <p className="text-brand-dark/80 italic">
            Once you've rebalanced your immune system and healed your gut (usually after 30–90 days), caffeine can be
            reintroduced mindfully as part of the reintroduction protocol.
          </p>
        </div>
      ),
    },
    {
      question: "What about weight loss on AIP?",
      answer: (
        <div>
          <p className="text-brand-dark/80 mb-3">
            Many people experience weight loss on AIP as a natural side effect of:
          </p>
          <ul className="list-disc pl-5 text-brand-dark/80 mb-3">
            <li>Reduced inflammation throughout the body</li>
            <li>Better hormone regulation and balance</li>
            <li>Improved gut health and nutrient absorption</li>
            <li>Elimination of processed foods and refined sugars</li>
          </ul>
          <p className="text-brand-dark/80 mb-3 font-medium">
            Important: AIP is not designed as a weight loss diet. The primary goal is health and symptom reduction.
          </p>
          <p className="text-brand-dark/80 mb-2">
            If your weight isn't changing or is increasing on AIP, consider these factors:
          </p>
          <ul className="list-disc pl-5 text-brand-dark/80">
            <li>Consuming too many AIP-safe treats (coconut-heavy desserts, excessive sweet potatoes)</li>
            <li>Underlying thyroid or hormonal imbalances that need addressing</li>
            <li>Being in a caloric surplus (AIP is not automatically low-calorie)</li>
            <li>Chronic stress or poor sleep affecting metabolism</li>
            <li>Your body finding its natural, healthy weight (which may be different than expected)</li>
          </ul>
        </div>
      ),
    },
    {
      question: "How do I track my symptoms?",
      answer: (
        <p className="text-brand-dark/80">
          IMMU helps you track your symptoms daily. Consistent tracking is important to identify patterns and
          connections between foods and symptoms. Use the dashboard to log your meals and symptoms each day.
        </p>
      ),
    },
  ]

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

          <div className="space-y-2">
            {faqItems.map((item, index) => (
              <div key={index} className="glass-card rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleExpand(index)}
                  className="w-full p-4 flex justify-between items-center text-left font-semibold"
                >
                  <span>{item.question}</span>
                  {expandedIndex === index ? (
                    <ChevronUp className="h-5 w-5 flex-shrink-0 text-brand-dark/70" />
                  ) : (
                    <ChevronDown className="h-5 w-5 flex-shrink-0 text-brand-dark/70" />
                  )}
                </button>
                {expandedIndex === index && <div className="p-4 pt-0 border-t border-brand-dark/10">{item.answer}</div>}
              </div>
            ))}
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
