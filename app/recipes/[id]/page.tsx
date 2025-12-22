"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, ArrowLeft, Clock, Heart } from "lucide-react"
import Logo from "@/app/components/logo"
import { createBrowserClient } from "@supabase/ssr"

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

  const handleBack = () => {
    router.back()
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
        <header className="p-4 flex justify-between items-center header-gradient text-white">
          <button onClick={handleBack} className="flex items-center text-white/80 hover:text-white">
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back</span>
          </button>
          <Logo variant="light" />
          <div className="w-20"></div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-brand-dark/60">Loading recipe...</div>
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
            <span>Back</span>
          </button>
          <Logo variant="light" />
          <div className="w-20"></div>
        </header>
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-brand-dark/70 mb-4">Recipe not found</p>
            <button onClick={handleBack} className="gradient-button px-6 py-2 rounded-full">
              Go Back
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
          <span>Back</span>
        </button>
        <Logo variant="light" />
        <div className="w-20"></div>
      </header>

      {/* Recipe Image */}
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

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-auto">
        {/* Recipe Header */}
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
              <span className="text-sm">Prep: {recipe.prep_time}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-brand-dark/70" />
              <span className="text-sm">Cook: {recipe.cook_time}</span>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index} className="flex items-start">
                <div className="h-2 w-2 rounded-full bg-pink-400 mt-2 mr-2"></div>
                <span>{typeof ingredient === "string" ? ingredient : ingredient.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Instructions</h2>
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
            <h2 className="text-xl font-bold mb-4">Nutrition Facts</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {recipe.nutrition_info.calories && (
                <div className="text-center">
                  <div className="text-lg font-bold">{recipe.nutrition_info.calories}</div>
                  <div className="text-sm text-brand-dark/70">Calories</div>
                </div>
              )}
              {recipe.nutrition_info.protein && (
                <div className="text-center">
                  <div className="text-lg font-bold">{recipe.nutrition_info.protein}g</div>
                  <div className="text-sm text-brand-dark/70">Protein</div>
                </div>
              )}
              {recipe.nutrition_info.carbs && (
                <div className="text-center">
                  <div className="text-lg font-bold">{recipe.nutrition_info.carbs}g</div>
                  <div className="text-sm text-brand-dark/70">Carbs</div>
                </div>
              )}
              {recipe.nutrition_info.fat && (
                <div className="text-center">
                  <div className="text-lg font-bold">{recipe.nutrition_info.fat}g</div>
                  <div className="text-sm text-brand-dark/70">Fat</div>
                </div>
              )}
              {recipe.nutrition_info.fiber && (
                <div className="text-center">
                  <div className="text-lg font-bold">{recipe.nutrition_info.fiber}g</div>
                  <div className="text-sm text-brand-dark/70">Fiber</div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="grid grid-cols-5 border-t border-brand-dark/10 bg-white/80 backdrop-blur-sm">
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => handleNavigation("/food-list")}
        >
          <List className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Products</span>
        </button>
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => handleNavigation("/dashboard")}
        >
          <Home className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Dashboard</span>
        </button>
        <button
          className="flex items-center justify-center rounded-full gradient-button h-14 w-14 -mt-7 mx-auto shadow-lg"
          onClick={() => handleNavigation("/log-day")}
        >
          <Plus className="h-6 w-6" />
        </button>
        <button
          className="flex flex-col items-center justify-center py-3 text-xs"
          onClick={() => handleNavigation("/nutrition")}
        >
          <BookOpen className="h-5 w-5 mb-1 text-brand-dark" />
          <span className="text-brand-dark">Nutrition</span>
        </button>
        <button className="flex flex-col items-center justify-center py-3 text-xs text-pink-400">
          <UtensilsCrossed className="h-5 w-5 mb-1 text-pink-400" />
          <span>Recipes</span>
        </button>
      </nav>
    </div>
  )
}
