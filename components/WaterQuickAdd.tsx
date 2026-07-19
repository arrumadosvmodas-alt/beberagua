'use client'

import { useState } from 'react'
import { Droplet } from 'lucide-react'

interface WaterQuickAddProps {
  onAdd: (amount: number) => Promise<void>
  isLoading?: boolean
}

const QUICK_OPTIONS = [
  { label: '250ml', value: 250 },
  { label: '500ml', value: 500 },
  { label: '750ml', value: 750 },
  { label: '1L', value: 1000 },
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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Droplet className="w-5 h-5 text-blue-500" />
        Adicionar água
      </h2>

      <div className="grid grid-cols-2 gap-2">
        {QUICK_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleAdd(option.value)}
            disabled={isLoading}
            className="p-3 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-lg font-semibold text-blue-700 transition-colors disabled:opacity-50"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="number"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          placeholder="Digite em ml"
          className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleCustomAdd}
          disabled={isLoading || !customAmount}
          className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
        >
          Adicionar
        </button>
      </div>
    </div>
  )
}
