import { Suspense, type ReactNode } from "react";
import { HiveTabRail } from "@/components/hive/HiveTabRail";

function TabFallback() {
  return <div className="h-11 min-h-[44px]" aria-hidden />;
}

/** Hive shell: full-width ambient canvas; content uses responsive max-width + horizontal padding. */
export default function HiveLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative min-h-screen w-full overflow-x-hidden text-[rgba(255,255,255,0.88)]"
      style={{ background: "#050508" }}
    >
      <div className="pointer-events-none fixed inset-0" style={{ background: "#050508", zIndex: 0 }} />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.07]"
        style={{
          zIndex: 1,
          background: "radial-gradient(ellipse 90% 50% at 50% -8%, rgba(255,255,255,0.38), transparent 58%)",
          filter: "blur(120px)",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.09]"
        style={{
          zIndex: 1,
          background: "radial-gradient(ellipse 55% 42% at 72% 28%, rgba(124,58,237,0.48), transparent 62%)",
          filter: "blur(160px)",
        }}
      />

      <div className="relative z-10 flex min-h-screen w-full flex-col">
        <div className="sticky top-0 z-30 w-full border-b border-white/[0.04] bg-[#050508]/85 backdrop-blur-xl supports-[backdrop-filter]:bg-[#050508]/70">
          <div className="mx-auto w-full max-w-[min(1920px,100%)] px-4 pb-2 pt-2 sm:px-5 lg:px-8 xl:px-12 2xl:px-16">
            <Suspense fallback={<TabFallback />}>
              <HiveTabRail />
            </Suspense>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[min(1920px,100%)] flex-1 px-4 pb-36 pt-3 sm:px-5 lg:px-8 lg:pt-6 xl:px-12 xl:pt-7 2xl:px-16">
          {children}
        </div>
      </div>
    </div>
  );
}
