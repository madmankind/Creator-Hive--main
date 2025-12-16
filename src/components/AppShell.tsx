"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LogoSpinner } from "./LogoSpinner";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    setShowSpinner(false);

    // Debounce: only show spinner if loading takes >150ms
    const debounceTimer = setTimeout(() => {
      setShowSpinner(true);
    }, 150);

    const loadTimer = setTimeout(() => {
      setShowSpinner(false);
    }, 300);

    return () => {
      clearTimeout(debounceTimer);
      clearTimeout(loadTimer);
    };
  }, [pathname]);

  // Handle initial load
  useEffect(() => {
    const initialTimer = setTimeout(() => {
      setShowSpinner(false);
    }, 300);

    return () => clearTimeout(initialTimer);
  }, []);

  return (
    <>
      <LogoSpinner active={showSpinner} />
      {children}
    </>
  );
}


