import { ObjectId } from 'mongodb'
import { connectToDatabase } from './utils/mongodb.js'
import { requireAuth } from './utils/auth.js'

async function programmiHandler(event, context, user) {
  const { db } = await connectToDatabase()
  const programmiCollection = db.collection('programmi')
  const usersCollection = db.collection('users')
  const oratoriCollection = db.collection('oratori')

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
    // Ottieni l'utente corrente dal database
    const currentUser = await usersCollection.findOne({ googleId: user.uid })
    if (!currentUser) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: 'Utente non trovato' }),
      }
    }

    // GET - Ottieni programmi
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {}

      // Se richiesto, ritorna le date occupate di un oratore (da tutti i programmi)
      if (params.oratoreId && params.occupiedOnly === 'true') {
        const programmi = await programmiCollection
          .find({ oratoreId: new ObjectId(params.oratoreId) })
          .project({ data: 1 })
          .toArray()

        const dates = programmi.map((p) => p.data)
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(dates),
        }
      }

      // Altrimenti ritorna solo i programmi dell'utente corrente
      const programmi = await programmiCollection
        .aggregate([
          { $match: { userId: currentUser._id } },
          {
            $lookup: {
              from: 'oratori',
              localField: 'oratoreId',
              foreignField: '_id',
              as: 'oratore',
            },
          },
          { $unwind: { path: '$oratore', preserveNullAndEmptyArrays: true } },
          { $sort: { data: 1 } },
        ])
        .toArray()

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(programmi),
      }
    }

    // POST - Crea nuovo programma
    if (event.httpMethod === 'POST') {
      const data = JSON.parse(event.body)
      const { data: dataEvento, orario, oratoreId, discorso, note } = data

      if (!dataEvento || !orario || !oratoreId || discorso === undefined) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Dati incompleti' }),
        }
      }

      // Verifica che l'oratore esista
      const oratore = await oratoriCollection.findOne({ _id: new ObjectId(oratoreId) })
      if (!oratore) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Oratore non trovato' }),
        }
      }

      // Verifica che la data sia sabato o domenica
      const dateObj = new Date(dataEvento)
      const dayOfWeek = dateObj.getDay()
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'La data deve essere sabato o domenica' }),
        }
      }

      // Verifica che l'oratore non sia già occupato in quella data
      const existingProgram = await programmiCollection.findOne({
        oratoreId: new ObjectId(oratoreId),
        data: new Date(dataEvento),
      })

      if (existingProgram) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ message: 'Oratore già occupato in questa data' }),
        }
      }

      const newProgramma = {
        userId: currentUser._id,
        data: new Date(dataEvento),
        orario,
        oratoreId: new ObjectId(oratoreId),
        discorso,
        note: note || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await programmiCollection.insertOne(newProgramma)
      newProgramma._id = result.insertedId
      newProgramma.oratore = oratore

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newProgramma),
      }
    }

    // PUT - Aggiorna programma
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body)
      const { id, data: dataEvento, orario, oratoreId, discorso, note } = data

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'ID obbligatorio' }),
        }
      }

      // Verifica che il programma appartenga all'utente
      const existingProgramma = await programmiCollection.findOne({
        _id: new ObjectId(id),
        userId: currentUser._id,
      })

      if (!existingProgramma) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Programma non trovato' }),
        }
      }

      // Verifica che la data sia sabato o domenica
      if (dataEvento) {
        const dateObj = new Date(dataEvento)
        const dayOfWeek = dateObj.getDay()
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'La data deve essere sabato o domenica' }),
          }
        }
      }

      // Se cambia oratore o data, verifica disponibilita
      const newOratoreId = oratoreId ? new ObjectId(oratoreId) : existingProgramma.oratoreId
      const newData = dataEvento ? new Date(dataEvento) : existingProgramma.data

      const conflictingProgram = await programmiCollection.findOne({
        _id: { $ne: new ObjectId(id) },
        oratoreId: newOratoreId,
        data: newData,
      })

      if (conflictingProgram) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ message: 'Oratore già occupato in questa data' }),
        }
      }

      const updateFields = {
        updatedAt: new Date(),
      }
      if (dataEvento) updateFields.data = new Date(dataEvento)
      if (orario) updateFields.orario = orario
      if (oratoreId) updateFields.oratoreId = new ObjectId(oratoreId)
      if (discorso !== undefined) updateFields.discorso = discorso
      if (note !== undefined) updateFields.note = note

      const result = await programmiCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateFields },
        { returnDocument: 'after' }
      )

      // Aggiungi i dati dell'oratore
      const oratore = await oratoriCollection.findOne({ _id: result.oratoreId })
      result.oratore = oratore

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      }
    }

    // DELETE - Elimina programma
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

      // Verifica che il programma appartenga all'utente
      const result = await programmiCollection.deleteOne({
        _id: new ObjectId(id),
        userId: currentUser._id,
      })

      if (result.deletedCount === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Programma non trovato' }),
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Programma eliminato' }),
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Metodo non permesso' }),
    }
  } catch (error) {
    console.error('Errore programmi:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Errore interno del server' }),
    }
  }
}

export const handler = requireAuth(programmiHandler)
