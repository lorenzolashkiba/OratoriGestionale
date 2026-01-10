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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">I miei Programmi</h1>
          <p className="text-gray-600">Gestisci i tuoi programmi personali</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuovo Programma
        </button>
      </div>

      {pastProgrammi.length > 0 && (
        <div className="mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Mostra programmi passati ({pastProgrammi.length})
          </label>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          Errore: {error}
        </div>
      )}

      {!loading && !error && displayProgrammi.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>{showPast ? 'Nessun programma trovato' : 'Nessun programma futuro'}</p>
          <button
            onClick={handleCreate}
            className="mt-4 text-green-600 hover:text-green-800 font-medium"
          >
            Crea il tuo primo programma
          </button>
        </div>
      )}

      {!loading && !error && displayProgrammi.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">
            {displayProgrammi.length} programma{displayProgrammi.length !== 1 ? 'i' : ''} {showPast ? 'totale' : 'in programma'}
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Conferma eliminazione</h3>
            <p className="text-gray-600 mb-4">
              Sei sicuro di voler eliminare il programma del{' '}
              <strong>{new Date(deleteConfirm.data).toLocaleDateString('it-IT')}</strong>?
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
