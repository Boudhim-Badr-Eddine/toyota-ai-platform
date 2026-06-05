// ─── Vehicle Types ─────────────────────────────────────────────────────────────

export interface VehicleColor {
  id: string;
  name: string;
  hex: string;
  type: "solid" | "metallic" | "pearl";
}

export interface VehicleWheel {
  id: string;
  name: string;
  size: string;
}

export interface VehicleInterior {
  id: string;
  name: string;
  material: "fabric" | "leather" | "premium-leather";
  colorHex: string;
}

export interface VehicleSpecs {
  engine: string;            // ex: "3.0L Turbo BMW B58"
  engineType: string;        // "Essence" | "Hybride" | "Diesel" | "PHEV"
  power: number;             // ch
  torque: number;            // Nm
  transmission: string;      // ex: "Automatique 8 rapports"
  drivetrain: string;        // "RWD" | "FWD" | "AWD" | "4WD"
  zeroto100: number;         // seconds
  topSpeed: number;          // km/h
  consumption: number;       // L/100km
  autonomyEV?: number;       // km, PHEV only
  trunkLiters: number;       // L
  seats: number;
  weight: number;            // kg
  length: number;            // mm
  width: number;             // mm
  height: number;            // mm
  wheelbase: number;         // mm
  groundClearance?: number;  // mm, SUVs
  towingCapacity?: number;   // kg
  payload?: number;          // kg, Hilux only
  warranty: string;          // ex: "3 ans / 100,000 km"
}

export interface Vehicle {
  id: string;
  name: string;
  category: string;
  model3dPath: string;
  imageUrl: string;
  images: string[];          // [front, side, rear, interior]
  tagline: string;
  highlights: string[];      // 4 key selling points
  targetProfiles: string[];  // ex: ["Famille", "Professionnel"]
  isHybrid: boolean;
  isNew: boolean;
  rating: number;            // out of 5
  reviewCount: number;
  priceFrom: number;         // MAD
  colors: VehicleColor[];
  wheels: VehicleWheel[];
  interiors: VehicleInterior[];
  specs: VehicleSpecs;
  description: string;
}

// ─── Configurator Types ────────────────────────────────────────────────────────

export interface ConfiguratorState {
  vehicleId: string;
  selectedColor: VehicleColor | null;
  selectedWheel: VehicleWheel | null;
  selectedInterior: VehicleInterior | null;
  isRotating: boolean;
  cameraPosition: [number, number, number];
}

// ─── Lead & Reservation Types ──────────────────────────────────────────────────

export type LeadType = "test_drive" | "quote";
export type LeadStatus = "new" | "contacted" | "converted" | "lost";
export type ReservationStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type ReservationType = "test_drive" | "visit";

export interface LeadFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  vehicleId: string;
  configuration: Partial<ConfiguratorState>;
  chatHistory: ChatMessage[];
  type: LeadType;
}

export interface Lead extends LeadFormData {
  id: string;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReservationFormData {
  leadId: string;
  vehicleId: string;
  date: Date;
  type: ReservationType;
  notes?: string;
}

export interface Reservation extends ReservationFormData {
  id: string;
  status: ReservationStatus;
  createdAt: Date;
  lead?: Lead;
  vehicle?: Vehicle;
}

// ─── Chat / AI Types ────────────────────────────────────────────────────────────

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
}

export interface UserPreferences {
  budget: "under-200k" | "200k-350k" | "350k-550k" | "over-550k" | null;
  usage: "family" | "city" | "offroad" | "sport" | "eco" | null;
  fuelType: "hybrid" | "petrol" | "diesel" | "no-preference" | null;
  priority: "comfort" | "economy" | "technology" | "performance" | "value" | null;
}

export interface VehicleRecommendation {
  vehicleId: string;
  vehicleName: string;
  reasoning: string;
}

// ─── ML Service Types ───────────────────────────────────────────────────────────

export type MLSeason = "spring" | "summer" | "autumn" | "winter";
export type MLTargetSegment = "families" | "young" | "professional" | "adventure";

export interface MLPredictionInput {
  vehicle_category: string;
  price_range: string;
  season: MLSeason;
  target_segment: MLTargetSegment;
}

export interface MLPrediction {
  campaign_type: string;
  channel: string;
  budget_allocation: number; // percentage
  predicted_roi: number;     // multiplier
  message_theme: string;
  confidence: number;        // 0–1
}

// ─── Admin Types ────────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "super_admin";
  createdAt: Date;
}

export interface DashboardStats {
  totalLeads: number;
  newLeadsToday: number;
  totalReservations: number;
  pendingReservations: number;
  conversionRate: number;
  topVehicle: string;
}

// ─── API Response Types ─────────────────────────────────────────────────────────

export interface APIResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Navigation Types ───────────────────────────────────────────────────────────

export interface NavLink {
  href: string;
  label: string;
  icon?: string;
}
