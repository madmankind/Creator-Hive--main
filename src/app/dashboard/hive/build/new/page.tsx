import { Suspense } from "react";
import { ShopNewClient } from "./ShopNewClient";

export default function NewShopProjectPage() {
  return (
    <Suspense fallback={<div className="min-h-[240px] animate-pulse rounded-2xl bg-white/[0.02]" aria-hidden />}>
      <ShopNewClient />
    </Suspense>
  );
}
