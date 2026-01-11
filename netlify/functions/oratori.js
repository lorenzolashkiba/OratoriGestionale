import { ObjectId } from 'mongodb'
import { connectToDatabase } from './utils/mongodb.js'
import { requireApprovedUser } from './utils/auth.js'

async function oratoriHandler(event, context, user, dbUser) {
  const { db } = await connectToDatabase()
  const oratoriCollection = db.collection('oratori')
  const usersCollection = db.collection('users')

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' }
  }

  try {
    // L'utente corrente viene passato dal middleware requireApprovedUser
    const currentUser = dbUser

    // GET - Ottieni tutti gli oratori o uno specifico
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {}

      // Se c'è un ID, ritorna solo quell'oratore
      if (params.id) {
        const oratore = await oratoriCollection.findOne({ _id: new ObjectId(params.id) })
        if (!oratore) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Oratore non trovato' }),
          }
        }
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(oratore),
        }
      }

      // Costruisci i filtri
      const filter = {}
      if (params.localita) {
        filter.localita = { $regex: params.localita, $options: 'i' }
      }
      if (params.nome) {
        filter.nome = { $regex: params.nome, $options: 'i' }
      }
      if (params.cognome) {
        filter.cognome = { $regex: params.cognome, $options: 'i' }
      }
      if (params.congregazione) {
        filter.congregazione = { $regex: params.congregazione, $options: 'i' }
      }

      const oratori = await oratoriCollection
        .find(filter)
        .sort({ cognome: 1, nome: 1 })
        .toArray()

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(oratori),
      }
    }

    // POST - Crea nuovo oratore
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body)
      const { nome, cognome, email, telefono, congregazione, localita, discorsi } = data

      if (!nome || !cognome) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Nome e cognome sono obbligatori' }),
        }
      }

      const newOratore = {
        nome,
        cognome,
        email: email || '',
        telefono: telefono || '',
        congregazione: congregazione || '',
        localita: localita || '',
        discorsi: discorsi || [],
        createdBy: currentUser._id,
        createdByName: `${currentUser.nome} ${currentUser.cognome}`.trim() || currentUser.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        updatedBy: currentUser._id,
        updatedByName: `${currentUser.nome} ${currentUser.cognome}`.trim() || currentUser.email,
      }

      const result = await oratoriCollection.insertOne(newOratore)
      newOratore._id = result.insertedId

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newOratore),
      }
    }

    // PUT - Aggiorna oratore
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body)
      const { id, nome, cognome, email, telefono, congregazione, localita, discorsi } = data

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'ID obbligatorio' }),
        }
      }

      const result = await oratoriCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            nome: nome || '',
            cognome: cognome || '',
            email: email || '',
            telefono: telefono || '',
            congregazione: congregazione || '',
            localita: localita || '',
            discorsi: discorsi || [],
            updatedAt: new Date(),
            updatedBy: currentUser._id,
            updatedByName: `${currentUser.nome} ${currentUser.cognome}`.trim() || currentUser.email,
          },
        },
        { returnDocument: 'after' }
      )

      if (!result) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Oratore non trovato' }),
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      }
    }

    // DELETE - Elimina oratore
    if (event.httpMethod === 'DELETE') {
      const data = JSON.parse(event.body)
      const { id } = data

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'ID obbligatorio' }),
        }
      }

      const result = await oratoriCollection.deleteOne({ _id: new ObjectId(id) })

      if (result.deletedCount === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Oratore non trovato' }),
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Oratore eliminato' }),
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Metodo non permesso' }),
    }
  } catch (error) {
    console.error('Errore oratori:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Errore interno del server' }),
    }
  }
}

export const handler = requireApprovedUser(oratoriHandler)
