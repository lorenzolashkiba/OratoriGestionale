import { MongoClient } from 'mongodb'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Leggi .env manualmente
const envPath = path.join(__dirname, '..', '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const envLines = envContent.split('\n')
let MONGODB_URI = ''

for (const line of envLines) {
  if (line.startsWith('MONGODB_URI=')) {
    MONGODB_URI = line.substring('MONGODB_URI='.length).trim()
    break
  }
}

if (!MONGODB_URI) {
  console.error('MONGODB_URI non trovato nel .env')
  process.exit(1)
}

// Mappatura giorni russo -> italiano
const giorni = {
  'Воскресенье': 'Domenica',
  'Суббота': 'Sabato',
}

// Dati dal CSV (già parsati)
const csvData = `Брешиа,"Brescia Russa, Италия","Воскресенье, 09:30",Джанлука Факко,Старейшина,+39 339 862 4738,gianlucafacco@gmail.com,Да,76;124
Бусто А. гр.,"Busto Arsizio Nord (группа), Италия","Суббота, 15:00",Антонино Семилиа,Старейшина,+39 349 108 5457,antoninosemilia78@gmail.com,Да,87;143;149;171;181;186
Венеция,"Venezia Russa, Италия","Воскресенье, 13:30",Luigi Lanni,Старейшина,0039 328 758 1928,llanni76@gmail.com,Да,69;107;125;186
Венеция,"Venezia Russa, Италия","Воскресенье, 13:30",Ренцо Тонделли,Старейшина,+39 339 684 6594,renzo.tondelli@gmail.com,Да,1;8;65;76;92;105;166;176;184;187;191
Венеция,"Venezia Russa, Италия","Воскресенье, 13:30",Чиро Греко,Старейшина,+39 328 859 5981,ciro.greco@icloud.com,Да,37;105;117
Верона гр.,"Verona (группа), Италия","Воскресенье, 10:00",Андреа Фриго,Старейшина,+39 349 565 2867,andreafrigo87@gmail.com,Да,2;0
Генуя гр.,"Genova Certosa (группа), Италия","Воскресенье, 10:00",Алессандро Ферранди,Старейшина,+39 338 796 4814,ale.ferrandi@gmail.com,Да,28;150;160
Генуя гр.,"Genova Certosa (группа), Италия","Воскресенье, 10:00",Юрий Кожевников,Старейшина,+39 348 651 3578,yuriykoz21@gmail.com,Да,11;35
Маростика гр.,"Marostica (группа), Италия","Суббота, 15:00",Алессандро Пиккиралло,Служебный помощник,+39 348 233 8377,sandropik@gmail.com,Да,24;103;192
Милан Север,"Milano Russa Nord, Италия","Воскресенье, 10.00",Filippo Pecora,Старейшина,+39 339 6056264,filippo.pecora12@icloud.com,Да,21;24;50;96;165;169;177;180;188
Милан Север,"Milano Russa Nord, Италия","Воскресенье, 10.00",Michele Catalano,Старейшина,+39 380 3250183,michele.catalano@live.com,Да,2;60;62;101;114;131;137;148;155;164;176;184
Милан Север,"Milano Russa Nord, Италия","Воскресенье, 10.00",Егор Щепачёв,Старейшина,+39 342 7309673,scepacini@gmail.com,Да,30;68;77;80;129
Милан Юг,"Milano Russa Sud, Италия","Воскресенье, 12:30",Джанни Ди Чокко,Старейшина,+39 349 767 8421,giannidiciocco@gmail.com,Да,8;11;70;133;186
Милан Юг,"Milano Russa Sud, Италия","Воскресенье, 12:30",Михайл Товарницкий,Старейшина,+39 327 582 0449,mihail.tovarnitskiy@gmail.com,Да,27;78;160;192
Милан Юг,"Milano Russa Sud, Италия","Воскресенье, 12:30",Стефано Кольнаги,Старейшина,+39 349 502 5583,solostiopa@gmail.com,Да,15;124;173;177;187
Милан Юг,"Milano Russa Sud, Италия","Воскресенье, 12:30",Роберто Порчиелло,Старейшина,+39 393 093 0995,roberto_porciello@libero.it,Да,6;9;19;24;101;150;193
Милан Юг,"Milano Russa Sud, Италия","Воскресенье, 12:30",Николай Бадрак,Старейшина,+39 327 582 8925,nbadrak98@gmail.com,Да,139;194
Падова гр.,"Padova Borgomagno (группа), Италия","Суббота, 15:15",Никола Боаретто,Старейшина,+39 349 713 4658,boaretto.n@gmail.com,Да,170;0
Падова гр.,"Padova Borgomagno (группа), Италия","Суббота, 15:15",Энрико Менеготто,Старейшина,+39 349 353 6405,enrico.menegotto@gmail.com,Да,1;115;123;173
Падова гр.,"Padova Borgomagno (группа), Италия","Суббота, 15:15",Данел Зегря,Старейшина,+39 329 733 5331,danelzegrya@gmail.com,Да,67;76;110;114;168;176;184;190;192
Порденоне гр.,"Pordenone Meduna (группа), Италия","Суббота, 14:00",Антоний Лебид,Старейшина,+39 392 791 8584,LebidA11@jwpub.org,Да,1;160;170;179;180
Санремо гр.,"Sanremo Ovest (группа), Италия","Воскресенье, 16:30",Игорь Мыхалишин,Старейшина,+39 389 533 3743,igor.novara@gmail.com,Да,50;100;115
Сеграте гр.,"Segrate (группа), Италия","Воскресенье, 14:00",Томми Тиккала,Старейшина,+39 334 17 33 177,tommi.tikkala@gmail.com,Да,45;53;56;57;65;67;105;134;156
Сеграте гр.,"Segrate (группа), Италия","Воскресенье, 14:00",Марко Паолетта,Старейшина,+39 328 64 59 558,ipotini@gmail.com,Да,41;68;76;100;161
Сеграте гр.,"Segrate (группа), Италия","Воскресенье, 14:00",Егор Щепачёв,Старейшина,+39 342 73 096 73,scepacini@gmail.com,Да,68;77;80;113;129;192
Тревизо гр.,"Treviso Est (группа), Италия","Воскресенье, 14:45",Эммануеле Панелла,Старейшина,+39 333 895 8353,emmanuele.panella@icloud.com,Да,87;158
Тревизо гр.,"Treviso Est (группа), Италия","Воскресенье, 14:45",Симоне Соппелса,Старейшина,+39 347 642 3816,simonealesoppelsa@gmail.com,Да,86;187
Тренто гр.,"Trento Sud (группа), Италия","Воскресенье, 10:00",Маттео Коррадетти,Старейшина,+39 333 833 6149,1MatteoCorradetti@jwpub.org,Да,54;98;153;157;168;182
Тренто гр.,"Trento Sud (группа), Италия","Воскресенье, 10:00",Serghei Palamarchiuk,Старейшина,+39 351 6434480,PalamarchuSerhii@jwpub.org,Да,67;101;160;165
Турин гр.,"Torino (группа), Италия","Воскресенье, 10:30",Джованни Мотта,Старейшина,+39 320 045 9046,giemme@jwpub.org,Да,23;176;181;187
Турин гр.,"Torino (группа), Италия","Воскресенье, 10:30",Александр Гынку,Старейшина,+39 347 327 1279,gincualexandr4@jwpub.org,Да,1;0
Удине гр.,"Udine Torre (группа), Италия","Суббота , 14:45",Юрий Савченко,Старейшина,+39 324 694 5389,bm3366ap@gmail.com,Да,11;31;117;165;189
Удине гр.,"Udine Torre (группа), Италия","Суббота , 14:45",Dumitru Fediucovici,Старейшина,3664193274.0,dimafedy94@gmail.com,Да,6;11;24;41;148
Фино Морнаско гр.,"Fino Mornasco (группа), Италия","Воскресенье, 10:15",Сергей Олонцев,Старейшина,+39 351 145 9209,Solontsev@gmail.com,Да,168;190
Фино Морнаско гр.,"Fino Mornasco (группа), Италия","Воскресенье, 10:15",Семён Скляров,Старейшина,+39 347 963 6185,Sklyarovsemen@gmail.com,Да,12;14;18;42;94;127`

// Mappa nomi russo -> italiano (per quelli che ho identificato)
const nomiMap = {
  'Джанлука Факко': { nome: 'Gianluca', cognome: 'Facco' },
  'Антонино Семилиа': { nome: 'Antonino', cognome: 'Semilia' },
  'Ренцо Тонделли': { nome: 'Renzo', cognome: 'Tondelli' },
  'Чиро Греко': { nome: 'Ciro', cognome: 'Greco' },
  'Андреа Фриго': { nome: 'Andrea', cognome: 'Frigo' },
  'Алессандро Ферранди': { nome: 'Alessandro', cognome: 'Ferrandi' },
  'Юрий Кожевников': { nome: 'Yuriy', cognome: 'Kozhevnikov' },
  'Алессандро Пиккиралло': { nome: 'Alessandro', cognome: 'Picchirrallo' },
  'Егор Щепачёв': { nome: 'Egor', cognome: 'Shchepachev' },
  'Джанни Ди Чокко': { nome: 'Gianni', cognome: 'Di Ciocco' },
  'Михайл Товарницкий': { nome: 'Mikhail', cognome: 'Tovarnitskiy' },
  'Стефано Кольнаги': { nome: 'Stefano', cognome: 'Colnagi' },
  'Роберто Порчиелло': { nome: 'Roberto', cognome: 'Porciello' },
  'Николай Бадрак': { nome: 'Nikolay', cognome: 'Badrak' },
  'Никола Боаретто': { nome: 'Nicola', cognome: 'Boaretto' },
  'Энрико Менеготто': { nome: 'Enrico', cognome: 'Menegotto' },
  'Данел Зегря': { nome: 'Danel', cognome: 'Zegrya' },
  'Антоний Лебид': { nome: 'Anton', cognome: 'Lebid' },
  'Игорь Мыхалишин': { nome: 'Igor', cognome: 'Mykhalishyn' },
  'Томми Тиккала': { nome: 'Tommi', cognome: 'Tikkala' },
  'Марко Паолетта': { nome: 'Marco', cognome: 'Paoletta' },
  'Эммануеле Панелла': { nome: 'Emmanuele', cognome: 'Panella' },
  'Симоне Соппелса': { nome: 'Simone', cognome: 'Soppelsa' },
  'Маттео Коррадетти': { nome: 'Matteo', cognome: 'Corradetti' },
  'Джованни Мотта': { nome: 'Giovanni', cognome: 'Motta' },
  'Александр Гынку': { nome: 'Alexandr', cognome: 'Gincu' },
  'Юрий Савченко': { nome: 'Yuriy', cognome: 'Savchenko' },
  'Сергей Олонцев': { nome: 'Sergey', cognome: 'Olontsev' },
  'Семён Скляров': { nome: 'Semen', cognome: 'Sklyarov' },
}

function parseNome(nomeCompleto) {
  // Se è nella mappa, usa la traduzione
  if (nomiMap[nomeCompleto]) {
    return nomiMap[nomeCompleto]
  }

  // Altrimenti prova a splittare (per nomi già in italiano/latino)
  const parts = nomeCompleto.trim().split(/\s+/)
  if (parts.length >= 2) {
    // Ultimo elemento è il cognome, il resto è il nome
    const cognome = parts.pop()
    const nome = parts.join(' ')
    return { nome, cognome }
  }

  return { nome: nomeCompleto, cognome: '' }
}

function parseCongregazione(nomeUfficiale) {
  // Rimuove ", Италия" dalla fine
  let nome = nomeUfficiale.replace(/, Италия$/, '').trim()
  // Rimuove " (группа)" se presente
  nome = nome.replace(/ \(группа\)$/, '')
  return nome
}

function parseOrario(orarioRusso) {
  // Formato: "Воскресенье, 09:30" o "Суббота, 15:00"
  for (const [russo, italiano] of Object.entries(giorni)) {
    if (orarioRusso.includes(russo)) {
      return orarioRusso.replace(russo, italiano).replace('.', ':')
    }
  }
  return orarioRusso.replace('.', ':')
}

function parseDiscorsi(discorsiStr) {
  if (!discorsiStr) return []
  return discorsiStr.split(';')
    .map(d => parseInt(d.trim(), 10))
    .filter(d => !isNaN(d) && d > 0) // Filtra NaN e 0
}

function parseCsvLine(line) {
  // Parser CSV semplice che gestisce i campi con virgolette
  const result = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim())

  return result
}

