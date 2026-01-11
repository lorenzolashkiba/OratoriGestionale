import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import ProfiloForm from '../components/profilo/ProfiloForm'
import { useAuth } from '../context/AuthContext'
import { usersApi, oratoriApi } from '../services/api'

export default function Profilo() {
  const { user, profile, refreshProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [oratori, setOratori] = useState([])
  const [loadingOratori, setLoadingOratori] = useState(true)
  const [showOratoreSelector, setShowOratoreSelector] = useState(false)
  const [searchOratore, setSearchOratore] = useState('')

  useEffect(() => {
    const fetchOratori = async () => {
      try {
        const data = await oratoriApi.getAll()
        setOratori(data)
      } catch (err) {
        console.error('Errore caricamento oratori:', err)
      } finally {
        setLoadingOratori(false)
      }
    }
    fetchOratori()
  }, [])

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

  const handleLinkOratore = async (oratoreId) => {
    setSaving(true)
    setMessage(null)
    try {
      await usersApi.updateProfile({ ...profile, oratoreId })
      await refreshProfile()
      setShowOratoreSelector(false)
      setSearchOratore('')
      setMessage({ type: 'success', text: 'Collegato all\'oratore con successo!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleUnlinkOratore = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await usersApi.updateProfile({ ...profile, oratoreId: null })
      await refreshProfile()
      setMessage({ type: 'success', text: 'Scollegato dall\'oratore con successo!' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const filteredOratori = oratori.filter((o) =>
    `${o.cognome} ${o.nome} ${o.congregazione}`.toLowerCase().includes(searchOratore.toLowerCase())
  )

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

        {/* Sezione collegamento oratore */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Collegamento Oratore</h2>
          <p className="text-sm text-gray-600 mb-4">
            Se sei anche un oratore, puoi collegare il tuo profilo utente a un oratore esistente nella lista.
          </p>

          {profile?.oratore ? (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Collegato a:</p>
                  <p className="font-semibold text-gray-900">
                    {profile.oratore.cognome} {profile.oratore.nome}
                  </p>
                  {profile.oratore.congregazione && (
                    <p className="text-sm text-gray-600">{profile.oratore.congregazione}</p>
                  )}
                  {profile.oratore.discorsi && profile.oratore.discorsi.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">Discorsi:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {profile.oratore.discorsi.slice(0, 10).map((d) => (
                          <span key={d} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                            {d}
                          </span>
                        ))}
                        {profile.oratore.discorsi.length > 10 && (
                          <span className="text-xs text-gray-500">+{profile.oratore.discorsi.length - 10} altri</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleUnlinkOratore}
                  disabled={saving}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                >
                  Scollega
                </button>
              </div>
              <Link
                to="/oratori"
                className="inline-block mt-3 text-sm text-blue-600 hover:text-blue-800"
              >
                Modifica dati oratore →
              </Link>
            </div>
          ) : (
            <div>
              {!showOratoreSelector ? (
                <button
                  onClick={() => setShowOratoreSelector(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Collega a un oratore
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={searchOratore}
                    onChange={(e) => setSearchOratore(e.target.value)}
                    placeholder="Cerca oratore per nome, cognome o congregazione..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />

                  {loadingOratori ? (
                    <p className="text-gray-500 text-sm">Caricamento oratori...</p>
                  ) : filteredOratori.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nessun oratore trovato</p>
                  ) : (
                    <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                      {filteredOratori.map((o) => (
                        <button
                          key={o._id}
                          onClick={() => handleLinkOratore(o._id)}
                          disabled={saving}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 disabled:opacity-50"
                        >
                          <p className="font-medium text-gray-900">
                            {o.cognome} {o.nome}
                          </p>
                          {o.congregazione && (
                            <p className="text-sm text-gray-500">{o.congregazione}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setShowOratoreSelector(false)
                      setSearchOratore('')
                    }}
                    className="text-gray-600 hover:text-gray-800 text-sm"
                  >
                    Annulla
                  </button>
                </div>
              )}
            </div>
          )}
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
