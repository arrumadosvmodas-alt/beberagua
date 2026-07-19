'use client'

interface WaterProgressBarProps {
  current: number
  goal: number
}

export default function WaterProgressBar({
  current,
  goal,
}: WaterProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100)
  const currentLiters = (current / 1000).toFixed(1)
  const goalLiters = (goal / 1000).toFixed(1)

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-baseline">
        <span className="text-sm font-medium text-gray-600">Progresso diário</span>
        <span className="text-2xl font-bold text-blue-600">
          {currentLiters}L
        </span>
      </div>

      <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-3"
          style={{ width: `${percentage}%` }}
        >
          {percentage > 10 && (
            <span className="text-white text-xs font-bold">{Math.round(percentage)}%</span>
          )}
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>0 L</span>
        <span>Meta: {goalLiters}L</span>
      </div>

      {percentage >= 100 && (
        <div className="text-center">
          <p className="text-green-600 font-semibold text-sm">🎉 Parabéns! Meta atingida!</p>
        </div>
      )}
    </div>
  )
}
