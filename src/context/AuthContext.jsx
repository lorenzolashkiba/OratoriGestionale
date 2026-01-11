import { createContext, useContext, useState, useEffect } from 'react'
import { auth, loginWithGoogle, logout as firebaseLogout } from '../services/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { usersApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingApproval, setPendingApproval] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        try {
          const profileData = await usersApi.getProfile()
          setProfile(profileData)

          // Verifica stato approvazione
          if (profileData.role === 'pending') {
            setPendingApproval(true)
            // Auto logout per utenti pending
            setTimeout(async () => {
              await firebaseLogout()
              setUser(null)
              setProfile(null)
            }, 100)
          } else if (profileData.status === 'rejected') {
            setAccessDenied(true)
            setTimeout(async () => {
              await firebaseLogout()
              setUser(null)
              setProfile(null)
            }, 100)
          } else {
            setPendingApproval(false)
            setAccessDenied(false)
          }
        } catch (error) {
          console.error('Errore nel caricamento del profilo:', error)
          // Gestisci codici errore specifici
          if (error.message?.includes('PENDING_APPROVAL') || error.code === 'PENDING_APPROVAL') {
            setPendingApproval(true)
          } else if (error.message?.includes('ACCESS_DENIED') || error.code === 'ACCESS_DENIED') {
            setAccessDenied(true)
          }
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
      // Reset flags prima del login
      setPendingApproval(false)
      setAccessDenied(false)
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
      setPendingApproval(false)
      setAccessDenied(false)
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

        // Verifica se ora approvato
        if (profileData.role !== 'pending') {
          setPendingApproval(false)
        }
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
    isAuthenticated: !!user && !!profile && profile.role !== 'pending',
    isAdmin: profile?.role === 'admin',
    pendingApproval,
    accessDenied,
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
