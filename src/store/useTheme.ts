"use client";
import { create } from "zustand";

type Accent = "purple" | "cyan";
type ThemeMode = "system" | "light" | "dark";

interface ThemeState {
  mode: ThemeMode;
  accent: Accent;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: Accent) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: "dark",
  accent: "purple",
  setMode: (mode) => set({ mode }),
  setAccent: (accent) => set({ accent }),
}));

