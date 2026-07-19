'use client'

import { Trash2 } from 'lucide-react'
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
        return '🌅 Manhã'
      case 'afternoon':
        return '☀️ Tarde'
      case 'evening':
        return '🌆 Noite'
      case 'night':
        return '🌙 Madrugada'
      default:
        return '💧 Registro'
    }
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-2">🤷‍♂️</div>
        <p className="text-[#afafaf] text-sm font-bold">Nenhum copo de água registrado hoje.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <span className="text-xs font-bold text-[#afafaf] uppercase tracking-wider">Histórico de Hoje</span>
        <h3 className="text-xl font-extrabold text-[#3c3c3c]">Copos Ingeridos</h3>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex items-center justify-between p-4 bg-white border-2 border-[#e5e5e5] rounded-2xl hover:bg-[#fafafa] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#e8f4fd] rounded-2xl flex items-center justify-center text-xl shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)]">
                💧
              </div>
              <div>
                <p className="font-extrabold text-[#3c3c3c] text-lg leading-tight">{log.amount_ml} ml</p>
                <p className="text-xs font-bold text-[#afafaf] mt-0.5">
                  {getTimeOfDayEmoji(log.time_of_day)} • {formatTime(log.timestamp)}
                </p>
              </div>
            </div>
            <button
              onClick={() => onDelete(log.id, log.amount_ml)}
              className="w-10 h-10 flex items-center justify-center bg-white border-2 border-[#e5e5e5] border-b-4 border-b-[#e5e5e5] rounded-2xl hover:bg-[#ffebef] hover:border-[#ffcdd2] hover:border-b-[#e57373] text-[#afafaf] hover:text-[#ef5350] transition-all active:translate-y-[2px] active:border-b-2"
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
