"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import type { ItineraryStop } from "./ItineraryDayCard";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

function createStopIcon(isDealer: boolean, index: number) {
  const color = isDealer ? "#EB0A1E" : "#C9A84C";
  return L.divIcon({
    className: "trip-stop-icon",
    html: `
      <div style="
        width:28px;height:28px;border-radius:50%;
        background:${color};border:2px solid #fff;
        display:flex;align-items:center;justify-content:center;
        font-size:11px;font-weight:800;color:#fff;
        box-shadow:0 2px 8px rgba(0,0,0,0.4);
      ">${index + 1}</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function MapFitBounds({ stops }: { stops: ItineraryStop[] }) {
  const map = useMap();

  useEffect(() => {
    if (stops.length === 0) return;
    if (stops.length === 1) {
      map.setView([stops[0].lat, stops[0].lng], 12);
      return;
    }
    const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 10 });
  }, [map, stops]);

  return null;
}

interface TripMapInnerProps {
  stops: ItineraryStop[];
  origin?: string;
  className?: string;
  height?: string;
  activeDay?: number;
}

export function TripMapInner({
  stops,
  className,
  height = "360px",
}: TripMapInnerProps) {
  const moroccoCenter: [number, number] = [31.7917, -7.0926];
  const center: [number, number] = stops[0]
    ? [stops[0].lat, stops[0].lng]
    : moroccoCenter;

  const polylinePositions = stops.map((s) => [s.lat, s.lng] as [number, number]);

  return (
    <div
      className={cn("dealer-map-shell rounded-2xl overflow-hidden border border-white/10", className)}
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={6}
        minZoom={5}
        maxZoom={14}
        style={{ height: "100%", width: "100%", background: "#0a0a0a" }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapFitBounds stops={stops} />

        {polylinePositions.length > 1 && (
          <Polyline
            positions={polylinePositions}
            pathOptions={{ color: "#EB0A1E", weight: 3, opacity: 0.7, dashArray: "8 6" }}
          />
        )}

        {stops.map((stop, i) => (
          <Marker
            key={`${stop.name}-${i}`}
            position={[stop.lat, stop.lng]}
            icon={createStopIcon(!!stop.isDealer, i)}
          >
            <Popup maxWidth={240}>
              <div className="dealer-popup">
                <p className="dealer-popup__title">{stop.name}</p>
                <p className="dealer-popup__meta">{stop.city}</p>
                <p className="dealer-popup__meta">{stop.note}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
