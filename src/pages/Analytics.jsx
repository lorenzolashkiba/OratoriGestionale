import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { analyticsApi } from '../services/api'
import Layout from '../components/layout/Layout'

function formatDateTime(value, locale) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function getEntityLabel(key, t) {
  const map = {
    users: t('analytics.entities.users'),
    oratori: t('analytics.entities.oratori'),
    congregazioni: t('analytics.entities.congregazioni'),
    programmi: t('analytics.entities.programmi'),
  }

  return map[key] || key
}

function getRouteLabel(pathname, t) {
  const map = {
    '/': t('analytics.routes.home'),
    '/oratori': t('analytics.routes.oratori'),
    '/programmi': t('analytics.routes.programmi'),
    '/discorsi': t('analytics.routes.discorsi'),
    '/profilo': t('analytics.routes.profilo'),
    '/admin': t('analytics.routes.admin'),
    '/analytics': t('analytics.routes.analytics'),
    '/guida': t('analytics.routes.guida'),
    '/doc': t('analytics.routes.doc'),
    '/privacy': t('analytics.routes.privacy'),
    '/login': t('analytics.routes.login'),
  }

  return map[pathname] || pathname
}

function getActionLabel(action, t) {
  const map = {
    create: t('analytics.actions.create'),
    update: t('analytics.actions.update'),
    delete: t('analytics.actions.delete'),
    approve: t('analytics.actions.approve'),
    reject: t('analytics.actions.reject'),
    role_change: t('analytics.actions.roleChange'),
    update_profile: t('analytics.actions.updateProfile'),
    delete_account: t('analytics.actions.deleteAccount'),
    request_access: t('analytics.actions.requestAccess'),
  }

  return map[action] || action
}

