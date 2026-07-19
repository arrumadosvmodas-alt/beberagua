'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useWaterLogs } from '@/lib/hooks/useWaterLogs'
import WaterProgressBar from '@/components/WaterProgressBar'
import WaterQuickAdd from '@/components/WaterQuickAdd'
import WaterHistory from '@/components/WaterHistory'
import { LogOut, Settings } from 'lucide-react'

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { logs, todayTotal, loading: logsLoading, addWaterLog, deleteWaterLog } = useWaterLogs(
    user?.id
  )
  const [addingWater, setAddingWater] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      // Add a small delay before redirecting to avoid flashing
      const timer = setTimeout(() => {
        router.push('/auth')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [user, authLoading, router])

  if (authLoading || logsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4 animate-pulse">
            <span className="text-white text-xl">💧</span>
          </div>
          <p className="text-gray-600">Carregando...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Hydra</h1>
            <p className="text-xs text-gray-500">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/settings')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Configurações"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleSignOut}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-red-600"
              title="Sair"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Progress Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <WaterProgressBar current={todayTotal} goal={goalMl} />
        </div>

        {/* Quick Add Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <WaterQuickAdd onAdd={handleAddWater} isLoading={addingWater} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-blue-600">
              {((todayTotal / goalMl) * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">Da meta</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-blue-600">{logs.length}</p>
            <p className="text-xs text-gray-500 mt-1">Copos bebidos</p>
          </div>
        </div>

        {/* History Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <WaterHistory logs={logs} onDelete={handleDeleteLog} />
        </div>

        {/* Motivational Message */}
        {todayTotal > 0 && todayTotal < goalMl / 2 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 text-center">
            <p className="text-sm text-yellow-800">
              💪 Continue! Você está no caminho certo. Faltam{' '}
              <strong>{((goalMl - todayTotal) / 1000).toFixed(1)}L</strong>
            </p>
          </div>
        )}

        {todayTotal >= goalMl && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
            <p className="text-sm text-green-800">✨ Incrível! Você atingiu sua meta diária!</p>
          </div>
        )}
      </div>
    </div>
  )
}
