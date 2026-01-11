export const translations = {
  it: {
    // Navbar
    nav: {
      home: 'Home',
      oratori: 'Oratori',
      programmi: 'Programmi',
      profilo: 'Profilo',
      admin: 'Admin',
      logout: 'Esci',
    },

    // Common
    common: {
      save: 'Salva',
      cancel: 'Annulla',
      delete: 'Elimina',
      edit: 'Modifica',
      add: 'Aggiungi',
      search: 'Cerca',
      loading: 'Caricamento...',
      error: 'Errore',
      noResults: 'Nessun risultato',
      confirm: 'Conferma',
      close: 'Chiudi',
      yes: 'Sì',
      no: 'No',
      created: 'Creato',
      updated: 'Aggiornato',
      by: 'Da',
    },

    // Home
    home: {
      title: 'Benvenuto',
      subtitle: 'Gestionale Oratori EU2',
      quickActions: 'Azioni rapide',
      viewOratori: 'Visualizza Oratori',
      viewProgrammi: 'Gestisci Programmi',
      viewProfile: 'Il tuo Profilo',
    },

    // Oratori
    oratori: {
      title: 'Oratori',
      subtitle: 'Lista condivisa di tutti gli oratori',
      newOratore: 'Nuovo Oratore',
      editOratore: 'Modifica Oratore',
      deleteOratore: 'Elimina Oratore',
      noOratori: 'Nessun oratore trovato',
      startAdding: 'Inizia aggiungendo il primo oratore alla lista',
      addOratore: 'Aggiungi oratore',
      found: 'trovato',
      foundPlural: 'trovati',
      oratore: 'oratore',
      oratoriPlural: 'oratori',

      // Form fields
      nome: 'Nome',
      cognome: 'Cognome',
      email: 'Email',
      telefono: 'Telefono',
      congregazione: 'Congregazione',
      localita: 'Località',
      discorsi: 'Discorsi',
      discorsiRange: 'Discorsi (1-194)',
      discorsoNum: 'N. discorso',
      discorsiSelected: 'discorso/i selezionato/i',

      // Status badges
      programmiFuturi: 'Programmi futuri',
      questoMese: 'Questo mese',
      noContatti: 'Nessun contatto disponibile',

      // Delete confirmation
      confirmDelete: 'Conferma eliminazione',
      confirmDeleteText: "Sei sicuro di voler eliminare l'oratore",
      deleteWarning: 'Questa azione non può essere annullata.',

      // Errors
      errorLoading: 'Errore durante il caricamento',
      errorSaving: 'Errore durante il salvataggio',
      errorDeleting: 'Errore durante eliminazione',
    },

    // Filters
    filters: {
      title: 'Filtra oratori',
      activeFilters: 'filtro/i attivo/i',
      clear: 'Cancella',
      searchByName: 'Cerca per nome...',
      searchBySurname: 'Cerca per cognome...',
      searchByCongregazione: 'Cerca per congregazione...',
      searchByLocalita: 'Cerca per località...',
      searchByDiscorso: 'Discorso (numero o tema)',
      searchByDiscorsoPlaceholder: 'Es: 42 oppure testo...',
      searchByDiscorsoHint: 'Cerca per numero o testo nel titolo',
    },

    // Programmi
    programmi: {
      title: 'I miei Programmi',
      subtitle: 'Gestisci i tuoi programmi personali',
      newProgramma: 'Nuovo Programma',
      editProgramma: 'Modifica Programma',
      noProgrammi: 'Nessun programma trovato',
      noProgrammiFuturi: 'Nessun programma futuro',
      startCreating: 'Inizia creando il tuo primo programma',
      createFirst: 'Crea il tuo primo programma',
      showPast: 'Mostra programmi passati',
      inProgramma: 'in programma',
      totale: 'totale',
      programma: 'programma',
      programmiPlural: 'programmi',

      // Form
      data: 'Data (Sab/Dom)',
      orario: 'Orario',
      oratore: 'Oratore',
      discorso: 'Discorso',
      note: 'Note',
      notePlaceholder: 'Note aggiuntive...',
      selectDiscorso: 'Seleziona discorso...',
      searchOratore: 'Cerca o seleziona un oratore...',
      distanceFrom: 'distanze da',
      loadingOratori: 'Caricamento oratori...',
      calculatingDistances: 'Calcolo distanze...',
      availableFor: 'Disponibili per',
      notAvailable: 'Non disponibili per questa data',
      occupied: 'Occupato',
      noOratoreDiscorsi: 'Questo oratore non ha discorsi associati. Aggiungi prima i discorsi nella sezione Oratori.',

      // Validation
      selectWeekend: 'Seleziona solo sabato o domenica',
      oratoreOccupied: 'Oratore già occupato in questa data',
      sunday: 'Domenica',
      saturday: 'Sabato',

      // Monthly warning
      monthlyWarning: 'Questo oratore ha già un discorso questo mese',
      otherDates: 'Altre date',
      monthlyHint: 'In linea di massima ogni oratore dovrebbe fare al massimo un discorso al mese.',

      // Delete
      confirmDelete: 'Conferma eliminazione',
      confirmDeleteText: 'Sei sicuro di voler eliminare il programma del',
    },

    // Profile
    profilo: {
      title: 'Il tuo Profilo',
      subtitle: 'Gestisci le tue informazioni personali',
      yourLocalita: 'La tua località',
      localitaHint: 'Usata per calcolare le distanze dagli oratori',
      saveSuccess: 'Profilo aggiornato con successo',
    },

    // Admin
    admin: {
      title: 'Pannello Admin',
      subtitle: 'Gestione utenti e approvazioni',
      stats: 'Statistiche',
      totalUsers: 'Utenti totali',
      pendingUsers: 'In attesa',
      activeUsers: 'Attivi',
      adminUsers: 'Admin',
      pendingTab: 'In attesa',
      allUsersTab: 'Tutti gli utenti',
      noPending: 'Nessun utente in attesa di approvazione',
      approve: 'Approva',
      reject: 'Rifiuta',
      requestedAt: 'Richiesta il',
      role: 'Ruolo',
      status: 'Stato',
      actions: 'Azioni',
    },

    // Login
    login: {
      title: 'Oratori EU2',
      subtitle: 'Gestionale per oratori',
      loginWithGoogle: 'Accedi con Google',
      pendingTitle: 'Richiesta inviata',
      pendingMessage: 'La tua richiesta di accesso è stata inviata. Un amministratore la esaminerà a breve.',
      rejectedTitle: 'Accesso negato',
      rejectedMessage: 'La tua richiesta di accesso è stata rifiutata.',
    },
  },

  ru: {
    // Navbar
    nav: {
      home: 'Главная',
      oratori: 'Ораторы',
      programmi: 'Программы',
      profilo: 'Профиль',
      admin: 'Админ',
      logout: 'Выйти',
    },

    // Common
    common: {
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      edit: 'Редактировать',
      add: 'Добавить',
      search: 'Поиск',
      loading: 'Загрузка...',
      error: 'Ошибка',
      noResults: 'Ничего не найдено',
      confirm: 'Подтвердить',
      close: 'Закрыть',
      yes: 'Да',
      no: 'Нет',
      created: 'Создано',
      updated: 'Обновлено',
      by: 'От',
    },

    // Home
    home: {
      title: 'Добро пожаловать',
      subtitle: 'Система управления ораторами EU2',
      quickActions: 'Быстрые действия',
      viewOratori: 'Просмотр ораторов',
      viewProgrammi: 'Управление программами',
      viewProfile: 'Ваш профиль',
    },

    // Oratori
    oratori: {
      title: 'Ораторы',
      subtitle: 'Общий список всех ораторов',
      newOratore: 'Новый оратор',
      editOratore: 'Редактировать оратора',
      deleteOratore: 'Удалить оратора',
      noOratori: 'Ораторы не найдены',
      startAdding: 'Начните с добавления первого оратора в список',
      addOratore: 'Добавить оратора',
      found: 'найден',
      foundPlural: 'найдено',
      oratore: 'оратор',
      oratoriPlural: 'ораторов',

      // Form fields
      nome: 'Имя',
      cognome: 'Фамилия',
      email: 'Эл. почта',
      telefono: 'Телефон',
      congregazione: 'Собрание',
      localita: 'Город',
      discorsi: 'Речи',
      discorsiRange: 'Речи (1-194)',
      discorsoNum: '№ речи',
      discorsiSelected: 'речь(ей) выбрано',

      // Status badges
      programmiFuturi: 'Будущие программы',
      questoMese: 'В этом месяце',
      noContatti: 'Контактные данные отсутствуют',

      // Delete confirmation
      confirmDelete: 'Подтверждение удаления',
      confirmDeleteText: 'Вы уверены, что хотите удалить оратора',
      deleteWarning: 'Это действие нельзя отменить.',

      // Errors
      errorLoading: 'Ошибка при загрузке',
      errorSaving: 'Ошибка при сохранении',
      errorDeleting: 'Ошибка при удалении',
    },

    // Filters
    filters: {
      title: 'Фильтр ораторов',
      activeFilters: 'активных фильтров',
      clear: 'Очистить',
      searchByName: 'Поиск по имени...',
      searchBySurname: 'Поиск по фамилии...',
      searchByCongregazione: 'Поиск по собранию...',
      searchByLocalita: 'Поиск по городу...',
      searchByDiscorso: 'Речь (номер или тема)',
      searchByDiscorsoPlaceholder: 'Напр: 42 или текст...',
      searchByDiscorsoHint: 'Поиск по номеру или тексту в названии',
    },

    // Programmi
    programmi: {
      title: 'Мои программы',
      subtitle: 'Управление вашими личными программами',
      newProgramma: 'Новая программа',
      editProgramma: 'Редактировать программу',
      noProgrammi: 'Программы не найдены',
      noProgrammiFuturi: 'Нет будущих программ',
      startCreating: 'Начните с создания первой программы',
      createFirst: 'Создать первую программу',
      showPast: 'Показать прошедшие программы',
      inProgramma: 'запланировано',
      totale: 'всего',
      programma: 'программа',
      programmiPlural: 'программ',

      // Form
      data: 'Дата (Сб/Вс)',
      orario: 'Время',
      oratore: 'Оратор',
      discorso: 'Речь',
      note: 'Заметки',
      notePlaceholder: 'Дополнительные заметки...',
      selectDiscorso: 'Выберите речь...',
      searchOratore: 'Найдите или выберите оратора...',
      distanceFrom: 'расстояние от',
      loadingOratori: 'Загрузка ораторов...',
      calculatingDistances: 'Расчёт расстояний...',
      availableFor: 'Доступны на',
      notAvailable: 'Недоступны на эту дату',
      occupied: 'Занят',
      noOratoreDiscorsi: 'У этого оратора нет назначенных речей. Сначала добавьте речи в разделе Ораторы.',

      // Validation
      selectWeekend: 'Выберите только субботу или воскресенье',
      oratoreOccupied: 'Оратор уже занят в эту дату',
      sunday: 'Воскресенье',
      saturday: 'Суббота',

      // Monthly warning
      monthlyWarning: 'У этого оратора уже есть речь в этом месяце',
      otherDates: 'Другие даты',
      monthlyHint: 'Как правило, каждый оратор должен выступать не более одного раза в месяц.',

      // Delete
      confirmDelete: 'Подтверждение удаления',
      confirmDeleteText: 'Вы уверены, что хотите удалить программу от',
    },

    // Profile
    profilo: {
      title: 'Ваш профиль',
      subtitle: 'Управление личными данными',
      yourLocalita: 'Ваш город',
      localitaHint: 'Используется для расчёта расстояний до ораторов',
      saveSuccess: 'Профиль успешно обновлён',
    },

    // Admin
    admin: {
      title: 'Панель администратора',
      subtitle: 'Управление пользователями и одобрениями',
      stats: 'Статистика',
      totalUsers: 'Всего пользователей',
      pendingUsers: 'Ожидают',
      activeUsers: 'Активных',
      adminUsers: 'Админов',
      pendingTab: 'Ожидающие',
      allUsersTab: 'Все пользователи',
      noPending: 'Нет пользователей, ожидающих одобрения',
      approve: 'Одобрить',
      reject: 'Отклонить',
      requestedAt: 'Запрошено',
      role: 'Роль',
      status: 'Статус',
      actions: 'Действия',
    },

    // Login
    login: {
      title: 'Ораторы EU2',
      subtitle: 'Система управления ораторами',
      loginWithGoogle: 'Войти через Google',
      pendingTitle: 'Запрос отправлен',
      pendingMessage: 'Ваш запрос на доступ отправлен. Администратор рассмотрит его в ближайшее время.',
      rejectedTitle: 'Доступ запрещён',
      rejectedMessage: 'Ваш запрос на доступ был отклонён.',
    },
  },
}
