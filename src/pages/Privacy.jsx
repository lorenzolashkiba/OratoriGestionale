import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/layout/Layout'

export default function Privacy() {
  const { user } = useAuth()

  const content = (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-8">Ultimo aggiornamento: Gennaio 2025</p>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Titolari e Responsabili del Trattamento</h2>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">1.1 Titolari del Trattamento</h3>
            <p className="text-gray-700 mb-4">
              I <strong>titolari del trattamento</strong> dei dati personali sono i <strong>responsabili delle singole congregazioni</strong>.
              Ogni responsabile di congregazione è titolare del trattamento dei dati degli oratori e delle informazioni
              inserite relative alla propria congregazione.
            </p>
            <p className="text-gray-700 mb-4">
              Per qualsiasi richiesta relativa ai tuoi dati personali (accesso, rettifica, cancellazione),
              devi contattare il responsabile della tua congregazione.
            </p>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">1.2 Gestore della Piattaforma</h3>
            <p className="text-gray-700 mb-4">
              L'<strong>amministratore della piattaforma</strong> è responsabile esclusivamente della gestione tecnica
              dell'applicazione "Oratori EU2" (manutenzione, sicurezza, funzionamento). L'amministratore non è
              titolare del trattamento dei dati inseriti dagli utenti, ma agisce come responsabile del trattamento
              (data processor) per conto dei titolari (i responsabili delle congregazioni).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Dati Personali Raccolti</h2>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">2.1 Dati da Google OAuth2</h3>
            <p className="text-gray-700 mb-2">Quando accedi con Google, riceviamo:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Indirizzo email</li>
              <li>Nome visualizzato</li>
              <li>Foto profilo (se disponibile)</li>
              <li>ID univoco Google</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">2.2 Dati del Profilo Utente</h3>
            <p className="text-gray-700 mb-2">Dati che puoi fornire volontariamente:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Nome e cognome</li>
              <li>Numero di telefono</li>
              <li>Congregazione di appartenenza</li>
              <li>Località</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">2.3 Dati degli Oratori</h3>
            <p className="text-gray-700 mb-2">Se inserisci dati di oratori:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Nome e cognome dell'oratore</li>
              <li>Email e telefono</li>
              <li>Congregazione e località</li>
              <li>Lista dei discorsi disponibili</li>
            </ul>

            <h3 className="text-lg font-medium text-gray-800 mt-4 mb-2">2.4 Dati dei Programmi</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Date e orari degli eventi</li>
              <li>Assegnazioni oratori-discorsi</li>
              <li>Note aggiuntive</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Finalità del Trattamento</h2>
            <p className="text-gray-700 mb-2">I tuoi dati vengono utilizzati per:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Autenticazione e accesso sicuro all'applicazione</li>
              <li>Gestione del tuo profilo utente</li>
              <li>Organizzazione e gestione dei programmi degli oratori</li>
              <li>Comunicazioni relative al servizio (approvazione account, notifiche)</li>
            </ul>
            <p className="text-gray-700">
              <strong>Base legale:</strong> Consenso esplicito (GDPR Art. 6.1.a)
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Fornitori di Servizi Terzi</h2>
            <p className="text-gray-700 mb-4">
              Utilizziamo i seguenti servizi esterni per il funzionamento dell'applicazione:
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-800">Firebase (Google Cloud)</h4>
              <p className="text-gray-600 text-sm">Autenticazione utenti e gestione sessioni</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-800">MongoDB Atlas</h4>
              <p className="text-gray-600 text-sm">Archiviazione sicura dei dati</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-800">Netlify</h4>
              <p className="text-gray-600 text-sm">Hosting dell'applicazione</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-800">Resend</h4>
              <p className="text-gray-600 text-sm">Invio email di notifica</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. I Tuoi Diritti</h2>
            <p className="text-gray-700 mb-2">In conformità al GDPR, hai diritto a:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Accesso:</strong> Richiedere una copia dei tuoi dati personali</li>
              <li><strong>Rettifica:</strong> Correggere dati inesatti o incompleti</li>
              <li><strong>Cancellazione:</strong> Richiedere l'eliminazione dei tuoi dati ("diritto all'oblio")</li>
              <li><strong>Portabilità:</strong> Ricevere i tuoi dati in formato strutturato</li>
              <li><strong>Opposizione:</strong> Opporti al trattamento dei tuoi dati</li>
              <li><strong>Revoca del consenso:</strong> Ritirare il consenso in qualsiasi momento</li>
            </ul>
            <p className="text-gray-700 mb-2">
              <strong>Come esercitare i tuoi diritti:</strong>
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Per i dati del tuo <strong>account</strong>: usa le funzioni disponibili nel tuo profilo (modifica, cancellazione account)</li>
              <li>Per <strong>esportare i tuoi dati</strong>: usa il bottone "Esporta i tuoi dati" nel profilo per scaricare tutti i tuoi dati in formato JSON</li>
              <li>Per i dati relativi agli <strong>oratori e programmi</strong>: contatta il responsabile della tua congregazione</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Conservazione dei Dati</h2>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Dati profilo:</strong> Conservati fino alla cancellazione dell'account</li>
              <li><strong>Dati oratori e programmi:</strong> Conservati fino alla cancellazione manuale o dell'account</li>
              <li><strong>Log di autenticazione:</strong> Conservati per motivi di sicurezza</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Sicurezza dei Dati</h2>
            <p className="text-gray-700 mb-2">Proteggiamo i tuoi dati attraverso:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Connessione HTTPS crittografata</li>
              <li>Autenticazione sicura tramite Google OAuth2</li>
              <li>Token JWT con scadenza automatica</li>
              <li>Controllo degli accessi basato sui ruoli</li>
              <li>Archiviazione sicura su database cloud</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Cookie e Tracciamento</h2>
            <p className="text-gray-700 mb-4">
              Questa applicazione utilizza cookie tecnici necessari per il funzionamento
              dell'autenticazione Firebase. Non utilizziamo cookie di tracciamento o profilazione
              a fini pubblicitari.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Modifiche alla Privacy Policy</h2>
            <p className="text-gray-700 mb-4">
              Ci riserviamo il diritto di modificare questa Privacy Policy. In caso di modifiche
              sostanziali, gli utenti saranno informati tramite l'applicazione o via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contatti</h2>
            <p className="text-gray-700 mb-4">
              Per domande o richieste relative ai tuoi dati personali:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Dati oratori e programmi:</strong> Contatta il responsabile della tua congregazione</li>
              <li><strong>Problemi tecnici della piattaforma:</strong> Contatta l'amministratore del sistema</li>
            </ul>
            <p className="text-gray-700">
              Hai inoltre il diritto di presentare un reclamo all'autorità di controllo competente
              (Garante per la Protezione dei Dati Personali - <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.garanteprivacy.it</a>).
            </p>
          </section>
        </div>

        {!user && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Torna al login
            </Link>
          </div>
        )}
      </div>
    </div>
  )

  // Se l'utente è loggato, mostra con Layout
  if (user) {
    return <Layout>{content}</Layout>
  }

  // Se non loggato, mostra standalone
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      {content}
    </div>
  )
}
