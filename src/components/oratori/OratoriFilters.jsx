import { useState, useEffect } from 'react'

export default function OratoriFilters({ filters, onFilterChange }) {
  const [localFilters, setLocalFilters] = useState(filters)

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(localFilters)
    }, 300)
    return () => clearTimeout(timer)
  }, [localFilters, onFilterChange])

  const handleChange = (e) => {
    const { name, value } = e.target
    setLocalFilters((prev) => ({ ...prev, [name]: value }))
  }

  const clearFilters = () => {
    const empty = { localita: '', nome: '', cognome: '', congregazione: '' }
    setLocalFilters(empty)
    onFilterChange(empty)
  }

  const hasFilters = Object.values(localFilters).some((v) => v)

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-700">Filtra oratori</h3>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Cancella filtri
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Nome</label>
          <input
            type="text"
            name="nome"
            value={localFilters.nome}
            onChange={handleChange}
            placeholder="Cerca per nome..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Cognome</label>
          <input
            type="text"
            name="cognome"
            value={localFilters.cognome}
            onChange={handleChange}
            placeholder="Cerca per cognome..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Congregazione</label>
          <input
            type="text"
            name="congregazione"
            value={localFilters.congregazione}
            onChange={handleChange}
            placeholder="Cerca per congregazione..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Localita</label>
          <input
            type="text"
            name="localita"
            value={localFilters.localita}
            onChange={handleChange}
            placeholder="Cerca per localita..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div>
    </div>
  )
}
