import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { DashboardLayoutClient } from './DashboardLayoutClient'

export default async function DashboardLayout({ children }:{children:React.ReactNode}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  // For Manage mode, we need to conditionally skip the sidebar
  // This is handled client-side in DashboardLayoutClient
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>
}
