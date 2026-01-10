import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoginButton from '../components/auth/LoginButton'

export default function Login() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestionale Oratori
          </h1>
          <p className="text-gray-600">
            Accedi per gestire oratori e programmi
          </p>
        </div>

        <div className="flex justify-center">
          <LoginButton />
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Utilizza il tuo account Google per accedere
        </p>
      </div>
    </div>
  )
}
