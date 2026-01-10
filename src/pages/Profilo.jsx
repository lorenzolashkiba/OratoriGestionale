import { useState } from 'react'
import Layout from '../components/layout/Layout'
import ProfiloForm from '../components/profilo/ProfiloForm'
import { useAuth } from '../context/AuthContext'
import { usersApi } from '../services/api'

export default function Profilo() {
  const { user, profile, refreshProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const handleSave = async (data) => {
    setSaving(true)
    setMessage(null)
    try {
      await usersApi.updateProfile(data)
      await refreshProfile()
      setMessage({ type: 'success', text: 'Profilo aggiornato con successo!' })
    } catch (err) {
      setMessage({ type: 'error', text: 'Errore durante il salvataggio: ' + err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Il mio Profilo</h1>
        <p className="text-gray-600 mb-8">Gestisci le tue informazioni personali</p>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{user?.displayName || 'Utente'}</p>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-xs text-gray-400 mt-1">Accesso tramite Google</p>
            </div>
          </div>

          <div className="pt-6">
            {message && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <ProfiloForm profile={profile} onSave={handleSave} loading={saving} />
          </div>
        </div>

        {profile && (
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
            <p>Account creato: {new Date(profile.createdAt).toLocaleDateString('it-IT')}</p>
            <p>Ultimo aggiornamento: {new Date(profile.updatedAt).toLocaleDateString('it-IT')}</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
