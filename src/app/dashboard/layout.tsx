import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { DashboardLayoutClient } from './DashboardLayoutClient'
import { ensureLegalAccepted } from '@/server/legal-gate'

export default async function DashboardLayout({ children }:{children:React.ReactNode}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/?signin=required')
  }
  const hdrs = await headers()
  const pathname = hdrs.get('x-pathname') ?? '/dashboard'
  await ensureLegalAccepted(pathname)
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
