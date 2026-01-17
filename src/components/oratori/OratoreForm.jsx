import { useState, useEffect } from 'react'
import { getDiscorsoTitolo } from '../../data/discorsi'
import { useLanguage } from '../../context/LanguageContext'

export default function OratoreForm({ oratore, onSave, onCancel, loading }) {
  const { t } = useLanguage()
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">
            {oratore ? t('oratori.editOratore') : t('oratori.newOratore')}
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
                  {t('oratori.nome')} *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('oratori.cognome')} *
                </label>
                <input
                  type="text"
                  name="cognome"
                  value={formData.cognome}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('oratori.email')}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="esempio@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('oratori.telefono')}
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="+39..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('oratori.congregazione')}
                </label>
                <input
                  type="text"
                  name="congregazione"
                  value={formData.congregazione}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('oratori.localita')}
                </label>
                <input
                  type="text"
                  name="localita"
                  value={formData.localita}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('oratori.discorsiRange')}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="194"
                  value={discorsoInput}
                  onChange={(e) => setDiscorsoInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDiscorso())}
                  placeholder={t('oratori.discorsoNum')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
                <button
                  type="button"
                  onClick={addDiscorso}
                  className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors font-medium shrink-0"
                >
                  {t('common.add')}
                </button>
              </div>
              {formData.discorsi.length > 0 && (
                <div className="mt-3 space-y-2">
                  {formData.discorsi.map((num) => (
                    <div
                      key={num}
                      className="bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 flex items-start justify-between gap-2"
                    >
                      <div className="flex items-start gap-2 min-w-0">
                        <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                          {num}
                        </span>
                        <span className="text-sm text-gray-700 leading-tight">
                          {getDiscorsoTitolo(num)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDiscorso(num)}
                        className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {formData.discorsi.length > 0 && (
                <p className="mt-2 text-xs text-gray-500">{formData.discorsi.length} {t('oratori.discorsiSelected')}</p>
              )}
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
              <button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-5 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {t('common.loading')}
                  </>
                ) : (
                  t('common.save')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
