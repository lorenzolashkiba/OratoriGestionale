import { useMemo, useState } from 'react'
import Layout from '../components/layout/Layout'
import { discorsiMap, searchDiscorsi } from '../data/discorsi'
import { useLanguage } from '../context/LanguageContext'

export default function Discorsi() {
  const { t } = useLanguage()
  const [query, setQuery] = useState('')

  const allDiscorsi = useMemo(() => (
    Object.entries(discorsiMap)
      .map(([numero, titolo]) => ({ numero: Number(numero), titolo }))
      .sort((a, b) => a.numero - b.numero)
  ), [])

  const filteredDiscorsi = useMemo(() => {
    if (!query.trim()) return allDiscorsi
    return searchDiscorsi(query).sort((a, b) => a.numero - b.numero)
  }, [allDiscorsi, query])

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('discorsi.title')}</h1>
            <p className="text-gray-500 mt-1">{t('discorsi.subtitle')}</p>
          </div>
          <div className="w-full sm:max-w-xs">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('discorsi.searchPlaceholder')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <span>
              {t('discorsi.totalPrefix')} {filteredDiscorsi.length} {t('discorsi.totalSuffix')} {allDiscorsi.length}
            </span>
            {query.trim() && (
              <button
                onClick={() => setQuery('')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {t('discorsi.clearSearch')}
              </button>
            )}
          </div>

          {filteredDiscorsi.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {t('discorsi.noResults')}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredDiscorsi.map((discorso) => (
                <div key={discorso.numero} className="py-3 flex gap-4">
                  <div className="w-10 text-right font-semibold text-gray-700">{discorso.numero}</div>
                  <div className="flex-1 text-gray-800">{discorso.titolo}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
