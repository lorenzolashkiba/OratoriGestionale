import { ObjectId } from 'mongodb'
import { connectToDatabase } from './utils/mongodb.js'
import { requireApprovedUser } from './utils/auth.js'

async function congregazioniHandler(event, context, user, dbUser) {
  const { db } = await connectToDatabase()
  const congregazioniCollection = db.collection('congregazioni')
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

  const currentUser = dbUser

  try {
    // GET - Lista tutte o dettaglio per nome
    if (event.httpMethod === 'GET') {
      const params = event.queryStringParameters || {}

      // GET /congregazioni?nome=X - Dettaglio per nome
      if (params.nome) {
        const congregazione = await congregazioniCollection.findOne({
          nome: { $regex: `^${params.nome}$`, $options: 'i' },
        })

        if (!congregazione) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Congregazione non trovata' }),
          }
        }

        // Popola dati responsabile (oratore)
        if (congregazione.responsabileOratoreId) {
          const responsabile = await oratoriCollection.findOne(
            { _id: congregazione.responsabileOratoreId },
            { projection: { nome: 1, cognome: 1, email: 1, telefono: 1 } }
          )
          congregazione.responsabile = responsabile
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(congregazione),
        }
      }

      // GET /congregazioni - Lista tutte con responsabili (oratori)
      const congregazioni = await congregazioniCollection
        .aggregate([
          {
            $lookup: {
              from: 'oratori',
              localField: 'responsabileOratoreId',
              foreignField: '_id',
              as: 'responsabile',
              pipeline: [{ $project: { nome: 1, cognome: 1, email: 1, telefono: 1 } }],
            },
          },
          { $unwind: { path: '$responsabile', preserveNullAndEmptyArrays: true } },
          { $sort: { nome: 1 } },
        ])
        .toArray()

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(congregazioni),
      }
    }

    // POST - Crea nuova congregazione (solo admin)
    if (event.httpMethod === 'POST') {
      if (currentUser.role !== 'admin') {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'Solo gli admin possono creare congregazioni' }),
        }
      }

      const data = JSON.parse(event.body)
      const { nome, responsabileOratoreId, orari, indirizzo } = data

      if (!nome || !responsabileOratoreId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Nome e responsabile sono obbligatori' }),
        }
      }

      // Verifica unicita nome
      const existing = await congregazioniCollection.findOne({
        nome: { $regex: `^${nome}$`, $options: 'i' },
      })
      if (existing) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ message: 'Esiste gia una congregazione con questo nome' }),
        }
      }

      // Verifica che l'oratore esista
      const responsabile = await oratoriCollection.findOne({
        _id: new ObjectId(responsabileOratoreId),
      })
      if (!responsabile) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Oratore responsabile non trovato' }),
        }
      }

      const newCongregazione = {
        nome: nome.trim(),
        responsabileOratoreId: new ObjectId(responsabileOratoreId),
        orari: orari || '',
        indirizzo: indirizzo || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: currentUser._id,
      }

      const result = await congregazioniCollection.insertOne(newCongregazione)
      newCongregazione._id = result.insertedId
      newCongregazione.responsabile = {
        _id: responsabile._id,
        nome: responsabile.nome,
        cognome: responsabile.cognome,
        email: responsabile.email,
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newCongregazione),
      }
    }

    // PUT - Modifica congregazione
    if (event.httpMethod === 'PUT') {
      const data = JSON.parse(event.body)
      const { id, nome, responsabileOratoreId, orari, indirizzo } = data

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'ID obbligatorio' }),
        }
      }

      const congregazione = await congregazioniCollection.findOne({ _id: new ObjectId(id) })
      if (!congregazione) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Congregazione non trovata' }),
        }
      }

      // Verifica permessi: admin o utente collegato all'oratore responsabile
      const isAdmin = currentUser.role === 'admin'

      // Controlla se l'utente corrente è collegato all'oratore responsabile
      let isResponsabile = false
      if (congregazione.responsabileOratoreId && currentUser.oratoreId) {
        isResponsabile = congregazione.responsabileOratoreId.toString() === currentUser.oratoreId.toString()
      }

      if (!isAdmin && !isResponsabile) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'Non hai i permessi per modificare questa congregazione' }),
        }
      }

      const updateData = {
        updatedAt: new Date(),
      }

      // Solo admin puo cambiare nome e responsabile
      if (isAdmin) {
        if (nome) {
          // Verifica unicita del nuovo nome (escluso se stesso)
          const existing = await congregazioniCollection.findOne({
            nome: { $regex: `^${nome}$`, $options: 'i' },
            _id: { $ne: new ObjectId(id) },
          })
          if (existing) {
            return {
              statusCode: 409,
              headers,
              body: JSON.stringify({ message: 'Esiste gia una congregazione con questo nome' }),
            }
          }
          updateData.nome = nome.trim()
        }

        if (responsabileOratoreId) {
          const responsabile = await oratoriCollection.findOne({
            _id: new ObjectId(responsabileOratoreId),
          })
          if (!responsabile) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ message: 'Oratore responsabile non trovato' }),
            }
          }
          updateData.responsabileOratoreId = new ObjectId(responsabileOratoreId)
        }
      } else if (responsabileOratoreId && responsabileOratoreId !== congregazione.responsabileOratoreId?.toString()) {
        // Responsabile non puo cambiare se stesso
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'Non puoi cambiare il responsabile' }),
        }
      }

      // Campi modificabili da entrambi (admin e responsabile)
      if (orari !== undefined) updateData.orari = orari
      if (indirizzo !== undefined) updateData.indirizzo = indirizzo

      const result = await congregazioniCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: updateData },
        { returnDocument: 'after' }
      )

      // Popola responsabile (oratore)
      if (result.responsabileOratoreId) {
        const responsabile = await oratoriCollection.findOne(
          { _id: result.responsabileOratoreId },
          { projection: { nome: 1, cognome: 1, email: 1, telefono: 1 } }
        )
        result.responsabile = responsabile
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      }
    }

    // DELETE - Elimina congregazione (solo admin)
    if (event.httpMethod === 'DELETE') {
      if (currentUser.role !== 'admin') {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ message: 'Solo gli admin possono eliminare congregazioni' }),
        }
      }

      const data = JSON.parse(event.body)
      const { id } = data

      if (!id) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'ID obbligatorio' }),
        }
      }

      const result = await congregazioniCollection.deleteOne({ _id: new ObjectId(id) })

      if (result.deletedCount === 0) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Congregazione non trovata' }),
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Congregazione eliminata' }),
      }
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Metodo non permesso' }),
    }
  } catch (error) {
    console.error('Errore congregazioni:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Errore interno del server' }),
    }
  }
}

export const handler = requireApprovedUser(congregazioniHandler)
