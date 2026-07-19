'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface ChartDataPoint {
  name: string
  quantidade: number
  meta: number
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [average, setAverage] = useState(0)
  const [bestDay, setBestDay] = useState('N/A')
  const [daysGoalMet, setDaysGoalMet] = useState(0)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth')
    }
  }, [user, authLoading, router])

  const fetchAnalyticsData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      const now = new Date()
      const datesList: { dateString: string; label: string; amount: number }[] = []

      // Create last 7 days list
      for (let i = 6; i >= 0; i--) {
        const d = new Date()
        d.setDate(now.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const weekday = d.toLocaleDateString('pt-BR', { weekday: 'short' })
        datesList.push({
          dateString: dateStr,
          label: weekday.charAt(0).toUpperCase() + weekday.slice(1, 3),
          amount: 0,
        })
      }

      // Fetch logs
      const startDateTime = new Date()
      startDateTime.setDate(now.getDate() - 6)
      startDateTime.setHours(0, 0, 0, 0)

      const { data, error } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('timestamp', startDateTime.toISOString())

      if (error) throw error

      // Populate logs
      if (data) {
        data.forEach((log) => {
          const logDateStr = log.timestamp.split('T')[0]
          const dayIndex = datesList.findIndex((d) => d.dateString === logDateStr)
          if (dayIndex !== -1) {
            datesList[dayIndex].amount += log.amount_ml
          }
        })
      }

      // Process stats
      const goalMl = user.goal_liters * 1000
      let totalAmount = 0
      let maxAmount = 0
      let maxDayLabel = 'N/A'
      let metCounter = 0

      const processedData: ChartDataPoint[] = datesList.map((d) => {
        totalAmount += d.amount
        if (d.amount > maxAmount) {
          maxAmount = d.amount
          maxDayLabel = d.label
        }
        if (d.amount >= goalMl) {
          metCounter++
        }

        return {
          name: d.label,
          quantidade: d.amount,
          meta: goalMl,
        }
      })

      setChartData(processedData)
      setAverage(Math.round(totalAmount / 7))
      setBestDay(maxAmount > 0 ? `${maxDayLabel} (${(maxAmount / 1000).toFixed(1)}L)` : 'N/A')
      setDaysGoalMet(metCounter)
    } catch (err) {
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAnalyticsData()
    }
  }, [user, fetchAnalyticsData])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1899d6] border-b-4 border-b-[#187fb3] rounded-3xl mb-4 animate-bounce text-3xl">
            📊
          </div>
          <p className="text-[#afafaf] font-bold">Gerando análises...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-24">
      {/* Header */}
      <div className="bg-white border-b-2 border-[#e5e5e5] sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-2xl font-extrabold text-[#3c3c3c]">Minhas Estatísticas</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Chart Card */}
        <div className="card-duo space-y-4">
          <div>
            <span className="text-xs font-bold text-[#afafaf] uppercase tracking-wider">Últimos 7 Dias</span>
            <h3 className="text-lg font-extrabold text-[#3c3c3c]">Consumo Diário (ml)</h3>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#afafaf', fontWeight: 'bold', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#afafaf', fontWeight: 'bold', fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(24, 153, 214, 0.05)' }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '2px solid #e5e5e5',
                    borderRadius: '16px',
                    fontWeight: 'bold',
                    color: '#3c3c3c',
                  }}
                />
                <Bar
                  dataKey="quantidade"
                  fill="#1899d6"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={40}
                  // Simulates Duolingo 3D bar effect by injecting customized SVG elements if wanted,
                  // but a simple styled bar with border is great!
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-duo p-5 text-center flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#afafaf] uppercase tracking-wider">Média Diária</span>
              <p className="text-2xl font-extrabold text-[#1899d6] mt-1">{average} ml</p>
            </div>
          </div>
          <div className="card-duo p-5 text-center flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#afafaf] uppercase tracking-wider">Melhor Dia</span>
              <p className="text-2xl font-extrabold text-[#1899d6] mt-1 text-ellipsis overflow-hidden whitespace-nowrap">
                {bestDay}
              </p>
            </div>
          </div>
        </div>

        {/* Long Streak/Met Goal card */}
        <div className="card-duo flex items-center gap-4">
          <div className="w-14 h-14 bg-[#fff4e5] border-2 border-[#ffb74d] rounded-2xl flex items-center justify-center text-3xl shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)]">
            🔥
          </div>
          <div>
            <h4 className="font-extrabold text-[#3c3c3c]">Dias de Meta Atingida</h4>
            <p className="text-sm font-bold text-[#afafaf] mt-0.5">
              Você atingiu sua meta diária em <span className="text-[#58cc02] font-extrabold">{daysGoalMet}</span> dos últimos 7 dias.
            </p>
          </div>
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
            className="flex flex-col items-center gap-1 text-[#1899d6] focus:outline-none"
          >
            <span className="text-2xl">📊</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Gráficos</span>
          </button>
          <button
            onClick={() => router.push('/settings')}
            className="flex flex-col items-center gap-1 text-[#afafaf] hover:text-[#4b4b4b] focus:outline-none"
          >
            <span className="text-2xl opacity-60">⚙️</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#afafaf]">Ajustes</span>
          </button>
        </div>
      </div>
    </div>
  )
}
