"use client"

interface DietViolationOptionsProps {
  onSelect: (type: "full" | "single") => void
}

export default function DietViolationOptions({ onSelect }: DietViolationOptionsProps) {
  return (
    <div className="glass-card rounded-2xl p-6 overflow-hidden border border-blue-100">
      <h2 className="text-xl font-bold mb-6 text-center">What type of diet violation?</h2>

      <div className="space-y-6">
        <button
          onClick={() => onSelect("full")}
          className="w-full flex flex-col items-start text-left p-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 transition-colors"
        >
          <h3 className="font-medium text-lg mb-1">Indulged in a Full Non-AIP Meal</h3>
          <p className="text-sm text-gray-600">Examples: Pizza, bowl of pasta, cake, or multiple non-AIP foods.</p>
        </button>

        <button
          onClick={() => onSelect("single")}
          className="w-full flex flex-col items-start text-left p-4 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 transition-colors"
        >
          <h3 className="font-medium text-lg mb-1">Had One Non-AIP Ingredient</h3>
          <p className="text-sm text-gray-600">
            Examples: A potato, cup of coffee, or single non-compliant ingredient.
          </p>
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/80 to-transparent pointer-events-none"></div>
    </div>
  )
}
