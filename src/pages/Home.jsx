import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import Layout from '../components/layout/Layout'

export default function Home() {
  const { profile, user } = useAuth()
  const { t } = useLanguage()

  const userName = profile?.nome || user?.displayName?.split(' ')[0] || 'Utente'

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl shadow-lg p-6 sm:p-8 mb-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                {t('home.greeting')}, {userName}!
              </h1>
              <p className="text-blue-100">
                {t('home.heroText')}
              </p>
            </div>
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt=""
                className="w-16 h-16 rounded-full border-4 border-white/30 shadow-lg hidden sm:block"
              />
            )}
          </div>
        </div>

        {/* Profile incomplete warning */}
        {!profile?.congregazione && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="bg-amber-100 rounded-full p-2 shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-800">{t('home.completeProfile')}</p>
                <p className="text-sm text-amber-700 mt-0.5">
                  {t('home.completeProfileHint')}
                </p>
                <Link
                  to="/profilo"
                  className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-amber-700 hover:text-amber-900"
                >
                  {t('home.goToProfile')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            to="/oratori"
            className="group bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-blue-200"
          >
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left sm:flex-row gap-4">
              <div className="bg-blue-100 p-4 rounded-xl group-hover:bg-blue-200 transition-colors shrink-0">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                  {t('nav.oratori')}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {t('home.oratoriDesc')}
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/programmi"
            className="group bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-green-200"
          >
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left sm:flex-row gap-4">
              <div className="bg-green-100 p-4 rounded-xl group-hover:bg-green-200 transition-colors shrink-0">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                  {t('nav.programmi')}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {t('home.programmiDesc')}
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/profilo"
            className="group bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-purple-200 sm:col-span-2 lg:col-span-1"
          >
            <div className="flex flex-col items-center text-center sm:items-start sm:text-left sm:flex-row gap-4">
              <div className="bg-purple-100 p-4 rounded-xl group-hover:bg-purple-200 transition-colors shrink-0">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">
                  {t('nav.profilo')}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {t('home.profiloDesc')}
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Info about linked speaker */}
        {profile?.oratore && (
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-full p-2 shrink-0">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-blue-900">{t('home.linkedAsSpeaker')}</p>
                <p className="text-sm text-blue-700 mt-1">
                  {profile.oratore.cognome} {profile.oratore.nome}
                  {profile.oratore.congregazione && ` - ${profile.oratore.congregazione}`}
                </p>
                {profile.oratore.discorsi?.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    {profile.oratore.discorsi.length} {t('home.discorsiAvailable')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
