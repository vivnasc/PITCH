import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

/**
 * Authentication hook — Supabase Auth with email/password.
 *
 * If Supabase is not configured (no env vars), all auth functions
 * are no-ops and the app works fully offline as before.
 *
 * Supports:
 *   - Email + password sign up/in
 *   - Magic link (passwordless email)
 *   - Session persistence (auto-login on return)
 *   - Sign out
 */
export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const configured = isSupabaseConfigured()

  // Check existing session on mount
  useEffect(() => {
    if (!configured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [configured])

  const signUp = useCallback(async (email, password) => {
    if (!configured) return { error: 'Supabase não configurado' }
    setError(null)
    const { data, error: err } = await supabase.auth.signUp({ email, password })
    if (err) {
      setError(err.message)
      return { error: err.message }
    }
    return { data }
  }, [configured])

  const signIn = useCallback(async (email, password) => {
    if (!configured) return { error: 'Supabase não configurado' }
    setError(null)
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) {
      setError(err.message)
      return { error: err.message }
    }
    return { data }
  }, [configured])

  const signInWithMagicLink = useCallback(async (email) => {
    if (!configured) return { error: 'Supabase não configurado' }
    setError(null)
    const { data, error: err } = await supabase.auth.signInWithOtp({ email })
    if (err) {
      setError(err.message)
      return { error: err.message }
    }
    return { data }
  }, [configured])

  const resetPassword = useCallback(async (email) => {
    if (!configured) return { error: 'Supabase não configurado' }
    setError(null)
    const { data, error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    })
    if (err) {
      setError(err.message)
      return { error: err.message }
    }
    return { data }
  }, [configured])

  const signOut = useCallback(async () => {
    if (!configured) return
    setError(null)
    await supabase.auth.signOut()
    setUser(null)
  }, [configured])

  return {
    user,
    loading,
    error,
    configured,
    signUp,
    signIn,
    signInWithMagicLink,
    resetPassword,
    signOut,
  }
}
