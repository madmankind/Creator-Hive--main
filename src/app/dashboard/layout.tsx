import Sidebar from '@/components/agency/Sidebar'

export default async function DashboardLayout({ children }:{children:React.ReactNode}) {
  // In production, check session and redirect if not authenticated
  return (
    <div className="flex min-h-screen bg-[#05070b] text-slate-100">
      {/* Left nav (Contra-style) */}
      <Sidebar />
      
      {/* Main content region */}
      <main className="flex-1 bg-[#05070b] min-w-0">
        {children}
      </main>
    </div>
  )
}







