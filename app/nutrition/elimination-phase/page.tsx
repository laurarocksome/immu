"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, User, ArrowLeft, ChevronRight, PlusIcon } from "lucide-react"
import Logo from "@/app/components/logo"
import BottomNav from "@/app/components/bottom-nav"
import Image from "next/image"
import { createBrowserClient } from "@supabase/ssr"

export default function EliminationPhasePage() {
  const router = useRouter()
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const [nutritionPlans, setNutritionPlans] = useState<any[]>([])
  const [recipes, setRecipes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

  const faqs = [
    {
      id: "foods-to-avoid",
      question: "What foods should be avoided?",
      answer:
        "During the elimination phase, avoid all grains, legumes, dairy, eggs, nightshades, nuts, seeds, and food additives. This helps identify which foods might be triggering inflammation in your body.",
    },
    {
      id: "how-long",
      question: "How long should I stay in the elimination phase?",
      answer:
        "Most people stay in the elimination phase for 30-90 days. The exact duration depends on your symptoms and how your body responds. It's important to stay in this phase until your symptoms have significantly improved.",
    },
    {
      id: "what-to-eat",
      question: "What can I eat during this phase?",
      answer:
        "Focus on nutrient-dense foods like quality meats, seafood, bone broth, and a wide variety of vegetables (except nightshades). Fruits in moderation are also allowed, as are healthy fats like olive oil, coconut oil, and avocados.",
    },
  ]

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        )

        const { data: plansData, error: plansError } = await supabase
          .from("nutrition_plans")
          .select("*")
          .eq("phase", "Elimination")
          .order("created_at")

        if (plansError) throw plansError

        setNutritionPlans(plansData || [])

        const { data: recipesData, error: recipesError } = await supabase
          .from("recipes")
          .select("*")
          .eq("phase", "Elimination")
          .limit(3)

        if (recipesError) throw recipesError

        setRecipes(recipesData || [])
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
          <h1 className="text-3xl font-bold mb-4">Elimination Phase</h1>

          <p className="text-brand-dark/90 mb-8">
            This phase helps identify your food triggers by temporarily removing common inflammatory foods. By strictly
            following the AIP diet, you'll give your body a chance to heal and reduce inflammation.
          </p>
        </div>

        {/* To-Do List */}
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">To-Do List</h2>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <ul className="space-y-5">
              {nutritionPlans.map((plan) => (
                <li key={plan.id} className="flex items-start">
                  <span className="text-pink-500 mr-2 mt-1 flex-shrink-0">•</span>
                  <div>
                    <strong className="block mb-1">{plan.title}</strong>
                    <p>{plan.description}</p>
                    {plan.content?.tasks && (
                      <ul className="mt-2 space-y-1">
                        {plan.content.tasks.map((task: string, idx: number) => (
                          <li key={idx} className="text-sm text-brand-dark/80">
                            • {task}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Related Recipes */}
        {recipes.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Related Recipes</h2>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="min-w-[280px] rounded-xl overflow-hidden border border-gray-200 bg-white cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/recipes/${recipe.id}`)}
                >
                  <div className="relative h-40 w-full">
                    <Image
                      src={recipe.image_url || "/placeholder.svg?height=200&width=300"}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                    />
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
        )}

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

      <BottomNav active="nutrition" />
    </div>
  )
}
