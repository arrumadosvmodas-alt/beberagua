'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface TestResult {
  error?: string
  session?: boolean
  email?: string
  userId?: string
}

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([])
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const router = useRouter()

  const addLog = (msg: string) => {
    console.log(msg)
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  useEffect(() => {
    const testSupabase = async () => {
      addLog('🔍 Iniciando testes de autenticação...')

      try {
        // Test 1: Check connection
        addLog('✓ Testando conexão Supabase...')
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          addLog(`✗ Erro ao obter sessão: ${error.message}`)
          setTestResult({ error: error.message })
          return
        }

        if (data.session) {
          addLog(`✓ Sessão encontrada: ${data.session.user.email}`)
          setTestResult({
            session: true,
            email: data.session.user.email,
            userId: data.session.user.id,
          })
        } else {
          addLog('⚠ Nenhuma sessão ativa')
          setTestResult({ session: false })
        }

        // Test 2: List users table
        addLog('✓ Testando acesso à tabela users...')
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('*')
          .limit(5)

        if (usersError) {
          addLog(`✗ Erro ao listar usuários: ${usersError.message}`)
        } else {
          addLog(`✓ Usuários encontrados: ${users?.length || 0}`)
          if (users) {
            users.forEach((u) => {
              addLog(`  - ${u.email} (peso: ${u.weight}kg, meta: ${u.goal_liters}L)`)
            })
          }
        }
      } catch (err) {
        addLog(`✗ Erro geral: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }

      addLog('✓ Testes concluídos!')
    }

    testSupabase()
  }, [])

  const handleTestSignUp = async () => {
    const testEmail = `test${Date.now()}@example.com`
    const testPassword = 'TestPassword123!'

    addLog(`🔄 Testando sign-up com ${testEmail}...`)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })

      if (error) {
        addLog(`✗ Erro no sign-up: ${error.message}`)
        return
      }

      addLog(`✓ User criado: ${data.user?.id}`)
      addLog(`✓ Email: ${data.user?.email}`)

      // Wait for confirmation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase.from('users').insert([
          {
            id: data.user.id,
            email: testEmail,
            weight: 70,
            age: 30,
            goal_liters: 2.1,
          },
        ])

        if (profileError) {
          addLog(`✗ Erro ao criar profile: ${profileError.message}`)
        } else {
          addLog(`✓ Profile criado com sucesso`)
        }
      }
    } catch (err) {
      addLog(`✗ Erro geral: ${err instanceof Error ? err.message : 'Unknown'}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">🔍 Debug Console</h1>

        <div className="space-y-4">
          <button
            onClick={handleTestSignUp}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
          >
            Test Sign-Up
          </button>

          <button
            onClick={() => router.push('/auth')}
            className="w-full py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg"
          >
            Go to Auth Page
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>

        {testResult && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-bold text-blue-900 mb-2">Resultado do Teste:</h2>
            <pre className="text-sm text-blue-800 overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-6 bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          <div className="font-bold text-green-400 mb-2">Console Logs:</div>
          {logs.map((log, i) => (
            <div key={i} className="text-gray-300">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
