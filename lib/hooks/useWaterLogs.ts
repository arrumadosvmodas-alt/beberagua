'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { WaterLog } from '@/lib/types'

export const useWaterLogs = (userId: string | undefined) => {
  const [logs, setLogs] = useState<WaterLog[]>([])
  const [todayTotal, setTodayTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTodayLogs = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]

      const { data, error: fetchError } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('timestamp', `${today}T00:00:00`)
        .lt('timestamp', `${today}T23:59:59`)
        .order('timestamp', { ascending: false })

      if (fetchError) throw fetchError

      setLogs(data as WaterLog[])
      const total = data.reduce((sum, log) => sum + log.amount_ml, 0)
      setTodayTotal(total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching logs')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchTodayLogs()

      // Subscribe to real-time updates
      const subscription = supabase
        .channel(`water_logs:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'water_logs',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetchTodayLogs()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [userId, fetchTodayLogs])

  const addWaterLog = useCallback(
    async (amountMl: number) => {
      if (!userId) return

      try {
        setError(null)
        const now = new Date()
        const hour = now.getHours()
        let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'

        if (hour < 12) timeOfDay = 'morning'
        else if (hour < 17) timeOfDay = 'afternoon'
        else if (hour < 21) timeOfDay = 'evening'
        else timeOfDay = 'night'

        const { data, error: insertError } = await supabase
          .from('water_logs')
          .insert([
            {
              user_id: userId,
              amount_ml: amountMl,
              timestamp: now.toISOString(),
              time_of_day: timeOfDay,
            },
          ])
          .select()

        if (insertError) throw insertError

        setLogs([...(data as WaterLog[]), ...logs])
        setTodayTotal(todayTotal + amountMl)

        return data[0]
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error adding log'
        setError(message)
        throw err
      }
    },
    [userId, logs, todayTotal]
  )

  const deleteWaterLog = useCallback(
    async (logId: string, amountMl: number) => {
      try {
        setError(null)
        const { error: deleteError } = await supabase
          .from('water_logs')
          .delete()
          .eq('id', logId)

        if (deleteError) throw deleteError

        setLogs(logs.filter((log) => log.id !== logId))
        setTodayTotal(Math.max(0, todayTotal - amountMl))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error deleting log'
        setError(message)
        throw err
      }
    },
    [logs, todayTotal]
  )

  return { logs, todayTotal, loading, error, addWaterLog, deleteWaterLog, refetch: fetchTodayLogs }
}
