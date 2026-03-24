"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { TalentPodConfig, EngagementType, AddOn } from "@/lib/podRates";
import { getBaseDayRate } from "@/lib/podRates";
import type { Talent } from "./useCampaignPodStore";

export interface PodConfig {
  campaignBrief: string;
  campaignDuration: {
    start: Date | null;
    end: Date | null;
  };
  talentConfigs: Map<string, TalentPodConfig>;
}

type PodConfigState = {
  isPodSetupOpen: boolean;
  podConfig: PodConfig | null;
  openPodSetup: (talents: Talent[]) => void;
  closePodSetup: () => void;
  updateTalentConfig: (talentId: string, config: Partial<TalentPodConfig>) => void;
  updateCampaignBrief: (brief: string) => void;
  updateCampaignDuration: (start: Date | null, end: Date | null) => void;
  resetPodConfig: () => void;
};

const ensureTalentConfigMap = (value: unknown): Map<string, TalentPodConfig> => {
  if (value instanceof Map) {
    return value;
  }
  if (Array.isArray(value)) {
    return new Map(value as [string, TalentPodConfig][]);
  }
  if (value && typeof value === "object") {
    return new Map(Object.entries(value as Record<string, TalentPodConfig>));
  }
  return new Map();
};

const mapAwareStorage = createJSONStorage<PodConfigState>(() => localStorage, {
  replacer: (_key, value) => {
    if (value instanceof Map) {
      return { __type: "Map", value: Array.from(value.entries()) };
    }
    if (value instanceof Date) {
      return { __type: "Date", value: value.toISOString() };
    }
    return value;
  },
  reviver: (_key, value) => {
    if (value && typeof value === "object") {
      const marker = value as { __type?: string; value?: unknown };
      if (marker.__type === "Map" && Array.isArray(marker.value)) {
        return new Map(marker.value as [string, TalentPodConfig][]);
      }
      if (marker.__type === "Date" && typeof marker.value === "string") {
        return new Date(marker.value);
      }
    }
    return value;
  },
});

export const usePodConfigStore = create<PodConfigState>()(
  persist(
    (set, get) => ({
      isPodSetupOpen: false,
      podConfig: null,
      
      openPodSetup: (talents) => {
        const talentConfigs = new Map<string, TalentPodConfig>();
        
        // Initialize configs for each talent
        talents.forEach((talent) => {
          const primaryRole = talent.roles[0] || "Content Creator";
          talentConfigs.set(talent.id, {
            talentId: talent.id,
            baseDayRate: getBaseDayRate(primaryRole),
            duration: 7, // Default 7 days
            engagementType: "per-project",
            dateRange: {
              start: null,
              end: null,
            },
            addOns: [],
          });
        });
        
        set({
          isPodSetupOpen: true,
          podConfig: {
            campaignBrief: "",
            campaignDuration: {
              start: null,
              end: null,
            },
            talentConfigs,
          },
        });
      },
      
      closePodSetup: () => {
        set({ isPodSetupOpen: false });
      },
      
      updateTalentConfig: (talentId, partialConfig) => {
        const state = get();
        if (!state.podConfig) return;
        
        const currentConfig = state.podConfig.talentConfigs.get(talentId);
        if (!currentConfig) return;
        
        const updatedConfigs = new Map(state.podConfig.talentConfigs);
        updatedConfigs.set(talentId, {
          ...currentConfig,
          ...partialConfig,
        });
        
        set({
          podConfig: {
            ...state.podConfig,
            talentConfigs: updatedConfigs,
          },
        });
      },
      
      updateCampaignBrief: (brief) => {
        const state = get();
        if (!state.podConfig) return;
        
        set({
          podConfig: {
            ...state.podConfig,
            campaignBrief: brief,
          },
        });
      },
      
      updateCampaignDuration: (start, end) => {
        const state = get();
        if (!state.podConfig) return;
        
        // Update all talent date ranges if campaign duration is set
        const updatedConfigs = new Map(state.podConfig.talentConfigs);
        if (start && end) {
          updatedConfigs.forEach((config, talentId) => {
            if (!config.dateRange.start || !config.dateRange.end) {
              updatedConfigs.set(talentId, {
                ...config,
                dateRange: { start, end },
              });
            }
          });
        }
        
        set({
          podConfig: {
            ...state.podConfig,
            campaignDuration: { start, end },
            talentConfigs: updatedConfigs,
          },
        });
      },
      
      resetPodConfig: () => {
        set({
          isPodSetupOpen: false,
          podConfig: null,
        });
      },
    }),
    {
      name: "creator-hive-pod-config",
      storage: mapAwareStorage,
      merge: (
        persistedState: unknown,
        currentState: PodConfigState,
      ): PodConfigState => {
        if (!persistedState || typeof persistedState !== "object") {
          return currentState;
        }
        const typed = persistedState as Partial<PodConfigState>;
        const merged = {
          ...currentState,
          ...typed,
        };
        if (typed.podConfig) {
          merged.podConfig = {
            ...currentState.podConfig,
            ...typed.podConfig,
            talentConfigs: ensureTalentConfigMap(typed.podConfig.talentConfigs),
          };
        }
        return merged;
      },
    },
  ),
);
