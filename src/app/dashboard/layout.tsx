import Sidebar from '@/components/agency/Sidebar'

export default async function DashboardLayout({ children }:{children:React.ReactNode}) {
  // In production, check session and redirect if not authenticated
  return (
    <div className="min-h-screen grid grid-cols-12 bg-[#0B0F14] text-slate-200">
      <aside className="col-span-12 md:col-span-3 xl:col-span-2 border-r border-white/10 p-4">
        <Sidebar />
      </aside>
      <main className="col-span-12 md:col-span-9 xl:col-span-10 p-6">
        {children}
      </main>
    </div>
  )
}







