'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useWaterLogs } from '@/lib/hooks/useWaterLogs'
import WaterProgressBar from '@/components/WaterProgressBar'
import WaterQuickAdd from '@/components/WaterQuickAdd'
import WaterHistory from '@/components/WaterHistory'

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { logs, todayTotal, loading: logsLoading, addWaterLog, deleteWaterLog } = useWaterLogs(
    user?.id
  )
  const [addingWater, setAddingWater] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      const timer = setTimeout(() => {
        router.push('/auth')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [user, authLoading, router])

  if (authLoading || logsLoading) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1899d6] border-b-4 border-b-[#187fb3] rounded-3xl mb-4 animate-bounce text-3xl">
            💧
          </div>
          <p className="text-[#afafaf] font-bold">Carregando seus dados...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const goalMl = user.goal_liters * 1000

  const handleAddWater = async (amount: number) => {
    setAddingWater(true)
    try {
      await addWaterLog(amount)
    } finally {
      setAddingWater(false)
    }
  }

  const handleDeleteLog = async (logId: string, amount: number) => {
    try {
      await deleteWaterLog(logId, amount)
    } catch (error) {
      console.error('Error deleting log:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-24">
      {/* Top Header */}
      <div className="bg-white border-b-2 border-[#e5e5e5] sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-[#3c3c3c] tracking-tight">AguaQuero</h1>
            <p className="text-xs font-bold text-[#afafaf] uppercase tracking-wider mt-0.5">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
          <button
            onClick={handleSignOut}
            className="btn-3d-red py-2 px-4 text-xs font-extrabold uppercase"
            title="Sair da Conta"
          >
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Progress Card */}
        <div className="card-duo">
          <WaterProgressBar current={todayTotal} goal={goalMl} />
        </div>

        {/* Quick Add Card */}
        <div className="card-duo">
          <WaterQuickAdd onAdd={handleAddWater} isLoading={addingWater} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card-duo flex flex-col items-center justify-center py-5">
            <span className="text-xs font-bold text-[#afafaf] uppercase tracking-wider mb-1">Da Meta</span>
            <p className="text-3xl font-extrabold text-[#1899d6] leading-none">
              {((todayTotal / goalMl) * 100).toFixed(0)}%
            </p>
          </div>
          <div className="card-duo flex flex-col items-center justify-center py-5">
            <span className="text-xs font-bold text-[#afafaf] uppercase tracking-wider mb-1">Registros</span>
            <p className="text-3xl font-extrabold text-[#1899d6] leading-none">
              {logs.length}
            </p>
          </div>
        </div>

        {/* History Card */}
        <div className="card-duo">
          <WaterHistory logs={logs} onDelete={handleDeleteLog} />
        </div>

        {/* Motivational Message */}
        {todayTotal > 0 && todayTotal < goalMl / 2 && (
          <div className="bg-[#fff4e5] border-2 border-[#ffb74d] rounded-2xl p-4 text-center border-b-4 border-b-[#ffa726] text-[#e65100] font-bold">
            💪 Continue bebendo! Você está no caminho certo. Faltam{' '}
            <strong>{((goalMl - todayTotal) / 1000).toFixed(1)}L</strong>.
          </div>
        )}

        {todayTotal >= goalMl && (
          <div className="bg-[#e8f5e9] border-2 border-[#81c784] rounded-2xl p-4 text-center border-b-4 border-b-[#4caf50] text-[#2e7d32] font-bold animate-pulse">
            ✨ Incrível! Você atingiu e completou sua meta diária! 🥳
          </div>
        )}
      </div>

      {/* Bottom Nav Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-[#e5e5e5] py-3 z-10 shadow-lg">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex flex-col items-center gap-1 text-[#1899d6] focus:outline-none"
          >
            <span className="text-2xl">💧</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider">Painel</span>
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
