import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { adminApi } from '../services/api'
import Layout from '../components/layout/Layout'

export default function Admin() {
  const { isAdmin, loading: authLoading } = useAuth()
  const [pendingUsers, setPendingUsers] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    if (isAdmin) {
      loadData()
    }
  }, [isAdmin])

  const loadData = async () => {
    try {
      setLoading(true)
      const [pending, users, statsData] = await Promise.all([
        adminApi.getPendingUsers(),
        adminApi.getAllUsers(),
        adminApi.getStats(),
      ])
      setPendingUsers(pending)
      setAllUsers(users)
      setStats(statsData)
    } catch (error) {
      console.error('Errore caricamento dati admin:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId) => {
    try {
      setActionLoading(userId)
      await adminApi.approveUser(userId)
      await loadData()
    } catch (error) {
      console.error('Errore approvazione:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (userId, reason) => {
    try {
      setActionLoading(userId)
      await adminApi.rejectUser(userId, reason)
      await loadData()
    } catch (error) {
      console.error('Errore rifiuto:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      setActionLoading(userId)
      await adminApi.changeRole(userId, newRole)
      await loadData()
    } catch (error) {
      console.error('Errore cambio ruolo:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('Sei sicuro di voler eliminare questo utente? L\'utente potrà registrarsi nuovamente.')) {
      return
    }
    try {
      setActionLoading(userId)
      await adminApi.deleteUser(userId)
      await loadData()
    } catch (error) {
      console.error('Errore eliminazione:', error)
    } finally {
      setActionLoading(null)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Pannello Amministratore</h1>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Utenti totali</div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-4 shadow-sm border border-yellow-200">
              <div className="text-3xl font-bold text-yellow-700">{stats.pending}</div>
              <div className="text-sm text-yellow-600">In attesa</div>
            </div>
            <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-200">
              <div className="text-3xl font-bold text-green-700">{stats.users}</div>
              <div className="text-sm text-green-600">Utenti attivi</div>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 shadow-sm border border-blue-200">
              <div className="text-3xl font-bold text-blue-700">{stats.admins}</div>
              <div className="text-sm text-blue-600">Amministratori</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex gap-4">
            <button
              onClick={() => setActiveTab('pending')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              In attesa ({pendingUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tutti gli utenti
            </button>
          </nav>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Pending Users Tab */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500">Nessuna richiesta in attesa</p>
                  </div>
                ) : (
                  pendingUsers.map((user) => (
                    <PendingUserCard
                      key={user._id}
                      user={user}
                      onApprove={() => handleApprove(user._id)}
                      onReject={(reason) => handleReject(user._id, reason)}
                      loading={actionLoading === user._id}
                    />
                  ))
                )}
              </div>
            )}

            {/* All Users Tab */}
            {activeTab === 'all' && (
              <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruolo</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stato</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data registrazione</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allUsers.map((user) => (
                        <UserRow
                          key={user._id}
                          user={user}
                          onRoleChange={(role) => handleRoleChange(user._id, role)}
                          onDelete={() => handleDelete(user._id)}
                          loading={actionLoading === user._id}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

function PendingUserCard({ user, onApprove, onReject, loading }) {
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-lg">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {user.nome || user.cognome ? `${user.nome} ${user.cognome}`.trim() : 'Nome non specificato'}
              </h3>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-3">
            Richiesto il {new Date(user.requestedAt || user.createdAt).toLocaleDateString('it-IT', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onApprove}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approva
              </>
            )}
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={loading}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 disabled:opacity-50"
          >
            Rifiuta
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Rifiuta richiesta</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Motivo del rifiuto (opzionale)"
              className="w-full border rounded-lg p-3 h-24 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                }}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  onReject(rejectReason)
                  setShowRejectModal(false)
                  setRejectReason('')
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Conferma rifiuto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UserRow({ user, onRoleChange, onDelete, loading }) {
  const roleColors = {
    admin: 'bg-blue-100 text-blue-700',
    user: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
  }

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }

  const roleLabels = {
    admin: 'Admin',
    user: 'Utente',
    pending: 'In attesa',
  }

  const statusLabels = {
    active: 'Attivo',
    rejected: 'Rifiutato',
  }

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-600 font-medium text-sm">
              {user.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              {user.nome || user.cognome ? `${user.nome} ${user.cognome}`.trim() : '-'}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-700'}`}>
          {roleLabels[user.role] || user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[user.status] || 'bg-gray-100 text-gray-700'}`}>
          {statusLabels[user.status] || user.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(user.createdAt).toLocaleDateString('it-IT')}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          {user.role !== 'pending' && user.status !== 'rejected' && (
            <select
              value={user.role}
              onChange={(e) => onRoleChange(e.target.value)}
              disabled={loading}
              className="text-sm border rounded-lg px-2 py-1 disabled:opacity-50 focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">Utente</option>
              <option value="admin">Admin</option>
            </select>
          )}
          <button
            onClick={onDelete}
            disabled={loading}
            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors"
            title="Elimina utente"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        </div>
      </td>
    </tr>
  )
}
