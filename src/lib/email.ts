import { resend, FROM_EMAIL, REPLY_TO } from '@/lib/resend'
import {
  signupConfirmationEmail,
  adminSignupAlertEmail,
  welcomeEmail,
  campaignInviteEmail,
  bookingConfirmedEmail,
  bookingReceivedEmail,
  adminBookingAlertEmail,
  paymentInstructionsEmail,
  bookingOrderEmail,
  talentConfirmationEmail,
} from '@/emails/templates'

const ADMIN_EMAIL = 'ajil@creatorhive.ae'

type SendResult = { ok: true } | { ok: false; error: string }

async function send(to: string, subject: string, html: string): Promise<SendResult> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY missing — skipping send')
    return { ok: true }
  }
  try {
    await resend.emails.send({ from: FROM_EMAIL, replyTo: REPLY_TO, to, subject, html })
    return { ok: true }
  } catch (err) {
    console.error('[email] send failed:', err)
    return { ok: false, error: String(err) }
  }
}

export async function sendSignupConfirmation(to: string, role: string) {
  return send(to, "You're on the Creator Hive list", signupConfirmationEmail(role))
}

export async function sendAdminSignupAlert(data: {
  role: string; email?: string; whatsapp?: string; instagram?: string
}) {
  const subject = `New ${data.role} signup — ${data.email || data.whatsapp || 'unknown'}`
  return send(ADMIN_EMAIL, subject, adminSignupAlertEmail(data))
}

export async function sendWelcomeEmail(to: string, name: string, role: string) {
  return send(to, `Welcome to Creator Hive, ${name}`, welcomeEmail(name, role))
}

export async function sendCampaignInvite(to: string, data: {
  creatorName: string; brandName: string; campaignName: string; inviteUrl: string
}) {
  return send(to, `Campaign invite: ${data.campaignName}`, campaignInviteEmail(data))
}

export async function sendBookingConfirmed(to: string, data: {
  recipientName: string; otherPartyName: string; campaignName: string; dashboardUrl: string
}) {
  return send(to, `Booking confirmed — ${data.campaignName}`, bookingConfirmedEmail(data))
}

export async function sendBookingConfirmation(to: string, data: {
  bookingId: string; description: string; budgetRange?: string; clientName: string
}) {
  return send(to, 'Your Creator Hive booking is received', bookingReceivedEmail(data))
}

export async function sendAdminBookingAlert(data: {
  bookingId: string; description: string; email?: string; clientName?: string;
  budgetRange?: string; talentCount: number; packageId?: string
}) {
  const subject = `New booking — ${data.clientName || data.email || 'unknown'} · ${data.description.substring(0, 50)}`
  return send(ADMIN_EMAIL, subject, adminBookingAlertEmail(data))
}

export async function sendPaymentInstructions(to: string, data: {
  invoiceNumber: string; amount: number; vatAmount: number; total: number;
  clientName: string; method: 'bank_transfer' | 'stripe'; stripeUrl?: string
}) {
  return send(to, `Payment instructions — Invoice ${data.invoiceNumber}`, paymentInstructionsEmail(data))
}

async function sendWithAttachment(
  to: string, subject: string, html: string,
  attachment: { filename: string; content: Uint8Array }
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY missing — skipping send')
    return { ok: true }
  }
  try {
    await resend.emails.send({
      from: FROM_EMAIL, replyTo: REPLY_TO, to, subject, html,
      attachments: [{ filename: attachment.filename, content: Buffer.from(attachment.content) }],
    })
    return { ok: true }
  } catch (err) {
    console.error('[email] sendWithAttachment failed:', err)
    return { ok: false, error: String(err) }
  }
}

export async function sendBookingOrder(to: string, data: {
  orderRef: string; clientName: string; packageLabel: string;
  totalAed: number; paymentSchedule: string; dashboardUrl: string;
  pdfBytes: Uint8Array;
}) {
  const { pdfBytes, ...emailData } = data
  return sendWithAttachment(
    to,
    `Booking Order ${data.orderRef} — Creator Hive`,
    bookingOrderEmail(emailData),
    { filename: `${data.orderRef}.pdf`, content: pdfBytes }
  )
}

export async function sendTalentConfirmation(to: string, data: {
  orderRef: string; clientName: string; talentNames: string[];
  replaced: boolean; replacementNote?: string;
  approveUrl: string; replaceUrl: string; cancelUrl: string;
}) {
  return send(
    to,
    `Talent Confirmed — Booking ${data.orderRef} | Action Required`,
    talentConfirmationEmail(data)
  )
}
