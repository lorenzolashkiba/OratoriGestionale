import { useState, useEffect, useCallback, useMemo } from 'react'
import { congregazioniApi } from '../services/api'

export function useCongregazioni() {
  const [congregazioni, setCongregazioni] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCongregazioni = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await congregazioniApi.getAll()
      setCongregazioni(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCongregazioni()
  }, [fetchCongregazioni])

  const createCongregazione = async (data) => {
    const newCong = await congregazioniApi.create(data)
    setCongregazioni((prev) => [...prev, newCong].sort((a, b) => a.nome.localeCompare(b.nome)))
    return newCong
  }

  const updateCongregazione = async (id, data) => {
    const updated = await congregazioniApi.update(id, data)
    setCongregazioni((prev) => prev.map((c) => (c._id === id ? updated : c)))
    return updated
  }

  const deleteCongregazione = async (id) => {
    await congregazioniApi.delete(id)
    setCongregazioni((prev) => prev.filter((c) => c._id !== id))
  }

  // Mappa nome (lowercase) -> congregazione per lookup veloce
  const congregazioniMap = useMemo(() => {
    return congregazioni.reduce((acc, c) => {
      acc[c.nome.toLowerCase()] = c
      return acc
    }, {})
  }, [congregazioni])

  return {
    congregazioni,
    congregazioniMap,
    loading,
    error,
    refetch: fetchCongregazioni,
    createCongregazione,
    updateCongregazione,
    deleteCongregazione,
  }
}
