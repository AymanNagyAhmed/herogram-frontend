'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getCookie, setCookie, deleteCookie } from 'cookies-next'

interface User {
  id: number
  email: string
  fullName: string
  dateOfBirth: string
  preferredLocation: Record<string, any>
  resumeSummary: string
  programmingSkills: any[]
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (token: string, userData: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = getCookie('access_token')
    const userData = getCookie('user_data')

    if (token && userData) {
      try {
        setUser(JSON.parse(userData as string))
      } catch (error) {
        console.error('Failed to parse user data:', error)
      }
    }
    setIsLoading(false)
  }, [])

  const login = (token: string, userData: User) => {
    setCookie('access_token', token)
    setCookie('user_data', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    deleteCookie('access_token')
    deleteCookie('user_data')
    deleteCookie('userRegistered')
    setUser(null)
    router.push('/')
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 