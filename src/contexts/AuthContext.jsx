import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Buatkan baris profil bila belum ada (kasus: insert saat signup
  // gagal karena belum ada sesi saat konfirmasi email aktif).
  // Dipanggil saat sesi valid sehingga policy insert_own (auth.uid()) lolos.
  async function ensureProfile(userId, fallbackName = '') {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) return data
    const { data: created, error } = await supabase.from('profiles')
      .insert({ id: userId, name: fallbackName || 'Anggota', role: 'member' })
      .select().single()
    if (error) {
      // Balapan dua pemanggilan: baca ulang bila baris sudah ada (23505)
      if (error.code === '23505') {
        const { data: retry } = await supabase.from('profiles').select('*').eq('id', userId).single()
        if (retry) return retry
      }
      throw error
    }
    return created
  }

  async function loadProfile(userId) {
    if (!userId) return setProfile(null)
    try {
      setProfile(await ensureProfile(userId))
    } catch {
      setProfile(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      loadProfile(data.session?.user?.id).finally(() => setLoading(false))
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null)
      loadProfile(session?.user?.id)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  async function signUp({ email, password, name }) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    // Jika ada sesi langsung (konfirmasi email nonaktif), buat profil sekarang.
    // Jika tidak ada sesi, profil dibuat otomatis oleh ensureProfile saat login pertama.
    if (data.user && data.session) {
      await ensureProfile(data.user.id, name)
    }
  }

  async function signIn({ email, password }) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthCtx.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthCtx.Provider>
  )
}
