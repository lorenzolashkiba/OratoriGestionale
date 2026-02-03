import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

export default function Layout({ children }) {
  const { isAdmin } = useAuth()
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 w-full">
        {children}
      </main>
      <footer className="border-t border-gray-200 bg-white/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <p>Oratori EU2</p>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link
                  to="/doc"
                  className="hover:text-gray-700 transition-colors"
                >
                  {t('nav.doc')}
                </Link>
              )}
              <Link
                to="/guida"
                className="hover:text-gray-700 transition-colors"
              >
                {t('nav.guida')}
              </Link>
              <Link
                to="/privacy"
                className="hover:text-gray-700 transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
