"use client"

interface AdaptationPeriodQuestionProps {
  onSelect: (wantAdaptation: boolean) => void
}

export default function AdaptationPeriodQuestion({ onSelect }: AdaptationPeriodQuestionProps) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="bg-gray-100 rounded-xl p-4 mb-6">
        <h2 className="text-xl font-bold mb-2">Your diet will restart.</h2>
        <p className="text-sm text-gray-700">
          Auto-immune protocol requires to be followed strictly, thus it will start at the day 1. If you feel like you
          need some time to ease into the diet, please select additionally some time for adaptation.
        </p>
      </div>

      <div className="space-y-3">
        <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
          <input
            type="checkbox"
            className="h-5 w-5 rounded text-pink-400 focus:ring-pink-400"
            onChange={() => onSelect(true)}
          />
          <span className="text-sm font-medium">Yes, I want adaptational period.</span>
        </label>

        <label className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
          <input
            type="checkbox"
            className="h-5 w-5 rounded text-pink-400 focus:ring-pink-400"
            onChange={() => onSelect(false)}
          />
          <span className="text-sm font-medium">No, I don't need adaptational period.</span>
        </label>
      </div>
    </div>
  )
}
