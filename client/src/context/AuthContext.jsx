import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import AuthContext from './authContext'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('checkinn_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('checkinn_token')))

  useEffect(() => {
    const token = localStorage.getItem('checkinn_token')
    if (!token) return

    api
      .get('/auth/me')
      .then(({ data }) => {
        setUser(data.user)
        localStorage.setItem('checkinn_user', JSON.stringify(data.user))
      })
      .catch(() => {
        localStorage.removeItem('checkinn_token')
        localStorage.removeItem('checkinn_user')
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials)
    localStorage.setItem('checkinn_token', data.token)
    localStorage.setItem('checkinn_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload)
    localStorage.setItem('checkinn_token', data.token)
    localStorage.setItem('checkinn_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = () => {
    localStorage.removeItem('checkinn_token')
    localStorage.removeItem('checkinn_user')
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
