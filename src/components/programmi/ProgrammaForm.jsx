import { useState, useEffect } from 'react'
import { oratoriApi } from '../../services/api'
import { useProgrammi } from '../../hooks/useProgrammi'

export default function ProgrammaForm({ programma, onSave, onCancel, loading }) {
  const { getOccupiedDates } = useProgrammi()
  const [formData, setFormData] = useState({
    data: '',
    orario: '',
    oratoreId: '',
    discorso: '',
    note: '',
  })
  const [oratori, setOratori] = useState([])
  const [selectedOratore, setSelectedOratore] = useState(null)
  const [occupiedDates, setOccupiedDates] = useState([])
  const [loadingOratori, setLoadingOratori] = useState(true)
  const [searchOratore, setSearchOratore] = useState('')
  const [dateError, setDateError] = useState('')

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

  useEffect(() => {
    if (programma) {
      const date = new Date(programma.data)
      const formattedDate = date.toISOString().split('T')[0]
      setFormData({
        data: formattedDate,
        orario: programma.orario || '',
        oratoreId: programma.oratoreId?._id || programma.oratoreId || '',
        discorso: programma.discorso?.toString() || '',
        note: programma.note || '',
      })
      if (programma.oratore) {
        setSelectedOratore(programma.oratore)
      }
    }
  }, [programma])

  useEffect(() => {
    if (formData.oratoreId) {
      const fetchOccupied = async () => {
        const dates = await getOccupiedDates(formData.oratoreId)
        setOccupiedDates(dates.map((d) => new Date(d).toISOString().split('T')[0]))
      }
      fetchOccupied()
      const oratore = oratori.find((o) => o._id === formData.oratoreId)
      setSelectedOratore(oratore || null)
    } else {
      setOccupiedDates([])
      setSelectedOratore(null)
    }
  }, [formData.oratoreId, oratori, getOccupiedDates])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'data') {
      validateDate(value)
    }
  }

  const validateDate = (dateStr) => {
    if (!dateStr) {
      setDateError('')
      return true
    }
    const date = new Date(dateStr)
    const day = date.getDay()
    if (day !== 0 && day !== 6) {
      setDateError('Seleziona solo sabato o domenica')
      return false
    }

    // Controlla se la data è già occupata (escludendo il programma corrente in modifica)
    const currentProgramDate = programma ? new Date(programma.data).toISOString().split('T')[0] : null
    if (occupiedDates.includes(dateStr) && dateStr !== currentProgramDate) {
      setDateError('Oratore già occupato in questa data')
      return false
    }

    setDateError('')
    return true
  }

  const handleSelectOratore = (oratore) => {
    setFormData((prev) => ({ ...prev, oratoreId: oratore._id, discorso: '' }))
    setSearchOratore('')
  }

  const filteredOratori = oratori.filter((o) =>
    `${o.cognome} ${o.nome} ${o.congregazione}`.toLowerCase().includes(searchOratore.toLowerCase())
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateDate(formData.data)) {
      return
    }
    onSave({
      ...formData,
      discorso: parseInt(formData.discorso, 10),
    })
  }

  const isWeekend = (dateStr) => {
    const date = new Date(dateStr)
    const day = date.getDay()
    return day === 0 || day === 6
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {programma ? 'Modifica Programma' : 'Nuovo Programma'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data (Sab/Dom) *
                </label>
                <input
                  type="date"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    dateError ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {dateError && (
                  <p className="mt-1 text-sm text-red-600">{dateError}</p>
                )}
                {formData.data && isWeekend(formData.data) && !dateError && (
                  <p className="mt-1 text-sm text-green-600">
                    {new Date(formData.data).getDay() === 0 ? 'Domenica' : 'Sabato'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orario *
                </label>
                <input
                  type="time"
                  name="orario"
                  value={formData.orario}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Oratore *
              </label>
              {loadingOratori ? (
                <div className="text-gray-500">Caricamento oratori...</div>
              ) : (
                <>
                  <input
                    type="text"
                    value={searchOratore}
                    onChange={(e) => setSearchOratore(e.target.value)}
                    placeholder="Cerca oratore per nome, cognome o congregazione..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {searchOratore && filteredOratori.length > 0 && (
                    <div className="mt-1 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                      {filteredOratori.map((o) => (
                        <button
                          key={o._id}
                          type="button"
                          onClick={() => handleSelectOratore(o)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 border-b border-gray-100 last:border-0"
                        >
                          <span className="font-medium">{o.cognome} {o.nome}</span>
                          {o.congregazione && (
                            <span className="text-sm text-gray-500 ml-2">({o.congregazione})</span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedOratore && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium text-blue-900">
                          {selectedOratore.cognome} {selectedOratore.nome}
                        </p>
                        {selectedOratore.congregazione && (
                          <p className="text-sm text-blue-700">{selectedOratore.congregazione}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, oratoreId: '', discorso: '' }))
                          setSelectedOratore(null)
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  {occupiedDates.length > 0 && (
                    <div className="mt-2 text-sm text-orange-600">
                      <p className="font-medium">Date gia occupate:</p>
                      <p>
                        {occupiedDates
                          .filter((d) => !programma || d !== new Date(programma.data).toISOString().split('T')[0])
                          .map((d) => new Date(d).toLocaleDateString('it-IT'))
                          .join(', ') || 'Nessuna'}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {selectedOratore && selectedOratore.discorsi && selectedOratore.discorsi.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discorso *
                </label>
                <select
                  name="discorso"
                  value={formData.discorso}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleziona discorso...</option>
                  {selectedOratore.discorsi.sort((a, b) => a - b).map((num) => (
                    <option key={num} value={num}>
                      Discorso n. {num}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedOratore && (!selectedOratore.discorsi || selectedOratore.discorsi.length === 0) && (
              <div className="bg-yellow-50 p-3 rounded-lg text-yellow-800 text-sm">
                Questo oratore non ha discorsi associati. Aggiungi prima i discorsi nella sezione Oratori.
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Note aggiuntive..."
              />
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
                disabled={loading || dateError || !selectedOratore || !formData.discorso}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
