import { useState } from 'react'
import { getDiscorsoTitolo } from '../../data/discorsi'

export default function OratoreCard({ oratore, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('it-IT')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Header compatto - sempre visibile */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Avatar */}
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-semibold text-sm">
            {oratore.cognome?.charAt(0)}{oratore.nome?.charAt(0)}
          </span>
        </div>

        {/* Info principale */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {oratore.cognome} {oratore.nome}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {oratore.congregazione && (
              <span className="truncate">{oratore.congregazione}</span>
            )}
            {oratore.congregazione && oratore.localita && (
              <span className="text-gray-300">•</span>
            )}
            {oratore.localita && (
              <span className="truncate">{oratore.localita}</span>
            )}
          </div>
        </div>

        {/* Badge stato programmi */}
        <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
          {/* Badge programma futuro */}
          {oratore.hasProgrammiFuturi && (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 rounded-full" title="Ha programmi futuri">
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium text-green-700">{oratore.programmiFuturi.length}</span>
            </div>
          )}
          {/* Badge questo mese */}
          {oratore.hasProgrammiQuestoMese && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-50 border border-amber-200 rounded-full" title="Ha fatto discorso questo mese">
              <svg className="w-3.5 h-3.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-medium text-amber-700">Mese</span>
            </div>
          )}
          {/* Contatore discorsi */}
          {oratore.discorsi && oratore.discorsi.length > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="text-sm font-medium text-blue-700">{oratore.discorsi.length}</span>
            </div>
          )}
        </div>

        {/* Azioni rapide */}
        <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onEdit(oratore)}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifica"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(oratore)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Elimina"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        {/* Chevron espansione */}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dettagli espansi */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50/50">
          <div className="grid gap-3 sm:grid-cols-2">
            {/* Contatti */}
            <div className="space-y-2">
              {oratore.telefono && (
                <a href={`tel:${oratore.telefono}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{oratore.telefono}</span>
                </a>
              )}
              {oratore.email && (
                <a href={`mailto:${oratore.email}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{oratore.email}</span>
                </a>
              )}
              {oratore.localita && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{oratore.localita}</span>
                </div>
              )}
              {!oratore.telefono && !oratore.email && !oratore.localita && (
                <p className="text-sm text-gray-400 italic">Nessun contatto disponibile</p>
              )}
            </div>

            {/* Date */}
            <div className="text-xs text-gray-400 space-y-1 sm:text-right">
              <p>Creato: {formatDate(oratore.createdAt)}</p>
              <p>Aggiornato: {formatDate(oratore.updatedAt)}</p>
              {oratore.createdByName && (
                <p>Da: {oratore.createdByName}</p>
              )}
            </div>
          </div>

          {/* Programmi futuri */}
          {oratore.programmiFuturi && oratore.programmiFuturi.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Programmi futuri ({oratore.programmiFuturi.length})
              </p>
              <div className="space-y-1.5">
                {oratore.programmiFuturi
                  .sort((a, b) => new Date(a.data) - new Date(b.data))
                  .map((p) => (
                    <div key={p._id} className="flex items-center gap-2 text-xs bg-green-50 border border-green-100 rounded-lg px-2.5 py-1.5">
                      <span className="font-semibold text-green-700">
                        {new Date(p.data).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      {p.discorso && (
                        <>
                          <span className="text-green-300">•</span>
                          <span className="text-green-600 truncate">
                            {p.discorso}. {getDiscorsoTitolo(p.discorso)}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Programmi questo mese */}
          {oratore.programmiQuestoMese && oratore.programmiQuestoMese.length > 0 && !oratore.programmiFuturi?.some(pf => oratore.programmiQuestoMese.some(pm => pm._id === pf._id)) && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Questo mese
              </p>
              <div className="space-y-1.5">
                {oratore.programmiQuestoMese
                  .filter(pm => !oratore.programmiFuturi?.some(pf => pf._id === pm._id))
                  .sort((a, b) => new Date(a.data) - new Date(b.data))
                  .map((p) => (
                    <div key={p._id} className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
                      <span className="font-semibold text-amber-700">
                        {new Date(p.data).toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      {p.discorso && (
                        <>
                          <span className="text-amber-300">•</span>
                          <span className="text-amber-600 truncate">
                            {p.discorso}. {getDiscorsoTitolo(p.discorso)}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Discorsi */}
          {oratore.discorsi && oratore.discorsi.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Discorsi ({oratore.discorsi.length})
              </p>
              <div className="space-y-1.5">
                {oratore.discorsi.sort((a, b) => a - b).map((discorso) => (
                  <div
                    key={discorso}
                    className="flex items-start gap-2 text-sm"
                  >
                    <span className="bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full text-xs min-w-[2rem] text-center">
                      {discorso}
                    </span>
                    <span className="text-gray-600 text-xs leading-relaxed">
                      {getDiscorsoTitolo(discorso)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
