import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'

export default function ProfiloForm({ profile, onSave, loading }) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    telefono: '',
    congregazione: '',
    localita: '',
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        nome: profile.nome || '',
        cognome: profile.cognome || '',
        telefono: profile.telefono || '',
        congregazione: profile.congregazione || '',
        localita: profile.localita || '',
      })
    }
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('profilo.form.nomeLabel')}
          </label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            placeholder={t('profilo.form.nomePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('profilo.form.cognomeLabel')}
          </label>
          <input
            type="text"
            name="cognome"
            value={formData.cognome}
            onChange={handleChange}
            placeholder={t('profilo.form.cognomePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {t('profilo.form.telefonoLabel')}
        </label>
        <input
          type="tel"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          placeholder={t('profilo.form.telefonoPlaceholder')}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('profilo.form.congregazioneLabel')}
          </label>
          <input
            type="text"
            name="congregazione"
            value={formData.congregazione}
            onChange={handleChange}
            placeholder={t('profilo.form.congregazionePlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {t('profilo.form.localitaLabel')}
          </label>
          <input
            type="text"
            name="localita"
            value={formData.localita}
            onChange={handleChange}
            placeholder={t('profilo.form.localitaPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
          />
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              {t('profilo.saving')}
            </>
          ) : (
            t('profilo.saveButton')
          )}
        </button>
      </div>
    </form>
  )
}
