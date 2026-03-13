'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase/client'

export default function Page() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    const loadUser = async () => {

      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user ?? null

      setUser(user)

      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_superadmin')
          .eq('id', user.id)
          .single()

        if (!error) {
          setIsAdmin(data?.is_superadmin ?? false)
        } else {
          console.error(error)
          setIsAdmin(false)
        }
      }
    }

    loadUser()

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
      })

    return () => subscription.unsubscribe()

  }, [])

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: 'select_account' }
      }
    })
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(null)
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2>Login</h2>
        <button onClick={loginWithGoogle}>
          Sign in with Google
        </button>
      </div>
    )
  }

  if (isAdmin === null) {
    return <p style={{ textAlign: 'center' }}>Loading...</p>
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <p>Logged in as: {user.email}</p>

      {isAdmin ? (
        <h1 style={{ color: 'green' }}>YES</h1>
      ) : (
        <h1 style={{ color: 'red' }}>NO</h1>
      )}

      <button onClick={logout}>
        Sign Out
      </button>
    </div>
  )
}