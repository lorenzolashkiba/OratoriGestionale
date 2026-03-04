import { useState, useMemo, useEffect } from 'react'
import Layout from '../components/layout/Layout'
import OratoreCard from '../components/oratori/OratoreCard'
import OratoreForm from '../components/oratori/OratoreForm'
import OratoriFilters from '../components/oratori/OratoriFilters'
import CongregazioneHeader from '../components/congregazioni/CongregazioneHeader'
import CongregazioneForm from '../components/congregazioni/CongregazioneForm'
import { useOratori } from '../hooks/useOratori'
import { useCongregazioni } from '../hooks/useCongregazioni'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { oratoriApi } from '../services/api'
import { getDiscorsoTitolo, isDiscorsoDisponibile } from '../data/discorsi'

const PDF_FONT_FAMILY = 'NotoSans'
const PDF_FONT_REGULAR_FILE = 'NotoSans-Regular.ttf'
const PDF_FONT_BOLD_FILE = 'NotoSans-Bold.ttf'
const PDF_FONT_LOAD_ERROR = 'PDF_FONT_LOAD_ERROR'
let cachedPdfFontBase64 = null

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer)
  const chunkSize = 0x8000
  let binary = ''

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return btoa(binary)
}

async function loadPdfFontBase64() {
  if (cachedPdfFontBase64) return cachedPdfFontBase64

  const [regularResponse, boldResponse] = await Promise.all([
    fetch('/fonts/NotoSans-Regular.ttf'),
    fetch('/fonts/NotoSans-Bold.ttf'),
  ])

  if (!regularResponse.ok || !boldResponse.ok) {
    throw new Error(PDF_FONT_LOAD_ERROR)
  }

  const [regularBuffer, boldBuffer] = await Promise.all([
    regularResponse.arrayBuffer(),
    boldResponse.arrayBuffer(),
  ])

  cachedPdfFontBase64 = {
    regular: arrayBufferToBase64(regularBuffer),
    bold: arrayBufferToBase64(boldBuffer),
  }

  return cachedPdfFontBase64
}

async function registerPdfFonts(doc) {
  const fontData = await loadPdfFontBase64()

  doc.addFileToVFS(PDF_FONT_REGULAR_FILE, fontData.regular)
  doc.addFont(PDF_FONT_REGULAR_FILE, PDF_FONT_FAMILY, 'normal', 'Identity-H')
  doc.addFileToVFS(PDF_FONT_BOLD_FILE, fontData.bold)
  doc.addFont(PDF_FONT_BOLD_FILE, PDF_FONT_FAMILY, 'bold', 'Identity-H')
}

