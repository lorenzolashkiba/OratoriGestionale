import { connectToDatabase } from './utils/mongodb.js'
import { requireApprovedUser } from './utils/auth.js'

const TIME_ZONE = 'Europe/Rome'
const STALE_DAYS = 180

function getDateParts(date) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })

  return formatter.formatToParts(date).reduce((acc, part) => {
    if (part.type !== 'literal') acc[part.type] = part.value
    return acc
  }, {})
}

function getDayKey(date) {
  const parts = getDateParts(date)
  return `${parts.year}-${parts.month}-${parts.day}`
}

function getDayLabel(date) {
  return new Intl.DateTimeFormat('it-IT', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
  }).format(date)
}

function getRange(days) {
  const range = []
  const base = new Date()

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(base)
    date.setHours(12, 0, 0, 0)
    date.setDate(date.getDate() - offset)

    range.push({
      key: getDayKey(date),
      label: getDayLabel(date),
    })
  }

  return range
}

function getCutoff(days) {
  const cutoff = new Date()
  cutoff.setHours(0, 0, 0, 0)
  cutoff.setDate(cutoff.getDate() - (days - 1))
  return cutoff
}

function getRouteLabel(pathname) {
  if (pathname === '/') return 'home'
  return pathname.split('/')[1] || 'other'
}

function getEntityLabel(type, document) {
  if (!document) return ''

  if (type === 'oratori') {
    return `${document.nome || ''} ${document.cognome || ''}`.trim() || 'Oratore'
  }

  if (type === 'congregazioni') {
    return document.nome || 'Congregazione'
  }

  if (type === 'programmi') {
    if (!document.data) return 'Programma'
    return `Programma ${new Date(document.data).toLocaleDateString('it-IT')}`
  }

  if (type === 'users') {
    return document.email || `${document.nome || ''} ${document.cognome || ''}`.trim() || 'Utente'
  }

  return 'Record'
}