async function main() {
  console.log('Connessione a MongoDB...')
  const client = new MongoClient(MONGODB_URI)

  try {
    await client.connect()
    const db = client.db('gestionale-oratori')
    const oratoriCollection = db.collection('oratori')
    const congregazioniCollection = db.collection('congregazioni')

    console.log('Connesso!')

    // Leggi oratori esistenti per evitare duplicati
    const oratoriEsistenti = await oratoriCollection.find({}).toArray()
    const emailEsistenti = new Set(oratoriEsistenti.map(o => o.email?.toLowerCase()).filter(Boolean))

    // Leggi congregazioni esistenti
    const congregazioniEsistenti = await congregazioniCollection.find({}).toArray()
    const nomiCongEsistenti = new Set(congregazioniEsistenti.map(c => c.nome.toLowerCase()))

    console.log(`Oratori esistenti: ${oratoriEsistenti.length}`)
    console.log(`Congregazioni esistenti: ${congregazioniEsistenti.length}`)

    // Parse CSV
    const lines = csvData.split('\n').filter(l => l.trim())
    const records = lines.map(line => {
      const fields = parseCsvLine(line)
      return {
        nomeRusso: fields[0],
        congregazioneUfficiale: fields[1],
        orario: fields[2],
        nomeOratore: fields[3],
        ruolo: fields[4],
        telefono: fields[5],
        email: fields[6],
        disponibile: fields[7],
        discorsi: fields[8],
      }
    })

    // Raggruppa per congregazione e trova il primo oratore (sarà il responsabile)
    const congregazioniMap = new Map() // nome -> { orario, responsabileEmail }
    const oratoriDaInserire = []
    const oratoriSkipped = []

    for (const record of records) {
      const congNome = parseCongregazione(record.congregazioneUfficiale)
      const orario = parseOrario(record.orario)
      const { nome, cognome } = parseNome(record.nomeOratore)
      const discorsi = parseDiscorsi(record.discorsi)
      const email = record.email?.toLowerCase()

      // Verifica se l'oratore esiste già (per email)
      if (email && emailEsistenti.has(email)) {
        oratoriSkipped.push({ nome, cognome, email, motivo: 'Email già esistente' })
        continue
      }

      // Registra congregazione se non già vista
      if (!congregazioniMap.has(congNome)) {
        congregazioniMap.set(congNome, { orario, responsabileEmail: email })
      }

      oratoriDaInserire.push({
        nome,
        cognome,
        email: record.email || '',
        telefono: record.telefono || '',
        congregazione: congNome,
        localita: 'Italia',
        discorsi,
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      if (email) {
        emailEsistenti.add(email)
      }
    }

    console.log(`\nOratori da inserire: ${oratoriDaInserire.length}`)
    console.log(`Oratori saltati (duplicati): ${oratoriSkipped.length}`)

    if (oratoriSkipped.length > 0) {
      console.log('\nOratori saltati:')
      oratoriSkipped.forEach(o => console.log(`  - ${o.nome} ${o.cognome} (${o.email}): ${o.motivo}`))
    }

    // Inserisci oratori
    if (oratoriDaInserire.length > 0) {
      const resultOratori = await oratoriCollection.insertMany(oratoriDaInserire)
      console.log(`\nOratori inseriti: ${resultOratori.insertedCount}`)
    }

    // Ora crea le congregazioni
    // Prima recupera tutti gli oratori (inclusi quelli appena inseriti) per trovare i responsabili
    const tuttiOratori = await oratoriCollection.find({}).toArray()

    const congregazioniDaInserire = []
    const congregazioniSkipped = []

    for (const [nome, info] of congregazioniMap) {
      // Verifica se la congregazione esiste già
      if (nomiCongEsistenti.has(nome.toLowerCase())) {
        congregazioniSkipped.push({ nome, motivo: 'Già esistente' })
        continue
      }

      // Trova il responsabile (primo oratore con quell'email o primo oratore della congregazione)
      let responsabile = null
      if (info.responsabileEmail) {
        responsabile = tuttiOratori.find(o => o.email?.toLowerCase() === info.responsabileEmail)
      }
      if (!responsabile) {
        // Trova il primo oratore di questa congregazione
        responsabile = tuttiOratori.find(o => o.congregazione === nome)
      }

      if (!responsabile) {
        congregazioniSkipped.push({ nome, motivo: 'Nessun responsabile trovato' })
        continue
      }

      congregazioniDaInserire.push({
        nome,
        responsabileOratoreId: responsabile._id,
        orari: info.orario,
        indirizzo: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    console.log(`\nCongregazioni da inserire: ${congregazioniDaInserire.length}`)
    console.log(`Congregazioni saltate: ${congregazioniSkipped.length}`)

    if (congregazioniSkipped.length > 0) {
      console.log('\nCongregazioni saltate:')
      congregazioniSkipped.forEach(c => console.log(`  - ${c.nome}: ${c.motivo}`))
    }

    // Inserisci congregazioni
    if (congregazioniDaInserire.length > 0) {
      const resultCong = await congregazioniCollection.insertMany(congregazioniDaInserire)
      console.log(`\nCongregazioni inserite: ${resultCong.insertedCount}`)
    }

    // Riepilogo finale
    console.log('\n=== RIEPILOGO ===')
    const oratoriFinali = await oratoriCollection.countDocuments()
    const congregazioniFinali = await congregazioniCollection.countDocuments()
    console.log(`Totale oratori nel DB: ${oratoriFinali}`)
    console.log(`Totale congregazioni nel DB: ${congregazioniFinali}`)

  } catch (error) {
    console.error('Errore:', error)
  } finally {
    await client.close()
    console.log('\nConnessione chiusa.')
  }
}

main()
