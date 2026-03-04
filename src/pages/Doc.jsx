import { Navigate } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'

const DOC_CONTENT = {
  it: {
    title: 'Documentazione tecnica (solo admin)',
    intro: 'Questa pagina descrive il funzionamento del gestionale Oratori EU2, le componenti principali del codice e le procedure operative per manutenzione e sviluppo.',
    categories: [
      {
        id: 'overview',
        title: 'Panoramica',
        sections: [
          {
            id: 'overview-stack',
            title: 'Stack e componenti',
            body: [
              'Oratori EU2 è un gestionale web per la gestione degli oratori, delle congregazioni e dei programmi.',
              {
                type: 'list',
                items: [
                  'Frontend: React + Vite + Tailwind CSS.',
                  'Autenticazione: Firebase Auth (Google OAuth2).',
                  'Backend: Netlify Functions (Node).',
                  'Database: MongoDB Atlas.',
                  'Hosting: Netlify.',
                ],
              },
            ],
          },
          {
            id: 'overview-flow',
            title: 'Flusso ad alto livello',
            body: [
              'Il frontend autentica l’utente con Google, ottiene un ID Token e lo invia alle API. Le funzioni Netlify verificano il token e applicano le regole di ruolo/stato prima di leggere o scrivere nel database.',
            ],
          },
        ],
      },
      {
        id: 'architecture',
        title: 'Architettura e codice',
        sections: [
          {
            id: 'architecture-structure',
            title: 'Struttura progetto',
            body: [
              {
                type: 'list',
                items: [
                  'src/pages: pagine principali (Home, Oratori, Programmi, Profilo, Admin, Privacy, Doc).',
                  'src/components: componenti riutilizzabili (layout, modali, card, form).',
                  'src/context: contesti globali (Auth, Language).',
                  'src/services: integrazioni (Firebase, API REST).',
                  'netlify/functions: API serverless (users, oratori, programmi, congregazioni, admin).',
                  'netlify/functions/utils: utilità (auth Firebase Admin, MongoDB, email).',
                ],
              },
            ],
          },
          {
            id: 'architecture-routing',
            title: 'Routing e protezioni',
            body: [
              'Il routing è gestito in `src/App.jsx`. Tutte le pagine private passano da `ProtectedRoute` e dai controlli di `AuthContext`.',
              {
                type: 'note',
                tone: 'info',
                title: 'Nota',
                text: 'La pagina Doc è accessibile solo agli admin e si trova in `/doc`.',
              },
            ],
          },
        ],
      },
      {
        id: 'security',
        title: 'Sicurezza e accessi',
        sections: [
          {
            id: 'security-auth',
            title: 'Autenticazione e ruoli',
            body: [
              'Le API richiedono Authorization: Bearer <token>. Il middleware in `netlify/functions/utils/auth.js` verifica il token e recupera il ruolo dal database.',
              {
                type: 'list',
                items: [
                  'Ruoli: pending, user, admin.',
                  'Status: active, rejected.',
                  'Gli utenti pending non possono modificare i dati finché non vengono approvati.',
                ],
              },
            ],
          },
          {
            id: 'security-privacy',
            title: 'Privacy e consenso',
            body: [
              'La versione privacy è controllata con `PRIVACY_VERSION` (backend) e `VITE_PRIVACY_VERSION` (frontend).',
              'Se la versione accettata dall’utente è diversa, il sistema mostra la schermata di consenso e blocca l’accesso finché l’utente non accetta.',
              {
                type: 'note',
                tone: 'warning',
                title: 'Attenzione',
                text: 'Per aggiornare la privacy è necessario cambiare entrambe le versioni (frontend e backend).',
              },
            ],
          },
          {
            id: 'security-review',
            title: 'Reminder verifica dati (6 mesi)',
            body: [
              'Ogni 6 mesi viene richiesto all’utente di confermare la verifica dei dati.',
              'La conferma è salvata in `dataReviewAcceptedAt`. Se l’utente clicca “Non ora”, il reminder ricompare al prossimo login.',
            ],
          },
        ],
      },
      {
        id: 'data',
        title: 'Dati e API',
        sections: [
          {
            id: 'data-model',
            title: 'Modello dati (MongoDB)',
            body: [
              {
                type: 'list',
                items: [
                  'users: profilo utente, ruolo, stato, privacyAcceptedVersion, dataReviewAcceptedAt.',
                  'oratori: anagrafica oratori e lista discorsi.',
                  'programmi: date/orari/assegnazioni oratore-discorso.',
                  'congregazioni: dati congregazione, responsabile, orari, indirizzo.',
                ],
              },
            ],
          },
          {
            id: 'data-endpoints',
            title: 'API principali',
            body: [
              {
                type: 'list',
                items: [
                  'GET /api/users: profilo utente.',
                  'POST /api/users: registrazione nuovo utente (dopo consenso).',
                  'PUT /api/users: aggiornamento profilo.',
                  'PUT /api/users?privacy=true: accettazione nuova privacy.',
                  'PUT /api/users?dataReview=true: conferma verifica dati.',
                  'GET/POST/PUT/DELETE /api/oratori',
                  'GET/POST/PUT/DELETE /api/programmi',
                  'GET/POST/PUT/DELETE /api/congregazioni',
                  'GET /api/admin/*: funzioni admin (approvazioni, ruoli, stats).',
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'operations',
        title: 'Operatività',
        sections: [
          {
            id: 'operations-env',
            title: 'Variabili d’ambiente',
            body: [
              {
                type: 'list',
                items: [
                  'VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID',
                  'VITE_PRIVACY_VERSION (frontend)',
                  'PRIVACY_VERSION (backend)',
                  'MONGODB_URI',
                  'FIREBASE_SERVICE_ACCOUNT oppure FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY',
                  'RESEND_API_KEY, EMAIL_FROM, ADMIN_EMAIL (email notifiche)',
                  'URL (base URL dell’app, usata nelle email)',
                ],
              },
            ],
          },
          {
            id: 'operations-dev',
            title: 'Sviluppo locale',
            body: [
              {
                type: 'code',
                language: 'bash',
                content: 'npm install\nnpm run dev',
              },
            ],
          },
          {
            id: 'operations-deploy',
            title: 'Build e deploy',
            body: [
              {
                type: 'code',
                language: 'bash',
                content: 'npm run build\nnpx netlify deploy --prod',
              },
              'La configurazione build/redirect è in `netlify.toml`.',
            ],
          },
          {
            id: 'operations-notes',
            title: 'Note operative',
            body: [
              {
                type: 'list',
                items: [
                  'Per forzare il reminder dati, azzera `dataReviewAcceptedAt` degli utenti.',
                  'Per debug API, controlla i log funzioni in Netlify.',
                ],
              },
            ],
          },
          {
            id: 'operations-ux',
            title: 'Migliorie UX recenti',
            body: [
              {
                type: 'list',
                items: [
                  'Toast centralizzati: `src/context/ToastContext.jsx` (usati in Oratori/Programmi/Profilo).',
                  'Badge “Da completare” sugli oratori con dati mancanti: `src/components/oratori/OratoreCard.jsx`.',
                  'Micro‑help nei form: orari adunanze (Congregazioni), discorsi (Oratori), distanza (Programmi).',
                  'Export “Stampa PDF” per la tua congregazione con supporto lingua IT/RU e font Unicode per cirillico: `src/pages/Oratori.jsx`, `public/fonts/NotoSans-*.ttf`.',
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'usage',
        title: 'Guida all’uso',
        sections: [
          {
            id: 'usage-login',
            title: 'Accesso e primo utilizzo',
            body: [
              'Accedi con Google. Al primo accesso viene richiesto di accettare la Privacy Policy.',
              'L’account entra in stato “pending” finché un admin non lo approva.',
            ],
          },
          {
            id: 'usage-profile',
            title: 'Profilo utente',
            body: [
              'Completa il profilo con congregazione e località per abilitare tutte le funzionalità.',
              'Se sei un oratore, collega il tuo profilo a un oratore esistente nella lista.',
            ],
          },
          {
            id: 'usage-oratori',
            title: 'Gestione oratori',
            body: [
              'Usa la pagina Oratori per creare, modificare e aggiornare la lista condivisa.',
              'Le congregazioni sono raggruppate e collassate per impostazione predefinita.',
              'Senza filtri, la tua congregazione viene evidenziata in alto.',
              'Nella sezione “La tua congregazione” trovi il pulsante “Stampa PDF”, posizionato nell’header della congregazione.',
              'Il PDF include tutti gli oratori della tua congregazione (indipendentemente dai filtri attivi), con contatti e discorsi.',
              'Il testo del PDF segue la lingua attiva del gestionale (italiano/russo). In russo vengono usati font Unicode per mostrare correttamente il cirillico.',
            ],
          },
          {
            id: 'usage-programmi',
            title: 'Programmi',
            body: [
              'Crea i programmi inserendo data, orario, oratore e discorso.',
              'Il sistema segnala eventuali sovrapposizioni o oratori già occupati.',
            ],
          },
          {
            id: 'usage-admin',
            title: 'Funzionalità admin',
            body: [
              'Nel pannello Admin puoi approvare/rifiutare utenti, cambiare ruolo e vedere le statistiche.',
              'Dopo l’approvazione, l’utente riceve l’accesso completo.',
            ],
          },
        ],
      },
      {
        id: 'release',
        title: 'Release e manutenzione',
        sections: [
          {
            id: 'release-checklist',
            title: 'Checklist di rilascio',
            body: [
              {
                type: 'list',
                items: [
                  'Verifica che le variabili d’ambiente in Netlify siano aggiornate.',
                  'Se hai aggiornato la privacy, cambia `VITE_PRIVACY_VERSION` e `PRIVACY_VERSION`.',
                  'Esegui `npm run build` e controlla che non ci siano errori.',
                  'Dopo il deploy, verifica login, oratori e programmi.',
                ],
              },
            ],
          },
          {
            id: 'release-backup',
            title: 'Backup e ripristino',
            body: [
              'Il sistema non esegue backup automatici lato app. Per export utenti usa la funzione GDPR nel profilo o esporta manualmente dal database.',
              {
                type: 'note',
                tone: 'warning',
                title: 'Attenzione',
                text: 'Qualsiasi ripristino manuale sul database può impattare i dati correnti. Fai sempre un backup prima di modifiche massive.',
              },
            ],
          },
          {
            id: 'release-troubleshooting',
            title: 'Troubleshooting',
            body: [
              {
                type: 'list',
                items: [
                  'Login fallisce: controlla Firebase Auth e le variabili `VITE_FIREBASE_*`.',
                  'API 401/403: verifica il token e i ruoli in `users`.',
                  'Funzioni non rispondono: controlla i log Netlify Functions.',
                  'Email non inviate: verifica `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL`.',
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  ru: {
    title: 'Техническая документация (только для админов)',
    intro: 'Эта страница описывает работу системы Oratori EU2, ключевые части кода и процедуры поддержки/разработки.',
    categories: [
      {
        id: 'overview',
        title: 'Обзор',
        sections: [
          {
            id: 'overview-stack',
            title: 'Стек и компоненты',
            body: [
              'Oratori EU2 — веб‑система для управления ораторами, собраниями и программами.',
              {
                type: 'list',
                items: [
                  'Frontend: React + Vite + Tailwind CSS.',
                  'Аутентификация: Firebase Auth (Google OAuth2).',
                  'Backend: Netlify Functions (Node).',
                  'База данных: MongoDB Atlas.',
                  'Хостинг: Netlify.',
                ],
              },
            ],
          },
          {
            id: 'overview-flow',
            title: 'Высокоуровневый поток',
            body: [
              'Фронтенд аутентифицирует пользователя через Google, получает ID Token и отправляет его в API. Netlify Functions проверяют токен и применяют правила роли/статуса перед чтением или записью в БД.',
            ],
          },
        ],
      },
      {
        id: 'architecture',
        title: 'Архитектура и код',
        sections: [
          {
            id: 'architecture-structure',
            title: 'Структура проекта',
            body: [
              {
                type: 'list',
                items: [
                  'src/pages: основные страницы (Home, Oratori, Programmi, Profilo, Admin, Privacy, Doc).',
                  'src/components: переиспользуемые компоненты (layout, модали, карточки, формы).',
                  'src/context: глобальные контексты (Auth, Language).',
                  'src/services: интеграции (Firebase, REST API).',
                  'netlify/functions: serverless‑API (users, oratori, programmi, congregazioni, admin).',
                  'netlify/functions/utils: утилиты (auth Firebase Admin, MongoDB, email).',
                ],
              },
            ],
          },
          {
            id: 'architecture-routing',
            title: 'Маршрутизация и защиты',
            body: [
              'Маршрутизация задаётся в `src/App.jsx`. Все приватные страницы проходят через `ProtectedRoute` и проверки `AuthContext`.',
              {
                type: 'note',
                tone: 'info',
                title: 'Примечание',
                text: 'Страница Doc доступна только администраторам по адресу `/doc`.',
              },
            ],
          },
        ],
      },
      {
        id: 'security',
        title: 'Безопасность и доступы',
        sections: [
          {
            id: 'security-auth',
            title: 'Аутентификация и роли',
            body: [
              'API требует Authorization: Bearer <token>. Middleware в `netlify/functions/utils/auth.js` проверяет токен и получает роль из базы.',
              {
                type: 'list',
                items: [
                  'Роли: pending, user, admin.',
                  'Статусы: active, rejected.',
                  'Пользователи pending не могут изменять данные до утверждения.',
                ],
              },
            ],
          },
          {
            id: 'security-privacy',
            title: 'Privacy и согласие',
            body: [
              'Версия privacy контролируется через `PRIVACY_VERSION` (backend) и `VITE_PRIVACY_VERSION` (frontend).',
              'Если версия, принятая пользователем, отличается, система блокирует доступ до принятия новой версии.',
              {
                type: 'note',
                tone: 'warning',
                title: 'Внимание',
                text: 'Для обновления privacy нужно изменить обе версии (frontend и backend).',
              },
            ],
          },
          {
            id: 'security-review',
            title: 'Напоминание проверки данных (6 месяцев)',
            body: [
              'Каждые 6 месяцев пользователю показывается напоминание о проверке данных.',
              'Подтверждение сохраняется в `dataReviewAcceptedAt`. Если нажать «Не сейчас», напоминание появится при следующем входе.',
            ],
          },
        ],
      },
      {
        id: 'data',
        title: 'Данные и API',
        sections: [
          {
            id: 'data-model',
            title: 'Модель данных (MongoDB)',
            body: [
              {
                type: 'list',
                items: [
                  'users: профиль пользователя, роль, статус, privacyAcceptedVersion, dataReviewAcceptedAt.',
                  'oratori: данные ораторов и список речей.',
                  'programmi: даты/время/назначения оратор‑речь.',
                  'congregazioni: данные собрания, ответственный, время встреч, адрес.',
                ],
              },
            ],
          },
          {
            id: 'data-endpoints',
            title: 'Основные API',
            body: [
              {
                type: 'list',
                items: [
                  'GET /api/users: профиль пользователя.',
                  'POST /api/users: регистрация нового пользователя (после согласия).',
                  'PUT /api/users: обновление профиля.',
                  'PUT /api/users?privacy=true: принятие новой privacy.',
                  'PUT /api/users?dataReview=true: подтверждение проверки данных.',
                  'GET/POST/PUT/DELETE /api/oratori',
                  'GET/POST/PUT/DELETE /api/programmi',
                  'GET/POST/PUT/DELETE /api/congregazioni',
                  'GET /api/admin/*: админ‑функции (утверждения, роли, статистика).',
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'operations',
        title: 'Операционная часть',
        sections: [
          {
            id: 'operations-env',
            title: 'Переменные окружения',
            body: [
              {
                type: 'list',
                items: [
                  'VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID',
                  'VITE_PRIVACY_VERSION (frontend)',
                  'PRIVACY_VERSION (backend)',
                  'MONGODB_URI',
                  'FIREBASE_SERVICE_ACCOUNT или FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY',
                  'RESEND_API_KEY, EMAIL_FROM, ADMIN_EMAIL (email‑уведомления)',
                  'URL (base URL приложения для email‑ссылок)',
                ],
              },
            ],
          },
          {
            id: 'operations-dev',
            title: 'Локальная разработка',
            body: [
              {
                type: 'code',
                language: 'bash',
                content: 'npm install\nnpm run dev',
              },
            ],
          },
          {
            id: 'operations-deploy',
            title: 'Сборка и деплой',
            body: [
              {
                type: 'code',
                language: 'bash',
                content: 'npm run build\nnpx netlify deploy --prod',
              },
              'Конфигурация сборки и редиректов хранится в `netlify.toml`.',
            ],
          },
          {
            id: 'operations-notes',
            title: 'Операционные заметки',
            body: [
              {
                type: 'list',
                items: [
                  'Чтобы принудительно показать напоминание, сбросьте `dataReviewAcceptedAt` у пользователей.',
                  'Для диагностики API смотрите логи функций в Netlify.',
                ],
              },
            ],
          },
          {
            id: 'operations-ux',
            title: 'Последние улучшения UX',
            body: [
              {
                type: 'list',
                items: [
                  'Центральные toast‑уведомления: `src/context/ToastContext.jsx` (используются в Oratori/Programmi/Profilo).',
                  'Бейдж «Нужно заполнить» для ораторов с неполными данными: `src/components/oratori/OratoreCard.jsx`.',
                  'Микро‑подсказки в формах: время встреч (Congregazioni), речи (Oratori), расстояние (Programmi).',
                  'Экспорт «Печать PDF» для вашего собрания с поддержкой языков IT/RU и Unicode‑шрифтов для кириллицы: `src/pages/Oratori.jsx`, `public/fonts/NotoSans-*.ttf`.',
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'usage',
        title: 'Руководство пользователя',
        sections: [
          {
            id: 'usage-login',
            title: 'Вход и первый запуск',
            body: [
              'Войдите через Google. При первом входе требуется принять политику конфиденциальности.',
              'Аккаунт получает статус “pending”, пока администратор не утвердит доступ.',
            ],
          },
          {
            id: 'usage-profile',
            title: 'Профиль пользователя',
            body: [
              'Заполните профиль (собрание и город), чтобы открыть все функции.',
              'Если вы оратор, привяжите профиль к существующему оратору в списке.',
            ],
          },
          {
            id: 'usage-oratori',
            title: 'Управление ораторами',
            body: [
              'Используйте страницу «Ораторы» для создания и обновления общего списка.',
              'Собрания сгруппированы и по умолчанию свернуты.',
              'Без фильтров ваше собрание выделяется и показывается первым.',
              'В секции «Ваше собрание» доступна кнопка «Печать PDF» в заголовке собрания.',
              'PDF содержит всех ораторов вашего собрания (независимо от активных фильтров), а также контакты и речи.',
              'Текст PDF автоматически следует выбранному языку интерфейса (итальянский/русский). Для русского используется Unicode‑шрифт с корректной поддержкой кириллицы.',
            ],
          },
          {
            id: 'usage-programmi',
            title: 'Программы',
            body: [
              'Создавайте программы, указывая дату, время, оратора и речь.',
              'Система предупреждает о пересечениях и занятости оратора.',
            ],
          },
          {
            id: 'usage-admin',
            title: 'Функции администратора',
            body: [
              'В админ‑панели можно утверждать/отклонять пользователей, менять роли и смотреть статистику.',
              'После утверждения пользователь получает полный доступ.',
            ],
          },
        ],
      },
      {
        id: 'release',
        title: 'Релизы и обслуживание',
        sections: [
          {
            id: 'release-checklist',
            title: 'Чек‑лист релиза',
            body: [
              {
                type: 'list',
                items: [
                  'Проверьте, что переменные окружения в Netlify актуальны.',
                  'Если обновляли privacy, измените `VITE_PRIVACY_VERSION` и `PRIVACY_VERSION`.',
                  'Запустите `npm run build` и убедитесь, что ошибок нет.',
                  'После деплоя проверьте логин, ораторов и программы.',
                ],
              },
            ],
          },
          {
            id: 'release-backup',
            title: 'Резервное копирование и восстановление',
            body: [
              'Приложение не делает автоматические бэкапы. Для выгрузки пользователей используйте GDPR‑экспорт в профиле или экспортируйте данные вручную из БД.',
              {
                type: 'note',
                tone: 'warning',
                title: 'Внимание',
                text: 'Любое ручное восстановление БД может повлиять на текущие данные. Всегда делайте резервную копию перед массовыми изменениями.',
              },
            ],
          },
          {
            id: 'release-troubleshooting',
            title: 'Troubleshooting',
            body: [
              {
                type: 'list',
                items: [
                  'Не работает логин: проверьте Firebase Auth и переменные `VITE_FIREBASE_*`.',
                  'API 401/403: проверьте токен и роли в `users`.',
                  'Функции не отвечают: проверьте логи Netlify Functions.',
                  'Email не отправляются: проверьте `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL`.',
                ],
              },
            ],
          },
        ],
      },
    ],
  },
}

function renderBodyItem(item, index) {
  if (typeof item === 'string') {
    return (
      <p key={`p-${index}`} className="text-gray-700 leading-7">
        {item}
      </p>
    )
  }

  if (item.type === 'list') {
    return (
      <ul key={`list-${index}`} className="list-disc pl-5 text-gray-700 space-y-1">
        {item.items.map((entry) => (
          <li key={entry}>{entry}</li>
        ))}
      </ul>
    )
  }

  if (item.type === 'code') {
    return (
      <pre key={`code-${index}`} className="bg-slate-900 text-slate-100 rounded-2xl p-4 text-sm overflow-x-auto">
        <code className={`language-${item.language || 'text'}`}>{item.content}</code>
      </pre>
    )
  }

  if (item.type === 'note') {
    const toneStyles = item.tone === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : 'border-blue-200 bg-blue-50 text-blue-900'

    return (
      <div key={`note-${index}`} className={`rounded-2xl border p-4 ${toneStyles}`}>
        <p className="font-semibold mb-1">{item.title}</p>
        <p className="text-sm leading-6">{item.text}</p>
      </div>
    )
  }

  return null
}

export default function Doc() {
  const { isAdmin, loading } = useAuth()
  const { language } = useLanguage()
  const content = DOC_CONTENT[language] || DOC_CONTENT.it

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <aside className="lg:w-64">
              <div className="lg:sticky lg:top-24">
                <div className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">Indice</div>
                <nav className="space-y-2">
                  {content.categories.map((category) => (
                    <a
                      key={category.id}
                      href={`#${category.id}`}
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                      {category.title}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="flex-1 space-y-10">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{content.title}</h1>
                <p className="text-gray-600 mt-2">{content.intro}</p>
              </div>

              {content.categories.map((category) => (
                <section key={category.id} id={category.id} className="scroll-mt-24">
                  <div className="border-b border-gray-200 pb-2 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">{category.title}</h2>
                  </div>
                  <div className="space-y-8">
                    {category.sections.map((section) => (
                      <div key={section.id} id={section.id} className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                        <div className="space-y-3">
                          {section.body.map((item, index) => renderBodyItem(item, index))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
