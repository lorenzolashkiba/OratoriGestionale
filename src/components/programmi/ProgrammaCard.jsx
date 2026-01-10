export default function ProgrammaCard({ programma, onEdit, onDelete }) {
  const formatDate = (date) => {
    const d = new Date(date)
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    return d.toLocaleDateString('it-IT', options)
  }

  const getDayType = (date) => {
    const d = new Date(date)
    const day = d.getDay()
    return day === 0 ? 'Domenica' : day === 6 ? 'Sabato' : ''
  }

  const dayType = getDayType(programma.data)
  const isPast = new Date(programma.data) < new Date().setHours(0, 0, 0, 0)

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow ${isPast ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              dayType === 'Domenica' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
            }`}>
              {dayType}
            </span>
            {isPast && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                Passato
              </span>
            )}
          </div>
          <p className="font-semibold text-gray-900 capitalize">{formatDate(programma.data)}</p>
          <p className="text-gray-600">Ore {programma.orario}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(programma)}
            className="text-blue-600 hover:text-blue-800 p-1"
            title="Modifica"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(programma)}
            className="text-red-600 hover:text-red-800 p-1"
            title="Elimina"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {programma.oratore?.cognome} {programma.oratore?.nome}
            </p>
            {programma.oratore?.congregazione && (
              <p className="text-sm text-gray-500">{programma.oratore.congregazione}</p>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full">
            Discorso n. {programma.discorso}
          </span>
        </div>

        {programma.note && (
          <p className="mt-3 text-sm text-gray-600 italic">
            Note: {programma.note}
          </p>
        )}
      </div>
    </div>
  )
}
