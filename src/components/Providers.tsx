"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { useEffect } from "react";
import { useThemeStore } from "@/store/useTheme";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const { mode, accent } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    // Theme mode
    if (mode === "system") {
      const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      root.setAttribute("data-theme", prefersLight ? "light" : "dark");
    } else {
      root.setAttribute("data-theme", mode);
    }
    // Accent
    root.setAttribute("data-accent", accent);
  }, [mode, accent]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}


