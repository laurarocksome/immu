"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { List, Home, Plus, BookOpen, UtensilsCrossed, User, Search, Filter } from "lucide-react"
import Logo from "@/app/components/logo"

// Sample recipe data
const sampleRecipes = [
  {
    id: 1,
    title: "Turmeric Ginger Chicken Soup",
    category: "Lunch",
    prepTime: "15 min",
    cookTime: "30 min",
    tags: ["Anti-inflammatory", "Protein-rich"],
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "Avocado & Salmon Salad",
    category: "Dinner",
    prepTime: "10 min",
    cookTime: "0 min",
    tags: ["Omega-3", "Quick"],
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    title: "Sweet Potato Breakfast Hash",
    category: "Breakfast",
    prepTime: "10 min",
    cookTime: "20 min",
    tags: ["Energizing", "Fiber-rich"],
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 4,
    title: "Bone Broth with Vegetables",
    category: "Lunch",
    prepTime: "15 min",
    cookTime: "4 hrs",
    tags: ["Gut-healing", "Nutrient-dense"],
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 5,
    title: "Coconut Yogurt with Berries",
    category: "Breakfast",
    prepTime: "5 min",
    cookTime: "0 min",
    tags: ["Probiotic", "Quick"],
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 6,
    title: "Herb-Roasted Chicken with Root Vegetables",
    category: "Dinner",
    prepTime: "20 min",
    cookTime: "1 hr",
    tags: ["Protein-rich", "One-pan"],
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 7,
    title: "Shrimp Pesto Pasta",
    category: "Dinner",
    prepTime: "15 min",
    cookTime: "15 min",
    tags: ["AIP-Friendly", "Seafood", "Pasta Alternative"],
    image:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ChatGPT%20Image%20Apr%2018%2C%202025%2C%2011_14_18%20AM-fS3VCmaWCk9CtuFgUAGmJxj2EazeJW.png",
  },
]

// Categories for filtering
const categories = ["All", "Breakfast", "Lunch", "Dinner", "Snacks"]

export default function RecipesPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [showFilters, setShowFilters] = useState(false)

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const handleRecipeClick = (id: number) => {
    if (id === 7) {
      router.push(`/recipes/aip-shrimp-pesto-pasta`)
    } else {
      router.push(`/recipes/${id}`)
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  // Filter recipes based on search query and selected category
  const filteredRecipes = sampleRecipes.filter((recipe) => {
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "All" || recipe.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white text-brand-dark">
      {/* Header */}
      <header className="p-4 border-b border-brand-dark/10 flex justify-between items-center bg-brand-dark text-white">
        <Logo />
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
          <h2 className="text-2xl font-bold mb-2">AIP Recipes</h2>
          <p className="text-brand-dark/70">Discover delicious autoimmune-friendly recipes</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-brand-dark/50" />
          </div>
          <input
            type="text"
            placeholder="Search recipes or ingredients"
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/80 border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-5 w-5 text-brand-dark/50" />
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 glass-card rounded-xl p-4">
            <h3 className="font-medium mb-3">Filter by category</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedCategory === category
                      ? "bg-pink-400 text-white"
                      : "bg-white/80 border border-brand-dark/20 hover:bg-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recipe Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="glass-card rounded-2xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleRecipeClick(recipe.id)}
              >
                <div className="h-40 bg-gray-200 relative">
                  <img
                    src={recipe.image || "/placeholder.svg"}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-pink-400 text-white px-2 py-1 rounded-full text-xs">
                    {recipe.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{recipe.title}</h3>
                  <div className="flex justify-between text-sm text-brand-dark/70 mb-3">
                    <span>Prep: {recipe.prepTime}</span>
                    <span>Cook: {recipe.cookTime}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag, index) => (
                      <span key={index} className="bg-pink-100 text-brand-dark px-2 py-1 rounded-full text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-brand-dark/70">No recipes found. Try adjusting your search.</p>
            </div>
          )}
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
