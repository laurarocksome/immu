"use client"

interface RestartConfirmationProps {
  onSelect: (restart: boolean) => void
}

export default function RestartConfirmation({ onSelect }: RestartConfirmationProps) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h2 className="text-xl font-bold mb-4 text-center">Do you want to restart the diet?</h2>
      <p className="text-center mb-6 text-gray-600">
        A single non-AIP ingredient may affect your progress. You can choose to restart your diet or continue.
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => onSelect(true)}
          className="flex-1 py-3 rounded-xl bg-pink-400 text-white font-medium hover:bg-pink-500 transition-colors"
        >
          Yes, restart
        </button>

        <button
          onClick={() => onSelect(false)}
          className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-800 font-medium hover:bg-gray-300 transition-colors"
        >
          No, continue
        </button>
      </div>
    </div>
  )
}
