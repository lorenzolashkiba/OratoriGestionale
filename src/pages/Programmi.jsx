import { useState } from 'react'
import Layout from '../components/layout/Layout'
import ProgrammaCard from '../components/programmi/ProgrammaCard'
import ProgrammaForm from '../components/programmi/ProgrammaForm'
import { useProgrammi } from '../hooks/useProgrammi'

export default function Programmi() {
  const {
    programmi,
    loading,
    error,
    createProgramma,
    updateProgramma,
    deleteProgramma,
  } = useProgrammi()

  const [showForm, setShowForm] = useState(false)
  const [editingProgramma, setEditingProgramma] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showPast, setShowPast] = useState(false)

  const handleCreate = () => {
    setEditingProgramma(null)
    setShowForm(true)
  }

  const handleEdit = (programma) => {
    setEditingProgramma(programma)
    setShowForm(true)
  }

  const handleDelete = (programma) => {
    setDeleteConfirm(programma)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deleteProgramma(deleteConfirm._id)
      setDeleteConfirm(null)
    } catch (err) {
      alert('Errore durante eliminazione: ' + err.message)
    }
  }

  const handleSave = async (data) => {
    setSaving(true)
    try {
      if (editingProgramma) {
        await updateProgramma(editingProgramma._id, data)
      } else {
        await createProgramma(data)
      }
      setShowForm(false)
      setEditingProgramma(null)
    } catch (err) {
      alert('Errore durante il salvataggio: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingProgramma(null)
  }

  const today = new Date().setHours(0, 0, 0, 0)
  const futureProgrammi = programmi.filter((p) => new Date(p.data) >= today)
  const pastProgrammi = programmi.filter((p) => new Date(p.data) < today)
  const displayProgrammi = showPast ? programmi : futureProgrammi

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">I miei Programmi</h1>
          <p className="text-gray-500 mt-1">Gestisci i tuoi programmi personali</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 active:bg-green-800 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm w-full sm:w-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuovo Programma
        </button>
      </div>

      {pastProgrammi.length > 0 && (
        <div className="mb-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <label className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span>Mostra programmi passati <span className="text-gray-500">({pastProgrammi.length})</span></span>
          </label>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-200 border-t-green-600 mb-4"></div>
          <p className="text-gray-500">Caricamento programmi...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Errore: {error}
        </div>
      )}

      {!loading && !error && displayProgrammi.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {showPast ? 'Nessun programma trovato' : 'Nessun programma futuro'}
          </h3>
          <p className="text-gray-500 mb-4">Inizia creando il tuo primo programma</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crea il tuo primo programma
          </button>
        </div>
      )}

      {!loading && !error && displayProgrammi.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{displayProgrammi.length}</span> programma{displayProgrammi.length !== 1 ? 'i' : ''} {showPast ? 'totale' : 'in programma'}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayProgrammi.map((programma) => (
              <ProgrammaCard
                key={programma._id}
                programma={programma}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}

      {showForm && (
        <ProgrammaForm
          programma={editingProgramma}
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
              <h3 className="text-lg font-bold text-gray-900">Conferma eliminazione</h3>
            </div>
            <p className="text-gray-600 mb-2">
              Sei sicuro di voler eliminare il programma del{' '}
              <strong>{new Date(deleteConfirm.data).toLocaleDateString('it-IT')}</strong>?
            </p>
            <p className="text-sm text-red-600 mb-6">
              Questa azione non puo essere annullata.
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="w-full sm:w-auto px-5 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-colors"
              >
                Annulla
              </button>
              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors"
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
