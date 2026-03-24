import { baseLayout, btn, h1, p, divider } from './base'

// 1. Signup confirmation — sent to applicant
export function signupConfirmationEmail(role: string): string {
  const roleLabel = role === 'CREATOR' ? 'creator' : role === 'AGENCY' ? 'brand / agency' : 'member'
  return baseLayout(
    `${h1('You\'re on the list.')}
     ${p(`Thanks for applying to join Creator Hive as a ${roleLabel}. We review every application manually to keep the platform quality high.`)}
     ${p('We\'ll be in touch within 48 hours. In the meantime, take a look at what we\'re building.')}
     <div style="margin-top:28px;">${btn('Visit Creator Hive', 'https://creatorhive.ae')}</div>
     ${divider()}
     ${p('Questions? Reply to this email or reach us at <a href="mailto:hello@creatorhive.ae" style="color:#fff;">hello@creatorhive.ae</a>')}`,
    "You're on the Creator Hive waitlist — we'll be in touch soon."
  )
}

// 2. Internal alert — sent to admin when new signup arrives
export function adminSignupAlertEmail(data: {
  role: string; email?: string; whatsapp?: string; instagram?: string
}): string {
  return baseLayout(
    `${h1('New signup application')}
     <table style="width:100%;border-collapse:collapse;margin-top:16px;">
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;width:100px;">Role</td>
           <td style="padding:8px 0;color:#fff;font-size:14px;">${data.role}</td></tr>
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Email</td>
           <td style="padding:8px 0;color:#fff;font-size:14px;">${data.email || '—'}</td></tr>
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">WhatsApp</td>
           <td style="padding:8px 0;color:#fff;font-size:14px;">${data.whatsapp || '—'}</td></tr>
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Instagram</td>
           <td style="padding:8px 0;color:#fff;font-size:14px;">${data.instagram || '—'}</td></tr>
     </table>`,
    `New ${data.role} signup — ${data.email || data.whatsapp}`
  )
}

// 3. Welcome email — sent when account is approved/created
export function welcomeEmail(name: string, role: string): string {
  const dashboard = role === 'CREATOR'
    ? 'https://creatorhive.ae/dashboard'
    : 'https://creatorhive.ae/dashboard'
  return baseLayout(
    `${h1(`Welcome to Creator Hive, ${name}.`)}
     ${p('Your account is ready. You\'re now part of a vetted community of top-tier creative talent and forward-thinking brands across the UAE.')}
     <div style="margin-top:28px;">${btn('Go to your dashboard', dashboard)}</div>
     ${divider()}
     ${p('Need help getting started? Reply to this email — we\'re here.')}`,
    `Welcome to Creator Hive, ${name} — your account is ready.`
  )
}

// 4. Campaign invite — sent to creator when added to a campaign
export function campaignInviteEmail(data: {
  creatorName: string; brandName: string; campaignName: string; inviteUrl: string
}): string {
  return baseLayout(
    `${h1(`${data.brandName} wants to work with you.`)}
     ${p(`You've been invited to join the campaign <strong style="color:#fff;">${data.campaignName}</strong>. Review the brief and confirm your interest.`)}
     <div style="margin-top:28px;">${btn('View campaign brief', data.inviteUrl)}</div>
     ${divider()}
     ${p('This invite expires in 48 hours. Reply to this email if you have questions.')}`,
    `Campaign invite from ${data.brandName} — ${data.campaignName}`
  )
}

// 5. Booking confirmation — sent to both parties
export function bookingConfirmedEmail(data: {
  recipientName: string; otherPartyName: string; campaignName: string; dashboardUrl: string
}): string {
  return baseLayout(
    `${h1('Booking confirmed.')}
     ${p(`Your booking with <strong style="color:#fff;">${data.otherPartyName}</strong> for <strong style="color:#fff;">${data.campaignName}</strong> is confirmed.`)}
     ${p('Track deliverables, milestones, and payments from your dashboard.')}
     <div style="margin-top:28px;">${btn('View booking', data.dashboardUrl)}</div>`,
    `Booking confirmed — ${data.campaignName}`
  )
}
