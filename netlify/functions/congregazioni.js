import { ObjectId } from 'mongodb'
import { connectToDatabase } from './utils/mongodb.js'
import { requireApprovedUser } from './utils/auth.js'

const normalize = (value) => (value || '').trim().replace(/\s+/g, ' ').toLowerCase()

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

async function getResponsabileDetails(congregazione, oratoriCollection, usersCollection) {
  if (congregazione?.responsabileUserId) {
    const responsabileUser = await usersCollection.findOne(
      { _id: congregazione.responsabileUserId },
      { projection: { nome: 1, cognome: 1, email: 1, telefono: 1 } }
    )
    if (responsabileUser) {
      return { ...responsabileUser, source: 'user' }
    }
  }

  if (congregazione?.responsabileOratoreId) {
    const responsabileOratore = await oratoriCollection.findOne(
      { _id: congregazione.responsabileOratoreId },
      { projection: { nome: 1, cognome: 1, email: 1, telefono: 1 } }
    )
    if (responsabileOratore) {
      return { ...responsabileOratore, source: 'oratore' }
    }
  }

  return null
}

async function resolveResponsabileSelection({
  selection,
  targetCongregazioneNome,
  oratoriCollection,
  usersCollection,
}) {
  if (!selection) return null

  const rawSelection = selection.toString().trim()
  const [typePart, idPart] = rawSelection.includes(':') ? rawSelection.split(':', 2) : ['oratore', rawSelection]

  if (!ObjectId.isValid(idPart)) {
    throw new Error('INVALID_RESPONSABILE_ID')
  }

  const responsabileId = new ObjectId(idPart)

  if (typePart === 'user') {
    const responsabileUser = await usersCollection.findOne({ _id: responsabileId })
    if (!responsabileUser) throw new Error('RESPONSABILE_USER_NOT_FOUND')

    if (normalize(responsabileUser.congregazione) !== normalize(targetCongregazioneNome)) {
      throw new Error('RESPONSABILE_NOT_IN_CONGREGAZIONE')
    }

    return {
      responsabileOratoreId: null,
      responsabileUserId: responsabileId,
      responsabile: responsabileUser,
      source: 'user',
    }
  }

  const responsabileOratore = await oratoriCollection.findOne({ _id: responsabileId })
  if (!responsabileOratore) throw new Error('RESPONSABILE_ORATORE_NOT_FOUND')

  if (normalize(responsabileOratore.congregazione) !== normalize(targetCongregazioneNome)) {
    throw new Error('RESPONSABILE_NOT_IN_CONGREGAZIONE')
  }

  return {
    responsabileOratoreId: responsabileId,
    responsabileUserId: null,
    responsabile: responsabileOratore,
    source: 'oratore',
  }
}

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

      // GET /congregazioni?responsabili=true&nome=X - Candidati responsabile per congregazione
      if (params.responsabili === 'true') {
        if (!params.nome) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'Nome congregazione obbligatorio' }),
          }
        }

        const nomeRegex = { $regex: `^${escapeRegex(params.nome.trim())}$`, $options: 'i' }

        const [oratori, users] = await Promise.all([
          oratoriCollection
            .find({ congregazione: nomeRegex }, { projection: { nome: 1, cognome: 1, email: 1, telefono: 1 } })
            .toArray(),
          usersCollection
            .find({ congregazione: nomeRegex }, { projection: { nome: 1, cognome: 1, email: 1, telefono: 1 } })
            .toArray(),
        ])

        const responsabili = [
          ...oratori.map((oratore) => ({
            id: `oratore:${oratore._id.toString()}`,
            type: 'oratore',
            nome: oratore.nome || '',
            cognome: oratore.cognome || '',
            email: oratore.email || '',
            telefono: oratore.telefono || '',
          })),
          ...users.map((utente) => ({
            id: `user:${utente._id.toString()}`,
            type: 'user',
            nome: utente.nome || '',
            cognome: utente.cognome || '',
            email: utente.email || '',
            telefono: utente.telefono || '',
          })),
        ].sort((a, b) => {
          const cognomeCompare = a.cognome.localeCompare(b.cognome)
          if (cognomeCompare !== 0) return cognomeCompare
          return a.nome.localeCompare(b.nome)
        })

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(responsabili),
        }
      }

      // GET /congregazioni?nome=X - Dettaglio per nome
      if (params.nome) {
        const congregazione = await congregazioniCollection.findOne({
          nome: { $regex: `^${escapeRegex(params.nome)}$`, $options: 'i' },
        })

        if (!congregazione) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Congregazione non trovata' }),
          }
        }

        const responsabile = await getResponsabileDetails(congregazione, oratoriCollection, usersCollection)
        if (responsabile) {
          congregazione.responsabile = responsabile
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(congregazione),
        }
      }

      // GET /congregazioni - Lista tutte con responsabili (oratori o utenti)
      const congregazioni = await congregazioniCollection.find({}).sort({ nome: 1 }).toArray()
      const congregazioniWithResponsabile = await Promise.all(congregazioni.map(async (congregazione) => {
        const responsabile = await getResponsabileDetails(congregazione, oratoriCollection, usersCollection)
        if (responsabile) return { ...congregazione, responsabile }
        return congregazione
      }))

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(congregazioniWithResponsabile),
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
      const { nome, responsabileId, responsabileOratoreId, orari, indirizzo } = data
      const selectedResponsabile = responsabileId ?? responsabileOratoreId

      if (!nome || !selectedResponsabile) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Nome e responsabile sono obbligatori' }),
        }
      }

      // Verifica unicita nome
      const existing = await congregazioniCollection.findOne({
        nome: { $regex: `^${escapeRegex(nome)}$`, $options: 'i' },
      })
      if (existing) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({ message: 'Esiste gia una congregazione con questo nome' }),
        }
      }

      let resolvedResponsabile
      try {
        resolvedResponsabile = await resolveResponsabileSelection({
          selection: selectedResponsabile,
          targetCongregazioneNome: nome,
          oratoriCollection,
          usersCollection,
        })
      } catch (resolveError) {
        if (resolveError.message === 'INVALID_RESPONSABILE_ID') {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'ID responsabile non valido' }),
          }
        }
        if (resolveError.message === 'RESPONSABILE_USER_NOT_FOUND' || resolveError.message === 'RESPONSABILE_ORATORE_NOT_FOUND') {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ message: 'Responsabile non trovato' }),
          }
        }
        if (resolveError.message === 'RESPONSABILE_NOT_IN_CONGREGAZIONE') {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ message: 'Il responsabile deve appartenere alla stessa congregazione' }),
          }
        }
        throw resolveError
      }

      const newCongregazione = {
        nome: nome.trim(),
        responsabileOratoreId: resolvedResponsabile.responsabileOratoreId,
        responsabileUserId: resolvedResponsabile.responsabileUserId,
        orari: orari || '',
        indirizzo: indirizzo || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: currentUser._id,
      }

      const result = await congregazioniCollection.insertOne(newCongregazione)
      newCongregazione._id = result.insertedId
      newCongregazione.responsabile = {
        _id: resolvedResponsabile.responsabile._id,
        nome: resolvedResponsabile.responsabile.nome,
        cognome: resolvedResponsabile.responsabile.cognome,
        email: resolvedResponsabile.responsabile.email,
        telefono: resolvedResponsabile.responsabile.telefono,
        source: resolvedResponsabile.source,
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
      const { id, nome, responsabileId, responsabileOratoreId, orari, indirizzo } = data

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

      // Verifica permessi: admin, responsabile o utente della stessa congregazione
      const isAdmin = currentUser.role === 'admin'

      // Controlla se l'utente corrente è collegato all'oratore responsabile
      let isResponsabile = false
      if (congregazione.responsabileUserId && currentUser._id) {
        isResponsabile = congregazione.responsabileUserId.toString() === currentUser._id.toString()
      } else if (congregazione.responsabileOratoreId && currentUser.oratoreId) {
        isResponsabile = congregazione.responsabileOratoreId.toString() === currentUser.oratoreId.toString()
      }

      const isSameCongregazione =
        normalize(currentUser.congregazione) &&
        normalize(congregazione.nome) === normalize(currentUser.congregazione)

      const canEdit = isAdmin || isResponsabile || isSameCongregazione

      if (!canEdit) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({
            message: 'Per modificare questi dati devi fare parte di questa congregazione',
          }),
        }
      }

      const updateData = {
        updatedAt: new Date(),
      }

      // Admin, responsabile o utente della stessa congregazione possono cambiare nome e responsabile
      if (isAdmin || isResponsabile || isSameCongregazione) {
        if (nome) {
          // Verifica unicita del nuovo nome (escluso se stesso)
          const existing = await congregazioniCollection.findOne({
            nome: { $regex: `^${escapeRegex(nome)}$`, $options: 'i' },
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

        const selectedResponsabile = responsabileId ?? responsabileOratoreId
        if (responsabileId !== undefined || responsabileOratoreId !== undefined) {
          if (!selectedResponsabile) {
            updateData.responsabileOratoreId = null
            updateData.responsabileUserId = null
          } else {
            const targetCongregazioneNome = nome || congregazione.nome
            try {
              const resolvedResponsabile = await resolveResponsabileSelection({
                selection: selectedResponsabile,
                targetCongregazioneNome,
                oratoriCollection,
                usersCollection,
              })
              updateData.responsabileOratoreId = resolvedResponsabile.responsabileOratoreId
              updateData.responsabileUserId = resolvedResponsabile.responsabileUserId
            } catch (resolveError) {
              if (resolveError.message === 'INVALID_RESPONSABILE_ID') {
                return {
                  statusCode: 400,
                  headers,
                  body: JSON.stringify({ message: 'ID responsabile non valido' }),
                }
              }
              if (resolveError.message === 'RESPONSABILE_USER_NOT_FOUND' || resolveError.message === 'RESPONSABILE_ORATORE_NOT_FOUND') {
                return {
                  statusCode: 404,
                  headers,
                  body: JSON.stringify({ message: 'Responsabile non trovato' }),
                }
              }
              if (resolveError.message === 'RESPONSABILE_NOT_IN_CONGREGAZIONE') {
                return {
                  statusCode: 400,
                  headers,
                  body: JSON.stringify({ message: 'Il responsabile deve appartenere alla stessa congregazione' }),
                }
              }
              throw resolveError
            }
          }
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

      const responsabile = await getResponsabileDetails(result, oratoriCollection, usersCollection)
      if (responsabile) {
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
