import { useState } from 'react'
import Layout from '../components/layout/Layout'
import OratoreCard from '../components/oratori/OratoreCard'
import OratoreForm from '../components/oratori/OratoreForm'
import OratoriFilters from '../components/oratori/OratoriFilters'
import { useOratori } from '../hooks/useOratori'
import { useLanguage } from '../context/LanguageContext'

export default function Oratori() {
  const { t } = useLanguage()
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('oratori.title')}</h1>
          <p className="text-gray-500 mt-1">{t('oratori.subtitle')}</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm w-full sm:w-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('oratori.newOratore')}
        </button>
      </div>

      <OratoriFilters filters={filters} onFilterChange={setFilters} />

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('common.error')}: {error}
        </div>
      )}

      {!loading && !error && oratori.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('oratori.noOratori')}</h3>
          <p className="text-gray-500 mb-4">{t('oratori.startAdding')}</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('oratori.addOratore')}
          </button>
        </div>
      )}

      {!loading && !error && oratori.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{oratori.length}</span> {oratori.length !== 1 ? t('oratori.oratoriPlural') : t('oratori.oratore')} {oratori.length !== 1 ? t('oratori.foundPlural') : t('oratori.found')}
            </p>
          </div>
          <div className="space-y-2">
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
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{t('oratori.confirmDelete')}</h3>
            </div>
            <p className="text-gray-600 mb-2">
              {t('oratori.deleteMessage')}{' '}
              <strong>{deleteConfirm.cognome} {deleteConfirm.nome}</strong>?
            </p>
            <p className="text-sm text-red-600 mb-6">
              {t('oratori.deleteWarning')}
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="w-full sm:w-auto px-5 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
