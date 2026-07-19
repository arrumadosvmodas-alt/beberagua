'use client'

import { Trash2, Clock } from 'lucide-react'
import type { WaterLog } from '@/lib/types'

interface WaterHistoryProps {
  logs: WaterLog[]
  onDelete: (logId: string, amount: number) => Promise<void>
}

export default function WaterHistory({ logs, onDelete }: WaterHistoryProps) {
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getTimeOfDayEmoji = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning':
        return '🌅'
      case 'afternoon':
        return '☀️'
      case 'evening':
        return '🌆'
      case 'night':
        return '🌙'
      default:
        return '💧'
    }
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">Nenhum registro de água hoje</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-600 flex items-center gap-2">
        <Clock className="w-4 h-4" />
        Histórico de hoje
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl">{getTimeOfDayEmoji(log.time_of_day)}</span>
              <div>
                <p className="font-semibold text-gray-800">{log.amount_ml}ml</p>
                <p className="text-xs text-gray-500">{formatTime(log.timestamp)}</p>
              </div>
            </div>
            <button
              onClick={() => onDelete(log.id, log.amount_ml)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
              title="Deletar registro"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
