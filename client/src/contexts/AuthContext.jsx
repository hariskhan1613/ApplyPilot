import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/apiClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    authApi.me()
      .then((result) => { setUser(result.user); setStatus('ready') })
      .catch(() => { setUser(null); setStatus('ready') })
  }, [])

  const value = useMemo(() => ({
    user,
    loading: status === 'loading',
    async login(credentials) {
      const result = await authApi.login(credentials)
      setUser(result.user)
      return result.user
    },
    async register(details) {
      const result = await authApi.register(details)
      setUser(result.user)
      return result.user
    },
    async logout() {
      await authApi.logout()
      setUser(null)
    },
  }), [status, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
