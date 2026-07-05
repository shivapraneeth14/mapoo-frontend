import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setTokenState] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const wasAuthed = useRef(false)

  useEffect(() => {
    api.get('/users/me').then(res => {
      setUser(res.data.user)
      setTokenState(res.data.token)
      wasAuthed.current = true
    }).catch(() => {
      setUser(null)
      setTokenState(null)
    }).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const handler = () => {
      if (!wasAuthed.current) return
      wasAuthed.current = false
      setUser(null)
      setTokenState(null)
      navigate('/login')
    }
    window.addEventListener('auth:logout', handler)
    return () => window.removeEventListener('auth:logout', handler)
  }, [navigate])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { user, token: t } = res.data
    wasAuthed.current = true
    setUser(user)
    setTokenState(t)
    return user
  }, [])

  const signup = useCallback(async (fields) => {
    const res = await api.post('/auth/signup', fields)
    const { user, token: t } = res.data
    wasAuthed.current = true
    setUser(user)
    setTokenState(t)
    return user
  }, [])

  const logout = useCallback(() => {
    wasAuthed.current = false
    api.post('/auth/logout').catch(() => {})
    setUser(null)
    setTokenState(null)
    navigate('/login')
  }, [navigate])

  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
