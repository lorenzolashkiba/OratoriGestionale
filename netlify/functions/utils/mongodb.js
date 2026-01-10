import { MongoClient } from 'mongodb'

let cachedClient = null
let cachedDb = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI non configurato')
  }

  const client = new MongoClient(uri)
  await client.connect()

  const db = client.db('gestionale-oratori')

  cachedClient = client
  cachedDb = db

  return { client, db }
}
