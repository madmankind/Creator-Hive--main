"use client";

import { useEffect } from "react";

/**
 * Filters out noisy Next.js devtools console stack traces in development.
 * These are harmless internal devtools messages that don't affect functionality.
 */
export function ConsoleFilter() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalTrace = console.trace;
    const originalLog = console.log;

    // Filter function to check if message is from Next.js devtools
    const isDevtoolsNoise = (args: any[]): boolean => {
      const message = args[0]?.toString() || "";
      const fullMessage = args.map(arg => {
        if (typeof arg === 'string') return arg;
        if (arg?.stack) return arg.stack;
        if (arg?.message) return arg.message;
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }).join(" ");
      
      return (
        message.includes("next-devtools") ||
        fullMessage.includes("next-devtools") ||
        fullMessage.includes("webpack-internal:///(pages-dir-browser)") ||
        fullMessage.includes("next/dist/compiled/next-devtools")
      );
    };

    // Override console.error
    console.error = (...args: any[]) => {
      if (!isDevtoolsNoise(args)) {
        originalError.apply(console, args);
      }
    };

    // Override console.warn
    console.warn = (...args: any[]) => {
      if (!isDevtoolsNoise(args)) {
        originalWarn.apply(console, args);
      }
    };

    // Override console.trace (stack traces)
    console.trace = (...args: any[]) => {
      if (!isDevtoolsNoise(args)) {
        originalTrace.apply(console, args);
      }
    };

    // Override console.log (sometimes used for traces)
    console.log = (...args: any[]) => {
      if (!isDevtoolsNoise(args)) {
        originalLog.apply(console, args);
      }
    };

    // Cleanup on unmount
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      console.trace = originalTrace;
      console.log = originalLog;
    };
  }, []);

  return null;
}
