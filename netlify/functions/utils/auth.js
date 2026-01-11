import admin from 'firebase-admin'
import { connectToDatabase } from './mongodb.js'

let app = null

function getFirebaseAdmin() {
  if (!app) {
    // Usa le credenziali del Service Account
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT

    if (serviceAccount) {
      // Se le credenziali sono passate come JSON string
      const credentials = JSON.parse(serviceAccount)
      app = admin.initializeApp({
        credential: admin.credential.cert(credentials),
      })
    } else {
      // Fallback: usa variabili separate
      const projectId = process.env.VITE_FIREBASE_PROJECT_ID
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
      const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

      if (!projectId) {
        throw new Error('Firebase non configurato correttamente')
      }

      if (clientEmail && privateKey) {
        app = admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        })
      } else {
        // Solo projectId (per ambienti con ADC configurato)
        app = admin.initializeApp({
          projectId,
        })
      }
    }
  }
  return app
}

export async function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.split('Bearer ')[1]

  try {
    getFirebaseAdmin()
    const decodedToken = await admin.auth().verifyIdToken(token)
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
    }
  } catch (error) {
    console.error('Errore verifica token:', error)
    return null
  }
}

export function requireAuth(handler) {
  return async (event, context) => {
    const user = await verifyToken(event.headers.authorization)

    if (!user) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Non autorizzato' }),
      }
    }

    return handler(event, context, user)
  }
}

// Ottiene utente con ruolo dal database
export async function getUserWithRole(uid) {
  const { db } = await connectToDatabase()
  const user = await db.collection('users').findOne({ googleId: uid })
  return user
}

// Middleware per endpoint che richiedono utenti approvati
export function requireApprovedUser(handler) {
  return async (event, context) => {
    const user = await verifyToken(event.headers.authorization)

    if (!user) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Non autorizzato' }),
      }
    }

    const dbUser = await getUserWithRole(user.uid)

    if (!dbUser || dbUser.role === 'pending') {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Account in attesa di approvazione',
          code: 'PENDING_APPROVAL',
        }),
      }
    }

    if (dbUser.status === 'rejected') {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Accesso negato',
          code: 'ACCESS_DENIED',
        }),
      }
    }

    return handler(event, context, user, dbUser)
  }
}

// Middleware per endpoint solo admin
export function requireAdmin(handler) {
  return async (event, context) => {
    const user = await verifyToken(event.headers.authorization)

    if (!user) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Non autorizzato' }),
      }
    }

    const dbUser = await getUserWithRole(user.uid)

    if (!dbUser || dbUser.role !== 'admin') {
      return {
        statusCode: 403,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Accesso riservato agli amministratori' }),
      }
    }

    return handler(event, context, user, dbUser)
  }
}
