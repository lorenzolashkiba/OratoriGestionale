import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM_EMAIL = process.env.EMAIL_FROM || 'Oratori EU2 <noreply@resend.dev>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const APP_NAME = 'Oratori EU2'
const APP_URL = process.env.URL || 'https://oratori-eu2.netlify.app'

// Notifica admin quando nuovo utente richiede accesso
export async function sendApprovalRequestEmail(newUser) {
  if (!resend || !ADMIN_EMAIL) {
    console.log('Email non configurata, skip notifica admin')
    return
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `[${APP_NAME}] Nuova richiesta di accesso`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1e40af; margin-bottom: 20px;">Nuova richiesta di accesso</h2>
          <p style="color: #374151; font-size: 16px;">Un nuovo utente ha richiesto l'accesso a ${APP_NAME}:</p>
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Email:</strong> ${newUser.email}</p>
            <p style="margin: 8px 0;"><strong>Data richiesta:</strong> ${new Date().toLocaleString('it-IT')}</p>
          </div>
          <p style="margin-top: 24px;">
            <a href="${APP_URL}/admin" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">
              Gestisci richieste
            </a>
          </p>
        </div>
      `,
    })
    console.log('Email di richiesta inviata a:', ADMIN_EMAIL)
  } catch (error) {
    console.error('Errore invio email:', error)
  }
}

// Notifica utente quando approvato
export async function sendApprovalEmail(user) {
  if (!resend) {
    console.log('Email non configurata, skip notifica approvazione')
    return
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `[${APP_NAME}] Accesso approvato`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #059669; margin-bottom: 20px;">Benvenuto in ${APP_NAME}!</h2>
          <p style="color: #374151; font-size: 16px;">La tua richiesta di accesso e stata approvata.</p>
          <p style="color: #374151; font-size: 16px;">Ora puoi accedere all'applicazione e gestire oratori e programmi.</p>
          <p style="margin-top: 24px;">
            <a href="${APP_URL}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">
              Accedi ora
            </a>
          </p>
        </div>
      `,
    })
    console.log('Email di approvazione inviata a:', user.email)
  } catch (error) {
    console.error('Errore invio email:', error)
  }
}

// Notifica utente quando rifiutato
export async function sendRejectionEmail(user, reason) {
  if (!resend) {
    console.log('Email non configurata, skip notifica rifiuto')
    return
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `[${APP_NAME}] Richiesta di accesso`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #dc2626; margin-bottom: 20px;">Richiesta di accesso</h2>
          <p style="color: #374151; font-size: 16px;">Purtroppo la tua richiesta di accesso a ${APP_NAME} non e stata approvata.</p>
          ${reason ? `<p style="color: #374151; font-size: 16px;"><strong>Motivo:</strong> ${reason}</p>` : ''}
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">Se ritieni che si tratti di un errore, contatta l'amministratore.</p>
        </div>
      `,
    })
    console.log('Email di rifiuto inviata a:', user.email)
  } catch (error) {
    console.error('Errore invio email:', error)
  }
}