function serializeDate(value) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function buildVisitSummary(visits, days) {
  const range = getRange(days)
  const validKeys = new Set(range.map((entry) => entry.key))
  const filteredVisits = visits.filter((visit) => validKeys.has(visit.dayKey || getDayKey(new Date(visit.visitedAt))))

  const dayMap = Object.fromEntries(range.map((entry) => [entry.key, {
    date: entry.key,
    label: entry.label,
    pageViews: 0,
    uniqueUsers: new Set(),
    sessions: new Set(),
  }]))

  const uniqueUsers = new Set()
  const uniqueSessions = new Set()
  const topPagesMap = new Map()
  const topUsersMap = new Map()

  filteredVisits.forEach((visit) => {
    const dayKey = visit.dayKey || getDayKey(new Date(visit.visitedAt))
    const dayBucket = dayMap[dayKey]
    if (!dayBucket) return

    dayBucket.pageViews += 1
    if (visit.userId) {
      const userKey = visit.userId.toString()
      dayBucket.uniqueUsers.add(userKey)
      uniqueUsers.add(userKey)
    }
    if (visit.sessionId) {
      dayBucket.sessions.add(visit.sessionId)
      uniqueSessions.add(visit.sessionId)
    }

    const pageStats = topPagesMap.get(visit.pathname) || {
      pathname: visit.pathname,
      route: visit.route || getRouteLabel(visit.pathname),
      visits: 0,
      uniqueUsers: new Set(),
    }
    pageStats.visits += 1
    if (visit.userId) pageStats.uniqueUsers.add(visit.userId.toString())
    topPagesMap.set(visit.pathname, pageStats)

    const userKey = visit.userId?.toString()
    if (userKey) {
      const userStats = topUsersMap.get(userKey) || {
        userId: userKey,
        email: visit.userEmail || '',
        name: visit.userName || visit.userEmail || 'Utente',
        visits: 0,
        lastVisitAt: null,
      }

      userStats.visits += 1
      if (!userStats.lastVisitAt || new Date(visit.visitedAt) > new Date(userStats.lastVisitAt)) {
        userStats.lastVisitAt = visit.visitedAt
      }
      topUsersMap.set(userKey, userStats)
    }
  })

  const series = range.map((entry) => ({
    date: entry.key,
    label: entry.label,
    pageViews: dayMap[entry.key].pageViews,
    uniqueUsers: dayMap[entry.key].uniqueUsers.size,
    sessions: dayMap[entry.key].sessions.size,
  }))

  const avgDailyUsers = series.length
    ? Number((series.reduce((sum, day) => sum + day.uniqueUsers, 0) / series.length).toFixed(1))
    : 0

  return {
    uniqueUsers: uniqueUsers.size,
    sessions: uniqueSessions.size,
    pageViews: filteredVisits.length,
    avgDailyUsers,
    series,
    topPages: Array.from(topPagesMap.values())
      .map((page) => ({
        pathname: page.pathname,
        route: page.route,
        visits: page.visits,
        uniqueUsers: page.uniqueUsers.size,
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5),
    topUsers: Array.from(topUsersMap.values())
      .map((entry) => ({
        ...entry,
        lastVisitAt: serializeDate(entry.lastVisitAt),
      }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5),
  }
}

function getAverageHoursBetween(events) {
  if (events.length < 2) return null

  const sorted = [...events]
    .map((event) => new Date(event.performedAt))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a - b)

  if (sorted.length < 2) return null

  let totalDiff = 0
  for (let index = 1; index < sorted.length; index += 1) {
    totalDiff += sorted[index] - sorted[index - 1]
  }

  return Number((totalDiff / (sorted.length - 1) / 36e5).toFixed(1))
}

function buildChangeSummary(changes, days) {
  const range = getRange(days)
  const validKeys = new Set(range.map((entry) => entry.key))
  const filteredChanges = changes.filter((change) => validKeys.has(getDayKey(new Date(change.performedAt))))

  const dayMap = Object.fromEntries(range.map((entry) => [entry.key, {
    date: entry.key,
    label: entry.label,
    count: 0,
  }]))

  const byTypeMap = new Map()

  filteredChanges.forEach((change) => {
    const dayKey = getDayKey(new Date(change.performedAt))
    if (dayMap[dayKey]) {
      dayMap[dayKey].count += 1
    }

    const current = byTypeMap.get(change.entityType) || 0
    byTypeMap.set(change.entityType, current + 1)
  })

  return {
    totalChanges: filteredChanges.length,
    avgHoursBetweenChanges: getAverageHoursBetween(filteredChanges),
    daysWithChanges: Object.values(dayMap).filter((day) => day.count > 0).length,
    series: range.map((entry) => dayMap[entry.key]),
    byType: Array.from(byTypeMap.entries())
      .map(([entityType, count]) => ({ entityType, count }))
      .sort((a, b) => b.count - a.count),
  }
}

async function buildCollectionHealth(collection, key) {
  const staleBefore = new Date()
  staleBefore.setDate(staleBefore.getDate() - STALE_DAYS)

  const [total, staleCount, lastUpdatedDoc] = await Promise.all([
    collection.countDocuments({}),
    collection.countDocuments({
      $or: [
        { updatedAt: { $exists: false } },
        { updatedAt: { $lt: staleBefore } },
      ],
    }),
    collection.find(
      { updatedAt: { $exists: true } },
      { projection: { updatedAt: 1, nome: 1, cognome: 1, email: 1, data: 1 } }
    ).sort({ updatedAt: -1 }).limit(1).next(),
  ])

  return {
    key,
    total,
    staleCount,
    lastUpdatedAt: serializeDate(lastUpdatedDoc?.updatedAt),
    lastUpdatedLabel: getEntityLabel(key, lastUpdatedDoc),
  }
}

async function analyticsHandler(event, context, user, dbUser) {
  const { db } = await connectToDatabase()
  const visitsCollection = db.collection('analytics_visits')
  const activityCollection = db.collection('activity_logs')
  const usersCollection = db.collection('users')
  const oratoriCollection = db.collection('oratori')
  const congregazioniCollection = db.collection('congregazioni')
  const programmiCollection = db.collection('programmi')

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  const path = event.path.replace('/.netlify/functions/analytics', '').replace('/api/analytics', '')

  try {
    if (event.httpMethod === 'POST' && path === '/visit') {
      const payload = event.body ? JSON.parse(event.body) : {}
      const pathname = typeof payload.pathname === 'string' && payload.pathname.startsWith('/')
        ? payload.pathname
        : '/'
      const sessionId = typeof payload.sessionId === 'string' && payload.sessionId.trim()
        ? payload.sessionId.trim().slice(0, 120)
        : null
      const now = new Date()
      const recentThreshold = new Date(now.getTime() - (5 * 60 * 1000))

      const existingVisit = await visitsCollection.findOne({
        userId: dbUser._id,
        pathname,
        sessionId,
        visitedAt: { $gte: recentThreshold },
      })

      if (existingVisit) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ tracked: false }),
        }
      }

      const displayName = `${dbUser.nome || ''} ${dbUser.cognome || ''}`.trim()
      await visitsCollection.insertOne({
        userId: dbUser._id,
        userEmail: dbUser.email || user.email || '',
        userName: displayName || dbUser.email || user.email || 'Utente',
        role: dbUser.role || 'user',
        pathname,
        route: getRouteLabel(pathname),
        sessionId,
        referrer: typeof payload.referrer === 'string' ? payload.referrer.slice(0, 300) : '',
        screen: typeof payload.screen === 'string' ? payload.screen.slice(0, 40) : '',
        dayKey: getDayKey(now),
        visitedAt: now,
      })

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ tracked: true }),
      }
    }

    if (event.httpMethod === 'GET' && (path === '' || path === '/' || path === '/dashboard')) {
      if (dbUser.role !== 'admin') {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'Accesso riservato agli amministratori' }),
        }
      }

      const monthCutoff = getCutoff(30)
      const weekCutoff = getCutoff(7)

      const [visits30d, changeLogs30d, overview, collectionHealth] = await Promise.all([
        visitsCollection.find(
          { visitedAt: { $gte: monthCutoff } },
          { projection: { userId: 1, userEmail: 1, userName: 1, pathname: 1, route: 1, sessionId: 1, visitedAt: 1, dayKey: 1 } }
        ).sort({ visitedAt: -1 }).toArray(),
        activityCollection.find(
          { category: 'data_change', performedAt: { $gte: monthCutoff } },
          { projection: { entityType: 1, entityLabel: 1, action: 1, description: 1, actor: 1, performedAt: 1 } }
        ).sort({ performedAt: -1 }).toArray(),
        Promise.all([
          usersCollection.countDocuments({}),
          oratoriCollection.countDocuments({}),
          congregazioniCollection.countDocuments({}),
          programmiCollection.countDocuments({}),
        ]),
        Promise.all([
          buildCollectionHealth(usersCollection, 'users'),
          buildCollectionHealth(oratoriCollection, 'oratori'),
          buildCollectionHealth(congregazioniCollection, 'congregazioni'),
          buildCollectionHealth(programmiCollection, 'programmi'),
        ]),
      ])

      const visits7d = visits30d.filter((visit) => new Date(visit.visitedAt) >= weekCutoff)
      const recentChanges = changeLogs30d.slice(0, 12).map((change) => ({
        entityType: change.entityType,
        entityLabel: change.entityLabel,
        action: change.action,
        description: change.description,
        actorName: change.actor?.name || change.actor?.email || 'Utente',
        actorEmail: change.actor?.email || '',
        performedAt: serializeDate(change.performedAt),
      }))

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          generatedAt: new Date().toISOString(),
          overview: {
            users: overview[0],
            oratori: overview[1],
            congregazioni: overview[2],
            programmi: overview[3],
          },
          visitors: {
            week: buildVisitSummary(visits7d, 7),
            month: buildVisitSummary(visits30d, 30),
            lastVisitAt: serializeDate(visits30d[0]?.visitedAt),
          },
          dataChanges: {
            week: buildChangeSummary(changeLogs30d.filter((change) => new Date(change.performedAt) >= weekCutoff), 7),
            month: buildChangeSummary(changeLogs30d, 30),
            recent: recentChanges,
            collectionHealth,
          },
        }),
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Endpoint non trovato' }),
    }
  } catch (error) {
    console.error('Errore analytics:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Errore interno del server' }),
    }
  }
}

export const handler = requireApprovedUser(analyticsHandler)
