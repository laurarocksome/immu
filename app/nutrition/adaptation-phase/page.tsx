"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, User, ArrowLeft, ChevronRight, PlusIcon } from "lucide-react"
import Logo from "@/app/components/logo"
import Image from "next/image"

export default function AdaptationPhasePage() {
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
      title: "Fiber-Rich Breakfast Bowl",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 2,
      title: "Vegetable Protein Stir-Fry",
      image: "/placeholder.svg?height=200&width=300",
    },
    {
      id: 3,
      title: "Berry Smoothie Bowl",
      image: "/placeholder.svg?height=200&width=300",
    },
  ]

  const faqs = [
    {
      id: "foods-to-avoid",
      question: "What foods should be avoided?",
      answer:
        "During the adaptation phase, gradually reduce caffeine (coffee, black and green tea), alcohol, sugar, and processed foods. Focus on removing one category per week rather than all at once.",
    },
    {
      id: "grains-legumes",
      question: "Can I eat any grains or legumes?",
      answer:
        "Yes, you can include whole grains and legumes in moderation. These are good sources of fiber, but introduce them gradually to allow your digestive system to adapt.",
    },
    {
      id: "fiber-sources",
      question: "What are some good sources of fiber?",
      answer:
        "Good sources of fiber include fruits (apples, berries, pears), vegetables (broccoli, carrots, leafy greens), legumes (beans, lentils), whole grains (oats, quinoa), and nuts and seeds.",
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 border-b border-pink-200/30 flex justify-between items-center bg-gradient-to-r from-pink-300 to-peach-300">
        <div className="flex items-center">
          <button
            className="mr-2 w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <Logo variant="light" />
        </div>
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
          onClick={handleProfileClick}
        >
          <User className="h-5 w-5 text-white" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-4">Adaptation Phase</h1>

          <p className="text-brand-dark/90 mb-8">
            This 28-day phase helps you ease into the AIP diet without going cold turkey. You don't need to change
            everything at once — instead, you'll build new habits week by week, making the transition smoother and more
            sustainable.
          </p>
        </div>

        {/* To-Do List */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">To-Do List</h2>
          <ul className="space-y-5">
            <li className="flex items-start">
              <span className="text-pink-500 mr-2 mt-1 flex-shrink-0">•</span>
              <div>
                <strong className="block mb-1">Week 1</strong>
                <p>
                  Remove all caffeinated drinks (like coffee, matcha, energy drinks), and any stimulants like
                  pre-workout supplements. This helps reduce stress on your nervous system and improves sleep and energy
                  stability.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-pink-500 mr-2 mt-1 flex-shrink-0">•</span>
              <div>
                <strong className="block mb-1">Week 2</strong>
                <p>
                  Eliminate alcohol while continuing to avoid caffeine. Start drinking 1.5–2L of water daily and
                  increase your fruit intake to stay hydrated and ease cravings.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-pink-500 mr-2 mt-1 flex-shrink-0">•</span>
              <div>
                <strong className="block mb-1">Week 3</strong>
                <p>
                  Remove added sugars. You can still enjoy fruit or a little honey in moderation. To feel satisfied and
                  avoid blood sugar dips, boost your protein intake — add more chicken, fish, or other lean proteins to
                  your meals.
                </p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-pink-500 mr-2 mt-1 flex-shrink-0">•</span>
              <div>
                <strong className="block mb-1">Week 4</strong>
                <p>
                  Keep going with your new habits (no caffeine, sugar, or alcohol) and increase your vegetable intake.
                  You're now preparing for full AIP, where proteins and vegetables are the foundation of your meals.
                </p>
              </div>
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
