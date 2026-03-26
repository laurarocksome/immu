"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, Heart } from "lucide-react"
import Logo from "@/app/components/logo"
import BottomNav from "@/app/components/bottom-nav"
import { createBrowserClient } from "@supabase/ssr"
import { useLanguage } from "@/lib/i18n/context"

type Recipe = {
  id: string
  title: string
  category: string
  prep_time: string
  cook_time: string
  tags: string[]
  image_url?: string
  ingredients: Array<string | { text: string }>
  instructions: Array<string | { text: string }>
  nutrition_info?: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
  }
}

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { t } = useLanguage()
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    loadRecipe()
  }, [params.id])

  const loadRecipe = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("recipes").select("*").eq("id", params.id).single()

    if (error) {
      console.error("[v0] Error loading recipe:", error)
    } else {
      if (data) {
        const normalizedRecipe = {
          ...data,
          ingredients: Array.isArray(data.ingredients)
            ? data.ingredients.map((i: any) => (typeof i === "string" ? i : i.text || ""))
            : [],
          instructions: Array.isArray(data.instructions)
            ? data.instructions.map((i: any) => (typeof i === "string" ? i : i.text || ""))
            : [],
        }
        setRecipe(normalizedRecipe)
      }
    }
    setLoading(false)
  }

  const handleBack = () => { router.back() }
  const toggleFavorite = () => { setIsFavorite(!isFavorite) }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
        <header className="p-4 flex justify-between items-center header-gradient text-white">
          <button onClick={handleBack} className="flex items-center text-white/80 hover:text-white">
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>{t("recipe.back", "Back")}</span>
          </button>
          <Logo variant="light" />
          <div className="w-20"></div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-brand-dark/60">{t("recipe.loading", "Loading recipe...")}</div>
        </main>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
        <header className="p-4 flex justify-between items-center header-gradient text-white">
          <button onClick={handleBack} className="flex items-center text-white/80 hover:text-white">
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>{t("recipe.back", "Back")}</span>
          </button>
          <Logo variant="light" />
          <div className="w-20"></div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-brand-dark/70 mb-4">{t("recipe.notFound", "Recipe not found")}</p>
            <button onClick={handleBack} className="gradient-button px-6 py-2 rounded-full">
              {t("recipe.goBack", "Go Back")}
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      <header className="p-4 flex justify-between items-center header-gradient text-white">
        <button onClick={handleBack} className="flex items-center text-white/80 hover:text-white">
          <ArrowLeft className="h-5 w-5 mr-1" />
          <span>{t("recipe.back", "Back")}</span>
        </button>
        <Logo variant="light" />
        <div className="w-20"></div>
      </header>

      <div className="relative w-full h-48 md:h-64">
        <img
          src={recipe.image_url || "/placeholder.svg?height=300&width=600&query=recipe"}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4">
          <button
            onClick={toggleFavorite}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isFavorite ? "bg-pink-400" : "bg-white/80"
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "text-white fill-current" : "text-pink-400"}`} />
          </button>
        </div>
      </div>

      <main className="flex-1 p-4 overflow-auto">
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 mb-2">
            {recipe.tags.map((tag, index) => (
              <span key={index} className="bg-pink-100 text-brand-dark px-2 py-1 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-2xl font-bold mb-2">{recipe.title}</h1>
          <div className="flex flex-wrap gap-4 mb-2">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-brand-dark/70" />
              <span className="text-sm">{t("recipes.prep", "Prep:")} {recipe.prep_time}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-brand-dark/70" />
              <span className="text-sm">{t("recipes.cook", "Cook:")} {recipe.cook_time}</span>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{t("recipe.ingredients", "Ingredients")}</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-pink-400 mt-2 mr-2"></div>
                <span>{typeof ingredient === "string" ? ingredient : ingredient.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{t("recipe.instructions", "Instructions")}</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((instruction, index) => (
              <li key={index} className="flex">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-400 text-white flex items-center justify-center mr-3 text-sm">
                  {index + 1}
                </span>
                <p>{typeof instruction === "string" ? instruction : instruction.text}</p>
              </li>
            ))}
          </ol>
        </div>

        {recipe.nutrition_info && (
          <div className="glass-card rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">{t("recipe.nutritionFacts", "Nutrition Facts")}</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {recipe.nutrition_info.calories && (
                <div className="text-center">
                  <div className="text-lg font-bold">{recipe.nutrition_info.calories}</div>
                  <div className="text-sm text-brand-dark/70">{t("recipe.calories", "Calories")}</div>
                </div>
              )}
              {recipe.nutrition_info.protein && (
                <div className="text-center">
                  <div className="text-lg font-bold">{recipe.nutrition_info.protein}g</div>
                  <div className="text-sm text-brand-dark/70">{t("recipe.protein", "Protein")}</div>
                </div>
              )}
              {recipe.nutrition_info.carbs && (
                <div className="text-center">
                  <div className="text-lg font-bold">{recipe.nutrition_info.carbs}g</div>
                  <div className="text-sm text-brand-dark/70">{t("recipe.carbs", "Carbs")}</div>
                </div>
              )}
              {recipe.nutrition_info.fat && (
                <div className="text-center">
                  <div className="text-lg font-bold">{recipe.nutrition_info.fat}g</div>
                  <div className="text-sm text-brand-dark/70">{t("recipe.fat", "Fat")}</div>
                </div>
              )}
              {recipe.nutrition_info.fiber && (
                <div className="text-center">
                  <div className="text-lg font-bold">{recipe.nutrition_info.fiber}g</div>
                  <div className="text-sm text-brand-dark/70">{t("recipe.fiber", "Fiber")}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <BottomNav active="recipes" />
    </div>
  )
}
