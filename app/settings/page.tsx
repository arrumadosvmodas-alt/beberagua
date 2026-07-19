'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Trash2, Plus } from 'lucide-react'

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [goalLiters, setGoalLiters] = useState(0)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [newAlarmTime, setNewAlarmTime] = useState('08:00')
  const [reminders, setReminders] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  // Load reminders from localStorage on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedReminders = localStorage.getItem('aguaquero_reminders')
      const savedEnabled = localStorage.getItem('aguaquero_reminders_enabled')
      
      if (savedReminders) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setReminders(JSON.parse(savedReminders))
      } else {
        // Defaults
        const defaultList = ['09:00', '12:00', '15:00', '18:00', '21:00']
        setReminders(defaultList)
        localStorage.setItem('aguaquero_reminders', JSON.stringify(defaultList))
      }

      if (savedEnabled !== null) {
        setNotificationsEnabled(savedEnabled === 'true')
      } else {
        localStorage.setItem('aguaquero_reminders_enabled', 'true')
      }
    }
  }, [])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGoalLiters(user.goal_liters)
    }
  }, [user])

  const handleSaveGoal = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase
        .from('users')
        .update({ goal_liters: goalLiters })
        .eq('id', user.id)

      if (error) throw error
      alert('Meta salva com sucesso!')
    } catch {
      alert('Erro ao salvar meta')
    } finally {
      setSaving(false)
    }
  }

  const handleToggleNotifications = () => {
    const newVal = !notificationsEnabled
    setNotificationsEnabled(newVal)
    localStorage.setItem('aguaquero_reminders_enabled', String(newVal))
    
    // Request permission if enabling
    if (newVal && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted') {
        Notification.requestPermission()
      }
    }
  }

  const handleAddAlarm = () => {
    if (reminders.includes(newAlarmTime)) {
      alert('Este horário já está adicionado!')
      return
    }

    const updated = [...reminders, newAlarmTime].sort()
    setReminders(updated)
    localStorage.setItem('aguaquero_reminders', JSON.stringify(updated))
  }

  const handleRemoveAlarm = (time: string) => {
    const updated = reminders.filter((t) => t !== time)
    setReminders(updated)
    localStorage.setItem('aguaquero_reminders', JSON.stringify(updated))
  }

  const playNotificationSound = () => {
    if (typeof window === 'undefined') return
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()

      osc.connect(gain)
      gain.connect(audioCtx.destination)

      osc.type = 'sine'
      const now = audioCtx.currentTime

      // Som de gota d'água: variação rápida de frequência
      osc.frequency.setValueAtTime(450, now)
      osc.frequency.exponentialRampToValueAtTime(1300, now + 0.15)

      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.4, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

      osc.start(now)
      osc.stop(now + 0.35)
    } catch (e) {
      console.error('AudioContext failed:', e)
    }
  }

  const handleTestReminder = () => {
    // Play the water drop sound
    playNotificationSound()

    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('AguaQuero 💧', {
          body: 'Lembrete funcionando! Beba um copo de água agora para se manter saudável.',
          icon: '/icon-192.png',
        })
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('AguaQuero 💧', {
              body: 'Permissão concedida! Lembrete funcionando com sucesso.',
              icon: '/icon-192.png',
            })
          } else {
            alert('Você precisa permitir notificações no navegador.')
          }
        })
      } else {
        alert('Permissão de notificações bloqueada no seu navegador. Ative nas permissões do site para receber alertas.')
      }
    } else {
      alert('Seu navegador não suporta notificações de desktop.')
    }
  }

  if (authLoading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-24">
      {/* Header */}
      <div className="bg-white border-b-2 border-[#e5e5e5] sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center">
          <h1 className="text-2xl font-extrabold text-[#3c3c3c]">Configurações</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Goal Setting */}
        <div className="card-duo space-y-4">
          <div>
            <span className="text-xs font-bold text-[#afafaf] uppercase tracking-wider">Meta Diária</span>
            <h3 className="text-lg font-extrabold text-[#3c3c3c]">Meta Diária de Hidratação</h3>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#afafaf] uppercase tracking-wider">Quantidade (litros)</label>
            <div className="flex gap-3">
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="10"
                value={goalLiters}
                onChange={(e) => setGoalLiters(parseFloat(e.target.value))}
                className="flex-1 px-4 py-3 border-2 border-[#e5e5e5] rounded-2xl focus:outline-none focus:border-[#1899d6] transition-all bg-[#fafafa] font-bold text-[#3c3c3c]"
              />
              <span className="text-xl font-extrabold text-[#3c3c3c] flex items-center">L</span>
            </div>
          </div>

          <p className="text-xs text-[#afafaf] font-bold">
            Meta sugerida (peso × 30ml): {((user.weight * 30) / 1000).toFixed(1)} Litros/dia.
          </p>

          <button
            onClick={handleSaveGoal}
            disabled={saving}
            className="btn-3d-green w-full py-3 text-sm font-extrabold uppercase disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Meta'}
          </button>
        </div>

        {/* Reminders List Settings */}
        <div className="card-duo space-y-4">
          <div>
            <span className="text-xs font-bold text-[#afafaf] uppercase tracking-wider">Lembretes Múltiplos</span>
            <h3 className="text-lg font-extrabold text-[#3c3c3c]">Configurar Horários de Alerta</h3>
          </div>

          <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-4">
            <label className="text-sm font-bold text-[#4b4b4b]">Ativar Notificações do Navegador</label>
            <button
              onClick={handleToggleNotifications}
              className={`relative w-14 h-8 rounded-full transition-colors focus:outline-none border-2 border-transparent ${
                notificationsEnabled ? 'bg-[#58cc02] border-[#58a700]' : 'bg-[#e5e5e5] border-[#ccc]'
              }`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                  notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {notificationsEnabled && (
            <div className="space-y-4">
              {/* Add New Alarm */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#afafaf] uppercase tracking-wider">
                  Adicionar Novo Horário:
                </label>
                <div className="flex gap-3">
                  <input
                    type="time"
                    value={newAlarmTime}
                    onChange={(e) => setNewAlarmTime(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-[#e5e5e5] rounded-2xl focus:outline-none focus:border-[#1899d6] transition-all bg-[#fafafa] font-bold text-[#3c3c3c]"
                  />
                  <button
                    onClick={handleAddAlarm}
                    className="btn-3d-blue flex items-center justify-center px-4"
                  >
                    <Plus className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Alarms List */}
              <div className="space-y-2 pt-2">
                <span className="block text-xs font-bold text-[#afafaf] uppercase tracking-wider">
                  Horários Programados:
                </span>
                {reminders.length === 0 ? (
                  <p className="text-sm text-[#afafaf] font-bold py-2">Nenhum alarme configurado.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {reminders.map((time) => (
                      <div
                        key={time}
                        className="flex items-center justify-between p-3 border-2 border-[#e5e5e5] rounded-2xl bg-white"
                      >
                        <span className="font-extrabold text-[#3c3c3c] text-lg">⏰ {time}</span>
                        <button
                          onClick={() => handleRemoveAlarm(time)}
                          className="w-8 h-8 flex items-center justify-center bg-white border-2 border-[#e5e5e5] border-b-4 border-b-[#e5e5e5] rounded-xl hover:bg-[#ffebef] hover:border-[#ffcdd2] hover:border-b-[#e57373] text-[#afafaf] hover:text-[#ef5350] transition-all active:translate-y-[2px] active:border-b-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Test Notification Widget */}
        <div className="card-duo space-y-4 border-[#1899d6]/30 bg-[#e8f4fd]/30">
          <div>
            <span className="text-xs font-bold text-[#1899d6] uppercase tracking-wider">Testador de Alerta</span>
            <h3 className="text-lg font-extrabold text-[#3c3c3c]">Testar Alerta Imediato</h3>
            <p className="text-xs text-gray-500 mt-1">Clique abaixo para disparar um alarme de teste e ouvir o som de gota d&apos;água no seu dispositivo.</p>
          </div>

          <button
            onClick={handleTestReminder}
            className="btn-3d-blue w-full py-3 text-sm font-extrabold uppercase"
          >
            Testar Alerta Agora
          </button>
        </div>
      </div>

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#e5e5e5] py-3 z-10 shadow-lg">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex flex-col items-center gap-1 text-[#afafaf] hover:text-[#4b4b4b] focus:outline-none"
          >
            <span className="text-2xl opacity-60">💧</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#afafaf]">Painel</span>
          </button>
          <button
            onClick={() => router.push('/analytics')}
            className="flex flex-col items-center gap-1 text-[#afafaf] hover:text-[#4b4b4b] focus:outline-none"
          >
            <span className="text-2xl opacity-60">📊</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#afafaf]">Gráficos</span>
          </button>
          <button
            onClick={() => router.push('/settings')}
            className="flex flex-col items-center gap-1 text-[#1899d6] focus:outline-none"
          >
            <span className="text-2xl">⚙️</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Ajustes</span>
          </button>
        </div>
      </div>
    </div>
  )
}
