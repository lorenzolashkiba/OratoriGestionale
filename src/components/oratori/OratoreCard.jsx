export default function OratoreCard({ oratore, onEdit, onDelete }) {
  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('it-IT')
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {oratore.cognome} {oratore.nome}
            </h3>
            {oratore.congregazione && (
              <p className="text-sm font-medium text-blue-600 truncate">{oratore.congregazione}</p>
            )}
          </div>
          <div className="flex gap-1 ml-2 shrink-0">
            <button
              onClick={() => onEdit(oratore)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              title="Modifica"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(oratore)}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              title="Elimina"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="space-y-2 text-sm">
          {oratore.localita && (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="truncate">{oratore.localita}</span>
            </div>
          )}
          {oratore.telefono && (
            <a href={`tel:${oratore.telefono}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="truncate">{oratore.telefono}</span>
            </a>
          )}
          {oratore.email && (
            <a href={`mailto:${oratore.email}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="truncate">{oratore.email}</span>
            </a>
          )}
        </div>

        {/* Discorsi */}
        {oratore.discorsi && oratore.discorsi.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Discorsi ({oratore.discorsi.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {oratore.discorsi.sort((a, b) => a - b).slice(0, 12).map((discorso) => (
                <span
                  key={discorso}
                  className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  {discorso}
                </span>
              ))}
              {oratore.discorsi.length > 12 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{oratore.discorsi.length - 12} altri
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
          <span>Creato: {formatDate(oratore.createdAt)}</span>
          <span>Aggiornato: {formatDate(oratore.updatedAt)}</span>
        </div>
      </div>
    </div>
  )
}
