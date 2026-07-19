'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

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

        const goalLiters = (weightNum * 30) / 1000

        await signUp(email, password, {
          weight: weightNum,
          age: ageNum,
          goal_liters: goalLiters,
        })

        setError('')
        await new Promise(resolve => setTimeout(resolve, 500))
      } else {
        await signIn(email, password)
        setError('')
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na autenticação'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#1899d6] border-b-4 border-b-[#187fb3] rounded-3xl mb-4 text-4xl shadow-md animate-bounce">
            💧
          </div>
          <h1 className="text-4xl font-extrabold text-[#3c3c3c] tracking-tight">AguaQuero</h1>
          <p className="text-[#afafaf] font-bold text-sm mt-1">Sua hidratação diária, divertida e simples.</p>
        </div>

        {/* Card */}
        <div className="card-duo">
          <h2 className="text-2xl font-extrabold text-[#3c3c3c] mb-6 text-center">
            {isSignUp ? 'Criar Conta' : 'Fazer Login'}
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-[#ffebef] border-2 border-[#ffcdd2] text-[#ef5350] rounded-2xl text-sm font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#afafaf] uppercase tracking-wider mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-2xl focus:outline-none focus:border-[#1899d6] transition-all bg-[#fafafa] font-bold text-[#3c3c3c]"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#afafaf] uppercase tracking-wider mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-2xl focus:outline-none focus:border-[#1899d6] transition-all bg-[#fafafa] font-bold text-[#3c3c3c]"
                placeholder="••••••••"
                required
              />
            </div>

            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#afafaf] uppercase tracking-wider mb-2">
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-2xl focus:outline-none focus:border-[#1899d6] transition-all bg-[#fafafa] font-bold text-[#3c3c3c]"
                      placeholder="70"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#afafaf] uppercase tracking-wider mb-2">Idade</label>
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-[#e5e5e5] rounded-2xl focus:outline-none focus:border-[#1899d6] transition-all bg-[#fafafa] font-bold text-[#3c3c3c]"
                      placeholder="30"
                      required
                    />
                  </div>
                </div>
                {weight && (
                  <p className="text-xs text-[#afafaf] text-center font-bold">
                    Sua meta diária calculada: <span className="text-[#1899d6] font-extrabold">{((parseInt(weight) * 30) / 1000).toFixed(1)} Litros</span>
                  </p>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-3d-green w-full py-4 text-base font-extrabold uppercase disabled:opacity-50 disabled:pointer-events-none mt-2"
            >
              {loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center border-t-2 border-[#e5e5e5] pt-5">
            <p className="text-[#afafaf] font-bold text-sm">
              {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-[#1899d6] font-extrabold hover:underline"
              >
                {isSignUp ? 'Faça login' : 'Crie uma'}
              </button>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          <div className="card-duo py-3 px-2 flex flex-col items-center justify-center">
            <span className="text-3xl mb-1">💧</span>
            <p className="text-xs font-extrabold text-[#4b4b4b] uppercase tracking-wider">Rastrear</p>
          </div>
          <div className="card-duo py-3 px-2 flex flex-col items-center justify-center">
            <span className="text-3xl mb-1">🔔</span>
            <p className="text-xs font-extrabold text-[#4b4b4b] uppercase tracking-wider">Lembretes</p>
          </div>
          <div className="card-duo py-3 px-2 flex flex-col items-center justify-center">
            <span className="text-3xl mb-1">📊</span>
            <p className="text-xs font-extrabold text-[#4b4b4b] uppercase tracking-wider">Gráficos</p>
          </div>
        </div>
      </div>
    </div>
  )
}
