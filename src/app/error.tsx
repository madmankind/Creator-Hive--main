"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "#07070B" }}
    >
      <div className="max-w-md w-full text-center space-y-6">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{
            background: "rgba(251,113,133,0.08)",
            border: "1px solid rgba(251,113,133,0.25)",
          }}
        >
          <span className="text-2xl">⚠</span>
        </div>
        <div>
          <h1
            className="text-xl font-medium tracking-tight mb-2"
            style={{ color: "rgba(255,255,255,0.95)" }}
          >
            Something went wrong
          </h1>
          <p
            className="text-sm font-light"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            An error occurred. Please try again.
          </p>
        </div>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-full text-sm font-medium transition-all"
          style={{
            background: "rgba(255,255,255,0.9)",
            color: "#07070B",
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
