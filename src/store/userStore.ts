import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserPreferences } from "@/types";

// ─── State & Actions interface ─────────────────────────────────────────────────

interface UserStore {
  // State
  preferences: UserPreferences | null;
  userName: string | null;

  // Actions
  setPreferences: (prefs: UserPreferences) => void;
  setUserName: (name: string) => void;
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => void;
  clear: () => void;

  // Helpers
  hasCompletedPreferences: () => boolean;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // ─── Initial State ──────────────────────────────────────────────────────
      preferences: null,
      userName: null,

      // ─── Actions ────────────────────────────────────────────────────────────

      setPreferences: (prefs: UserPreferences) =>
        set({ preferences: prefs }),

      setUserName: (name: string) =>
        set({ userName: name }),

      updatePreference: <K extends keyof UserPreferences>(
        key: K,
        value: UserPreferences[K]
      ) =>
        set((state) => ({
          preferences: {
            budget: null,
            usage: null,
            fuelType: null,
            priority: null,
            ...state.preferences,
            [key]: value,
          },
        })),

      clear: () =>
        set({
          preferences: null,
          userName: null,
        }),

      // ─── Helpers ────────────────────────────────────────────────────────────

      /**
       * Returns true only when all four preference fields have been answered.
       */
      hasCompletedPreferences: (): boolean => {
        const { preferences } = get();
        if (!preferences) return false;
        return (
          preferences.budget !== null &&
          preferences.usage !== null &&
          preferences.fuelType !== null &&
          preferences.priority !== null
        );
      },
    }),
    {
      name: "toyota-user-store",
    }
  )
);
