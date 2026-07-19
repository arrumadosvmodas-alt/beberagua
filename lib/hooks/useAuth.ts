'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/lib/types'

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const createUserProfile = async (userId: string, email: string, profile: Partial<User>) => {
  // Retry logic for profile creation
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { error } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            email,
            weight: profile.weight || 70,
            age: profile.age || 30,
            goal_liters: profile.goal_liters || 2.1,
          },
        ])
        .select()
        .single()

      if (!error) {
        return true
      }

      // If it's an RLS error, retry
      if (error?.code === '42501' && attempt < 3) {
        await delay(500 * attempt)
        continue
      }

      throw error
    } catch (err) {
      if (attempt === 3) throw err
      await delay(500 * attempt)
    }
  }
  return false
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const authCheckRef = useRef(false)

  useEffect(() => {
    if (authCheckRef.current) return
    authCheckRef.current = true

    const initAuth = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('[Auth] Session error:', sessionError)
          setUser(null)
          return
        }

        if (session?.user) {
          console.log('[Auth] Session found for:', session.user.email)

          // Fetch user profile with retry
          let profileData = null
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              const { data } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single()

              if (data) {
                profileData = data
                break
              }
            } catch (err) {
              if (attempt === 3) throw err
              await delay(300 * attempt)
            }
          }

          if (profileData) {
            setUser(profileData as User)
            console.log('[Auth] Profile loaded:', profileData.email)
          } else {
            console.warn('[Auth] No profile found for user:', session.user.id)
            setUser(null)
          }
        } else {
          console.log('[Auth] No session found')
          setUser(null)
        }
      } catch (err) {
        console.error('[Auth] Init error:', err)
        setError(err instanceof Error ? err.message : 'Authentication error')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[Auth] State change:', event)

        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const { data } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single()

            if (data) {
              setUser(data as User)
              setError(null)
              console.log('[Auth] Signed in:', data.email)
            }
          } catch (err) {
            console.error('[Auth] Error fetching profile on sign in:', err)
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setError(null)
          console.log('[Auth] Signed out')
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string, profile: Partial<User>) => {
    try {
      setError(null)
      setLoading(true)

      console.log('[Auth] Starting sign up for:', email)

      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      // Create auth account
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
      })

      if (signUpError) {
        console.error('[Auth] Sign up error:', signUpError)
        throw signUpError
      }

      if (!data.user?.id) {
        throw new Error('Failed to create user')
      }

      console.log('[Auth] User created:', data.user.id)

      // Wait for auth to be ready
      await delay(1000)

      // Create profile with retry logic
      const profileCreated = await createUserProfile(
        data.user.id,
        email.toLowerCase().trim(),
        profile
      )

      if (!profileCreated) {
        throw new Error('Failed to create user profile')
      }

      console.log('[Auth] Profile created successfully')

      // Set user state
      setUser({
        id: data.user.id,
        email: email.toLowerCase().trim(),
        weight: profile.weight || 70,
        age: profile.age || 30,
        goal_liters: profile.goal_liters || 2.1,
        created_at: new Date().toISOString(),
      } as User)

      return data.user
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed'
      console.error('[Auth] Sign up failed:', message)
      setError(message)
      setUser(null)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)

      console.log('[Auth] Starting sign in for:', email)

      // Validate input
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      })

      if (error) {
        console.error('[Auth] Sign in error:', error)
        throw new Error(error.message || 'Invalid email or password')
      }

      if (!data.user?.id) {
        throw new Error('Sign in failed - no user returned')
      }

      console.log('[Auth] Signed in:', data.user.id)

      // Wait for session to be established
      await delay(1000)

      // Fetch profile
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const { data: profileData } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single()

          if (profileData) {
            setUser(profileData as User)
            setError(null)
            console.log('[Auth] Profile loaded on sign in:', profileData.email)
            return
          }
        } catch (err) {
          if (attempt === 3) throw err
          await delay(300 * attempt)
        }
      }

      throw new Error('Failed to load user profile')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed'
      console.error('[Auth] Sign in failed:', message)
      setError(message)
      setUser(null)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)

      console.log('[Auth] Signing out...')

      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('[Auth] Sign out error:', error)
        throw error
      }

      setUser(null)
      console.log('[Auth] Signed out successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign out failed'
      console.error('[Auth] Sign out failed:', message)
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return { user, loading, error, signUp, signIn, signOut }
}
