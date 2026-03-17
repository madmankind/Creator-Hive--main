import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DashboardLayoutClient } from './DashboardLayoutClient'
import { ensureLegalAccepted } from '@/server/legal-gate'
import { headers } from 'next/headers'

export default async function DashboardLayout({ children }:{children:React.ReactNode}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/?signin=required')
  }
  const pathname = (await headers()).get('x-pathname') ?? '/dashboard';
  await ensureLegalAccepted(pathname);
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
