import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

export default function DataReviewReminder() {
  const { user, isAuthenticated, needsDataReviewConfirmation, acceptDataReview } = useAuth()
  const { t } = useLanguage()
  const [dismissed, setDismissed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    setDismissed(false)
    setError(null)
    setSubmitting(false)
  }, [user?.uid])

  if (!user || !isAuthenticated || !needsDataReviewConfirmation || dismissed) {
    return null
  }

  const handleAccept = async () => {
    setSubmitting(true)
    setError(null)
    try {
      await acceptDataReview()
      setDismissed(true)
    } catch (err) {
      setError(err.message || t('dataReview.error'))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 sm:p-8">
        <div className="flex items-start gap-3 mb-4">
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-yellow-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86l-7.4 12.83A1 1 0 003.78 18h16.44a1 1 0 00.87-1.31l-7.4-12.83a1 1 0 00-1.74 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{t('dataReview.title')}</h2>
            <p className="text-gray-600 mt-2">{t('dataReview.message')}</p>
            <p className="text-sm text-gray-500 mt-2">{t('dataReview.note')}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            type="button"
            onClick={handleDismiss}
            disabled={submitting}
            className="flex-1 px-5 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 font-medium transition-colors disabled:opacity-50"
          >
            {t('dataReview.notNow')}
          </button>
          <button
            type="button"
            onClick={handleAccept}
            disabled={submitting}
            className="flex-1 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? t('dataReview.accepting') : t('dataReview.accept')}
          </button>
        </div>
      </div>
    </div>
  )
}
