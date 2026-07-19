'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [goalLiters, setGoalLiters] = useState(0)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [reminderTime, setReminderTime] = useState('08:00')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  const fetchReminderSettings = useCallback(async () => {
    if (!user) return

    try {
      const { data } = await supabase
        .from('reminder_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setNotificationsEnabled(data.enabled)
        setReminderTime(data.start_time?.slice(0, 5) || '08:00')
      }
    } catch {
      console.log('No reminder settings found')
    }
  }, [user])

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGoalLiters(user.goal_liters)
      fetchReminderSettings()
    }
  }, [user, fetchReminderSettings])

  const handleSaveGoal = async () => {
    if (!user) return

    setSaving(true)
    try {
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

  const handleSaveReminders = async () => {
    if (!user) return

    setSaving(true)
    try {
      const endTime = `${String(parseInt(reminderTime.split(':')[0]) + 20).padStart(2, '0')}:00`
      let reminderId = null

      const { data: existing } = await supabase
        .from('reminder_settings')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existing?.id) {
        reminderId = existing.id
        await supabase
          .from('reminder_settings')
          .update({
            enabled: notificationsEnabled,
            start_time: `${reminderTime}:00`,
            end_time: `${endTime}:00`,
            interval_minutes: 60,
          })
          .eq('id', reminderId)
      } else {
        await supabase.from('reminder_settings').insert([
          {
            user_id: user.id,
            enabled: notificationsEnabled,
            start_time: `${reminderTime}:00`,
            end_time: `${endTime}:00`,
            interval_minutes: 60,
          },
        ])
      }

      // Request browser notification permission if turning on
      if (notificationsEnabled && typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission !== 'granted') {
          await Notification.requestPermission()
        }
      }

      alert('Lembretes salvos com sucesso!')
    } catch {
      alert('Erro ao salvar lembretes')
    } finally {
      setSaving(false)
    }
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

        {/* Reminder Settings */}
        <div className="card-duo space-y-4">
          <div>
            <span className="text-xs font-bold text-[#afafaf] uppercase tracking-wider">Lembretes</span>
            <h3 className="text-lg font-extrabold text-[#3c3c3c]">Configurar Alertas</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-[#4b4b4b]">Ativar Notificações do Navegador</label>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
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
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#afafaf] uppercase tracking-wider">
                  Começar Lembretes às:
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-2xl focus:outline-none focus:border-[#1899d6] transition-all bg-[#fafafa] font-bold text-[#3c3c3c]"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleSaveReminders}
            disabled={saving}
            className="btn-3d-green w-full py-3 text-sm font-extrabold uppercase disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Lembretes'}
          </button>
        </div>

        {/* Test Notification Widget */}
        <div className="card-duo space-y-4 border-[#1899d6]/30 bg-[#e8f4fd]/30">
          <div>
            <span className="text-xs font-bold text-[#1899d6] uppercase tracking-wider">Testador de Alerta</span>
            <h3 className="text-lg font-extrabold text-[#3c3c3c]">Testar Alerta Imediato</h3>
            <p className="text-xs text-gray-500 mt-1">Clique abaixo para disparar um lembrete pop-up de teste e ver como o alerta do AguaQuero funciona no seu dispositivo.</p>
          </div>

          <button
            onClick={handleTestReminder}
            className="btn-3d-blue w-full py-3 text-sm font-extrabold uppercase"
          >
            Testar Alerta Agora
          </button>
        </div>

        {/* Info */}
        <div className="bg-[#e8f4fd] border-2 border-[#84d8ff] border-b-4 border-b-[#187fb3] rounded-2xl p-4 text-sm text-[#187fb3] font-bold">
          💡 Dica: Notificações locais funcionam melhor no navegador quando mantido aberto. Certifique-se de autorizar o envio de notificações no seu dispositivo.
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
