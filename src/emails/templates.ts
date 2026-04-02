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

// 6. Booking received — confirmation to client
export function bookingReceivedEmail(data: {
  bookingId: string; description: string; budgetRange?: string; clientName: string
}): string {
  return baseLayout(
    `${h1(`Booking received, ${data.clientName.split(' ')[0]}.`)}
     ${p("We've received your booking request and our team will be in touch within 24 hours to confirm availability and next steps.")}
     <table style="width:100%;border-collapse:collapse;margin-top:20px;">
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;width:120px;">Reference</td>
           <td style="padding:8px 0;color:#fff;font-size:14px;font-family:monospace;">${data.bookingId.substring(0, 16)}</td></tr>
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Brief</td>
           <td style="padding:8px 0;color:rgba(255,255,255,0.8);font-size:13px;">${data.description.substring(0, 120)}${data.description.length > 120 ? '…' : ''}</td></tr>
       ${data.budgetRange ? `<tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Budget</td>
           <td style="padding:8px 0;color:#fff;font-size:14px;">${data.budgetRange}</td></tr>` : ''}
     </table>
     <div style="margin-top:28px;">${btn('View your dashboard', 'https://creatorhive.ae/dashboard')}</div>
     ${divider()}
     ${p('Questions? Reply to this email — we\'re here.')}`,
    `Booking received — Creator Hive will be in touch shortly`
  )
}

// 7. Admin booking alert
export function adminBookingAlertEmail(data: {
  bookingId: string; description: string; email?: string; clientName?: string;
  budgetRange?: string; talentCount: number; packageId?: string
}): string {
  return baseLayout(
    `${h1('New booking request')}
     <table style="width:100%;border-collapse:collapse;margin-top:16px;">
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;width:120px;">ID</td>
           <td style="padding:8px 0;color:#fff;font-size:13px;font-family:monospace;">${data.bookingId}</td></tr>
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Client</td>
           <td style="padding:8px 0;color:#fff;font-size:14px;">${data.clientName || '—'}</td></tr>
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Email</td>
           <td style="padding:8px 0;color:#fff;font-size:14px;">${data.email || '—'}</td></tr>
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Budget</td>
           <td style="padding:8px 0;color:#fff;font-size:14px;">${data.budgetRange || '—'}</td></tr>
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Talent</td>
           <td style="padding:8px 0;color:#fff;font-size:14px;">${data.talentCount} selected</td></tr>
       ${data.packageId ? `<tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Package</td>
           <td style="padding:8px 0;color:#fff;font-size:14px;">${data.packageId}</td></tr>` : ''}
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;vertical-align:top;">Brief</td>
           <td style="padding:8px 0;color:rgba(255,255,255,0.8);font-size:13px;">${data.description}</td></tr>
     </table>`,
    `New booking — ${data.clientName || data.email}`
  )
}

// 8. Payment instructions — bank transfer or Stripe
export function paymentInstructionsEmail(data: {
  invoiceNumber: string; amount: number; vatAmount: number; total: number;
  clientName: string; method: 'bank_transfer' | 'stripe'; stripeUrl?: string
}): string {
  const isBankTransfer = data.method === 'bank_transfer'
  return baseLayout(
    `${h1(`Invoice ${data.invoiceNumber}`)}
     ${p(`Hi ${data.clientName.split(' ')[0]}, your invoice is ready. Please find payment details below.`)}
     <table style="width:100%;border-collapse:collapse;margin-top:20px;margin-bottom:24px;">
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;width:160px;">Untaxed Amount</td>
           <td style="padding:8px 0;color:#fff;font-size:14px;font-weight:600;">AED ${data.amount.toLocaleString()}</td></tr>
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">VAT 5%</td>
           <td style="padding:8px 0;color:#fff;font-size:14px;">AED ${data.vatAmount.toFixed(2)}</td></tr>
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;border-top:1px solid rgba(255,255,255,0.08);">Total Due</td>
           <td style="padding:8px 0;color:#fff;font-size:18px;font-weight:700;border-top:1px solid rgba(255,255,255,0.08);">AED ${data.total.toLocaleString()}</td></tr>
     </table>
     ${isBankTransfer ? `
     ${divider()}
     <p style="margin:12px 0 8px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.5);text-transform:uppercase;letter-spacing:0.1em;">Bank Transfer Details</p>
     <table style="width:100%;border-collapse:collapse;">
       <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:13px;width:160px;">Account Name</td><td style="padding:6px 0;color:#fff;font-size:13px;">CREATOR HIVE FZE</td></tr>
       <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:13px;">Bank</td><td style="padding:6px 0;color:#fff;font-size:13px;">MASHREQ Bank PSC</td></tr>
       <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:13px;">Account No.</td><td style="padding:6px 0;color:#fff;font-size:13px;font-family:monospace;">019101993648</td></tr>
       <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:13px;">SWIFT</td><td style="padding:6px 0;color:#fff;font-size:13px;font-family:monospace;">BOMLAEAD</td></tr>
       <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:13px;">IBAN</td><td style="padding:6px 0;color:#fff;font-size:13px;font-family:monospace;">AE810330000019101993648</td></tr>
       <tr><td style="padding:6px 0;color:rgba(255,255,255,0.4);font-size:13px;">Reference</td><td style="padding:6px 0;color:#fff;font-size:13px;font-weight:700;font-family:monospace;">${data.invoiceNumber}</td></tr>
     </table>
     <p style="margin-top:16px;font-size:12px;color:rgba(255,255,255,0.4);">Please use <strong style="color:#fff;">${data.invoiceNumber}</strong> as the payment reference.</p>
     ` : `
     <div style="margin-top:8px;">${btn('Pay now via card', data.stripeUrl || 'https://creatorhive.ae/dashboard')}</div>
     ${p('Click the button above to complete payment securely via Stripe.')}
     `}`,
    `Invoice ${data.invoiceNumber} — AED ${data.total.toLocaleString()} due`
  )
}

