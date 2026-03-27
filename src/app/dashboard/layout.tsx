import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { DashboardLayoutClient } from './DashboardLayoutClient'
import { ensureLegalAccepted } from '@/server/legal-gate'

// Hive sub-routes are public (editorial, shop, build)
const PUBLIC_DASHBOARD_PATHS = ['/dashboard/hive']

export default async function DashboardLayout({ children }:{children:React.ReactNode}) {
  const hdrs = await headers()
  const pathname = hdrs.get('x-pathname') ?? ''
  const pathOnly = pathname.split("?")[0]
  const isPublicHive = PUBLIC_DASHBOARD_PATHS.some(p => pathOnly.startsWith(p))
  const shouldEnforceAuth = pathOnly.length > 0 && !isPublicHive

  const session = await auth()
  if (!session?.user && shouldEnforceAuth) {
    redirect('/?signin=required')
  }

  if (session?.user) {
    await ensureLegalAccepted(pathOnly || '/dashboard')
  }

  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
