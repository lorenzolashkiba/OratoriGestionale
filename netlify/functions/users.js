import { ObjectId } from 'mongodb'
import { connectToDatabase } from './utils/mongodb.js'
import { requireAuth } from './utils/auth.js'
import { sendApprovalRequestEmail } from './utils/email.js'

async function usersHandler(event, context, user) {
  const { db } = await connectToDatabase()
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
    // Parsing query parameters
    const params = event.queryStringParameters || {}

    // GET - Ottieni profilo utente o export dati
    if (event.httpMethod === 'GET') {
      let userProfile = await usersCollection.findOne({ googleId: user.uid })

      // Se utente era stato rifiutato, blocca accesso
      if (userProfile?.status === 'rejected') {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({
            message: 'Accesso negato',
            code: 'ACCESS_DENIED',
          }),
        }
      }

      // Se non esiste, ritorna 404 - l'utente deve prima accettare la privacy
      if (!userProfile) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({
            message: 'Utente non registrato',
            code: 'USER_NOT_FOUND',
          }),
        }
      }

      // Se l'utente e' collegato a un oratore, carica i dati dell'oratore
      if (userProfile.oratoreId) {
        const oratore = await oratoriCollection.findOne({ _id: new ObjectId(userProfile.oratoreId) })
        userProfile.oratore = oratore
      }

      // Export completo dei dati (GDPR - diritto alla portabilità)
      if (params.export === 'true') {
        const programmiCollection = db.collection('programmi')
        const congregazioniCollection = db.collection('congregazioni')

        // Raccogli tutti i dati dell'utente
        const exportData = {
          exportDate: new Date().toISOString(),
          exportType: 'GDPR_DATA_EXPORT',
          account: {
            email: userProfile.email,
            nome: userProfile.nome,
            cognome: userProfile.cognome,
            telefono: userProfile.telefono,
            congregazione: userProfile.congregazione,
            localita: userProfile.localita,
            role: userProfile.role,
            privacyAcceptedAt: userProfile.privacyAcceptedAt,
            createdAt: userProfile.createdAt,
            updatedAt: userProfile.updatedAt,
          },
          oratore: userProfile.oratore ? {
            nome: userProfile.oratore.nome,
            cognome: userProfile.oratore.cognome,
            email: userProfile.oratore.email,
            telefono: userProfile.oratore.telefono,
            congregazione: userProfile.oratore.congregazione,
            localita: userProfile.oratore.localita,
            discorsi: userProfile.oratore.discorsi,
          } : null,
          programmi: [],
        }

        // Se l'utente è collegato a un oratore, trova i programmi dove è assegnato
        if (userProfile.oratoreId) {
          const programmi = await programmiCollection.find({
            oratoreId: new ObjectId(userProfile.oratoreId),
          }).toArray()

          exportData.programmi = programmi.map((p) => ({
            data: p.data,
            orario: p.orario,
            discorso: p.discorso,
            note: p.note,
          }))
        }

        return {
          statusCode: 200,
          headers: {
            ...headers,
            'Content-Disposition': `attachment; filename="miei-dati-${new Date().toISOString().split('T')[0]}.json"`,
          },
          body: JSON.stringify(exportData, null, 2),
        }
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(userProfile),
      }
    }

    // POST - Registra nuovo utente (dopo accettazione privacy)
    if (event.httpMethod === 'POST') {
      // Verifica che l'utente non esista già
      const existingUser = await usersCollection.findOne({ googleId: user.uid })
      if (existingUser) {
        return {
          statusCode: 409,
          headers,
          body: JSON.stringify({
            message: 'Utente già registrato',
            code: 'USER_EXISTS',
          }),
        }
      }

      const newUser = {
        googleId: user.uid,
        email: user.email,
        nome: '',
        cognome: '',
        telefono: '',
        congregazione: '',
        localita: '',
        oratoreId: null,
        role: 'pending',
        status: 'active',
        privacyAcceptedAt: new Date(),
        requestedAt: new Date(),
        approvedAt: null,
        approvedBy: null,
        rejectedAt: null,
        rejectedBy: null,
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      await usersCollection.insertOne(newUser)

      // Invia email di notifica all'admin
      try {
        await sendApprovalRequestEmail(newUser)
      } catch (emailError) {
        console.error('Errore invio email notifica:', emailError)
      }

      return {
        statusCode: 201,
        headers,
        body: JSON.stringify(newUser),
      }
    }

    // PUT - Aggiorna profilo utente
    if (event.httpMethod === 'PUT') {
      // Verifica che utente non sia pending
      const existingUser = await usersCollection.findOne({ googleId: user.uid })
      if (existingUser?.role === 'pending') {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({
            message: 'Account in attesa di approvazione',
            code: 'PENDING_APPROVAL',
          }),
        }
      }

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

    // DELETE - Cancella account utente (diritto all'oblio)
    if (event.httpMethod === 'DELETE') {
      const existingUser = await usersCollection.findOne({ googleId: user.uid })
      if (!existingUser) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Utente non trovato' }),
        }
      }

      // Elimina l'utente
      await usersCollection.deleteOne({ googleId: user.uid })

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Account eliminato con successo' }),
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
