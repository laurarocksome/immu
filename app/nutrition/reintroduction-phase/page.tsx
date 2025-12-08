"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, User, ArrowLeft, ChevronRight, PlusIcon } from "lucide-react"
import Logo from "@/app/components/logo"
import Image from "next/image"

export const dynamic = 'force-dynamic'

export default function ReintroductionPhasePage() {
  const router = useRouter()
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const handleBackClick = () => {
    router.push("/nutrition")
  }

  const toggleFaq = (id: string) => {
    if (expandedFaq === id) {
      setExpandedFaq(null)
    } else {
      setExpandedFaq(id)
    }
  }

  const recipes = [
    {
      id: 1,
      title: "Egg Reintroduction Breakfast",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      title: "Seed-Based Snack Bowl",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      title: "Legume Test Meal",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  const faqs = [
    {
      id: "reintroduction-order",
      question: "In what order should I reintroduce foods?",
      answer:
        "Start with foods that are least likely to cause reactions, such as egg yolks, seed-based spices, and certain nuts. Then gradually move to more potentially problematic foods like dairy, nightshades, and grains.",
    },
    {
      id: "reaction-signs",
      question: "What signs indicate I'm reacting to a food?",
      answer:
        "Watch for digestive issues, skin problems, joint pain, headaches, fatigue, mood changes, or sleep disturbances. Any return of your original symptoms is a clear sign that the reintroduced food may be problematic for you.",
    },
    {
      id: "reintroduction-process",
      question: "How do I properly test a food?",
      answer:
        "Introduce one food at a time. Eat a small amount on day 1, a larger amount on day 2, and then avoid it completely for 3-5 days while monitoring for reactions. If no reactions occur, you can add that food to your safe list.",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 border-b border-brand-dark/10 flex justify-between items-center bg-brand-dark text-white">
        <div className="flex items-center">
          <button
            className="mr-2 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <Logo />
        </div>
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
          onClick={handleProfileClick}
        >
          <User className="h-5 w-5 text-white" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Reintroduction Phase</h1>

          <p className="text-brand-dark/90 mb-8">
            This phase helps you systematically test eliminated foods to identify your personal triggers. By carefully
            reintroducing one food at a time and monitoring your body's response, you'll create your personalized
            sustainable diet.
          </p>
        </div>

        {/* Reintroduction Process */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-lg mb-3 flex items-center">
            <span className="mr-2">🔍</span> The Reintroduction Process:
          </h3>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <span className="text-pink-500 mr-2 mt-1 flex-shrink-0">•</span>
              <p>Choose one food at a time.</p>
            </li>
            <li className="flex items-start">
              <span className="text-pink-500 mr-2 mt-1 flex-shrink-0">•</span>
              <p>Only reintroduce a single ingredient — not a mix.</p>
            </li>
            <li className="flex items-start">
              <span className="text-pink-500 mr-2 mt-1 flex-shrink-0">•</span>
              <p>Example: reintroduce egg yolk before whole egg.</p>
            </li>
          </ul>

          <h3 className="font-semibold text-lg mb-3 flex items-center">
            <span className="mr-2">⏱️</span> Test in increasing amounts:
          </h3>
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <span className="text-pink-500 mr-2 mt-1 flex-shrink-0">•</span>
              <p>Morning: Take a small bite.</p>
            </li>
            <li className="flex items-start">
              <span className="text-pink-500 mr-2 mt-1 flex-shrink-0">•</span>
              <p>Wait 15 minutes. If no reaction, have a larger bite.</p>
            </li>
            <li className="flex items-start">
              <span className="text-pink-500 mr-2 mt-1 flex-shrink-0">•</span>
              <p>Wait 2–3 hours. If still no reaction, eat a normal portion.</p>
            </li>
            <li className="flex items-start">
              <span className="text-pink-500 mr-2 mt-1 flex-shrink-0">•</span>
              <p>Then wait 3 full days before testing the next food — keep your base AIP diet otherwise unchanged.</p>
            </li>
          </ul>

          <h3 className="font-semibold text-lg mb-3 flex items-center">
            <span className="mr-2">📝</span> Track reactions carefully:
          </h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <span className="text-pink-500 mr-2 mt-1 flex-shrink-0">•</span>
              <p>Note any symptoms: fatigue, mood changes, digestive discomfort, headaches, pain, etc.</p>
            </li>
            <li className="flex items-start">
              <span className="text-pink-500 mr-2 mt-1 flex-shrink-0">•</span>
              <p>Symptoms can appear immediately or be delayed, so that 3-day waiting period is important.</p>
            </li>
          </ul>
        </div>

        {/* Related Recipes */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Related Recipes</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {recipes.map((recipe) => (
              <div
                key={recipe.id}
                className="min-w-[280px] rounded-xl overflow-hidden border border-gray-200 bg-white"
                onClick={() => router.push(`/recipes/${recipe.id}`)}
              >
                <div className="relative h-40 w-full">
                  <Image src={recipe.image || "/placeholder.svg"} alt={recipe.title} fill className="object-cover" />
                </div>
                <div className="p-4 flex justify-between items-center">
                  <h3 className="font-medium">{recipe.title}</h3>
                  <ChevronRight className="h-5 w-5 text-pink-500" />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push("/recipes")}
            className="mt-4 w-full py-3 rounded-xl border border-pink-500 text-pink-500 font-medium hover:bg-pink-50 transition-colors"
          >
            View All Recipes
          </button>
        </div>

        {/* FAQ */}
        <div className="mb-8">
          <div className="rounded-xl overflow-hidden border border-gray-200">
            {faqs.map((faq, index) => (
              <div key={faq.id} className={`border-b ${index === faqs.length - 1 ? "border-b-0" : "border-gray-200"}`}>
                <button
                  className="w-full p-4 flex justify-between items-center text-left"
                  onClick={() => toggleFaq(faq.id)}
                >
                  <span className="font-medium">{faq.question}</span>
                  <PlusIcon className={`h-5 w-5 transition-transform ${expandedFaq === faq.id ? "rotate-45" : ""}`} />
                </button>
                {expandedFaq === faq.id && <div className="p-4 pt-0 text-brand-dark/80">{faq.answer}</div>}
              </div>
            ))}
          </div>
          <button
            onClick={() => router.push("/faq")}
            className="mt-4 w-full py-3 rounded-xl border border-pink-500 text-pink-500 font-medium hover:bg-pink-50 transition-colors"
          >
            More FAQ
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="grid grid-cols-5 border-t border-brand-dark/10 bg-white/80 backdrop-blur-sm">
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => router.push("/food-list")}
        >
          <List className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Products</span>
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
          onClick={() => router.push("/log-day")}
        >
          <Plus className="h-6 w-6" />
        </button>
        <button
          className="flex flex-col items-center justify-center py-3 text-xs text-pink-400"
          onClick={() => router.push("/nutrition")}
        >
          <BookOpen className="h-5 w-5 mb-1 text-pink-400" />
          <span>Nutrition</span>
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
