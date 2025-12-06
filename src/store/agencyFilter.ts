'use client'
import { create } from 'zustand'

type State = {
  activeTalentId: string | null
  setTalentId: (id: string | null) => void
}
export const useAgencyFilter = create<State>((set)=>({
  activeTalentId: null,
  setTalentId: (id) => set({ activeTalentId: id }),
}))







