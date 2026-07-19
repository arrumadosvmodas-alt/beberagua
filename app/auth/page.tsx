'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { Droplet } from 'lucide-react'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [weight, setWeight] = useState('')
  const [age, setAge] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signUp, signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignUp) {
        // Validation
        if (!weight || !age) {
          throw new Error('Por favor, preencha peso e idade')
        }

        const weightNum = parseInt(weight)
        const ageNum = parseInt(age)

        if (isNaN(weightNum) || weightNum < 20 || weightNum > 300) {
          throw new Error('Peso deve estar entre 20 e 300 kg')
        }

        if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
          throw new Error('Idade deve estar entre 1 e 120 anos')
        }

        // Calcular meta: 30ml * peso (kg)
        const goalLiters = (weightNum * 30) / 1000

        console.log('[Auth Page] Starting sign up:', {
          email,
          weight: weightNum,
          age: ageNum,
          goal_liters: goalLiters,
        })

        await signUp(email, password, {
          weight: weightNum,
          age: ageNum,
          goal_liters: goalLiters,
        })

        setError('')
        // Wait a bit before redirecting
        await new Promise(resolve => setTimeout(resolve, 500))
      } else {
        console.log('[Auth Page] Starting sign in:', email)
        await signIn(email, password)
        setError('')
        // Wait a bit before redirecting
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      console.log('[Auth Page] Auth successful, redirecting to dashboard')
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na autenticação'
      console.error('[Auth Page] Auth error:', errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Droplet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Hydra</h1>
          <p className="text-gray-600 text-sm">Rastreie sua hidratação diária</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            {isSignUp ? 'Criar Conta' : 'Fazer Login'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
                required
              />
            </div>

            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="70"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Idade</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      placeholder="30"
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Sua meta: ~{weight && weight ? ((parseInt(weight) * 30) / 1000).toFixed(1) : '2.1'}L/dia
                </p>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-blue-600 font-semibold hover:underline"
              >
                {isSignUp ? 'Faça login' : 'Crie uma'}
              </button>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl mb-2">💧</p>
            <p className="text-xs text-gray-600">Rastreie água</p>
          </div>
          <div>
            <p className="text-2xl mb-2">🔔</p>
            <p className="text-xs text-gray-600">Lembretes</p>
          </div>
          <div>
            <p className="text-2xl mb-2">📊</p>
            <p className="text-xs text-gray-600">Análises</p>
          </div>
        </div>
      </div>
    </div>
  )
}
