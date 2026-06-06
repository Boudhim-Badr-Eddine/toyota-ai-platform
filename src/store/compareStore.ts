import { create } from "zustand";
import { toast } from "sonner";

interface CompareState {
  selectedIds: string[];
  toggle: (id: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

export const useCompareStore = create<CompareState>((set, get) => ({
  selectedIds: [],
  toggle: (id) => {
    const current = get().selectedIds;
    if (current.includes(id)) {
      set({ selectedIds: current.filter((x) => x !== id) });
    } else if (current.length < 3) {
      set({ selectedIds: [...current, id] });
    } else {
      toast.info("Maximum 3 véhicules en comparaison", {
        description: "Retirez un modèle pour en ajouter un autre.",
      });
    }
  },
  clear: () => set({ selectedIds: [] }),
  drawerOpen: false,
  setDrawerOpen: (open) => set({ drawerOpen: open }),
}));
