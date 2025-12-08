"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, ArrowLeft, Clock, User, Heart } from "lucide-react"
import Logo from "@/app/components/logo"

// Sample recipe details
const recipeDetails = {
  id: 1,
  title: "Turmeric Ginger Chicken Soup",
  description:
    "A warming, anti-inflammatory soup that's perfect for soothing digestive issues and boosting immunity. This AIP-friendly recipe is rich in nutrients and healing compounds.",
  category: "Lunch",
  prepTime: "15 min",
  cookTime: "30 min",
  servings: 4,
  tags: ["Anti-inflammatory", "Protein-rich", "Gut-healing"],
  image: "/placeholder.svg?height=300&width=600",
  ingredients: [
    "1 whole organic chicken (about 3-4 pounds)",
    "2 tablespoons olive oil or coconut oil",
    "1 large onion, chopped",
    "4 garlic cloves, minced",
    "2-inch piece fresh ginger, peeled and grated",
    "1 tablespoon ground turmeric",
    "2 carrots, chopped",
    "2 celery stalks, chopped",
    "8 cups bone broth or filtered water",
    "2 bay leaves",
    "1 teaspoon sea salt",
    "Fresh herbs (parsley, cilantro) for garnish",
  ],
  instructions: [
    "Heat oil in a large pot over medium heat. Add onions and sauté until translucent, about 5 minutes.",
    "Add garlic, ginger, and turmeric. Stir for 1 minute until fragrant.",
    "Add chicken, carrots, celery, bone broth, bay leaves, and salt. Bring to a boil.",
    "Reduce heat to low, cover, and simmer for 25-30 minutes until chicken is cooked through and vegetables are tender.",
    "Remove chicken from pot. When cool enough to handle, remove meat from bones and shred.",
    "Return shredded chicken to the pot and heat through.",
    "Adjust seasoning if needed and garnish with fresh herbs before serving.",
  ],
  nutritionFacts: {
    calories: 320,
    protein: 28,
    carbs: 12,
    fat: 18,
    fiber: 3,
  },
  isFavorite: false,
}

export default function RecipeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [recipe, setRecipe] = useState(recipeDetails)
  const [isFavorite, setIsFavorite] = useState(recipe.isFavorite)

  const handleBack = () => {
    router.back()
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
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

      {/* Recipe Image */}
      <div className="relative w-full h-48 md:h-64">
        <img src={recipe.image || "/placeholder.svg"} alt={recipe.title} className="w-full h-full object-cover" />
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
          <p className="text-brand-dark/70 mb-4">{recipe.description}</p>

          <div className="flex flex-wrap gap-4 mb-2">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-brand-dark/70" />
              <span className="text-sm">Prep: {recipe.prepTime}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-brand-dark/70" />
              <span className="text-sm">Cook: {recipe.cookTime}</span>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1 text-brand-dark/70" />
              <span className="text-sm">Serves: {recipe.servings}</span>
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
                <span>{ingredient}</span>
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
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-400 text-white flex items-center justify-center mr-3">
                  {index + 1}
                </span>
                <p>{instruction}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Nutrition Facts */}
        <div className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Nutrition Facts</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold">{recipe.nutritionFacts.calories}</div>
              <div className="text-sm text-brand-dark/70">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{recipe.nutritionFacts.protein}g</div>
              <div className="text-sm text-brand-dark/70">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{recipe.nutritionFacts.carbs}g</div>
              <div className="text-sm text-brand-dark/70">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{recipe.nutritionFacts.fat}g</div>
              <div className="text-sm text-brand-dark/70">Fat</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{recipe.nutritionFacts.fiber}g</div>
              <div className="text-sm text-brand-dark/70">Fiber</div>
            </div>
          </div>
        </div>
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