// 9. Booking Order sent to client — with PDF attachment reference
export function bookingOrderEmail(data: {
  orderRef: string;
  clientName: string;
  packageLabel: string;
  totalAed: number;
  paymentSchedule: string;
  dashboardUrl: string;
}): string {
  return baseLayout(
    `${h1(`Your booking order is ready, ${data.clientName.split(" ")[0]}.`)}
     ${p(`We've received your brief and prepared your booking order <strong style="color:#fff;">${data.orderRef}</strong>.`)}
     <table style="width:100%;border-collapse:collapse;margin-top:20px;margin-bottom:24px;">
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;width:160px;">Order Ref</td>
           <td style="padding:8px 0;color:#fff;font-size:14px;font-family:monospace;font-weight:700;">${data.orderRef}</td></tr>
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Package</td>
           <td style="padding:8px 0;color:#fff;font-size:14px;">${data.packageLabel}</td></tr>
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Total (incl. VAT)</td>
           <td style="padding:8px 0;color:#fff;font-size:18px;font-weight:700;">AED ${data.totalAed.toLocaleString()}</td></tr>
       <tr><td style="padding:8px 0;color:rgba(255,255,255,0.4);font-size:13px;">Payment</td>
           <td style="padding:8px 0;color:rgba(255,255,255,0.7);font-size:13px;">${data.paymentSchedule}</td></tr>
     </table>
     ${p("Your booking order PDF is attached. Our team will confirm your talent within <strong style=\"color:#fff;\">48 hours</strong> and send a follow-up for your approval.")}
     <div style="margin-top:28px;">${btn("View your booking", data.dashboardUrl)}</div>
     ${divider()}
     ${p('Questions? Reply to this email — <a href="mailto:hello@creatorhive.ae" style="color:#fff;">hello@creatorhive.ae</a>')}`,
    `Booking Order ${data.orderRef} — Creator Hive`
  );
}

// 10. Talent confirmation — 48h follow-up with talent names + approve/replace/cancel
export function talentConfirmationEmail(data: {
  orderRef: string;
  clientName: string;
  talentNames: string[];
  replaced: boolean;
  replacementNote?: string;
  approveUrl: string;
  replaceUrl: string;
  cancelUrl: string;
}): string {
  const talentList = data.talentNames.map(
    (n) => `<li style="padding:4px 0;color:rgba(255,255,255,0.85);font-size:14px;">${n}</li>`
  ).join("");
  return baseLayout(
    `${h1(`Your talent is confirmed, ${data.clientName.split(" ")[0]}.`)}
     ${data.replaced
       ? `<div style="margin-bottom:20px;padding:14px 16px;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);border-radius:10px;">
            <p style="margin:0;font-size:13px;color:rgba(245,158,11,0.9);">One or more of your original selections were unavailable. We've suggested replacements below.${data.replacementNote ? ` ${data.replacementNote}` : ""}</p>
          </div>`
       : ""}
     ${p(`For booking order <strong style="color:#fff;">${data.orderRef}</strong>, we've confirmed the following talent:`)}
     <ul style="margin:16px 0;padding-left:20px;">${talentList}</ul>
     ${p("Please review and take one of the following actions:")}
     <table style="width:100%;border-collapse:collapse;margin-top:20px;">
       <tr>
         <td style="padding:8px;text-align:center;">
           <a href="${data.approveUrl}" style="display:inline-block;background:#fff;color:#07070B;font-size:13px;font-weight:700;padding:12px 24px;border-radius:8px;text-decoration:none;">✓ Approve talent</a>
         </td>
         <td style="padding:8px;text-align:center;">
           <a href="${data.replaceUrl}" style="display:inline-block;background:rgba(245,158,11,0.12);color:rgba(245,158,11,0.9);border:1px solid rgba(245,158,11,0.35);font-size:13px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">↻ Request replacement</a>
         </td>
         <td style="padding:8px;text-align:center;">
           <a href="${data.cancelUrl}" style="display:inline-block;background:rgba(248,113,113,0.08);color:rgba(248,113,113,0.80);border:1px solid rgba(248,113,113,0.25);font-size:13px;font-weight:600;padding:12px 24px;border-radius:8px;text-decoration:none;">✕ Cancel</a>
         </td>
       </tr>
     </table>
     ${divider()}
     ${p("This link expires in 48 hours. Reply to this email with any questions.")}`,
    `Talent Confirmed — Booking ${data.orderRef} | Action Required`
  );
}
