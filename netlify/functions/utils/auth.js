import admin from 'firebase-admin'

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
        body: JSON.stringify({ message: 'Non autorizzato' }),
      }
    }

    return handler(event, context, user)
  }
}
