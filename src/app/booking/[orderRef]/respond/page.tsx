"use client";
import { useSearchParams, useParams } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BookingRespondPage() {
  const params = useParams();
  const search = useSearchParams();
  const router = useRouter();
  const orderRef = params.orderRef as string;
  const token = search.get("token");
  const action = search.get("action");

  useEffect(() => {
    if (!token || !action) { router.replace("/booking/invalid"); return; }
    // Redirect to API action handler which processes and then redirects to /status
    window.location.href = `/api/booking-orders/${orderRef}/action?token=${token}&action=${action}`;
  }, [orderRef, token, action, router]);

  return (
    <div style={{ minHeight: "100dvh", background: "#07070B", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>Processing your response…</p>
    </div>
  );
}
