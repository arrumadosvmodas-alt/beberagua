'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { ArrowLeft, Bell, Target } from 'lucide-react'
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

      // Show success message
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

      // Get existing reminder if any
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

      alert('Lembretes salvos com sucesso!')
    } catch {
      alert('Erro ao salvar lembretes')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Configurações</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Goal Setting */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Meta Diária</h2>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Meta de água (litros)</label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="10"
                value={goalLiters}
                onChange={(e) => setGoalLiters(parseFloat(e.target.value))}
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <span className="text-xl text-gray-500">L</span>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Calculado: {(user.weight * 30) / 1000} L/dia (peso × 30ml)
          </p>

          <button
            onClick={handleSaveGoal}
            disabled={saving}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Meta'}
          </button>
        </div>

        {/* Reminder Settings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Lembretes</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Ativar notificações</label>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {notificationsEnabled && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Horário para começar lembretes
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          <button
            onClick={handleSaveReminders}
            disabled={saving}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? 'Salvando...' : 'Salvar Lembretes'}
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2">💡 Dica</p>
          <p>Lembretes diários ajudam você a manter-se hidratado. Configure o horário que mais funciona para você!</p>
        </div>
      </div>
    </div>
  )
}
