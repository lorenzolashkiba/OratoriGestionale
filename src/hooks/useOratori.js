import { useState, useEffect, useCallback } from 'react'
import { oratoriApi } from '../services/api'

export function useOratori() {
  const [oratori, setOratori] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    localita: '',
    nome: '',
    cognome: '',
    congregazione: '',
  })

  const fetchOratori = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await oratoriApi.getAll(filters)
      setOratori(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchOratori()
  }, [fetchOratori])

  const createOratore = async (data) => {
    try {
      const newOratore = await oratoriApi.create(data)
      setOratori((prev) => [...prev, newOratore])
      return newOratore
    } catch (err) {
      throw new Error(err.message)
    }
  }

  const updateOratore = async (id, data) => {
    try {
      const updated = await oratoriApi.update(id, data)
      setOratori((prev) => prev.map((o) => (o._id === id ? updated : o)))
      return updated
    } catch (err) {
      throw new Error(err.message)
    }
  }

  const deleteOratore = async (id) => {
    try {
      await oratoriApi.delete(id)
      setOratori((prev) => prev.filter((o) => o._id !== id))
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
