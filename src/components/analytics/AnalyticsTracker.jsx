import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { analyticsApi } from '../../services/api'

const SESSION_KEY = 'oratori-analytics-session'

function getSessionId() {
  const existing = window.sessionStorage.getItem(SESSION_KEY)
  if (existing) return existing

  const nextSessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  window.sessionStorage.setItem(SESSION_KEY, nextSessionId)
  return nextSessionId
}

export default function AnalyticsTracker() {
  const location = useLocation()
  const { isAuthenticated, loading } = useAuth()

  useEffect(() => {
    if (loading || !isAuthenticated) return

    analyticsApi.trackVisit({
      pathname: location.pathname,
      sessionId: getSessionId(),
      referrer: document.referrer || '',
      screen: `${window.innerWidth}x${window.innerHeight}`,
    }).catch((error) => {
      console.debug('Analytics non disponibile:', error)
    })
  }, [isAuthenticated, loading, location.pathname])

  return null
}
