export default function ProgrammaCard({ programma, onEdit, onDelete }) {
  const formatDate = (date) => {
    const d = new Date(date)
    const options = { weekday: 'long', day: 'numeric', month: 'long' }
    return d.toLocaleDateString('it-IT', options)
  }

  const getDayType = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    return day === 0 ? 'Domenica' : day === 6 ? 'Sabato' : ''
  }

  const dayType = getDayType(programma.data)
  const isPast = new Date(programma.data) < new Date().setHours(0, 0, 0, 0)
  const isSunday = dayType === 'Domenica'

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 ${isPast ? 'opacity-60' : ''}`}>
      {/* Header con data */}
      <div className={`px-4 py-3 ${isSunday ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-green-500 to-emerald-600'} text-white`}>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20">
                {dayType}
              </span>
              {isPast && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/20">
                  Passato
                </span>
              )}
            </div>
            <p className="font-bold text-lg capitalize">{formatDate(programma.data)}</p>
            <p className="text-white/80 text-sm">Ore {programma.orario}</p>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(programma)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              title="Modifica"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(programma)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
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
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl ${isSunday ? 'bg-blue-100' : 'bg-green-100'}`}>
            <svg className={`w-6 h-6 ${isSunday ? 'text-blue-600' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-gray-900 truncate">
              {programma.oratore?.cognome} {programma.oratore?.nome}
            </p>
            {programma.oratore?.congregazione && (
              <p className="text-sm text-gray-500 truncate">{programma.oratore.congregazione}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="bg-purple-100 text-purple-700 text-sm font-medium px-3 py-1.5 rounded-full">
            Discorso n. {programma.discorso}
          </span>
        </div>

        {programma.note && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Note:</span> {programma.note}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
