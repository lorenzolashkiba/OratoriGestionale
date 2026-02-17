import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import { congregazioniApi } from '../../services/api'

export default function CongregazioneForm({ congregazione, initialNome, onSave, onCancel, loading }) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    nome: '',
    responsabileId: '',
    orari: '',
    indirizzo: '',
  })
  const [responsabili, setResponsabili] = useState([])
  const [loadingResponsabili, setLoadingResponsabili] = useState(true)

  // Determina il nome della congregazione per filtrare (usa initialNome per nuove, congregazione.nome per modifica)
  const congregazioneNomePerFiltro = initialNome || congregazione?.nome

  useEffect(() => {
    const responsabileIdFromCongregazione = congregazione?.responsabileUserId
      ? `user:${congregazione.responsabileUserId.toString()}`
      : congregazione?.responsabileOratoreId
        ? `oratore:${congregazione.responsabileOratoreId.toString()}`
        : congregazione?.responsabile?._id
          ? `${congregazione.responsabile.source === 'user' ? 'user' : 'oratore'}:${congregazione.responsabile._id.toString()}`
          : ''

    if (congregazione) {
      setFormData({
        nome: congregazione.nome || '',
        responsabileId: responsabileIdFromCongregazione,
        orari: congregazione.orari || '',
        indirizzo: congregazione.indirizzo || '',
      })
    } else if (initialNome) {
      setFormData((prev) => ({ ...prev, nome: initialNome }))
    }
  }, [congregazione, initialNome])

  useEffect(() => {
    const loadResponsabili = async () => {
      if (!congregazioneNomePerFiltro) {
        setResponsabili([])
        setLoadingResponsabili(false)
        return
      }

      try {
        setLoadingResponsabili(true)
        const allResponsabili = await congregazioniApi.getResponsabiliByNome(congregazioneNomePerFiltro)
        setResponsabili(allResponsabili)
      } catch (err) {
        console.error('Errore caricamento responsabili:', err)
      } finally {
        setLoadingResponsabili(false)
      }
    }
    loadResponsabili()
  }, [congregazioneNomePerFiltro])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  // Se modifica e non admin, non permettere cambio nome/responsabile
  const isEditing = !!congregazione
  const canEditNomeResponsabile = true

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">
            {congregazione ? t('congregazioni.edit') : t('congregazioni.new')}
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
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('congregazioni.nome')} *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                disabled={isEditing && !canEditNomeResponsabile}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>

            {/* Responsabile (Oratore) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('congregazioni.responsabile')} *
              </label>
              {loadingResponsabili ? (
                <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500">
                  {t('common.loading')}
                </div>
              ) : (
                <select
                  name="responsabileId"
                  value={formData.responsabileId}
                  onChange={handleChange}
                  disabled={isEditing && !canEditNomeResponsabile}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="">{t('congregazioni.selectResponsabile')}</option>
                  {responsabili.map((responsabile) => (
                    <option key={responsabile.id} value={responsabile.id}>
                      {(responsabile.cognome || '').trim()} {(responsabile.nome || '').trim()}
                      {responsabile.type === 'user' ? ' (Utente)' : ' (Oratore)'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Orari */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('congregazioni.orari')}
              </label>
              <p className="text-xs text-gray-500 mb-2">{t('congregazioni.orariHelp')}</p>
              <input
                type="text"
                name="orari"
                value={formData.orari}
                onChange={handleChange}
                placeholder="Es: Sab 17:00 / Dom 10:00"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>

            {/* Indirizzo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {t('congregazioni.indirizzo')}
              </label>
              <input
                type="text"
                name="indirizzo"
                value={formData.indirizzo}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              />
            </div>

            {/* Bottoni */}
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
