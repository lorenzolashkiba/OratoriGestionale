import { useState, useEffect, useCallback, useMemo } from 'react'
import { oratoriApi, programmiApi } from '../services/api'
import { searchDiscorsi } from '../data/discorsi'

export function useOratori() {
  const [allOratori, setAllOratori] = useState([])
  const [allProgrammi, setAllProgrammi] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    localita: '',
    nome: '',
    cognome: '',
    congregazione: '',
    discorso: '',
  })

  // Filtri da inviare al server (senza discorso che è solo frontend)
  const serverFilters = useMemo(() => {
    const { discorso, ...rest } = filters
    return rest
  }, [filters])

  const fetchOratori = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [oratoriData, programmiData] = await Promise.all([
        oratoriApi.getAll(serverFilters),
        programmiApi.getAllOccupied()
      ])
      setAllOratori(oratoriData)
      setAllProgrammi(programmiData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [serverFilters])

  useEffect(() => {
    fetchOratori()
  }, [fetchOratori])

  // Arricchisci oratori con info sui programmi
  const oratoriWithProgrammi = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Crea mappa oratoreId -> programmi
    const programmiByOratore = {}
    allProgrammi.forEach(p => {
      const oratoreId = p.oratoreId?._id || p.oratoreId
      if (!oratoreId) return
      if (!programmiByOratore[oratoreId]) {
        programmiByOratore[oratoreId] = []
      }
      programmiByOratore[oratoreId].push(p)
    })

    return allOratori.map(oratore => {
      const programmi = programmiByOratore[oratore._id] || []

      // Programmi futuri
      const programmiFuturi = programmi.filter(p => new Date(p.data) >= today)

      // Programmi questo mese (passati o futuri)
      const programmiQuestoMese = programmi.filter(p => {
        const d = new Date(p.data)
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear
      })

      return {
        ...oratore,
        programmiFuturi,
        programmiQuestoMese,
        hasProgrammiFuturi: programmiFuturi.length > 0,
        hasProgrammiQuestoMese: programmiQuestoMese.length > 0
      }
    })
  }, [allOratori, allProgrammi])

  // Filtra per discorso lato client (usa la mappa dei titoli)
  const oratori = useMemo(() => {
    if (!filters.discorso) return oratoriWithProgrammi

    // Trova i numeri di discorsi che matchano la query
    const matchingDiscorsi = searchDiscorsi(filters.discorso)
    const matchingNumbers = new Set(matchingDiscorsi.map(d => d.numero))

    // Filtra oratori che hanno almeno uno dei discorsi matchanti
    return oratoriWithProgrammi.filter(oratore =>
      oratore.discorsi?.some(d => matchingNumbers.has(d))
    )
  }, [oratoriWithProgrammi, filters.discorso])

  const createOratore = async (data) => {
    try {
      const newOratore = await oratoriApi.create(data)
      setAllOratori((prev) => [...prev, newOratore])
      return newOratore
    } catch (err) {
      throw new Error(err.message)
    }
  }

  const updateOratore = async (id, data) => {
    try {
      const updated = await oratoriApi.update(id, data)
      setAllOratori((prev) => prev.map((o) => (o._id === id ? updated : o)))
      return updated
    } catch (err) {
      throw new Error(err.message)
    }
  }

  const deleteOratore = async (id) => {
    try {
      await oratoriApi.delete(id)
      setAllOratori((prev) => prev.filter((o) => o._id !== id))
    } catch (err) {
      throw new Error(err.message)
    }
  }

  return {
    oratori,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchOratori,
    createOratore,
    updateOratore,
    deleteOratore,
  }
}
