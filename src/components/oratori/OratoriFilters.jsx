import { useState, useEffect } from 'react'
import { searchDiscorsi } from '../../data/discorsi'

export default function OratoriFilters({ filters, onFilterChange }) {
  const [localFilters, setLocalFilters] = useState(filters)
  const [isExpanded, setIsExpanded] = useState(false)

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
    const empty = { localita: '', nome: '', cognome: '', congregazione: '', discorso: '' }
    setLocalFilters(empty)
    onFilterChange(empty)
  }

  const hasFilters = Object.values(localFilters).some((v) => v)
  const activeFiltersCount = Object.values(localFilters).filter((v) => v).length

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
      {/* Header - sempre visibile */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Filtra oratori</h3>
            {activeFiltersCount > 0 && (
              <p className="text-sm text-blue-600">{activeFiltersCount} filtro/i attivo/i</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                clearFilters()
              }}
              className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
            >
              Cancella
            </button>
          )}
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Filtri espandibili */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Nome</label>
              <input
                type="text"
                name="nome"
                value={localFilters.nome}
                onChange={handleChange}
                placeholder="Cerca per nome..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Cognome</label>
              <input
                type="text"
                name="cognome"
                value={localFilters.cognome}
                onChange={handleChange}
                placeholder="Cerca per cognome..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Congregazione</label>
              <input
                type="text"
                name="congregazione"
                value={localFilters.congregazione}
                onChange={handleChange}
                placeholder="Cerca per congregazione..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Localita</label>
              <input
                type="text"
                name="localita"
                value={localFilters.localita}
                onChange={handleChange}
                placeholder="Cerca per localita..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Discorso (numero o tema)</label>
              <input
                type="text"
                name="discorso"
                value={localFilters.discorso || ''}
                onChange={handleChange}
                placeholder="Es: 42 oppure Армагеддон..."
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors"
              />
              <p className="text-xs text-gray-400 mt-1">Cerca per numero o testo nel titolo russo</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
