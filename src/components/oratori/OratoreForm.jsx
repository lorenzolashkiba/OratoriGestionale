import { useState, useEffect } from 'react'

export default function OratoreForm({ oratore, onSave, onCancel, loading }) {
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    congregazione: '',
    localita: '',
    discorsi: [],
  })
  const [discorsoInput, setDiscorsoInput] = useState('')

  useEffect(() => {
    if (oratore) {
      setFormData({
        nome: oratore.nome || '',
        cognome: oratore.cognome || '',
        email: oratore.email || '',
        telefono: oratore.telefono || '',
        congregazione: oratore.congregazione || '',
        localita: oratore.localita || '',
        discorsi: oratore.discorsi || [],
      })
    }
  }, [oratore])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const addDiscorso = () => {
    const num = parseInt(discorsoInput, 10)
    if (num >= 1 && num <= 194 && !formData.discorsi.includes(num)) {
      setFormData((prev) => ({
        ...prev,
        discorsi: [...prev.discorsi, num].sort((a, b) => a - b),
      }))
      setDiscorsoInput('')
    }
  }

  const removeDiscorso = (num) => {
    setFormData((prev) => ({
      ...prev,
      discorsi: prev.discorsi.filter((d) => d !== num),
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {oratore ? 'Modifica Oratore' : 'Nuovo Oratore'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cognome *
                </label>
                <input
                  type="text"
                  name="cognome"
                  value={formData.cognome}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefono
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Congregazione
              </label>
              <input
                type="text"
                name="congregazione"
                value={formData.congregazione}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Località
              </label>
              <input
                type="text"
                name="localita"
                value={formData.localita}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discorsi (1-194)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="194"
                  value={discorsoInput}
                  onChange={(e) => setDiscorsoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDiscorso())}
                  placeholder="Inserisci numero"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addDiscorso}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Aggiungi
                </button>
              </div>
              {formData.discorsi.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {formData.discorsi.map((num) => (
                    <span
                      key={num}
                      className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded-full flex items-center gap-1"
                    >
                      {num}
                      <button
                        type="button"
                        onClick={() => removeDiscorso(num)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Salvataggio...' : 'Salva'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
