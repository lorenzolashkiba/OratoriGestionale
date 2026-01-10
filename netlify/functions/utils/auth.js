import admin from 'firebase-admin'

let app = null

function getFirebaseAdmin() {
  if (!app) {
    const projectId = process.env.VITE_FIREBASE_PROJECT_ID
    if (!projectId) {
      throw new Error('VITE_FIREBASE_PROJECT_ID non configurato')
    }

    app = admin.initializeApp({
      projectId: projectId,
    })
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
