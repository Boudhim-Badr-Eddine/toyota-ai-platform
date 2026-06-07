export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface WithDistance<T> {
  item: T;
  distanceKm: number;
}

/** Haversine distance in kilometers */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function sortByDistance<T extends { lat: number; lng: number }>(
  items: T[],
  user: GeoPoint
): WithDistance<T>[] {
  return items
    .map((item) => ({
      item,
      distanceKm: distanceKm(user, { lat: item.lat, lng: item.lng }),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function googleMapsDirectionsUrl(lat: number, lng: number, origin?: GeoPoint): string {
  const dest = `${lat},${lng}`;
  if (origin) {
    return `https://www.google.com/maps/dir/?api=1&origin=${origin.lat},${origin.lng}&destination=${dest}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
}

/** Opens exact pin on Google Maps (satellite/street view available) */
export function googleMapsPlaceUrl(lat: number, lng: number, label?: string): string {
  const coords = `${lat},${lng}`;
  if (label) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label)}&query=${coords}`;
  }
  return `https://www.google.com/maps/search/?api=1&query=${coords}`;
}

/** Build URLs from a dealership record */
export function dealershipGoogleMaps(dealer: {
  lat: number;
  lng: number;
  googleLabel?: string;
  name?: string;
  address?: string;
}) {
  const label = dealer.googleLabel ?? `${dealer.name ?? "Toyota"} ${dealer.address ?? ""}`.trim();
  return {
    place: googleMapsPlaceUrl(dealer.lat, dealer.lng, label),
    directions: (origin?: GeoPoint) => googleMapsDirectionsUrl(dealer.lat, dealer.lng, origin),
  };
}

/** User-friendly French messages for geolocation failures */
export function getGeolocationErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as GeolocationPositionError).code;
    switch (code) {
      case 1:
        return "Accès à la position refusé. Autorisez la géolocalisation dans votre navigateur, puis réessayez.";
      case 2:
        return "Position indisponible. Vérifiez que le GPS est activé sur votre appareil.";
      case 3:
        return "Délai dépassé. Réessayez ou choisissez une ville manuellement.";
      default:
        return "Impossible d'obtenir votre position.";
    }
  }
  if (error instanceof Error) return error.message;
  return "Impossible d'obtenir votre position.";
}

export function requestUserLocation(): Promise<GeoPoint> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      reject(new Error("Géolocalisation non supportée par ce navigateur"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}
