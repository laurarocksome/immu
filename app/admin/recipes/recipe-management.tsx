"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Search, Edit2, Trash2, X, Save } from "lucide-react"
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
  phase?: string
  ingredients: { text: string }[]
  instructions: { step: number; text: string }[]
  nutrition_info?: any
}

export default function RecipeManagement() {
  const router = useRouter()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    category: "Breakfast",
    prep_time: "",
    cook_time: "",
    tags: "",
    image_url: "",
    phase: "General",
    ingredients: "",
    instructions: "",
  })

  useEffect(() => {
    loadRecipes()
  }, [])

  const loadRecipes = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("recipes").select("*").order("title")

    if (error) {
      console.error("[v0] Error loading recipes:", error)
    } else {
      setRecipes(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const recipeData = {
      title: formData.title,
      category: formData.category,
      prep_time: formData.prep_time,
      cook_time: formData.cook_time,
      tags: formData.tags.split(",").map((t) => t.trim()),
      image_url: formData.image_url || null,
      phase: formData.phase,
      ingredients: formData.ingredients
        .split("\n")
        .filter((line) => line.trim())
        .map((text) => ({ text })),
      instructions: formData.instructions
        .split("\n")
        .filter((line) => line.trim())
        .map((text, index) => ({ step: index + 1, text })),
    }

    if (editingRecipe) {
      const { error } = await supabase.from("recipes").update(recipeData).eq("id", editingRecipe.id)

      if (error) {
        console.error("[v0] Error updating recipe:", error)
        alert("Failed to update recipe")
      } else {
        await loadRecipes()
        handleCloseModal()
      }
    } else {
      const { error } = await supabase.from("recipes").insert(recipeData)

      if (error) {
        console.error("[v0] Error creating recipe:", error)
        alert("Failed to create recipe")
      } else {
        await loadRecipes()
        handleCloseModal()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return

    const { error } = await supabase.from("recipes").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting recipe:", error)
      alert("Failed to delete recipe")
    } else {
      await loadRecipes()
    }
  }

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setFormData({
      title: recipe.title,
      category: recipe.category,
      prep_time: recipe.prep_time,
      cook_time: recipe.cook_time,
      tags: recipe.tags.join(", "),
      image_url: recipe.image_url || "",
      phase: recipe.phase || "General",
      ingredients: recipe.ingredients.map((i) => i.text).join("\n"),
      instructions: recipe.instructions.map((i) => i.text).join("\n"),
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingRecipe(null)
    setFormData({
      title: "",
      category: "Breakfast",
      prep_time: "",
      cook_time: "",
      tags: "",
      image_url: "",
      phase: "General",
      ingredients: "",
      instructions: "",
    })
  }

  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-lightest to-white">
      {/* Header */}
      <header className="p-4 border-b border-pink-200/30 flex justify-between items-center bg-gradient-to-r from-pink-300 to-peach-300">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/admin")} className="text-white hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <Logo variant="light" />
          <span className="text-white font-medium">Recipe Management</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-dark/50" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="gradient-button px-6 py-3 rounded-xl flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="h-5 w-5" />
              Add Recipe
            </button>
          </div>

          {/* Recipes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center p-8 text-brand-dark/60">Loading...</div>
            ) : filteredRecipes.length === 0 ? (
              <div className="col-span-full text-center p-8 text-brand-dark/60">No recipes found</div>
            ) : (
              filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="glass-card rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-40 bg-gray-200 relative">
                    {recipe.image_url ? (
                      <img
                        src={recipe.image_url || "/placeholder.svg"}
                        alt={recipe.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-dark/40">No image</div>
                    )}
                    <div className="absolute top-2 right-2 bg-pink-400 text-white px-2 py-1 rounded-full text-xs">
                      {recipe.category}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2">{recipe.title}</h3>
                    <div className="flex justify-between text-sm text-brand-dark/70 mb-3">
                      <span>Prep: {recipe.prep_time}</span>
                      <span>Cook: {recipe.cook_time}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {recipe.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="bg-pink-100 text-brand-dark px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                      {recipe.tags.length > 2 && (
                        <span className="text-xs text-brand-dark/60">+{recipe.tags.length - 2}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(recipe)}
                        className="flex-1 px-4 py-2 bg-pink-100 hover:bg-pink-200 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(recipe.id)}
                        className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{editingRecipe ? "Edit Recipe" : "Add Recipe"}</h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    >
                      <option value="Breakfast">Breakfast</option>
                      <option value="Lunch">Lunch</option>
                      <option value="Dinner">Dinner</option>
                      <option value="Snacks">Snacks</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Prep Time *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 15 min"
                      value={formData.prep_time}
                      onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cook Time *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., 30 min"
                      value={formData.cook_time}
                      onChange={(e) => setFormData({ ...formData, cook_time: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., Anti-inflammatory, Protein-rich"
                    className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ingredients (one per line) *</label>
                  <textarea
                    required
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    placeholder="1 lb chicken breast&#10;2 cups vegetables&#10;1 tsp olive oil"
                    rows={6}
                    className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Instructions (one step per line) *</label>
                  <textarea
                    required
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Preheat oven to 350°F&#10;Season the chicken&#10;Bake for 30 minutes"
                    rows={8}
                    className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nutrition Phase</label>
                  <select
                    value={formData.phase}
                    onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    <option value="General">General (All Phases)</option>
                    <option value="Adaptation">Adaptation Phase</option>
                    <option value="Elimination">Elimination Phase</option>
                    <option value="Reintroduction">Reintroduction Phase</option>
                  </select>
                  <p className="text-xs text-brand-dark/60 mt-1">
                    Assign this recipe to a specific nutrition phase or keep it general
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 rounded-xl border border-brand-dark/20 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 gradient-button px-6 py-3 rounded-xl flex items-center justify-center gap-2"
                  >
                    <Save className="h-5 w-5" />
                    {editingRecipe ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
