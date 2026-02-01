import { createContext, useContext, useState, useEffect } from 'react'
import { auth, loginWithGoogle, logout as firebaseLogout } from '../services/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { usersApi } from '../services/api'
import { PRIVACY_VERSION } from '../config/privacy'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pendingApproval, setPendingApproval] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)
  const [needsPrivacyConsent, setNeedsPrivacyConsent] = useState(false)
  const [acceptingPrivacy, setAcceptingPrivacy] = useState(false)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Auth state changed:', firebaseUser?.email)
      setUser(firebaseUser)
      setAuthError(null)

      if (firebaseUser) {
        try {
          console.log('Fetching user profile...')
          const profileData = await usersApi.getProfile()
          console.log('Profile loaded:', profileData)
          setProfile(profileData)

          const needsPrivacyUpdate = profileData.privacyAcceptedVersion !== PRIVACY_VERSION
          setNeedsPrivacyConsent(needsPrivacyUpdate)

          // Verifica stato approvazione
          if (profileData.role === 'pending') {
            setPendingApproval(true)
          } else if (profileData.status === 'rejected') {
            setAccessDenied(true)
          } else {
            setPendingApproval(false)
            setAccessDenied(false)
          }
        } catch (error) {
          console.error('Errore nel caricamento del profilo:', error)

          // Se l'utente non esiste (404), deve accettare la privacy
          if (error.message?.includes('USER_NOT_FOUND') || error.message?.includes('non registrato')) {
            setNeedsPrivacyConsent(true)
            setProfile(null)
          } else if (error.message?.includes('PENDING_APPROVAL') || error.code === 'PENDING_APPROVAL') {
            setPendingApproval(true)
          } else if (error.message?.includes('ACCESS_DENIED') || error.code === 'ACCESS_DENIED') {
            setAccessDenied(true)
          } else {
            setAuthError(error.message || 'Errore durante il caricamento del profilo')
          }
          setProfile(null)
        }
      } else {
        setProfile(null)
        setPendingApproval(false)
        setAccessDenied(false)
        setNeedsPrivacyConsent(false)
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
      setNeedsPrivacyConsent(false)
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
      setNeedsPrivacyConsent(false)
    } catch (error) {
      console.error('Errore durante il logout:', error)
      throw error
    }
  }

  const acceptPrivacy = async () => {
    setAcceptingPrivacy(true)
    try {
      if (profile) {
        const updatedProfile = await usersApi.acceptPrivacyVersion()
        setProfile(updatedProfile)
        setNeedsPrivacyConsent(false)
        setPendingApproval(updatedProfile.role === 'pending')
        setAccessDenied(updatedProfile.status === 'rejected')
      } else {
        // Registra l'utente nel database
        const newProfile = await usersApi.register()
        setProfile(newProfile)
        setNeedsPrivacyConsent(false)
        setPendingApproval(true) // Nuovo utente è sempre pending
      }
    } catch (error) {
      console.error('Errore durante l\'accettazione della privacy:', error)
      throw error
    } finally {
      setAcceptingPrivacy(false)
    }
  }

  const deleteAccount = async () => {
    try {
      await usersApi.deleteAccount()
      await firebaseLogout()
      setProfile(null)
      setPendingApproval(false)
      setAccessDenied(false)
      setNeedsPrivacyConsent(false)
    } catch (error) {
      console.error('Errore durante la cancellazione:', error)
      throw error
    }
  }

  const refreshProfile = async () => {
    if (user) {
      try {
        const profileData = await usersApi.getProfile()
        setProfile(profileData)

        const needsPrivacyUpdate = profileData.privacyAcceptedVersion !== PRIVACY_VERSION
        setNeedsPrivacyConsent(needsPrivacyUpdate)

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
    acceptPrivacy,
    acceptingPrivacy,
    deleteAccount,
    isAuthenticated: !!user && !!profile && profile.role !== 'pending',
    isAdmin: profile?.role === 'admin',
    pendingApproval,
    accessDenied,
    needsPrivacyConsent,
    authError,
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
