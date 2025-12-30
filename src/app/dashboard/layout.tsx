import Sidebar from '@/components/agency/Sidebar'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }:{children:React.ReactNode}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-[#F6F7FB] text-slate-900">
      <Sidebar />
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  )
}





