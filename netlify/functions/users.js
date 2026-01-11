import { ObjectId } from 'mongodb'
import { connectToDatabase } from './utils/mongodb.js'
import { requireAuth } from './utils/auth.js'

async function usersHandler(event, context, user) {
  const { db } = await connectToDatabase()
  const usersCollection = db.collection('users')
  const oratoriCollection = db.collection('oratori')

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  try {
    // GET - Ottieni profilo utente
    if (event.httpMethod === 'GET') {
      let userProfile = await usersCollection.findOne({ googleId: user.uid })

      // Se non esiste, crealo
      if (!userProfile) {
        const newUser = {
          googleId: user.uid,
          email: user.email,
          nome: '',
          cognome: '',
          telefono: '',
          congregazione: '',
          localita: '',
          oratoreId: null, // Collegamento all'oratore
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        await usersCollection.insertOne(newUser)
        userProfile = newUser
      }

      // Se l'utente e' collegato a un oratore, carica i dati dell'oratore
      if (userProfile.oratoreId) {
        const oratore = await oratoriCollection.findOne({ _id: new ObjectId(userProfile.oratoreId) })
        userProfile.oratore = oratore
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(userProfile),
      }
    }

    // PUT - Aggiorna profilo utente
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body)
      const { nome, cognome, telefono, congregazione, localita, oratoreId } = data

      const updateData = {
        nome: nome || '',
        cognome: cognome || '',
        telefono: telefono || '',
        congregazione: congregazione || '',
        localita: localita || '',
        updatedAt: new Date(),
      }

      // Gestisci collegamento/scollegamento oratore
      if (oratoreId !== undefined) {
        if (oratoreId === null) {
          // Scollega l'oratore
          updateData.oratoreId = null
        } else {
          // Verifica che l'oratore esista e non sia gia' collegato a un altro utente
          const oratore = await oratoriCollection.findOne({ _id: new ObjectId(oratoreId) })
          if (!oratore) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ message: 'Oratore non trovato' }),
            }
          }

          // Verifica che l'oratore non sia gia' collegato a un altro utente
          const existingLink = await usersCollection.findOne({
            oratoreId: new ObjectId(oratoreId),
            googleId: { $ne: user.uid },
          })
          if (existingLink) {
            return {
              statusCode: 409,
              headers,
              body: JSON.stringify({ message: 'Questo oratore e\' gia\' collegato a un altro utente' }),
            }
          }

          updateData.oratoreId = new ObjectId(oratoreId)
        }
      }

      const result = await usersCollection.findOneAndUpdate(
        { googleId: user.uid },
        { $set: updateData },
        { returnDocument: 'after', upsert: true }
      )

      // Carica i dati dell'oratore se collegato
      if (result.oratoreId) {
        const oratore = await oratoriCollection.findOne({ _id: result.oratoreId })
        result.oratore = oratore
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Metodo non permesso' }),
    }
  } catch (error) {
    console.error('Errore users:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Errore interno del server' }),
    }
  }
}

export const handler = requireAuth(usersHandler)
