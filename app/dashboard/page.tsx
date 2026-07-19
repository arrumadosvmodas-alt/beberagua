'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useWaterLogs } from '@/lib/hooks/useWaterLogs'
import WaterProgressBar from '@/components/WaterProgressBar'
import WaterQuickAdd from '@/components/WaterQuickAdd'
import WaterHistory from '@/components/WaterHistory'
import Mascot from '@/components/Mascot'

interface ConfettiItem {
  id: number
  emoji: string
  left: string
  delay: string
  fontSize: string
}

export default function DashboardPage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { logs, todayTotal, loading: logsLoading, addWaterLog, deleteWaterLog } = useWaterLogs(
    user?.id
  )
  const [addingWater, setAddingWater] = useState(false)
  const router = useRouter()

  // Confetti/Animation states
  const [confetti, setConfetti] = useState<ConfettiItem[]>([])
  const [mascotState, setMascotState] = useState<'idle' | 'happy' | 'warning' | 'celebrate'>('idle')
  const mascotTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Alarm states
  const [alarms, setAlarms] = useState<string[]>([])
  const [alarmsEnabled, setAlarmsEnabled] = useState(true)
  const [triggeredAlarms, setTriggeredAlarms] = useState<Record<string, boolean>>({}) // track which alarms triggered today
  const [ringingAlarm, setRingingAlarm] = useState<string | null>(null)
  
  // Loops & timers
  const soundIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastMinuteRef = useRef<string>('')
  
  // 60 seconds check states
  const [active60sTimer, setActive60sTimer] = useState<boolean>(false)
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0)
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false)
  const timer60sIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const preTimerTotalRef = useRef<number>(0)

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      const timer = setTimeout(() => {
        router.push('/auth')
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [user, authLoading, router])

  // Load alarms from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aguaquero_reminders')
      const enabled = localStorage.getItem('aguaquero_reminders_enabled')
      if (saved) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAlarms(JSON.parse(saved))
      }
      if (enabled !== null) {
        setAlarmsEnabled(enabled === 'true')
      }
    }
  }, [])

  // Procedural notification sound
  const playNotificationSound = useCallback(() => {
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
  }, [])

  // Procedural warning sound (two low tones)
  const playWarningSound = useCallback(() => {
    if (typeof window === 'undefined') return
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.connect(gain)
        gain.connect(audioCtx.destination)
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, start)
        gain.gain.setValueAtTime(0.2, start)
        gain.gain.exponentialRampToValueAtTime(0.001, start + duration)
        osc.start(start)
        osc.stop(start + duration)
      }

      const now = audioCtx.currentTime
      playTone(250, now, 0.25)
      playTone(200, now + 0.3, 0.4)
    } catch (e) {
      console.error('AudioContext failed:', e)
    }
  }, [])

  // Alarm clock checker (runs every second)
  useEffect(() => {
    if (!alarmsEnabled || alarms.length === 0 || ringingAlarm) return

    const checkTime = setInterval(() => {
      const now = new Date()
      const currentHourMin = now.toTimeString().slice(0, 5) // "HH:MM"
      
      // Reset triggered alarms list at midnight
      if (currentHourMin === '00:00') {
        setTriggeredAlarms({})
      }

      if (alarms.includes(currentHourMin) && !triggeredAlarms[currentHourMin] && lastMinuteRef.current !== currentHourMin) {
        lastMinuteRef.current = currentHourMin
        setTriggeredAlarms(prev => ({ ...prev, [currentHourMin]: true }))
        setRingingAlarm(currentHourMin)
        setMascotState('warning')
        
        // Trigger browser notification
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('AguaQuero ⏰', {
            body: 'Está na hora de beber água! Clique para registrar.',
            icon: '/icon-192.png',
            tag: 'water-reminder-alarm'
          })
        }
      }
    }, 1000)

    return () => clearInterval(checkTime)
  }, [alarms, alarmsEnabled, triggeredAlarms, ringingAlarm])

  // Sound loop for ringing alarm
  useEffect(() => {
    if (ringingAlarm) {
      playNotificationSound()
      soundIntervalRef.current = setInterval(() => {
        playNotificationSound()
      }, 1500)
    } else {
      if (soundIntervalRef.current) {
        clearInterval(soundIntervalRef.current)
        soundIntervalRef.current = null
      }
    }

    return () => {
      if (soundIntervalRef.current) clearInterval(soundIntervalRef.current)
    }
  }, [ringingAlarm, playNotificationSound])

  // Helper to trigger confetti
  const triggerConfetti = useCallback((count: number) => {
    const emojis = ['🎉', '👏', '💧', '🥳', '👍', '🥤', '✨', '🎈']
    const newConfetti: ConfettiItem[] = []
    const now = Date.now()

    for (let i = 0; i < count; i++) {
      newConfetti.push({
        id: now + i,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        left: `${Math.random() * 100}vw`,
        delay: `${Math.random() * 1.5}s`,
        fontSize: `${20 + Math.random() * 25}px`,
      })
    }

    setConfetti(newConfetti)
    
    // Clear confetti elements after animation finishes
    setTimeout(() => {
      setConfetti([])
    }, 5000)
  }, [])

  // Mascot state changer helper
  const setTemporaryMascotState = useCallback((state: 'idle' | 'happy' | 'warning' | 'celebrate', duration = 3000) => {
    if (mascotTimerRef.current) clearTimeout(mascotTimerRef.current)
    setMascotState(state)
    
    // Hold celebrate if goal is met
    if (state === 'celebrate') return

    mascotTimerRef.current = setTimeout(() => {
      setMascotState('idle')
    }, duration)
  }, [])

  // Monitor goal completion state on load/update
  useEffect(() => {
    if (user && todayTotal >= user.goal_liters * 1000 && todayTotal > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMascotState('celebrate')
    } else {
      setMascotState('idle')
    }
  }, [todayTotal, user])

  // Alarm Dismiss & Start 60s validation
  const handleDismissAlarm = () => {
    setRingingAlarm(null)
    setTemporaryMascotState('idle', 100)
    
    // Save current water intake level to check for increase
    preTimerTotalRef.current = todayTotal

    // Start 60 seconds countdown
    setActive60sTimer(true)
    setSecondsRemaining(60)

    if (timer60sIntervalRef.current) clearInterval(timer60sIntervalRef.current)
    
    timer60sIntervalRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Time expired! Check if water was added
          clearInterval(timer60sIntervalRef.current!)
          timer60sIntervalRef.current = null
          setActive60sTimer(false)
          
          // Trigger warning if no water added
          setShowWarningModal(true)
          setMascotState('warning')
          playWarningSound()
          
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Handle water additions (confetti + mascot reactions)
  const handleAddWater = async (amount: number) => {
    setAddingWater(true)
    try {
      const addedLog = await addWaterLog(amount)
      
      if (addedLog) {
        // If 60s timer is active, cancel it on water increase
        if (active60sTimer) {
          if (timer60sIntervalRef.current) {
            clearInterval(timer60sIntervalRef.current)
            timer60sIntervalRef.current = null
          }
          setActive60sTimer(false)
        }

        // Close warning if they add water
        if (showWarningModal) {
          setShowWarningModal(false)
        }

        const newTotal = todayTotal + amount
        const goalMl = user!.goal_liters * 1000

        if (newTotal >= goalMl) {
          // Met Goal celebration!
          triggerConfetti(80)
          setMascotState('celebrate')
        } else {
          // Normal add water celebration!
          triggerConfetti(35)
          setTemporaryMascotState('happy', 3500)
        }
      }
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

  return (
    <div className="min-h-screen bg-[#f7f7f7] pb-24 relative overflow-x-hidden">
      
      {/* Floating Confetti Elements */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="animate-confetti-particle"
          style={{
            left: c.left,
            animationDelay: c.delay,
            fontSize: c.fontSize,
          }}
        >
          {c.emoji}
        </div>
      ))}

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
          >
            Sair
          </button>
        </div>
      </div>

      {/* Mascot & Status Card */}
      <div className="max-w-md mx-auto px-4 pt-6">
        <div className="card-duo flex items-center justify-between overflow-hidden relative min-h-[140px] bg-gradient-to-r from-white to-[#f4faff]">
          <div className="flex-1 space-y-2 z-1">
            <span className="text-[10px] font-extrabold text-[#1899d6] uppercase tracking-wider">Seu Mascote</span>
            {mascotState === 'idle' && (
              <>
                <h4 className="text-lg font-extrabold text-[#3c3c3c]">Olá! Estou pronto!</h4>
                <p className="text-xs text-[#afafaf] font-bold">Me alimente com copos d&apos;água ao longo do dia.</p>
              </>
            )}
            {mascotState === 'happy' && (
              <>
                <h4 className="text-lg font-extrabold text-[#58cc02] animate-bounce">Muito bem! 👍</h4>
                <p className="text-xs text-[#4b4b4b] font-bold">Que gole refrescante! Continue assim.</p>
              </>
            )}
            {mascotState === 'warning' && (
              <>
                <h4 className="text-lg font-extrabold text-[#ff4b4b] animate-pulse">Ei! Precisa de água! ⏰</h4>
                <p className="text-xs text-[#ff4b4b]/80 font-bold">Lembre-se de registrar sua hidratação!</p>
              </>
            )}
            {mascotState === 'celebrate' && (
              <>
                <h4 className="text-lg font-extrabold text-[#58cc02] animate-bounce">FESTA DA ÁGUA! 🎉</h4>
                <p className="text-xs text-[#2e7d32] font-bold">Meta concluída! Você é sensacional!</p>
              </>
            )}
          </div>
          <div className="ml-4 flex-shrink-0">
            <Mascot state={mascotState} size={110} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        
        {/* Active 60s Warning Banner */}
        {active60sTimer && (
          <div className="bg-[#fff3e0] border-2 border-[#ffe0b2] border-b-4 border-b-[#ffb74d] rounded-2xl p-4 text-center text-[#e65100] font-bold animate-pulse text-sm">
            ⌛ Alarme desligado. Aguardando registro de água em{' '}
            <span className="text-lg font-extrabold">{secondsRemaining}s</span>...
          </div>
        )}

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
      </div>

      {/* Loop Ringing Alarm Modal */}
      {ringingAlarm && (
        <div className="fixed inset-0 bg-[#3c3c3c]/85 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border-4 border-[#1899d6] rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl relative border-b-8 border-b-[#187fb3] animate-bounce">
            <div className="flex justify-center">
              <Mascot state="warning" size={130} />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-[#1899d6] uppercase tracking-wider animate-pulse">Alarme Ativo • {ringingAlarm}</span>
              <h2 className="text-2xl font-extrabold text-[#3c3c3c]">HORA DA ÁGUA! ⏰</h2>
              <p className="text-sm font-bold text-[#afafaf]">Seu alarme está tocando. Beba água para sua saúde!</p>
            </div>
            <button
              onClick={handleDismissAlarm}
              className="btn-3d-green w-full py-4 text-base font-extrabold uppercase"
            >
              Desligar Alarme
            </button>
          </div>
        </div>
      )}

      {/* 60s Warning Expiration Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 bg-[#3c3c3c]/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border-4 border-[#ff4b4b] rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl border-b-8 border-b-[#ea2b2b]">
            <div className="flex justify-center">
              <Mascot state="warning" size={120} />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-extrabold text-[#ff4b4b] uppercase tracking-wider">Aviso Importante</span>
              <h2 className="text-2xl font-extrabold text-[#3c3c3c]">Você Não Bebeu Água!</h2>
              <p className="text-sm font-bold text-[#afafaf]">
                Já se passaram 60 segundos desde o alarme e você não registrou consumo. Por favor, mantenha-se hidratado!
              </p>
            </div>
            <button
              onClick={() => {
                setShowWarningModal(false)
                setMascotState('idle')
              }}
              className="btn-3d-red w-full py-3 text-sm font-extrabold uppercase"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

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
