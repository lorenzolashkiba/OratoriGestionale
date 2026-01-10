import { useState } from 'react'
import Layout from '../components/layout/Layout'
import OratoreCard from '../components/oratori/OratoreCard'
import OratoreForm from '../components/oratori/OratoreForm'
import OratoriFilters from '../components/oratori/OratoriFilters'
import { useOratori } from '../hooks/useOratori'

export default function Oratori() {
  const {
    oratori,
    loading,
    error,
    filters,
    setFilters,
    createOratore,
    updateOratore,
    deleteOratore,
  } = useOratori()

  const [showForm, setShowForm] = useState(false)
  const [editingOratore, setEditingOratore] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const handleCreate = () => {
    setEditingOratore(null)
    setShowForm(true)
  }

  const handleEdit = (oratore) => {
    setEditingOratore(oratore)
    setShowForm(true)
  }

  const handleDelete = (oratore) => {
    setDeleteConfirm(oratore)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deleteOratore(deleteConfirm._id)
      setDeleteConfirm(null)
    } catch (err) {
      alert('Errore durante eliminazione: ' + err.message)
    }
  }

  const handleSave = async (data) => {
    setSaving(true)
    try {
      if (editingOratore) {
        await updateOratore(editingOratore._id, data)
      } else {
        await createOratore(data)
      }
      setShowForm(false)
      setEditingOratore(null)
    } catch (err) {
      alert('Errore durante il salvataggio: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingOratore(null)
  }

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Oratori</h1>
          <p className="text-gray-600">Lista condivisa di tutti gli oratori</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuovo Oratore
        </button>
      </div>

      <OratoriFilters filters={filters} onFilterChange={setFilters} />

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          Errore: {error}
        </div>
      )}

      {!loading && !error && oratori.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p>Nessun oratore trovato</p>
          <button
            onClick={handleCreate}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Aggiungi il primo oratore
          </button>
        </div>
      )}

      {!loading && !error && oratori.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {oratori.length} oratore{oratori.length !== 1 ? 'i' : ''} trovato{oratori.length !== 1 ? 'i' : ''}
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {oratori.map((oratore) => (
              <OratoreCard
                key={oratore._id}
                oratore={oratore}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      {showForm && (
        <OratoreForm
          oratore={editingOratore}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={saving}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Conferma eliminazione</h3>
            <p className="text-gray-600 mb-4">
              Sei sicuro di voler eliminare l'oratore{' '}
              <strong>{deleteConfirm.cognome} {deleteConfirm.nome}</strong>?
            </p>
            <p className="text-sm text-red-600 mb-4">
              Questa azione non puo essere annullata.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annulla
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
