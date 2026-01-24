import { useState, useEffect, useCallback } from 'react'
import { oratoriApi, programmiApi } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { getDistanceBetweenLocalities, formatDistance } from '../../services/geocoding'
import { getDiscorsoTitolo } from '../../data/discorsi'

export default function ProgrammaForm({ programma, onSave, onCancel, loading }) {
  const { profile } = useAuth()
  const [formData, setFormData] = useState({
    data: '',
    orario: '',
    oratoreId: '',
    discorso: '',
    note: '',
  })
  const [oratori, setOratori] = useState([])
  const [selectedOratore, setSelectedOratore] = useState(null)
  const [selectedOratoreDistance, setSelectedOratoreDistance] = useState(null)
  const [allOccupiedDates, setAllOccupiedDates] = useState({}) // { oratoreId: [dates] }
  const [loadingOratori, setLoadingOratori] = useState(true)
  const [loadingDistance, setLoadingDistance] = useState(false)
  const [searchOratore, setSearchOratore] = useState('')
  const [dateError, setDateError] = useState('')
  const [showOratoriList, setShowOratoriList] = useState(false)
  const [monthlyWarning, setMonthlyWarning] = useState(null)

  // Carica tutti gli oratori e le loro date occupate
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [oratoriData, allProgrammi] = await Promise.all([
          oratoriApi.getAll(),
          programmiApi.getAllOccupied(),
        ])
        setOratori(oratoriData)

        // Costruisci un oggetto con le date occupate per ogni oratore
        const occupiedMap = {}
        allProgrammi.forEach((p) => {
          const oratoreId = p.oratoreId?._id || p.oratoreId
          if (oratoreId) {
            if (!occupiedMap[oratoreId]) {
              occupiedMap[oratoreId] = []
            }
            occupiedMap[oratoreId].push(new Date(p.data).toISOString().split('T')[0])
          }
        })
        setAllOccupiedDates(occupiedMap)
      } catch (err) {
        console.error('Errore caricamento dati:', err)
      } finally {
        setLoadingOratori(false)
      }
    }
    fetchData()
  }, [])

  // Calcola la distanza solo per l'oratore selezionato
  const calculateDistanceForOratore = useCallback(async (oratore) => {
    if (!profile?.localita || !oratore?.localita) {
      setSelectedOratoreDistance(null)
      return
    }

    setLoadingDistance(true)
    try {
      const distance = await getDistanceBetweenLocalities(profile.localita, oratore.localita)
      setSelectedOratoreDistance(distance)
    } catch {
      setSelectedOratoreDistance(null)
    } finally {
      setLoadingDistance(false)
    }
  }, [profile?.localita])

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

  // Verifica se un oratore e' disponibile per la data selezionata
  const isOratoreAvailable = useCallback(
    (oratoreId) => {
      if (!formData.data) return true // Se non c'e' data, tutti disponibili
      const dates = allOccupiedDates[oratoreId] || []
      // Se stiamo modificando, escludiamo la data corrente del programma
      const currentProgramDate = programma ? new Date(programma.data).toISOString().split('T')[0] : null
      return !dates.some((d) => d === formData.data && d !== currentProgramDate)
    },
    [formData.data, allOccupiedDates, programma]
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (name === 'data') {
      validateDate(value)
      // Quando cambia la data, verifica se l'oratore selezionato e' ancora disponibile
      if (selectedOratore && !isOratoreAvailable(selectedOratore._id)) {
        setDateError('Oratore gia occupato in questa data')
      }
      // Verifica limite mensile
      if (selectedOratore) {
        checkMonthlyLimit(selectedOratore._id, value)
      }
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

    // Controlla se l'oratore selezionato e' occupato in questa data
    if (selectedOratore) {
      const dates = allOccupiedDates[selectedOratore._id] || []
      const currentProgramDate = programma ? new Date(programma.data).toISOString().split('T')[0] : null
      if (dates.includes(dateStr) && dateStr !== currentProgramDate) {
        setDateError('Oratore gia occupato in questa data')
        return false
      }
    }

    setDateError('')
    return true
  }

  const handleSelectOratore = (oratore) => {
    setFormData((prev) => ({ ...prev, oratoreId: oratore._id, discorso: '' }))
    setSelectedOratore(oratore)
    setSelectedOratoreDistance(null)
    setSearchOratore('')
    setShowOratoriList(false)

    // Verifica disponibilita per la data selezionata
    if (formData.data && !isOratoreAvailable(oratore._id)) {
      setDateError('Oratore gia occupato in questa data')
    } else {
      setDateError('')
    }

    // Verifica limite mensile
    checkMonthlyLimit(oratore._id, formData.data)

    // Calcola la distanza per questo oratore
    calculateDistanceForOratore(oratore)
  }

  // Filtra oratori in base alla ricerca
  const filteredOratori = oratoriWithDistance.filter((o) =>
    `${o.cognome} ${o.nome} ${o.congregazione} ${o.localita}`.toLowerCase().includes(searchOratore.toLowerCase())
  )

  // Separa oratori disponibili e non disponibili
  const availableOratori = filteredOratori.filter((o) => isOratoreAvailable(o._id))
  const unavailableOratori = filteredOratori.filter((o) => !isOratoreAvailable(o._id))

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

  const getOccupiedDatesForOratore = (oratoreId) => {
    const dates = allOccupiedDates[oratoreId] || []
    const currentProgramDate = programma ? new Date(programma.data).toISOString().split('T')[0] : null
    return dates.filter((d) => d !== currentProgramDate)
  }

  // Verifica se l'oratore ha già un discorso nello stesso mese
  const checkMonthlyLimit = useCallback((oratoreId, dateStr) => {
    if (!oratoreId || !dateStr) {
      setMonthlyWarning(null)
      return
    }

    const selectedDate = new Date(dateStr)
    const selectedMonth = selectedDate.getMonth()
    const selectedYear = selectedDate.getFullYear()
    const currentProgramDate = programma ? new Date(programma.data).toISOString().split('T')[0] : null

    const dates = allOccupiedDates[oratoreId] || []
    const otherDatesInMonth = dates.filter((d) => {
      if (d === currentProgramDate) return false // Escludi la data corrente se stiamo modificando
      const date = new Date(d)
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear
    })

    if (otherDatesInMonth.length > 0) {
      const formattedDates = otherDatesInMonth.map((d) => new Date(d).toLocaleDateString('it-IT')).join(', ')
      setMonthlyWarning({
        message: `Questo oratore ha già un discorso questo mese`,
        dates: formattedDates
      })
    } else {
      setMonthlyWarning(null)
    }
  }, [allOccupiedDates, programma])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {programma ? 'Modifica Programma' : 'Nuovo Programma'}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Data (Sab/Dom) *
                </label>
                <input
                  type="date"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base ${
                    dateError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                />
                {dateError && (
                  <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {dateError}
                  </p>
                )}
                {formData.data && isWeekend(formData.data) && !dateError && (
                  <p className="mt-1.5 text-sm text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {new Date(formData.data).getDay() === 0 ? 'Domenica' : 'Sabato'}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Orario *
                </label>
                <input
                  type="time"
                  name="orario"
                  value={formData.orario}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Oratore *
                {profile?.localita && (
                  <span className="text-gray-400 font-normal ml-2">
                    (distanze da {profile.localita})
                  </span>
                )}
              </label>
              {loadingOratori ? (
                <div className="flex items-center gap-2 text-gray-500 py-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-green-600"></div>
                  Caricamento oratori...
                </div>
              ) : (
                <>
                  {selectedOratore ? (
                    <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex justify-between items-center border border-green-100">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-green-900">
                            {selectedOratore.cognome} {selectedOratore.nome}
                          </p>
                          {selectedOratore.distance !== null && selectedOratore.distance !== undefined && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              {formatDistance(selectedOratore.distance)}
                            </span>
                          )}
                        </div>
                        {selectedOratore.congregazione && (
                          <p className="text-sm text-green-700">{selectedOratore.congregazione}</p>
                        )}
                        {selectedOratore.localita && (
                          <p className="text-xs text-green-600 mt-1">{selectedOratore.localita}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, oratoreId: '', discorso: '' }))
                          setSelectedOratore(null)
                          setDateError('')
                          setMonthlyWarning(null)
                        }}
                        className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={searchOratore}
                        onChange={(e) => setSearchOratore(e.target.value)}
                        onFocus={() => setShowOratoriList(true)}
                        placeholder="Cerca o seleziona un oratore..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
                      />

                      {/* Lista oratori - sempre visibile quando il campo ha focus */}
                      {showOratoriList && (
                        <div className="mt-2 border border-gray-200 rounded-xl max-h-64 overflow-y-auto bg-white shadow-lg">
                          {loadingDistances && (
                            <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 flex items-center gap-2">
                              <div className="animate-spin rounded-full h-3 w-3 border border-gray-300 border-t-green-600"></div>
                              Calcolo distanze...
                            </div>
                          )}

                          {/* Oratori disponibili */}
                          {availableOratori.length > 0 && (
                            <>
                              {formData.data && (
                                <div className="px-4 py-2 text-xs font-medium text-green-700 bg-green-50 sticky top-0">
                                  Disponibili per {new Date(formData.data).toLocaleDateString('it-IT')}
                                </div>
                              )}
                              {availableOratori.map((o) => (
                                <button
                                  key={o._id}
                                  type="button"
                                  onClick={() => handleSelectOratore(o)}
                                  className="w-full text-left px-4 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-0"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <span className="font-medium text-gray-900">
                                        {o.cognome} {o.nome}
                                      </span>
                                      {o.congregazione && (
                                        <span className="text-sm text-gray-500 ml-2">({o.congregazione})</span>
                                      )}
                                      {o.localita && (
                                        <p className="text-xs text-gray-400 mt-0.5">{o.localita}</p>
                                      )}
                                    </div>
                                    {o.distance !== null && o.distance !== undefined && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                                        {formatDistance(o.distance)}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </>
                          )}

                          {/* Oratori non disponibili */}
                          {unavailableOratori.length > 0 && formData.data && (
                            <>
                              <div className="px-4 py-2 text-xs font-medium text-orange-700 bg-orange-50 sticky top-0">
                                Non disponibili per questa data
                              </div>
                              {unavailableOratori.map((o) => (
                                <div
                                  key={o._id}
                                  className="w-full text-left px-4 py-3 bg-gray-50 opacity-60 border-b border-gray-100 last:border-0"
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <span className="font-medium text-gray-500">
                                        {o.cognome} {o.nome}
                                      </span>
                                      {o.congregazione && (
                                        <span className="text-sm text-gray-400 ml-2">({o.congregazione})</span>
                                      )}
                                      <p className="text-xs text-orange-500 mt-0.5">
                                        Occupato: {getOccupiedDatesForOratore(o._id).map((d) => new Date(d).toLocaleDateString('it-IT')).join(', ')}
                                      </p>
                                    </div>
                                    {o.distance !== null && o.distance !== undefined && (
                                      <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                                        {formatDistance(o.distance)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </>
                          )}

                          {filteredOratori.length === 0 && (
                            <div className="px-4 py-6 text-center text-gray-500">
                              Nessun oratore trovato
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>

            {/* Warning limite mensile */}
            {monthlyWarning && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-amber-800">{monthlyWarning.message}</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Altre date: {monthlyWarning.dates}
                  </p>
                  <p className="text-xs text-amber-500 mt-1 italic">
                    In linea di massima ogni oratore dovrebbe fare al massimo un discorso al mese.
                  </p>
                </div>
              </div>
            )}

            {selectedOratore && selectedOratore.discorsi && selectedOratore.discorsi.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Discorso *
                </label>
                <select
                  name="discorso"
                  value={formData.discorso}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base appearance-none bg-white"
                >
                  <option value="">Seleziona discorso...</option>
                  {selectedOratore.discorsi.sort((a, b) => a - b).map((num) => (
                    <option key={num} value={num}>
                      {num}. {getDiscorsoTitolo(num)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedOratore && (!selectedOratore.discorsi || selectedOratore.discorsi.length === 0) && (
              <div className="bg-yellow-50 p-4 rounded-xl text-yellow-800 text-sm border border-yellow-100 flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Questo oratore non ha discorsi associati. Aggiungi prima i discorsi nella sezione Oratori.</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Note
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base resize-none"
                placeholder="Note aggiuntive..."
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-5 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-colors"
              >
                Annulla
              </button>
              <button
                type="submit"
                disabled={loading || dateError || !selectedOratore || !formData.discorso}
                className="w-full sm:w-auto px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Salvataggio...
                  </>
                ) : (
                  'Salva'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
