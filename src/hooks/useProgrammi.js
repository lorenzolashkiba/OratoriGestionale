import { useState, useEffect, useCallback } from 'react'
import { programmiApi } from '../services/api'

export function useProgrammi() {
  const [programmi, setProgrammi] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProgrammi = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await programmiApi.getAll()
      setProgrammi(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProgrammi()
  }, [fetchProgrammi])

  const getOccupiedDates = async (oratoreId) => {
    try {
      return await programmiApi.getOccupiedDates(oratoreId)
    } catch (err) {
      console.error('Errore nel recupero date occupate:', err)
      return []
    }
  }

  const createProgramma = async (data) => {
    try {
      const newProgramma = await programmiApi.create(data)
      setProgrammi((prev) => [...prev, newProgramma].sort((a, b) => new Date(a.data) - new Date(b.data)))
      return newProgramma
    } catch (err) {
      throw new Error(err.message)
    }
  }

  const updateProgramma = async (id, data) => {
    try {
      const updated = await programmiApi.update(id, data)
      setProgrammi((prev) =>
        prev.map((p) => (p._id === id ? updated : p))
          .sort((a, b) => new Date(a.data) - new Date(b.data))
      )
      return updated
    } catch (err) {
      throw new Error(err.message)
    }
  }

  const deleteProgramma = async (id) => {
    try {
      await programmiApi.delete(id)
      setProgrammi((prev) => prev.filter((p) => p._id !== id))
    } catch (err) {
      throw new Error(err.message)
    }
  }

  return {
    programmi,
    loading,
    error,
    refetch: fetchProgrammi,
    getOccupiedDates,
    createProgramma,
    updateProgramma,
    deleteProgramma,
  }
}
