import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivacyConsent() {
  const { user, acceptPrivacy, logout, acceptingPrivacy } = useAuth()
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState(null)

  const handleAccept = async () => {
    if (!accepted) return

    setError(null)
    try {
      await acceptPrivacy()
    } catch (err) {
      setError(err.message || 'Errore durante la registrazione')
    }
  }

  const handleDecline = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-2xl mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Privacy e Consenso
          </h1>
          <p className="text-blue-100">
            Prima di continuare, leggi e accetta la nostra privacy policy
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
          {/* User info */}
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Utente'}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{user?.displayName || 'Nuovo utente'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Privacy summary */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Cosa devi sapere:</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>I tuoi dati sono protetti e trattati secondo il GDPR</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>I responsabili delle congregazioni sono titolari del trattamento dei dati della loro congregazione</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Puoi esportare i tuoi dati in JSON o richiedere la cancellazione in qualsiasi momento</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-gray-700">
                <svg className="w-5 h-5 text-green-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Non condividiamo i tuoi dati con terze parti per fini commerciali</span>
              </li>
            </ul>
          </div>

          {/* Link to full privacy */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-2">
              Ti invitiamo a leggere la privacy policy completa:
            </p>
            <Link
              to="/privacy"
              target="_blank"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Leggi la Privacy Policy completa
            </Link>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors mb-6">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-0.5"
            />
            <span className="text-sm text-gray-700">
              Ho letto e accetto la{' '}
              <Link to="/privacy" target="_blank" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
              {' '}e acconsento al trattamento dei miei dati personali per le finalità descritte.
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDecline}
              disabled={acceptingPrivacy}
              className="flex-1 px-5 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
            >
              Rifiuta e esci
            </button>
            <button
              onClick={handleAccept}
              disabled={!accepted || acceptingPrivacy}
              className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {acceptingPrivacy ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Registrazione...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Accetta e continua
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
