import Sidebar from '@/components/agency/Sidebar'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({ children }:{children:React.ReactNode}) {
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  return (
    <div className="flex min-h-screen bg-[#05070b] text-slate-100">
      <Sidebar />
      <main className="flex-1 bg-[#05070b] min-w-0">
        {children}
      </main>
    </div>
  )
}






