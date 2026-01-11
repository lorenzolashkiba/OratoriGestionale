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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Il mio Profilo</h1>
        <p className="text-gray-500 mb-6 sm:mb-8">Gestisci le tue informazioni personali</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-6 border-b border-gray-200 text-center sm:text-left">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Avatar"
                className="w-20 h-20 sm:w-16 sm:h-16 rounded-full ring-4 ring-blue-50"
              />
            ) : (
              <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center ring-4 ring-blue-50">
                <svg className="w-10 h-10 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-lg">{user?.displayName || 'Utente'}</p>
              <p className="text-gray-600 truncate">{user?.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-1 mt-2">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                <span className="text-xs text-gray-400">Accesso tramite Google</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            {message && (
              <div
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message.type === 'success' ? (
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {message.text}
              </div>
            )}

            <ProfiloForm profile={profile} onSave={handleSave} loading={saving} />
          </div>
        </div>

        {/* Sezione collegamento oratore */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-2 rounded-xl">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Collegamento Oratore</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Se sei anche un oratore, puoi collegare il tuo profilo utente a un oratore esistente nella lista.
          </p>

          {profile?.oratore ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm text-blue-600 font-medium mb-1">Collegato a:</p>
                  <p className="font-semibold text-gray-900 text-lg">
                    {profile.oratore.cognome} {profile.oratore.nome}
                  </p>
                  {profile.oratore.congregazione && (
                    <p className="text-sm text-gray-600">{profile.oratore.congregazione}</p>
                  )}
                  {profile.oratore.discorsi && profile.oratore.discorsi.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-1">Discorsi:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.oratore.discorsi.slice(0, 8).map((d) => (
                          <span key={d} className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                            {d}
                          </span>
                        ))}
                        {profile.oratore.discorsi.length > 8 && (
                          <span className="text-xs text-gray-500 py-1">+{profile.oratore.discorsi.length - 8} altri</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleUnlinkOratore}
                  disabled={saving}
                  className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Scollega
                </button>
              </div>
              <Link
                to="/oratori"
                className="inline-flex items-center gap-1 mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Modifica dati oratore
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            <div>
              {!showOratoreSelector ? (
                <button
                  onClick={() => setShowOratoreSelector(true)}
                  className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Collega a un oratore
                </button>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={searchOratore}
                    onChange={(e) => setSearchOratore(e.target.value)}
                    placeholder="Cerca oratore per nome, cognome o congregazione..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                    autoFocus
                  />

                  {loadingOratori ? (
                    <div className="flex items-center gap-2 text-gray-500 text-sm py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600"></div>
                      Caricamento oratori...
                    </div>
                  ) : filteredOratori.length === 0 ? (
                    <p className="text-gray-500 text-sm py-2">Nessun oratore trovato</p>
                  ) : (
                    <div className="border border-gray-200 rounded-xl max-h-60 overflow-y-auto divide-y divide-gray-100">
                      {filteredOratori.map((o) => (
                        <button
                          key={o._id}
                          onClick={() => handleLinkOratore(o._id)}
                          disabled={saving}
                          className="w-full text-left px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 transition-colors"
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
                    className="text-gray-600 hover:text-gray-800 text-sm font-medium px-3 py-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Annulla
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {profile && (
          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 flex flex-col sm:flex-row sm:justify-between gap-1">
            <p>Account creato: {new Date(profile.createdAt).toLocaleDateString('it-IT')}</p>
            <p>Ultimo aggiornamento: {new Date(profile.updatedAt).toLocaleDateString('it-IT')}</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
