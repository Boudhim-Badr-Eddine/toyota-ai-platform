import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS class names safely, resolving conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a MAD price with French thousands separator.
 * e.g. 520000 → "520 000 MAD"
 */
export function formatPrice(price: number): string {
  return `${price.toLocaleString("fr-MA")} MAD`;
}

/**
 * Format engine power in horsepower (French: "ch").
 * e.g. 340 → "340 ch"
 */
export function formatPower(power: number): string {
  return `${power} ch`;
}

/**
 * Format torque in Nm.
 * e.g. 500 → "500 Nm"
 */
export function formatTorque(torque: number): string {
  return `${torque} Nm`;
}

/**
 * Format fuel consumption.
 * e.g. 6.0 → "6.0 L/100 km"
 */
export function formatConsumption(consumption: number): string {
  return `${consumption} L/100 km`;
}

/**
 * Generate a simple UUID v4.
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Truncate a string to a maximum length, appending "…" if needed.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + "…";
}

/**
 * Debounce a function call.
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
