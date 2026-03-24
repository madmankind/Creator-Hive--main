import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.warn('[resend] RESEND_API_KEY not set — emails will not send')
}

export const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_EMAIL = 'Creator Hive <hello@creatorhive.ae>'
export const REPLY_TO = 'hello@creatorhive.ae'
