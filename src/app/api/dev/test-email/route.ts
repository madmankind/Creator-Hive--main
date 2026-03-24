import { NextResponse } from 'next/server'
import { sendSignupConfirmation, sendAdminSignupAlert, sendWelcomeEmail } from '@/lib/email'

export async function GET(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }
  const { searchParams } = new URL(req.url)
  const to = searchParams.get('to') || 'test@example.com'
  const type = searchParams.get('type') || 'signup'

  let result
  if (type === 'signup') {
    result = await sendSignupConfirmation(to, 'CREATOR')
  } else if (type === 'admin') {
    result = await sendAdminSignupAlert({ role: 'CREATOR', email: to, instagram: '@testcreator' })
  } else if (type === 'welcome') {
    result = await sendWelcomeEmail(to, 'Ajil', 'AGENCY')
  } else {
    return NextResponse.json({ error: 'Unknown type. Use: signup | admin | welcome' }, { status: 400 })
  }

  return NextResponse.json({ type, to, result })
}
