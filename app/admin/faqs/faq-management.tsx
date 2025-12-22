"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@/lib/supabase/client"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string | null
  phase: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "General",
    phase: "General",
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    fetchFAQs()
  }, [])

  async function fetchFAQs() {
    try {
      const { data, error } = await supabase.from("faqs").select("*").order("order_index")

      if (error) throw error
      setFaqs(data || [])
    } catch (error) {
      console.error("Error fetching FAQs:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    try {
      if (editingId) {
        const { error } = await supabase
          .from("faqs")
          .update({
            question: formData.question,
            answer: formData.answer,
            category: formData.category,
            phase: formData.phase,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingId)

        if (error) throw error
      } else {
        const { error } = await supabase.from("faqs").insert([
          {
            ...formData,
            order_index: faqs.length,
          },
        ])

        if (error) throw error
      }

      setEditingId(null)
      setIsAdding(false)
      setFormData({ question: "", answer: "", category: "General", phase: "General" })
      fetchFAQs()
    } catch (error) {
      console.error("Error saving FAQ:", error)
      alert("Failed to save FAQ. Please try again.")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this FAQ?")) return

    try {
      const { error } = await supabase.from("faqs").delete().eq("id", id)

      if (error) throw error
      fetchFAQs()
    } catch (error) {
      console.error("Error deleting FAQ:", error)
      alert("Failed to delete FAQ. Please try again.")
    }
  }

  function startEdit(faq: FAQ) {
    setEditingId(faq.id)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "General",
      phase: faq.phase || "General",
    })
    setIsAdding(false)
  }

  function cancelEdit() {
    setEditingId(null)
    setIsAdding(false)
    setFormData({ question: "", answer: "", category: "General", phase: "General" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading FAQs...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900">Manage FAQs</h1>
          <Button
            onClick={() => {
              setIsAdding(true)
              setEditingId(null)
              setFormData({ question: "", answer: "", category: "General", phase: "General" })
            }}
            className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New FAQ
          </Button>
        </div>

        {(isAdding || editingId) && (
          <Card className="mb-6 border-2 border-pink-200">
            <CardHeader>
              <CardTitle>{editingId ? "Edit FAQ" : "Add New FAQ"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question</label>
                <Input
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter FAQ question"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Answer</label>
                <Textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter FAQ answer (supports line breaks)"
                  rows={6}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="General">General</option>
                    <option value="Digestive">Digestive</option>
                    <option value="Nutrition">Nutrition</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phase</label>
                  <select
                    value={formData.phase}
                    onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="General">General</option>
                    <option value="Adaptation">Adaptation</option>
                    <option value="Elimination">Elimination</option>
                    <option value="Reintroduction">Reintroduction</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-green-500 hover:bg-green-600">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={cancelEdit} variant="outline">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-slate-600 whitespace-pre-wrap mb-3">{faq.answer}</p>
                    <div className="flex gap-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {faq.category || "General"}
                      </span>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {faq.phase || "General"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button onClick={() => startEdit(faq)} variant="outline" size="sm" className="hover:bg-blue-50">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(faq.id)}
                      variant="outline"
                      size="sm"
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
