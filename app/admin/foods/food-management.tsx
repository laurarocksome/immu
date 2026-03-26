"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Search, Edit2, Trash2, X, Save } from "lucide-react"
import Logo from "@/app/components/logo"
import { createBrowserClient } from "@supabase/ssr"

type Food = {
  id: string
  name: string
  is_aip: boolean
  status: string
  tags: string[]
  tooltip?: string
  category?: string
}

export default function FoodManagement() {
  const router = useRouter()
  const [foods, setFoods] = useState<Food[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [editingFood, setEditingFood] = useState<Food | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    is_aip: false,
    status: "Can consume",
    tags: "",
    tooltip: "",
    category: "",
  })

  useEffect(() => {
    loadFoods()
  }, [])

  const loadFoods = async () => {
    setLoading(true)
    const { data, error } = await supabase.from("foods").select("*").order("name")

    if (error) {
      console.error("[v0] Error loading foods:", error)
    } else {
      setFoods(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const foodData = {
      name: formData.name,
      is_aip: formData.is_aip,
      status: formData.status,
      tags: formData.tags.split(",").map((t) => t.trim()),
      tooltip: formData.tooltip || null,
      category: formData.category || null,
    }

    if (editingFood) {
      // Update existing food
      const { error } = await supabase.from("foods").update(foodData).eq("id", editingFood.id)

      if (error) {
        console.error("[v0] Error updating food:", error)
        alert("Failed to update food item")
      } else {
        await loadFoods()
        handleCloseModal()
      }
    } else {
      // Create new food
      const { error } = await supabase.from("foods").insert(foodData)

      if (error) {
        console.error("[v0] Error creating food:", error)
        alert("Failed to create food item")
      } else {
        await loadFoods()
        handleCloseModal()
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this food item?")) return

    const { error } = await supabase.from("foods").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting food:", error)
      alert("Failed to delete food item")
    } else {
      await loadFoods()
    }
  }

  const handleEdit = (food: Food) => {
    setEditingFood(food)
    setFormData({
      name: food.name,
      is_aip: food.is_aip,
      status: food.status,
      tags: food.tags.join(", "),
      tooltip: food.tooltip || "",
      category: food.category || "",
    })
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingFood(null)
    setFormData({
      name: "",
      is_aip: false,
      status: "Can consume",
      tags: "",
      tooltip: "",
      category: "",
    })
  }

  const filteredFoods = foods.filter(
    (food) =>
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
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
          <span className="text-white font-medium">Food Management</span>
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
                placeholder="Search foods..."
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
              Add Food Item
            </button>
          </div>

          {/* Foods Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-pink-50">
                  <tr>
                    <th className="text-left p-4 font-semibold">Name</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Category</th>
                    <th className="text-left p-4 font-semibold">Tags</th>
                    <th className="text-right p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-brand-dark/60">
                        Loading...
                      </td>
                    </tr>
                  ) : filteredFoods.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-brand-dark/60">
                        No food items found
                      </td>
                    </tr>
                  ) : (
                    filteredFoods.map((food) => (
                      <tr key={food.id} className="border-t border-brand-dark/10 hover:bg-pink-50/50">
                        <td className="p-4 font-medium">{food.name}</td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs ${
                              food.status === "Can consume"
                                ? "bg-green-100 text-calm-green"
                                : food.status === "Can't consume"
                                  ? "bg-red-100 text-red-600"
                                  : "bg-yellow-100 text-yellow-600"
                            }`}
                          >
                            {food.status}
                          </span>
                        </td>
                        <td className="p-4 text-brand-dark/70">{food.category || "-"}</td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {food.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="bg-pink-100 text-brand-dark px-2 py-1 rounded-full text-xs">
                                {tag}
                              </span>
                            ))}
                            {food.tags.length > 3 && (
                              <span className="text-xs text-brand-dark/60">+{food.tags.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(food)}
                              className="p-2 hover:bg-pink-100 rounded-lg transition-colors"
                            >
                              <Edit2 className="h-4 w-4 text-brand-dark" />
                            </button>
                            <button
                              onClick={() => handleDelete(food.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{editingFood ? "Edit Food Item" : "Add Food Item"}</h2>
                <button onClick={handleCloseModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  >
                    <option value="Can consume">Can consume</option>
                    <option value="Can't consume">Can't consume</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Reintroduction">Reintroduction</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_aip}
                      onChange={(e) => setFormData({ ...formData, is_aip: e.target.checked })}
                      className="w-4 h-4 rounded border-brand-dark/20"
                    />
                    <span className="text-sm font-medium">AIP Compliant</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Protein, Vegetable, Fruit"
                    className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., Protein, Meat, Poultry"
                    className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tooltip (optional)</label>
                  <textarea
                    value={formData.tooltip}
                    onChange={(e) => setFormData({ ...formData, tooltip: e.target.value })}
                    placeholder="Additional information about this food"
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-brand-dark/20 focus:outline-none focus:ring-2 focus:ring-pink-400"
                  />
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
                    {editingFood ? "Update" : "Create"}
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
