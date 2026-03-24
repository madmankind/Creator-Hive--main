import Link from 'next/link'

export default async function Review() {
  // In production, check session and redirect if not authenticated
  return (
    <main className="min-h-screen bg-[#0B0F14] text-slate-200">
      <div className="mx-auto max-w-xl px-6 py-14 space-y-6 text-center">
        <h1 className="text-[28px] font-semibold">You&apos;re set</h1>
        <p className="text-white/60">Your agency and first creator have been added.</p>
        <Link href="/dashboard" className="inline-block rounded-full bg-white/10 border border-white/10 px-6 py-2.5 hover:bg-white/15 transition">
          Go to Dashboard
        </Link>
      </div>
    </main>
  )
}







