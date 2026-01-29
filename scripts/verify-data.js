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

console.log('\n=== CONGREGAZIONI ===')
const congregazioni = await db.collection('congregazioni').find({}).sort({nome: 1}).toArray()
for (const c of congregazioni) {
  console.log('- ' + c.nome + ' | Orari: ' + (c.orari || 'N/A'))
}

console.log('\n=== ORATORI (ultimi 25 inseriti) ===')
const oratori = await db.collection('oratori').find({}).sort({createdAt: -1}).limit(25).toArray()
for (const o of oratori) {
  const discorsiCount = o.discorsi ? o.discorsi.length : 0
  console.log('- ' + o.nome + ' ' + o.cognome + ' | ' + o.congregazione + ' | Discorsi: ' + discorsiCount)
}

await client.close()
