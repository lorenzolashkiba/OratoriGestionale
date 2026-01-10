import { connectToDatabase } from './utils/mongodb.js'
import { requireAuth } from './utils/auth.js'

async function usersHandler(event, context, user) {
  const { db } = await connectToDatabase()
  const usersCollection = db.collection('users')

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
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        await usersCollection.insertOne(newUser)
        userProfile = newUser
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
      const { nome, cognome, telefono, congregazione, localita } = data

      const result = await usersCollection.findOneAndUpdate(
        { googleId: user.uid },
        {
          $set: {
            nome: nome || '',
            cognome: cognome || '',
            telefono: telefono || '',
            congregazione: congregazione || '',
            localita: localita || '',
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after', upsert: true }
      )

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
