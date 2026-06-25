import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('authlab_user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed)
        api.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`
      } catch {
        localStorage.removeItem('authlab_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    const userData = res.data
    setUser(userData)
    localStorage.setItem('authlab_user', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`
    return userData
  }

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password })
    const userData = res.data
    setUser(userData)
    localStorage.setItem('authlab_user', JSON.stringify(userData))
    api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`
    return userData
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('authlab_user')
    delete api.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
