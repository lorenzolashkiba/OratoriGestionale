import { ObjectId } from 'mongodb'
import { connectToDatabase } from './utils/mongodb.js'
import { requireAdmin } from './utils/auth.js'
import { sendApprovalEmail, sendRejectionEmail } from './utils/email.js'

async function adminHandler(event, context, firebaseUser, adminUser) {
  const { db } = await connectToDatabase()
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

  const path = event.path.replace('/.netlify/functions/admin', '').replace('/api/admin', '')

  try {
    // GET /admin/users - Lista tutti gli utenti
    if (event.httpMethod === 'GET' && (path === '/users' || path === '')) {
      const params = event.queryStringParameters || {}
      const filter = {}

      if (params.role) {
        filter.role = params.role
      }
      if (params.status) {
        filter.status = params.status
      }

      const users = await usersCollection
        .find(filter)
        .sort({ requestedAt: -1 })
        .toArray()

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(users),
      }
    }

    // GET /admin/pending - Solo utenti in attesa
    if (event.httpMethod === 'GET' && path === '/pending') {
      const pendingUsers = await usersCollection
        .find({ role: 'pending', status: 'active' })
        .sort({ requestedAt: -1 })
        .toArray()

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(pendingUsers),
      }
    }

    // GET /admin/stats - Statistiche
    if (event.httpMethod === 'GET' && path === '/stats') {
      const [total, pending, admins, users] = await Promise.all([
        usersCollection.countDocuments({}),
        usersCollection.countDocuments({ role: 'pending', status: 'active' }),
        usersCollection.countDocuments({ role: 'admin' }),
        usersCollection.countDocuments({ role: 'user' }),
      ])

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ total, pending, admins, users }),
      }
    }

    // POST /admin/approve - Approva utente
    if (event.httpMethod === 'POST' && path === '/approve') {
      const { userId } = JSON.parse(event.body)

      if (!userId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'userId obbligatorio' }),
        }
      }

      const targetUser = await usersCollection.findOne({ _id: new ObjectId(userId) })
      if (!targetUser) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: 'Utente non trovato' }),
        }
      }

      const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        {
          $set: {
            role: 'user',
            approvedAt: new Date(),
            approvedBy: adminUser._id,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      )

      // Invia email di approvazione
      try {
        await sendApprovalEmail(result)
      } catch (emailError) {
        console.error('Errore invio email approvazione:', emailError)
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      }
    }

    // POST /admin/reject - Rifiuta utente
    if (event.httpMethod === 'POST' && path === '/reject') {
      const { userId, reason } = JSON.parse(event.body)

      if (!userId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'userId obbligatorio' }),
        }
      }

      const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        {
          $set: {
            status: 'rejected',
            rejectedAt: new Date(),
            rejectedBy: adminUser._id,
            rejectionReason: reason || null,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      )

      // Invia email di rifiuto
      try {
        await sendRejectionEmail(result, reason)
      } catch (emailError) {
        console.error('Errore invio email rifiuto:', emailError)
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      }
    }

    // PUT /admin/role - Cambia ruolo utente
    if (event.httpMethod === 'PUT' && path === '/role') {
      const { userId, role } = JSON.parse(event.body)

      if (!userId || !role) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'userId e role obbligatori' }),
        }
      }

      if (!['admin', 'user', 'pending'].includes(role)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Role non valido' }),
        }
      }

      // Impedisci all'admin di modificare il proprio ruolo
      if (userId === adminUser._id.toString()) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: 'Non puoi modificare il tuo ruolo' }),
        }
      }

      const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        {
          $set: {
            role,
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      )

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result),
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Endpoint non trovato' }),
    }
  } catch (error) {
    console.error('Errore admin:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: 'Errore interno del server' }),
    }
  }
}

export const handler = requireAdmin(adminHandler)
