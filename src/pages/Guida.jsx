import { Link } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { useLanguage } from '../context/LanguageContext'

const GUIDE_CONTENT = {
  it: {
    title: 'Guida utente',
    subtitle: 'Come utilizzare Oratori EU2 in modo semplice e ordinato, dalla prima login alla gestione settimanale delle adunanze.',
    operativitaTitle: 'Operatività mensile (in breve)',
    operativitaText: 'Durante il mese organizzi le adunanze: pianifichi le date, cerchi oratori disponibili con discorsi adatti e prepari i programmi con anticipo.',
    operativitaBullets: [
      'All’inizio del mese dai un’occhiata al calendario e agli orari delle adunanze per impostare le priorità.',
      'Poi cerchi oratori liberi per le varie date e verifichi quali discorsi possono tenere, così da distribuire bene i temi.',
      'Quando hai una proposta chiara, crei o aggiorni i programmi assegnando oratore e discorso per ogni adunanza.',
      'Se qualcosa cambia (disponibilità, contatti, orari), aggiorni subito i dati così tutti restano allineati.',
    ],
    quickSteps: [
      {
        title: 'Accedi e attendi l’approvazione',
        text: 'Se è il tuo primo accesso, l’account resta in attesa finché un admin lo approva. Riceverai una mail di conferma se le notifiche sono attive.',
      },
      {
        title: 'Completa il profilo',
        text: 'Inserisci i tuoi dati, la congregazione e collega il profilo a un oratore se necessario.',
      },
      {
        title: 'Gestisci oratori e congregazioni',
        text: 'Aggiungi o aggiorna gli oratori, imposta il coordinatore degli oratori e gli orari delle adunanze.',
      },
      {
        title: 'Crea i programmi',
        text: 'Scegli data, orario, oratore e discorso. Il sistema segnala oratori già occupati.',
      },
    ],
    sections: [
      {
        id: 'permessi',
        title: 'Accessi e permessi',
        bullets: [
          'Solo l’admin può modificare tutti i dati dell’applicazione.',
          'Gli utenti normali possono modificare gli oratori creati da loro.',
          'Gli utenti normali possono modificare la congregazione di cui sono coordinatori.',
        ],
        ctaKey: 'nav.profilo',
        to: '/profilo',
      },
      {
        id: 'oratori',
        title: 'Oratori e congregazioni',
        bullets: [
          'Usa i filtri per trovare rapidamente un oratore e la sua congregazione.',
          'Apri una congregazione per vedere contatti, discorsi e programmi futuri degli oratori.',
          'Per ogni congregazione puoi configurare orari, indirizzo e coordinatore degli oratori.',
          'I dati sono condivisi: tienili aggiornati per tutti.',
        ],
        ctaKey: 'nav.oratori',
        to: '/oratori',
      },
      {
        id: 'programmi',
        title: 'Programmi',
        bullets: [
          'Clicca "Nuovo Programma" e inserisci data (Sab/Dom) e orario.',
          'Seleziona l’oratore: la lista separa disponibili e non disponibili per la data.',
          'Scegli il discorso (numero) e aggiungi eventuali note.',
          'Usa "Mostra programmi passati" per consultare lo storico.',
        ],
        ctaKey: 'nav.programmi',
        to: '/programmi',
      },
      {
        id: 'discorsi',
        title: 'Discorsi',
        bullets: [
          'Consulta la lista e cerca per numero o titolo.',
          'Usa la lista per verificare rapidamente i discorsi degli oratori.',
        ],
        ctaKey: 'nav.discorsi',
        to: '/discorsi',
      },
      {
        id: 'profilo',
        title: 'Profilo e dati personali',
        bullets: [
          'Aggiorna i tuoi dati e i contatti.',
          'Collega il tuo profilo all’oratore corrispondente, se previsto.',
          'Puoi esportare i tuoi dati in formato JSON.',
        ],
        ctaKey: 'nav.profilo',
        to: '/profilo',
      },
      {
        id: 'admin',
        title: 'Se sei admin',
        bullets: [
          'Approva o rifiuta le richieste di accesso.',
          'Gestisci ruoli e permessi degli utenti.',
        ],
        ctaKey: 'nav.admin',
        to: '/admin',
      },
    ],
    tipsTitle: 'Consigli utili',
    tips: [
      'Aggiorna i dati dopo ogni cambio programma o oratore.',
      'Controlla regolarmente la tua congregazione e i contatti.',
      'In caso di dubbi, contatta l’amministratore.',
    ],
  },
  ru: {
    title: 'Руководство пользователя',
    subtitle: 'Как пользоваться Oratori EU2: от первого входа до еженедельной организации встреч.',
    operativitaTitle: 'Ежемесячная работа (кратко)',
    operativitaText: 'В течение месяца вы организуете встречи: планируете даты, ищете свободных ораторов с подходящими речами и заранее готовите программы.',
    operativitaBullets: [
      'В начале месяца просмотрите календарь и время встреч, чтобы расставить приоритеты.',
      'Затем подберите свободных ораторов на нужные даты и уточните, какие речи они могут подготовить.',
      'Когда план готов, создайте или обновите программы: оратор и речь для каждой встречи.',
      'Если что-то меняется (доступность, контакты, расписание), сразу обновляйте данные, чтобы у всех была актуальная информация.',
    ],
    quickSteps: [
      {
        title: 'Войдите и дождитесь подтверждения',
        text: 'При первом входе аккаунт остаётся в ожидании, пока админ его не одобрит. Если уведомления активны, придёт письмо.',
      },
      {
        title: 'Заполните профиль',
        text: 'Укажите данные, собрание и при необходимости привяжите профиль к оратору.',
      },
      {
        title: 'Управляйте ораторами и собраниями',
        text: 'Добавляйте и обновляйте ораторов, задавайте координатора ораторов и время встреч.',
      },
      {
        title: 'Создавайте программы',
        text: 'Выберите дату, время, оратора и тему. Система предупредит, если оратор занят.',
      },
    ],
    sections: [
      {
        id: 'permessi',
        title: 'Доступ и права',
        bullets: [
          'Только админ может изменять все данные приложения.',
          'Обычные пользователи могут изменять ораторов, которых они создали.',
          'Обычные пользователи могут изменять своё собрание, если они координаторы.',
        ],
        ctaKey: 'nav.profilo',
        to: '/profilo',
      },
      {
        id: 'oratori',
        title: 'Ораторы и собрания',
        bullets: [
          'Используйте фильтры, чтобы быстро найти оратора и его собрание.',
          'Откройте собрание, чтобы видеть контакты, речи и будущие программы ораторов.',
          'Для каждого собрания можно задать время, адрес и координатора ораторов.',
          'Данные общие — поддерживайте их в актуальном виде.',
        ],
        ctaKey: 'nav.oratori',
        to: '/oratori',
      },
      {
        id: 'programmi',
        title: 'Программы',
        bullets: [
          'Нажмите "Новая программа" и укажите дату (сб/вс) и время.',
          'Выберите оратора: список разделяет доступных и недоступных на дату.',
          'Выберите речь (номер) и добавьте заметки при необходимости.',
          'Включите показ прошедших программ для истории.',
        ],
        ctaKey: 'nav.programmi',
        to: '/programmi',
      },
      {
        id: 'discorsi',
        title: 'Речи',
        bullets: [
          'Просматривайте список и ищите по номеру или названию.',
          'Список помогает быстро проверить речи ораторов.',
        ],
        ctaKey: 'nav.discorsi',
        to: '/discorsi',
      },
      {
        id: 'profilo',
        title: 'Профиль и личные данные',
        bullets: [
          'Обновляйте свои данные и контакты.',
          'При необходимости привяжите профиль к оратору.',
          'Вы можете экспортировать данные в формате JSON.',
        ],
        ctaKey: 'nav.profilo',
        to: '/profilo',
      },
      {
        id: 'admin',
        title: 'Если вы админ',
        bullets: [
          'Одобряйте или отклоняйте запросы на доступ.',
          'Управляйте ролями и правами пользователей.',
        ],
        ctaKey: 'nav.admin',
        to: '/admin',
      },
    ],
    tipsTitle: 'Полезные советы',
    tips: [
      'Обновляйте данные после любых изменений в программах.',
      'Регулярно проверяйте своё собрание и контакты.',
      'Если есть вопросы, обратитесь к администратору.',
    ],
  },
}

export default function Guida() {
  const { language, t } = useLanguage()
  const content = GUIDE_CONTENT[language] || GUIDE_CONTENT.it

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 rounded-2xl shadow-lg p-6 sm:p-8 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{content.title}</h1>
          <p className="text-sky-100">{content.subtitle}</p>
        </div>

        {content.operativitaTitle && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-2">{content.operativitaTitle}</h2>
            <p className="text-gray-600 text-sm mb-4">{content.operativitaText}</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
              {content.operativitaBullets?.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {content.quickSteps.map((step, index) => (
            <div key={step.title} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center">
                  {index + 1}
                </span>
                <h2 className="text-lg font-semibold text-gray-900">{step.title}</h2>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {content.sections.map((section) => (
            <div key={section.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-3">{section.title}</h3>
              <ul className="space-y-2 text-sm text-gray-600 mb-4">
                {section.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-start gap-2">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              {section.to && (
                <Link
                  to={section.to}
                  className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  {t(section.ctaKey)}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-3">{content.tipsTitle}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
            {content.tips.map((tip) => (
              <div key={tip} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
