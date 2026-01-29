import { MongoClient } from 'mongodb'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

const client = new MongoClient(MONGODB_URI)
await client.connect()
const db = client.db('gestionale-oratori')

const congregazioniCollection = db.collection('congregazioni')
const oratoriCollection = db.collection('oratori')

// Congregazioni da aggiungere con i loro responsabili
const daAggiungere = [
  { nome: 'Brescia Russa', orari: 'Domenica, 09:30', responsabileEmail: 'gianlucafacco@gmail.com' },
  { nome: 'Busto Arsizio Nord', orari: 'Sabato, 15:00', responsabileEmail: 'antoninosemilia78@gmail.com' },
  { nome: 'Verona', orari: 'Domenica, 10:00', responsabileEmail: 'andreafrigo87@gmail.com' },
]

console.log('\n=== Aggiunta congregazioni mancanti ===')

for (const cong of daAggiungere) {
  // Verifica se esiste già
  const existing = await congregazioniCollection.findOne({
    nome: { $regex: '^' + cong.nome + '$', $options: 'i' }
  })

  if (existing) {
    console.log('SKIP: ' + cong.nome + ' esiste già')
    continue
  }

  // Trova il responsabile
  const responsabile = await oratoriCollection.findOne({
    email: { $regex: '^' + cong.responsabileEmail + '$', $options: 'i' }
  })

  if (!responsabile) {
    console.log('ERRORE: Responsabile non trovato per ' + cong.nome + ' (' + cong.responsabileEmail + ')')
    continue
  }

  // Inserisci congregazione
  const result = await congregazioniCollection.insertOne({
    nome: cong.nome,
    responsabileOratoreId: responsabile._id,
    orari: cong.orari,
    indirizzo: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  console.log('INSERITA: ' + cong.nome + ' (responsabile: ' + responsabile.nome + ' ' + responsabile.cognome + ')')
}

// Verifica finale
console.log('\n=== Tutte le congregazioni ===')
const tutte = await congregazioniCollection.find({}).sort({ nome: 1 }).toArray()
console.log('Totale: ' + tutte.length)
for (const c of tutte) {
  console.log('- ' + c.nome)
}

await client.close()
