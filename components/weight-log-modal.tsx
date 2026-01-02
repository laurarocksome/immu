"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { saveWeightLog } from "@/lib/weight-data"

interface WeightLogModalProps {
  userId: string
  currentWeight?: number
  currentUnit?: string
  onClose: () => void
  onSave: () => void
}

export function WeightLogModal({ userId, currentWeight, currentUnit = "lbs", onClose, onSave }: WeightLogModalProps) {
  const [weight, setWeight] = useState(currentWeight?.toString() || "")
  const [unit, setUnit] = useState(currentUnit)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  const handleSave = async () => {
    const weightNum = Number.parseFloat(weight)
    if (!weight || isNaN(weightNum) || weightNum <= 0) {
      setError("Please enter a valid weight")
      return
    }

    setIsSaving(true)
    setError("")

    try {
      console.log("[v0] About to save weight log for user:", userId)
      const result = await saveWeightLog(userId, weightNum, unit)
      console.log("[v0] Weight log saved successfully:", result)
      onSave()
      onClose()
    } catch (err) {
      console.error("[v0] Error saving weight:", err)
      const errorMessage = err instanceof Error ? `Failed: ${err.message}` : "Failed to save weight. Please try again."
      console.error("[v0] Full error details:", JSON.stringify(err, null, 2))
      setError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-semibold text-primary-color mb-4">Log Weight</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter weight"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
                step="0.1"
                min="0"
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="lbs">lbs</option>
                <option value="kg">kg</option>
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-pink-400 hover:bg-pink-500 text-white"
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
