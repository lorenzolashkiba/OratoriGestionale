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

// Cerca congregazioni specifiche
const missingNames = ['Brescia', 'Busto', 'Verona']
console.log('\n=== Cerca congregazioni mancanti ===')
for (const name of missingNames) {
  const found = await db.collection('congregazioni').find({
    nome: { $regex: name, $options: 'i' }
  }).toArray()
  console.log(name + ': ' + (found.length > 0 ? found.map(f => f.nome).join(', ') : 'NON TROVATA'))
}

// Cerca oratori di queste congregazioni
console.log('\n=== Oratori di queste congregazioni ===')
const oratori = await db.collection('oratori').find({
  $or: [
    { congregazione: { $regex: 'Brescia', $options: 'i' } },
    { congregazione: { $regex: 'Busto', $options: 'i' } },
    { congregazione: { $regex: 'Verona', $options: 'i' } }
  ]
}).toArray()

for (const o of oratori) {
  console.log('- ' + o.nome + ' ' + o.cognome + ' | ' + o.congregazione + ' | ' + o.email)
}

await client.close()