export default function Oratori() {
  const { t, language } = useLanguage()
  const { showToast } = useToast()
  const { profile, isAdmin } = useAuth()
  const {
    oratori,
    loading,
    error,
    filters,
    setFilters,
    createOratore,
    updateOratore,
    deleteOratore,
  } = useOratori()

  const {
    congregazioniMap,
    createCongregazione,
    updateCongregazione,
  } = useCongregazioni()

  const [showForm, setShowForm] = useState(false)
  const [editingOratore, setEditingOratore] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [collapsedSections, setCollapsedSections] = useState({})

  // Stato per form congregazione
  const [showCongForm, setShowCongForm] = useState(false)
  const [editingCongregazione, setEditingCongregazione] = useState(null)
  const [configuringCongNome, setConfiguringCongNome] = useState(null)
  const [savingCong, setSavingCong] = useState(false)
  const [exportingPdfCongKey, setExportingPdfCongKey] = useState(null)

  // Raggruppa oratori per congregazione (normalizzato: trim + lowercase per raggruppamento)
  const hasActiveFilters = useMemo(() => Object.values(filters).some((value) => value), [filters])

  const { groupedOratori, sortedCongregazioni, congregazioneDisplayNames } = useMemo(() => {
    const grouped = {}
    const displayNames = {} // Mappa da chiave normalizzata a nome originale più comune

    oratori.forEach((oratore) => {
      const original = oratore.congregazione || ''
      const normalized = original.trim().toLowerCase()

      if (!grouped[normalized]) {
        grouped[normalized] = []
        displayNames[normalized] = original.trim() || ''
      }
      grouped[normalized].push(oratore)

      // Usa il nome con più occorrenze come display name
      // (in caso di "Venezia" vs "venezia", usa quello più frequente)
    })

    // Ordina congregazioni alfabeticamente, '' alla fine
    const sorted = Object.keys(grouped).sort((a, b) => {
      if (a === '') return 1
      if (b === '') return -1
      return a.localeCompare(b)
    })

    const userCongregazione = (profile?.congregazione || '').trim()
    const userCongregazioneKey = userCongregazione ? userCongregazione.toLowerCase() : ''
    let ordered = sorted

    if (!hasActiveFilters && userCongregazioneKey && grouped[userCongregazioneKey]) {
      ordered = [
        userCongregazioneKey,
        ...sorted.filter((key) => key !== userCongregazioneKey),
      ]
    }

    return { groupedOratori: grouped, sortedCongregazioni: ordered, congregazioneDisplayNames: displayNames }
  }, [oratori, hasActiveFilters, profile?.congregazione])

  // Imposta tutte le sezioni come collassate di default quando cambiano le congregazioni
  useEffect(() => {
    if (sortedCongregazioni.length > 0) {
      setCollapsedSections((prev) => {
        const newState = { ...prev }
        sortedCongregazioni.forEach((congKey) => {
          // Solo se non è già stato impostato manualmente dall'utente
          if (newState[congKey] === undefined) {
            newState[congKey] = true // Collassato di default
          }
        })
        return newState
      })
    }
  }, [sortedCongregazioni])

  const toggleSection = (cong) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [cong]: !prev[cong],
    }))
  }

  const handleCreate = () => {
    setEditingOratore(null)
    setShowForm(true)
  }

  const handleEdit = (oratore) => {
    setEditingOratore(oratore)
    setShowForm(true)
  }

  const handleDelete = (oratore) => {
    setDeleteConfirm(oratore)
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deleteOratore(deleteConfirm._id)
      setDeleteConfirm(null)
      showToast({ type: 'success', message: t('toast.oratoreDeleted') })
    } catch (err) {
      showToast({ type: 'error', message: `${t('toast.deleteError')}: ${mapOratoreDeleteErrorMessage(err.message)}` })
    }
  }

  const handleSave = async (data) => {
    setSaving(true)
    try {
      if (editingOratore) {
        await updateOratore(editingOratore._id, data)
      } else {
        await createOratore(data)
      }
      setShowForm(false)
      setEditingOratore(null)
      showToast({ type: 'success', message: t('toast.oratoreSaved') })
    } catch (err) {
      showToast({ type: 'error', message: `${t('toast.saveError')}: ${mapOratoreErrorMessage(err.message)}` })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingOratore(null)
  }

  // Handler per congregazioni
  const handleConfiguraCongregazione = (nome) => {
    setConfiguringCongNome(nome)
    setEditingCongregazione(null)
    setShowCongForm(true)
  }

  const handleEditCongregazione = (congregazione) => {
    setEditingCongregazione(congregazione)
    setConfiguringCongNome(null)
    setShowCongForm(true)
  }

  const PERMISSION_ERROR_IT = 'Per modificare questi dati devi fare parte di questa congregazione'
  const LEGACY_PERMISSION_ERROR_IT = 'Non hai i permessi per modificare questa congregazione'
  const ORATORE_PERMISSION_ERROR_IT = 'Per modificare questo oratore devi fare parte di questa congregazione'

  const mapCongregazioneErrorMessage = (message) => {
    if (!message) return message
    const normalized = message.trim()
    if (normalized === PERMISSION_ERROR_IT || normalized === LEGACY_PERMISSION_ERROR_IT) {
      return t('errors.congregazionePermission')
    }
    return message
  }

  const mapOratoreErrorMessage = (message) => {
    if (!message) return message
    const normalized = message.trim()
    if (normalized === ORATORE_PERMISSION_ERROR_IT) {
      return t('errors.oratorePermission')
    }
    return message
  }

  const mapOratoreDeleteErrorMessage = (message) => {
    if (!message) return message
    const normalized = message.trim()
    if (normalized === 'Per eliminare questo oratore devi fare parte di questa congregazione') {
      return t('errors.oratoreDeletePermission')
    }
    return message
  }

  const handleSaveCongregazione = async (data) => {
    setSavingCong(true)
    try {
      if (editingCongregazione) {
        await updateCongregazione(editingCongregazione._id, data)
      } else {
        await createCongregazione(data)
      }
      setShowCongForm(false)
      setEditingCongregazione(null)
      setConfiguringCongNome(null)
      showToast({ type: 'success', message: t('toast.congregazioneSaved') })
    } catch (err) {
      showToast({ type: 'error', message: `${t('toast.saveError')}: ${mapCongregazioneErrorMessage(err.message)}` })
    } finally {
      setSavingCong(false)
    }
  }

  const handleCancelCongregazione = () => {
    setShowCongForm(false)
    setEditingCongregazione(null)
    setConfiguringCongNome(null)
  }

  const normalizeCongregazione = (value) => (value || '').trim().replace(/\s+/g, ' ').toLowerCase()

  const createCongregazionePdf = async (PdfClass, congregazioneNome, congregazioneOratori) => {
    const doc = new PdfClass({ unit: 'pt', format: 'a4' })
    await registerPdfFonts(doc)

    const margin = 40
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const maxWidth = pageWidth - (margin * 2)
    const locale = language === 'ru' ? 'ru-RU' : 'it-IT'
    let y = margin

    const ensureSpace = (neededHeight = 16) => {
      if (y + neededHeight <= pageHeight - margin) return
      doc.addPage()
      y = margin
    }

    const addWrappedText = (text, options = {}) => {
      if (!text) return

      const { fontSize = 11, style = 'normal', indent = 0, spacingAfter = 4 } = options
      doc.setFont(PDF_FONT_FAMILY, style)
      doc.setFontSize(fontSize)

      const lines = doc.splitTextToSize(String(text), maxWidth - indent)
      const lineHeight = fontSize + 3

      ensureSpace((lines.length * lineHeight) + spacingAfter)
      lines.forEach((line) => {
        doc.text(line, margin + indent, y)
        y += lineHeight
      })
      y += spacingAfter
    }

    addWrappedText(`${t('oratori.pdfDocumentTitle')}: ${congregazioneNome}`, {
      fontSize: 16,
      style: 'bold',
      spacingAfter: 8,
    })
    addWrappedText(`${t('oratori.pdfGeneratedAt')}: ${new Date().toLocaleString(locale)}`, {
      fontSize: 10,
      spacingAfter: 12,
    })

    congregazioneOratori.forEach((oratore, index) => {
      const nomeCompleto = `${oratore.cognome || ''} ${oratore.nome || ''}`.trim()
      const discorsi = (oratore.discorsi || [])
        .filter(isDiscorsoDisponibile)
        .sort((a, b) => a - b)
      const discorsiConTitolo = discorsi.map((numero) => `${numero}. ${getDiscorsoTitolo(numero)}`)

      const contacts = []
      if (oratore.telefono) contacts.push(`${t('oratori.telefono')}: ${oratore.telefono}`)
      if (oratore.email) contacts.push(`${t('oratori.email')}: ${oratore.email}`)
      if (oratore.localita) contacts.push(`${t('oratori.localita')}: ${oratore.localita}`)

      ensureSpace(70)
      addWrappedText(`${index + 1}. ${nomeCompleto}`, {
        fontSize: 12,
        style: 'bold',
        spacingAfter: 2,
      })
      addWrappedText(`${t('oratori.pdfContacts')}: ${contacts.length > 0 ? contacts.join(' | ') : t('oratori.noContatti')}`, {
        indent: 14,
        spacingAfter: 3,
      })
      if (discorsiConTitolo.length > 0) {
        addWrappedText(`${t('oratori.pdfDiscorsi')}:`, {
          indent: 14,
          spacingAfter: 2,
        })
        discorsiConTitolo.forEach((discorso) => {
          addWrappedText(`- ${discorso}`, {
            indent: 24,
            spacingAfter: 1,
          })
        })
        y += 4
      } else {
        addWrappedText(`${t('oratori.pdfDiscorsi')}: ${t('oratori.pdfNoDiscorsi')}`, {
          indent: 14,
          spacingAfter: 8,
        })
      }

      ensureSpace(8)
      doc.setDrawColor(230, 230, 230)
      doc.line(margin, y, pageWidth - margin, y)
      y += 10
    })

    const safeCongregazione = normalizeCongregazione(congregazioneNome)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'congregazione'
    const dateStamp = new Date().toISOString().slice(0, 10)
    const filePrefix = language === 'ru' ? 'oratori-ru' : 'oratori'

    doc.save(`${filePrefix}-${safeCongregazione}-${dateStamp}.pdf`)
  }

  const handlePrintCongregazionePdf = async (congregazioneNome, congregationKey = null) => {
    const targetCongregazione = (congregazioneNome || '').trim()
    if (!targetCongregazione) {
      showToast({ type: 'warning', message: t('oratori.pdfMissingCongregazione') })
      return
    }

    const targetKey = congregationKey || normalizeCongregazione(targetCongregazione)
    setExportingPdfCongKey(targetKey)
    try {
      const fetchedOratori = await oratoriApi.getAll({ congregazione: targetCongregazione })
      const normalizedTarget = normalizeCongregazione(targetCongregazione)
      const congregazioneOratori = fetchedOratori
        .filter((oratore) => normalizeCongregazione(oratore.congregazione) === normalizedTarget)
        .sort((a, b) => {
          const cognomeCompare = (a.cognome || '').localeCompare(b.cognome || '')
          if (cognomeCompare !== 0) return cognomeCompare
          return (a.nome || '').localeCompare(b.nome || '')
        })

      if (congregazioneOratori.length === 0) {
        showToast({ type: 'warning', message: t('oratori.pdfNoOratoriToExport') })
        return
      }

      const { jsPDF } = await import('jspdf')
      await createCongregazionePdf(jsPDF, targetCongregazione, congregazioneOratori)
      showToast({ type: 'success', message: t('toast.exportSuccess') })
    } catch (err) {
      const mappedMessage = err.message === PDF_FONT_LOAD_ERROR
        ? t('oratori.pdfFontLoadError')
        : err.message
      showToast({ type: 'error', message: `${t('toast.exportError')}: ${mappedMessage}` })
    } finally {
      setExportingPdfCongKey(null)
    }
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('oratori.title')}</h1>
          <p className="text-gray-500 mt-1">{t('oratori.subtitle')}</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm w-full sm:w-auto"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('oratori.newOratore')}
        </button>
      </div>

      <OratoriFilters filters={filters} onFilterChange={setFilters} />

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
          <p className="text-gray-500">{t('common.loading')}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('common.error')}: {error}
        </div>
      )}

      {!loading && !error && oratori.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('oratori.noOratori')}</h3>
          <p className="text-gray-500 mb-4">{t('oratori.startAdding')}</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {t('oratori.addOratore')}
          </button>
        </div>
      )}

      {!loading && !error && oratori.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              <span className="font-medium text-gray-700">{oratori.length}</span> {oratori.length !== 1 ? t('oratori.oratoriPlural') : t('oratori.oratore')} {oratori.length !== 1 ? t('oratori.foundPlural') : t('oratori.found')}
            </p>
          </div>

          {/* Lista congregazioni con oratori */}
          <div className="space-y-4">
            {sortedCongregazioni.map((congKey) => {
              const displayName = congregazioneDisplayNames[congKey]
              const congregazioneOratori = groupedOratori[congKey]
              const congregazioneData = congKey ? congregazioniMap[congKey] : null
              const isCollapsed = collapsedSections[congKey] !== false // Default collassato
              const userCongregazioneKey = (profile?.congregazione || '').trim().toLowerCase()
              const isUserCongregazione = !!userCongregazioneKey && congKey === userCongregazioneKey
              const canPrintPdf = Boolean(congKey) && (isAdmin || isUserCongregazione)
              const pdfTargetCongregazione = displayName

              return (
                <div
                  key={congKey || '_no_cong'}
                  className={`bg-white rounded-xl border overflow-hidden ${
                    isUserCongregazione ? 'border-blue-200 ring-2 ring-blue-100' : 'border-gray-200'
                  }`}
                >
                  <CongregazioneHeader
                    nome={displayName}
                    congregazione={congregazioneData}
                    oratoriCount={congregazioneOratori.length}
                    isCollapsed={isCollapsed}
                    isUserCongregazione={isUserCongregazione}
                    onPrintPdf={canPrintPdf ? () => handlePrintCongregazionePdf(pdfTargetCongregazione, congKey) : null}
                    isPrintingPdf={canPrintPdf ? exportingPdfCongKey === congKey : false}
                    onToggle={() => toggleSection(congKey)}
                    onConfigura={handleConfiguraCongregazione}
                    onEdit={handleEditCongregazione}
                  />

                  {/* Lista oratori (solo se non collassato) */}
                  {!isCollapsed && (
                    <div>
                      {congregazioneOratori.map((oratore, index) => (
                        <div
                          key={oratore._id}
                          className={`border-t border-gray-100 ${index === congregazioneOratori.length - 1 ? '' : ''}`}
                        >
                          <OratoreCard
                            oratore={oratore}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            grouped
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {showForm && (
        <OratoreForm
          oratore={editingOratore}
          onSave={handleSave}
          onCancel={handleCancel}
          loading={saving}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{t('oratori.confirmDelete')}</h3>
            </div>
            <p className="text-gray-600 mb-2">
              {t('oratori.deleteMessage')}{' '}
              <strong>{deleteConfirm.cognome} {deleteConfirm.nome}</strong>?
            </p>
            <p className="text-sm text-red-600 mb-6">
              {t('oratori.deleteWarning')}
            </p>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="w-full sm:w-auto px-5 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCongForm && (
        <CongregazioneForm
          congregazione={editingCongregazione}
          initialNome={configuringCongNome}
          onSave={handleSaveCongregazione}
          onCancel={handleCancelCongregazione}
          loading={savingCong}
        />
      )}
    </Layout>
  )
}
