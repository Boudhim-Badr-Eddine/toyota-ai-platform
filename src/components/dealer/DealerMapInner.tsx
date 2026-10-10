"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { Dealership } from "@/data/dealerships";
import { formatDistance, dealershipGoogleMaps } from "@/lib/geo";
import { cn } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

export interface DealerWithDistance extends Dealership {
  distanceKm?: number;
}

function createDealerIcon(selected: boolean, isSuccursale: boolean) {
  return L.divIcon({
    className: "leaflet-dealer-icon",
    html: `
      <div class="dealer-pin${selected ? " dealer-pin--selected" : ""}${isSuccursale ? " dealer-pin--succursale" : ""}" aria-hidden="true">
        <div class="dealer-pin__head">
          <span class="dealer-pin__logo">T</span>
        </div>
        <div class="dealer-pin__point"></div>
      </div>
    `,
    iconSize: [40, 52],
    iconAnchor: [20, 52],
    popupAnchor: [0, -54],
  });
}

function createUserIcon() {
  return L.divIcon({
    className: "leaflet-user-icon",
    html: `
      <div class="user-pin" aria-hidden="true">
        <span class="user-pin__ring"></span>
        <span class="user-pin__core"></span>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function MapController({
  userLocation,
  dealers,
  flyToUser,
  selectedId,
}: {
  userLocation: { lat: number; lng: number } | null | undefined;
  dealers: DealerWithDistance[];
  flyToUser: boolean;
  selectedId?: string;
}) {
  const map = useMap();
  const prevSelected = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (flyToUser && userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 11, { duration: 1.2 });
      return;
    }

    if (selectedId && selectedId !== prevSelected.current) {
      const dealer = dealers.find((d) => d.id === selectedId);
      if (dealer) {
        map.flyTo([dealer.lat, dealer.lng], 14, { duration: 0.85 });
        prevSelected.current = selectedId;
        return;
      }
    }

    if (dealers.length === 0) return;

    if (dealers.length === 1) {
      map.setView([dealers[0].lat, dealers[0].lng], 13);
      return;
    }

    const bounds = L.latLngBounds(dealers.map((d) => [d.lat, d.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [52, 52], maxZoom: 11 });
  }, [map, userLocation, dealers, flyToUser, selectedId]);

  return null;
}

function DealerPopupContent({
  dealer,
  userLocation,
}: {
  dealer: DealerWithDistance;
  userLocation?: { lat: number; lng: number } | null;
}) {
  const maps = dealershipGoogleMaps(dealer);

  return (
    <div className="dealer-popup">
      <span
        className={cn(
          "dealer-popup__badge",
          dealer.type === "succursale" ? "dealer-popup__badge--succursale" : "dealer-popup__badge--dealer"
        )}
      >
        {dealer.type === "succursale" ? "Succursale Toyota" : "Concessionnaire agréé"}
      </span>
      <p className="dealer-popup__title">{dealer.name}</p>
      <p className="dealer-popup__address">{dealer.address}</p>
      <p className="dealer-popup__phone">{dealer.phone}</p>
      <p className="dealer-popup__coords">
        {dealer.lat.toFixed(5)}, {dealer.lng.toFixed(5)}
      </p>
      {dealer.distanceKm != null && (
        <p className="dealer-popup__distance">{formatDistance(dealer.distanceKm)} de vous</p>
      )}
      <div className="dealer-popup__actions">
        <a
          href={maps.place}
          target="_blank"
          rel="noopener noreferrer"
          className="dealer-popup__link dealer-popup__link--primary"
        >
          Voir sur Google Maps
        </a>
        <a
          href={maps.directions(userLocation ?? undefined)}
          target="_blank"
          rel="noopener noreferrer"
          className="dealer-popup__link"
        >
          Itinéraire →
        </a>
      </div>
    </div>
  );
}

interface DealerMapInnerProps {
  dealers: DealerWithDistance[];
  userLocation?: { lat: number; lng: number } | null;
  selectedId?: string;
  onSelect?: (dealer: Dealership) => void;
  className?: string;
  height?: string;
  flyToUser?: boolean;
}

export function DealerMapInner({
  dealers,
  userLocation,
  selectedId,
  onSelect,
  className,
  height = "400px",
  flyToUser = false,
}: DealerMapInnerProps) {
  const moroccoCenter: [number, number] = [31.7917, -7.0926];
  const center: [number, number] = userLocation
    ? [userLocation.lat, userLocation.lng]
    : dealers[0]
      ? [dealers[0].lat, dealers[0].lng]
      : moroccoCenter;

  return (
    <div
      className={cn("dealer-map-shell rounded-2xl overflow-hidden border border-white/10", className)}
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={userLocation ? 11 : 6}
        minZoom={5}
        maxZoom={18}
        style={{ height: "100%", width: "100%", background: "#0a0a0a" }}
        scrollWheelZoom
        zoomControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapController
          userLocation={userLocation}
          dealers={dealers}
          flyToUser={flyToUser}
          selectedId={selectedId}
        />

        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={createUserIcon()}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="dealer-popup">
                <p className="dealer-popup__title">Votre position</p>
                <p className="dealer-popup__meta">Concessions triées par distance GPS.</p>
              </div>
            </Popup>
          </Marker>
        )}

        {dealers.map((d) => {
          const selected = selectedId === d.id;
          return (
            <Marker
              key={d.id}
              position={[d.lat, d.lng]}
              icon={createDealerIcon(selected, d.type === "succursale")}
              zIndexOffset={selected ? 500 : 0}
              eventHandlers={
                onSelect
                  ? {
                      click: () => onSelect(d),
                    }
                  : undefined
              }
            >
              <Popup maxWidth={280} minWidth={240}>
                <DealerPopupContent dealer={d} userLocation={userLocation} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export { createDealerIcon, createUserIcon };
