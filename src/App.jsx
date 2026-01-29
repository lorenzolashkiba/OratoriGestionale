import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import Oratori from './pages/Oratori'
import Programmi from './pages/Programmi'
import Profilo from './pages/Profilo'
import Admin from './pages/Admin'
import Privacy from './pages/Privacy'
import PrivacyConsent from './pages/PrivacyConsent'

// Componente per gestire il redirect al consenso privacy
function PrivacyConsentGuard({ children }) {
  const { user, loading, needsPrivacyConsent } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  // Se l'utente è loggato ma deve accettare la privacy, mostra PrivacyConsent
  if (user && needsPrivacyConsent) {
    return <PrivacyConsent />
  }

  return children
}

function AppRoutes() {
  return (
    <PrivacyConsentGuard>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/oratori"
          element={
            <ProtectedRoute>
              <Oratori />
            </ProtectedRoute>
          }
        />
        <Route
          path="/programmi"
          element={
            <ProtectedRoute>
              <Programmi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profilo"
          element={
            <ProtectedRoute>
              <Profilo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />
        {/* Redirect any unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PrivacyConsentGuard>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
