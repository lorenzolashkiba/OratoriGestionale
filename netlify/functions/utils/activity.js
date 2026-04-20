export function getActorSnapshot(firebaseUser, dbUser) {
  if (!dbUser && !firebaseUser) return null

  const displayName = `${dbUser?.nome || ''} ${dbUser?.cognome || ''}`.trim()

  return {
    userId: dbUser?._id || null,
    googleId: firebaseUser?.uid || dbUser?.googleId || null,
    email: dbUser?.email || firebaseUser?.email || '',
    name: displayName || firebaseUser?.name || dbUser?.email || firebaseUser?.email || 'Utente',
    role: dbUser?.role || null,
  }
}

export async function logActivity(db, activity) {
  if (!db || !activity) return

  try {
    await db.collection('activity_logs').insertOne({
      category: activity.category || 'data_change',
      entityType: activity.entityType || null,
      entityId: activity.entityId || null,
      entityLabel: activity.entityLabel || '',
      action: activity.action || 'update',
      description: activity.description || '',
      metadata: activity.metadata || {},
      actor: activity.actor || null,
      performedAt: activity.performedAt || new Date(),
    })
  } catch (error) {
    console.error('Errore salvataggio activity log:', error)
  }
}
