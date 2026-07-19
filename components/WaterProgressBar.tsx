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
    <div className="w-full space-y-4">
      <div className="flex justify-between items-end">
        <div>
          <span className="text-xs font-bold text-[#afafaf] uppercase tracking-wider">Meta do Dia</span>
          <h3 className="text-2xl font-extrabold text-[#3c3c3c]">Progresso de Hidratação</h3>
        </div>
        <span className="text-3xl font-extrabold text-[#1899d6] tabular-nums">
          {currentLiters}<span className="text-lg font-bold text-[#afafaf]">/{goalLiters}L</span>
        </span>
      </div>

      {/* Bar container style Duolingo: border, rounded, bg */}
      <div className="relative w-full h-8 bg-[#e5e5e5] rounded-2xl overflow-hidden border-2 border-[#e5e5e5]">
        <div
          className="h-full bg-gradient-to-r from-[#24a5e2] to-[#1899d6] rounded-2xl transition-all duration-500 ease-out flex items-center justify-end pr-3 shadow-[inset_0_-4px_0_rgba(0,0,0,0.15)]"
          style={{ width: `${percentage}%` }}
        >
          {percentage > 12 && (
            <span className="text-white text-sm font-extrabold drop-shadow-sm">{Math.round(percentage)}%</span>
          )}
        </div>
      </div>

      {percentage >= 100 ? (
        <div className="bg-[#d7ffb7] border-2 border-[#84d8ff] rounded-2xl p-4 text-center border-b-4 border-b-[#58a700] text-[#58a700] font-extrabold flex items-center justify-center gap-2 animate-bounce">
          <span>🎉</span> Parabéns! Meta de água atingida! <span>💧</span>
        </div>
      ) : (
        <div className="text-center text-sm font-bold text-[#afafaf]">
          Falta apenas <span className="text-[#1899d6] font-extrabold">{Math.max(0, (goal - current) / 1000).toFixed(1)}L</span> para atingir sua meta!
        </div>
      )}
    </div>
  )
}
