import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Vehicle, VehicleColor, VehicleWheel, VehicleInterior } from "@/types";
import type { VehicleTrim } from "@/data/vehicleTrims";
import { getTrimsForVehicle } from "@/data/vehicleTrims";

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
  selectedTrim: VehicleTrim | null;
  selectedColor: VehicleColor | null;
  selectedWheels: VehicleWheel | null;
  selectedInterior: VehicleInterior | null;
  totalPrice: number;

  // Actions
  setVehicle: (vehicle: Vehicle) => void;
  setTrim: (trim: VehicleTrim) => void;
  setColor: (color: VehicleColor) => void;
  setWheels: (wheels: VehicleWheel) => void;
  setInterior: (interior: VehicleInterior) => void;
  resetConfig: () => void;
  applyFromUrl: (opts: {
    colorId?: string;
    wheelId?: string;
    interiorId?: string;
    trimId?: string;
  }) => void;

  // Helpers
  getConfiguration: () => ConfigurationSummary;
}

export interface ConfigurationSummary {
  vehicleId: string;
  vehicleName: string;
  trim: VehicleTrim | null;
  color: VehicleColor | null;
  wheels: VehicleWheel | null;
  interior: VehicleInterior | null;
  basePrice: number;
  totalPrice: number;
}

// ─── Helper: compute total price ───────────────────────────────────────────────

function computeTotal(
  vehicle: Vehicle | null,
  trim: VehicleTrim | null,
  color: VehicleColor | null,
  wheels: VehicleWheel | null,
  interior: VehicleInterior | null
): number {
  if (!vehicle) return 0;

  const base = trim && trim.priceFrom > 0 ? trim.priceFrom : vehicle.priceFrom;
  const colorExtra = color ? (COLOR_SURCHARGE[color.type] ?? 0) : 0;
  const wheelsExtra = wheels ? (WHEEL_SIZE_SURCHARGE[wheels.size] ?? 0) : 0;
  const interiorExtra = interior ? (INTERIOR_SURCHARGE[interior.material] ?? 0) : 0;

  return base + colorExtra + wheelsExtra + interiorExtra;
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useConfiguratorStore = create<ConfiguratorStore>()(
  persist(
    (set, get) => ({
      // ─── Initial State ──────────────────────────────────────────────────────
      selectedVehicle: null,
      selectedTrim: null,
      selectedColor: null,
      selectedWheels: null,
      selectedInterior: null,
      totalPrice: 0,

      // ─── Actions ────────────────────────────────────────────────────────────

      setVehicle: (vehicle: Vehicle) => {
        const defaultColor = vehicle.colors[0] ?? null;
        const defaultWheels = vehicle.wheels[0] ?? null;
        const defaultInterior = vehicle.interiors[0] ?? null;
        const trims = getTrimsForVehicle(vehicle.id);
        const defaultTrim = trims[0] ?? null;

        set({
          selectedVehicle: vehicle,
          selectedTrim: defaultTrim,
          selectedColor: defaultColor,
          selectedWheels: defaultWheels,
          selectedInterior: defaultInterior,
          totalPrice: computeTotal(vehicle, defaultTrim, defaultColor, defaultWheels, defaultInterior),
        });
      },

      setTrim: (trim: VehicleTrim) => {
        const { selectedVehicle, selectedColor, selectedWheels, selectedInterior } = get();
        set({
          selectedTrim: trim,
          totalPrice: computeTotal(selectedVehicle, trim, selectedColor, selectedWheels, selectedInterior),
        });
      },

      setColor: (color: VehicleColor) => {
        const { selectedVehicle, selectedTrim, selectedWheels, selectedInterior } = get();
        set({
          selectedColor: color,
          totalPrice: computeTotal(selectedVehicle, selectedTrim, color, selectedWheels, selectedInterior),
        });
      },

      setWheels: (wheels: VehicleWheel) => {
        const { selectedVehicle, selectedTrim, selectedColor, selectedInterior } = get();
        set({
          selectedWheels: wheels,
          totalPrice: computeTotal(selectedVehicle, selectedTrim, selectedColor, wheels, selectedInterior),
        });
      },

      setInterior: (interior: VehicleInterior) => {
        const { selectedVehicle, selectedTrim, selectedColor, selectedWheels } = get();
        set({
          selectedInterior: interior,
          totalPrice: computeTotal(selectedVehicle, selectedTrim, selectedColor, selectedWheels, interior),
        });
      },

      applyFromUrl: (opts) => {
        const { selectedVehicle, selectedTrim, selectedColor, selectedWheels, selectedInterior } = get();
        if (!selectedVehicle) return;

        const trims = getTrimsForVehicle(selectedVehicle.id);
        const trim = opts.trimId
          ? trims.find((t) => t.id === opts.trimId) ?? selectedTrim
          : selectedTrim;
        const color = opts.colorId
          ? selectedVehicle.colors.find((c) => c.id === opts.colorId) ?? selectedColor
          : selectedColor;
        const wheels = opts.wheelId
          ? selectedVehicle.wheels.find((w) => w.id === opts.wheelId) ?? selectedWheels
          : selectedWheels;
        const interior = opts.interiorId
          ? selectedVehicle.interiors.find((i) => i.id === opts.interiorId) ?? selectedInterior
          : selectedInterior;

        set({
          selectedTrim: trim,
          selectedColor: color,
          selectedWheels: wheels,
          selectedInterior: interior,
          totalPrice: computeTotal(selectedVehicle, trim, color, wheels, interior),
        });
      },

      resetConfig: () =>
        set({
          selectedVehicle: null,
          selectedTrim: null,
          selectedColor: null,
          selectedWheels: null,
          selectedInterior: null,
          totalPrice: 0,
        }),

      getConfiguration: (): ConfigurationSummary => {
        const { selectedVehicle, selectedTrim, selectedColor, selectedWheels, selectedInterior, totalPrice } =
          get();
        const basePrice =
          selectedTrim && selectedTrim.priceFrom > 0
            ? selectedTrim.priceFrom
            : selectedVehicle?.priceFrom ?? 0;
        return {
          vehicleId: selectedVehicle?.id ?? "",
          vehicleName: selectedVehicle?.name ?? "",
          trim: selectedTrim,
          color: selectedColor,
          wheels: selectedWheels,
          interior: selectedInterior,
          basePrice,
          totalPrice,
        };
      },
    }),
    {
      name: "toyota-configurator-store",
    }
  )
);