function MetricCard({ title, value, subtitle, tone = 'slate' }) {
  const tones = {
    slate: 'bg-white border-gray-200 text-gray-900',
    blue: 'bg-blue-50 border-blue-200 text-blue-900',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    amber: 'bg-amber-50 border-amber-200 text-amber-900',
  }

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${tones[tone] || tones.slate}`}>
      <div className="text-sm font-medium opacity-80">{title}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
      {subtitle && <div className="mt-2 text-sm opacity-75">{subtitle}</div>}
    </div>
  )
}

function MiniBars({ title, items, valueKey, subtitle, emptyLabel, colorClass = 'bg-blue-500' }) {
  const maxValue = Math.max(...items.map((item) => item[valueKey] || 0), 0)

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-6 text-sm text-gray-500">{emptyLabel}</p>
      ) : (
        <div className="mt-6 space-y-3">
          {items.map((item) => {
            const value = item[valueKey] || 0
            const width = maxValue > 0 ? `${Math.max((value / maxValue) * 100, value > 0 ? 8 : 0)}%` : '0%'

            return (
              <div key={`${item.date || item.pathname || item.userId || item.entityType}-${value}`} className="space-y-1.5">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="truncate text-gray-600">{item.label || item.pathname || item.name || item.entityType}</span>
                  <span className="font-semibold text-gray-900">{value}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className={`h-2 rounded-full ${colorClass}`} style={{ width }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Analytics() {
  const { isAdmin, loading: authLoading } = useAuth()
  const { t, language } = useLanguage()
  const locale = language === 'ru' ? 'ru-RU' : 'it-IT'
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) return

    const loadDashboard = async () => {
      try {
        setLoading(true)
        const response = await analyticsApi.getDashboard()
        setDashboard(response)
      } catch (error) {
        console.error('Errore caricamento analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [isAdmin])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  const overviewCards = dashboard ? [
    { key: 'users', value: dashboard.overview.users, tone: 'blue' },
    { key: 'oratori', value: dashboard.overview.oratori, tone: 'green' },
    { key: 'congregazioni', value: dashboard.overview.congregazioni, tone: 'amber' },
    { key: 'programmi', value: dashboard.overview.programmi, tone: 'slate' },
  ] : []

  const weekSeries = dashboard?.visitors?.week?.series || []
  const monthTopPages = (dashboard?.visitors?.month?.topPages || []).map((page) => ({
    ...page,
    label: `${getRouteLabel(page.pathname, t)} · ${page.visits}`,
  }))
  const monthTopUsers = (dashboard?.visitors?.month?.topUsers || []).map((user) => ({
    ...user,
    label: user.name || user.email,
  }))
  const changeTypes = (dashboard?.dataChanges?.month?.byType || []).map((entry) => ({
    ...entry,
    label: getEntityLabel(entry.entityType, t),
  }))

  return (
    <Layout>
      <div className="space-y-8">
        <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 px-6 py-8 text-white shadow-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-200">{t('analytics.eyebrow')}</p>
              <h1 className="mt-2 text-3xl font-bold">{t('analytics.title')}</h1>
              <p className="mt-3 max-w-3xl text-sm text-blue-100 sm:text-base">{t('analytics.subtitle')}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin"
                className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                {t('analytics.backToAdmin')}
              </Link>
              <div className="rounded-xl bg-white/10 px-4 py-2 text-sm text-blue-100">
                {t('analytics.generatedAt')}: {formatDateTime(dashboard?.generatedAt, locale)}
              </div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : dashboard ? (
          <>
            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{t('analytics.overview')}</h2>
                <p className="mt-1 text-sm text-gray-500">{t('analytics.overviewDescription')}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
                {overviewCards.map((card) => (
                  <MetricCard
                    key={card.key}
                    title={getEntityLabel(card.key, t)}
                    value={card.value}
                    tone={card.tone}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{t('analytics.visitorsTitle')}</h2>
                <p className="mt-1 text-sm text-gray-500">{t('analytics.visitorsDescription')}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  title={t('analytics.weekUniqueUsers')}
                  value={dashboard.visitors.week.uniqueUsers}
                  subtitle={t('analytics.weekUniqueUsersHint')}
                  tone="blue"
                />
                <MetricCard
                  title={t('analytics.weekSessions')}
                  value={dashboard.visitors.week.sessions}
                  subtitle={t('analytics.weekSessionsHint')}
                  tone="green"
                />
                <MetricCard
                  title={t('analytics.monthUniqueUsers')}
                  value={dashboard.visitors.month.uniqueUsers}
                  subtitle={t('analytics.monthUniqueUsersHint')}
                  tone="amber"
                />
                <MetricCard
                  title={t('analytics.monthPageViews')}
                  value={dashboard.visitors.month.pageViews}
                  subtitle={`${t('analytics.avgDailyUsers')}: ${dashboard.visitors.month.avgDailyUsers}`}
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr_1fr]">
                <MiniBars
                  title={t('analytics.weekTrend')}
                  subtitle={t('analytics.weekTrendHint')}
                  items={weekSeries.map((day) => ({
                    ...day,
                    label: `${day.label} · ${day.uniqueUsers} ${t('analytics.usersShort')}`,
                  }))}
                  valueKey="uniqueUsers"
                  emptyLabel={t('analytics.noVisits')}
                />
                <MiniBars
                  title={t('analytics.topPages')}
                  subtitle={t('analytics.topPagesHint')}
                  items={monthTopPages.map((page) => ({
                    ...page,
                    label: getRouteLabel(page.pathname, t),
                  }))}
                  valueKey="visits"
                  emptyLabel={t('analytics.noVisits')}
                  colorClass="bg-emerald-500"
                />
                <MiniBars
                  title={t('analytics.topUsers')}
                  subtitle={t('analytics.topUsersHint')}
                  items={monthTopUsers}
                  valueKey="visits"
                  emptyLabel={t('analytics.noVisits')}
                  colorClass="bg-amber-500"
                />
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{t('analytics.changesTitle')}</h2>
                <p className="mt-1 text-sm text-gray-500">{t('analytics.changesDescription')}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard
                  title={t('analytics.changesWeek')}
                  value={dashboard.dataChanges.week.totalChanges}
                  subtitle={t('analytics.changesWeekHint')}
                  tone="blue"
                />
                <MetricCard
                  title={t('analytics.changesMonth')}
                  value={dashboard.dataChanges.month.totalChanges}
                  subtitle={`${t('analytics.daysWithChanges')}: ${dashboard.dataChanges.month.daysWithChanges}`}
                  tone="green"
                />
                <MetricCard
                  title={t('analytics.avgInterval')}
                  value={dashboard.dataChanges.month.avgHoursBetweenChanges ?? '—'}
                  subtitle={t('analytics.avgIntervalHint')}
                  tone="amber"
                />
                <MetricCard
                  title={t('analytics.lastVisit')}
                  value={formatDateTime(dashboard.visitors.lastVisitAt, locale)}
                  subtitle={t('analytics.lastVisitHint')}
                />
              </div>

              <div className="grid gap-4 xl:grid-cols-[1fr_1.2fr]">
                <MiniBars
                  title={t('analytics.changeTypes')}
                  subtitle={t('analytics.changeTypesHint')}
                  items={changeTypes}
                  valueKey="count"
                  emptyLabel={t('analytics.noChanges')}
                  colorClass="bg-slate-700"
                />

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900">{t('analytics.collectionHealth')}</h3>
                  <p className="mt-1 text-sm text-gray-500">{t('analytics.collectionHealthHint')}</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {dashboard.dataChanges.collectionHealth.map((entry) => (
                      <div key={entry.key} className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{getEntityLabel(entry.key, t)}</div>
                            <div className="mt-1 text-sm text-gray-500">
                              {t('analytics.totalRecords')}: {entry.total}
                            </div>
                          </div>
                          <div className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            entry.staleCount > 0 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {t('analytics.staleRecords')}: {entry.staleCount}
                          </div>
                        </div>
                        <div className="mt-4 text-xs text-gray-500">
                          {t('analytics.lastUpdated')}:
                        </div>
                        <div className="mt-1 text-sm font-medium text-gray-800">{entry.lastUpdatedLabel || '—'}</div>
                        <div className="mt-1 text-sm text-gray-500">{formatDateTime(entry.lastUpdatedAt, locale)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">{t('analytics.recentChanges')}</h3>
                <p className="mt-1 text-sm text-gray-500">{t('analytics.recentChangesHint')}</p>

                {dashboard.dataChanges.recent.length === 0 ? (
                  <p className="mt-6 text-sm text-gray-500">{t('analytics.noChanges')}</p>
                ) : (
                  <div className="mt-5 space-y-3">
                    {dashboard.dataChanges.recent.map((change, index) => (
                      <div key={`${change.performedAt}-${change.description}-${index}`} className="rounded-2xl border border-gray-100 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                                {getEntityLabel(change.entityType, t)}
                              </span>
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                {getActionLabel(change.action, t)}
                              </span>
                            </div>
                            <div className="mt-3 text-sm font-semibold text-gray-900">{change.entityLabel || change.description}</div>
                            <div className="mt-1 text-sm text-gray-600">{change.description}</div>
                            <div className="mt-2 text-xs text-gray-500">
                              {t('analytics.byActor')}: {change.actorName}
                              {change.actorEmail ? ` · ${change.actorEmail}` : ''}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">{formatDateTime(change.performedAt, locale)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {t('analytics.loadError')}
          </div>
        )}
      </div>
    </Layout>
  )
}
