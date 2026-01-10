import { createContext, useContext, useState, useEffect } from 'react'
import { auth, loginWithGoogle, logout as firebaseLogout } from '../services/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { usersApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const profileData = await usersApi.getProfile()
          setProfile(profileData)
        } catch (error) {
          console.error('Errore nel caricamento del profilo:', error)
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async () => {
    try {
      await loginWithGoogle()
    } catch (error) {
      console.error('Errore durante il login:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await firebaseLogout()
      setProfile(null)
    } catch (error) {
      console.error('Errore durante il logout:', error)
      throw error
    }
  }

  const refreshProfile = async () => {
    if (user) {
      try {
        const profileData = await usersApi.getProfile()
        setProfile(profileData)
      } catch (error) {
        console.error('Errore nel refresh del profilo:', error)
      }
    }
  }

  const value = {
    user,
    profile,
    loading,
    login,
    logout,
    refreshProfile,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve essere usato dentro AuthProvider')
  }
  return context
}
