import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Vehicle, VehicleColor, VehicleWheel, VehicleInterior } from "@/types";

// ─── Price surcharges ──────────────────────────────────────────────────────────
// Applied on top of the vehicle base price based on option selections.

const COLOR_SURCHARGE: Record<string, number> = {
  pearl: 5000,
  metallic: 3000,
  solid: 0,
};

const WHEEL_SIZE_SURCHARGE: Record<string, number> = {
  "15 pouces": 0,
  "16 pouces": 2000,
  "17 pouces": 4000,
  "18 pouces": 7000,
  "19 pouces": 10000,
  "20 pouces": 14000,
  "21 pouces": 18000,
};

const INTERIOR_SURCHARGE: Record<string, number> = {
  fabric: 0,
  leather: 8000,
  "premium-leather": 18000,
};

// ─── State & Actions interface ─────────────────────────────────────────────────

interface ConfiguratorStore {
  // State
  selectedVehicle: Vehicle | null;
  selectedColor: VehicleColor | null;
  selectedWheels: VehicleWheel | null;
  selectedInterior: VehicleInterior | null;
  totalPrice: number;

  // Actions
  setVehicle: (vehicle: Vehicle) => void;
  setColor: (color: VehicleColor) => void;
  setWheels: (wheels: VehicleWheel) => void;
  setInterior: (interior: VehicleInterior) => void;
  resetConfig: () => void;

  // Helpers
  getConfiguration: () => ConfigurationSummary;
}

export interface ConfigurationSummary {
  vehicleId: string;
  vehicleName: string;
  color: VehicleColor | null;
  wheels: VehicleWheel | null;
  interior: VehicleInterior | null;
  basePrice: number;
  totalPrice: number;
}

// ─── Helper: compute total price ───────────────────────────────────────────────

function computeTotal(
  vehicle: Vehicle | null,
  color: VehicleColor | null,
  wheels: VehicleWheel | null,
  interior: VehicleInterior | null
): number {
  if (!vehicle) return 0;

  const colorExtra = color ? (COLOR_SURCHARGE[color.type] ?? 0) : 0;
  const wheelsExtra = wheels ? (WHEEL_SIZE_SURCHARGE[wheels.size] ?? 0) : 0;
  const interiorExtra = interior ? (INTERIOR_SURCHARGE[interior.material] ?? 0) : 0;

  return vehicle.priceFrom + colorExtra + wheelsExtra + interiorExtra;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useConfiguratorStore = create<ConfiguratorStore>()(
  persist(
    (set, get) => ({
      // ─── Initial State ──────────────────────────────────────────────────────
      selectedVehicle: null,
      selectedColor: null,
      selectedWheels: null,
      selectedInterior: null,
      totalPrice: 0,

      // ─── Actions ────────────────────────────────────────────────────────────

      setVehicle: (vehicle: Vehicle) => {
        // When switching vehicle, reset options and pre-select first of each
        const defaultColor = vehicle.colors[0] ?? null;
        const defaultWheels = vehicle.wheels[0] ?? null;
        const defaultInterior = vehicle.interiors[0] ?? null;

        set({
          selectedVehicle: vehicle,
          selectedColor: defaultColor,
          selectedWheels: defaultWheels,
          selectedInterior: defaultInterior,
          totalPrice: computeTotal(vehicle, defaultColor, defaultWheels, defaultInterior),
        });
      },

      setColor: (color: VehicleColor) => {
        const { selectedVehicle, selectedWheels, selectedInterior } = get();
        set({
          selectedColor: color,
          totalPrice: computeTotal(selectedVehicle, color, selectedWheels, selectedInterior),
        });
      },

      setWheels: (wheels: VehicleWheel) => {
        const { selectedVehicle, selectedColor, selectedInterior } = get();
        set({
          selectedWheels: wheels,
          totalPrice: computeTotal(selectedVehicle, selectedColor, wheels, selectedInterior),
        });
      },

      setInterior: (interior: VehicleInterior) => {
        const { selectedVehicle, selectedColor, selectedWheels } = get();
        set({
          selectedInterior: interior,
          totalPrice: computeTotal(selectedVehicle, selectedColor, selectedWheels, interior),
        });
      },

      resetConfig: () =>
        set({
          selectedVehicle: null,
          selectedColor: null,
          selectedWheels: null,
          selectedInterior: null,
          totalPrice: 0,
        }),

      // ─── Helpers ────────────────────────────────────────────────────────────

      getConfiguration: (): ConfigurationSummary => {
        const { selectedVehicle, selectedColor, selectedWheels, selectedInterior, totalPrice } =
          get();
        return {
          vehicleId: selectedVehicle?.id ?? "",
          vehicleName: selectedVehicle?.name ?? "",
          color: selectedColor,
          wheels: selectedWheels,
          interior: selectedInterior,
          basePrice: selectedVehicle?.priceFrom ?? 0,
          totalPrice,
        };
      },
    }),
    {
      name: "toyota-configurator-store",
    }
  )
);
