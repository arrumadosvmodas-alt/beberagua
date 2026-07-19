'use client'

import { useState } from 'react'

interface WaterQuickAddProps {
  onAdd: (amount: number) => Promise<void>
  isLoading?: boolean
}

const QUICK_OPTIONS = [
  { label: '🥤 Copo (250ml)', value: 250 },
  { label: '🥛 Garrafa (500ml)', value: 500 },
  { label: '🍶 Garrafa G (750ml)', value: 750 },
  { label: '🧪 Super Garrafa (1L)', value: 1000 },
]

export default function WaterQuickAdd({ onAdd, isLoading = false }: WaterQuickAddProps) {
  const [customAmount, setCustomAmount] = useState('')

  const handleAdd = async (amount: number) => {
    if (amount <= 0) return
    try {
      await onAdd(amount)
      setCustomAmount('')
    } catch (error) {
      console.error('Error adding water:', error)
    }
  }

  const handleCustomAdd = async () => {
    const amount = parseInt(customAmount)
    if (!isNaN(amount) && amount > 0) {
      await handleAdd(amount)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <span className="text-xs font-bold text-[#afafaf] uppercase tracking-wider">Ação Rápida</span>
        <h3 className="text-xl font-extrabold text-[#3c3c3c]">Quanto você bebeu?</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {QUICK_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleAdd(option.value)}
            disabled={isLoading}
            className="btn-3d-blue py-3 px-4 text-sm font-extrabold uppercase disabled:opacity-50 disabled:pointer-events-none"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="pt-2">
        <span className="text-xs font-bold text-[#afafaf] uppercase tracking-wider">Quantidade Personalizada</span>
        <div className="flex gap-3 mt-2">
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Quantidade em ml..."
            className="flex-1 px-4 py-3 border-2 border-[#e5e5e5] rounded-2xl focus:outline-none focus:border-[#1899d6] transition-all bg-[#fafafa] font-bold text-[#3c3c3c]"
          />
          <button
            onClick={handleCustomAdd}
            disabled={isLoading || !customAmount}
            className="btn-3d-green px-6 py-3 text-sm font-extrabold uppercase disabled:opacity-50 disabled:pointer-events-none"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  )
}
