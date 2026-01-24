import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

export default function CongregazioneHeader({
  nome,
  congregazione,
  oratoriCount,
  isCollapsed,
  onToggle,
  onConfigura,
  onEdit,
}) {
  const { isAdmin, profile } = useAuth()
  const { t } = useLanguage()

  const displayName = nome || t('oratori.noCongregazione')
  const hasConfig = !!congregazione

  // Verifica se l'utente corrente è collegato all'oratore responsabile
  // profile.oratoreId è l'oratore collegato all'utente corrente
  // congregazione.responsabileOratoreId è l'oratore responsabile della congregazione
  const isResponsabile =
    profile?.oratoreId &&
    (congregazione?.responsabileOratoreId?.toString() === profile.oratoreId.toString() ||
      congregazione?.responsabile?._id?.toString() === profile.oratoreId.toString())
  const canEdit = isAdmin || isResponsabile

  return (
    <div className="w-full">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{displayName}</h3>
            <p className="text-sm text-gray-500">
              {oratoriCount} {oratoriCount !== 1 ? t('oratori.oratoriPlural') : t('oratori.oratore')}
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isCollapsed ? '' : 'rotate-180'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Info congregazione (se configurata) */}
      {hasConfig && !isCollapsed && (
        <div className="px-4 py-3 bg-blue-50 border-b border-blue-100">
          <div className="flex flex-col gap-2 text-sm">
            {/* Responsabile */}
            {congregazione.responsabile ? (
              <div className="flex items-center gap-2 flex-wrap">
                <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span className="text-gray-700">
                  <strong>{t('congregazioni.responsabile')}:</strong>{' '}
                  {congregazione.responsabile.cognome} {congregazione.responsabile.nome}
                  {congregazione.responsabile.telefono && (
                    <a
                      href={`tel:${congregazione.responsabile.telefono}`}
                      className="ml-2 text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {congregazione.responsabile.telefono}
                    </a>
                  )}
                  {congregazione.responsabile.email && (
                    <a
                      href={`mailto:${congregazione.responsabile.email}`}
                      className="ml-2 text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {congregazione.responsabile.email}
                    </a>
                  )}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500 italic">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {t('congregazioni.noResponsabile')}
              </div>
            )}

            {/* Orari */}
            {congregazione.orari && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-gray-700">{congregazione.orari}</span>
              </div>
            )}

            {/* Indirizzo */}
            {congregazione.indirizzo && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-gray-700">{congregazione.indirizzo}</span>
              </div>
            )}

            {/* Bottone modifica */}
            {canEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(congregazione)
                }}
                className="self-start mt-1 text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                {t('common.edit')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Link per configurare (solo admin, se non configurata) */}
      {!hasConfig && nome && isAdmin && !isCollapsed && (
        <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onConfigura(nome)
            }}
            className="text-yellow-700 hover:text-yellow-900 font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {t('congregazioni.configura')}
          </button>
        </div>
      )}
    </div>
  )
}
