import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DashboardLayoutClient } from './DashboardLayoutClient'
import { ensureLegalAccepted } from '@/server/legal-gate'

export default async function DashboardLayout({ children }:{children:React.ReactNode}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/?signin=required')
  }
  await ensureLegalAccepted('/dashboard');
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
