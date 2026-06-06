"use client";

import { useCallback, useMemo, useState } from "react";
import { MapPin, Loader2, Search, LocateFixed, Heart } from "lucide-react";
import { toast } from "sonner";
import { DEALERSHIPS, TOYOTA_HOTLINE } from "@/data/dealerships";
import { DealerMap, type DealerWithDistance } from "@/components/dealer/DealerMap";
import { dealershipGoogleMaps } from "@/lib/geo";
import { Input } from "@/components/ui/input";
import { requestUserLocation, getGeolocationErrorMessage, sortByDistance } from "@/lib/geo";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";

const CITIES = [...new Set(DEALERSHIPS.map((d) => d.city))].sort();

export default function ConcessionsPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [flyToUser, setFlyToUser] = useState(false);
  const [cityFilter, setCityFilter] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | "succursale" | "concessionnaire">("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const requestGeo = useCallback(async () => {
    setLoading(true);
    try {
      const loc = await requestUserLocation();
      setUserLocation(loc);
      setFlyToUser(true);
      toast.success("Position détectée");
    } catch (error) {
      setUserLocation(null);
      setFlyToUser(false);
      toast.error("Géolocalisation impossible", { description: getGeolocationErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }, []);

  const dealers = useMemo((): DealerWithDistance[] => {
    let list = DEALERSHIPS;
    if (typeFilter) list = list.filter((d) => d.type === typeFilter);
    if (cityFilter) list = list.filter((d) => d.city === cityFilter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.city.toLowerCase().includes(q) ||
          d.address.toLowerCase().includes(q)
      );
    }
    if (userLocation) {
      return sortByDistance(list, userLocation).map(({ item, distanceKm }) => ({ ...item, distanceKm }));
    }
    return list;
  }, [userLocation, cityFilter, search, typeFilter]);

  const effectiveSelectedId = selectedId ?? (userLocation && dealers[0] ? dealers[0].id : null);

  return (
    <div className="toyota-page pb-28 lg:pb-12">
      <div className="section-container py-8 lg:py-10">
        <SectionHeading
          title="Nos concessions au Maroc"
          subtitle={
            <>
              <span className="text-toyota-red">{DEALERSHIPS.length} points de vente</span> — succursales officielles et
              concessionnaires agréés. Coordonnées GPS exactes, liens Google Maps dynamiques.
            </>
          }
        />
        <p className="text-[11px] text-white/30 mt-4 uppercase tracking-wider">
          Source : toyota.co.ma · Assistance : {TOYOTA_HOTLINE}
        </p>

        <div className="flex flex-wrap gap-3 mt-8 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input className="pl-10 bg-[#121212] border-white/10 rounded-md" placeholder="Rechercher une concession…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)} className="h-10 rounded-md border border-white/10 bg-[#121212] px-3 text-sm text-white">
            <option value="">Tous les types</option>
            <option value="succursale">Succursales</option>
            <option value="concessionnaire">Concessionnaires</option>
          </select>
          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className="h-10 rounded-md border border-white/10 bg-[#121212] px-3 text-sm text-white">
            <option value="">Toutes les villes</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void requestGeo()}
            disabled={loading}
            className="toyota-btn-ghost inline-flex items-center gap-2 h-10 px-4"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
            Ma position
          </button>
        </div>

        <div className="grid lg:grid-cols-5 gap-5">
          <div className="lg:col-span-3 relative">
            <DealerMap
              dealers={dealers}
              userLocation={userLocation}
              selectedId={effectiveSelectedId ?? undefined}
              onSelect={(d) => { setSelectedId(d.id); setFlyToUser(false); }}
              flyToUser={flyToUser}
              height="calc(100vh - 320px)"
              className="min-h-[420px]"
            />
            <div className="absolute bottom-4 left-4 z-[1000] flex items-center gap-2 px-3 py-2 rounded-md bg-black/80 border border-white/10 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70">
                {dealers.length} concessions · Horaires selon agence
              </span>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {dealers.length === 0 ? (
              <p className="text-white/40 text-sm p-4">Aucune concession trouvée.</p>
            ) : (
              dealers.map((d, i) => {
                const selected = effectiveSelectedId === d.id;
                const maps = dealershipGoogleMaps(d);
                return (
                  <div
                    key={d.id}
                    className={cn("toyota-dealer-card cursor-pointer", selected && "toyota-dealer-card--selected")}
                    onClick={() => setSelectedId(d.id)}
                    onKeyDown={(e) => e.key === "Enter" && setSelectedId(d.id)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        {i === 0 && userLocation && (
                          <span className="text-[9px] font-bold uppercase tracking-wider text-toyota-red block mb-1">Recommandé</span>
                        )}
                        <p className="text-white font-bold text-sm">{d.name}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFavorites((prev) => {
                            const next = new Set(prev);
                            if (next.has(d.id)) next.delete(d.id);
                            else next.add(d.id);
                            return next;
                          });
                        }}
                        className="text-white/25 hover:text-toyota-red transition-colors"
                      >
                        <Heart className={cn("h-4 w-4", favorites.has(d.id) && "fill-toyota-red text-toyota-red")} />
                      </button>
                    </div>
                    <span className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded", d.type === "succursale" ? "bg-toyota-red/15 text-toyota-red" : "bg-white/10 text-white/50")}>
                      {d.type === "succursale" ? "Officiel" : "Agréé"}
                    </span>
                    <p className="text-white/45 text-xs mt-2 flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-toyota-red shrink-0 mt-0.5" />
                      {d.address}
                    </p>
                    <p className="text-white/35 text-xs mt-1">{d.phone}</p>
                    {d.distanceKm != null && (
                      <p className="text-toyota-red text-xs font-bold mt-2">{d.distanceKm.toFixed(1)} km</p>
                    )}
                    <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                      <a href={maps.place} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 rounded-md border border-white/10 text-[11px] font-semibold text-white/60 hover:bg-white/5">
                        Google Maps
                      </a>
                      <a href={maps.directions(userLocation ?? undefined)} target="_blank" rel="noopener noreferrer" className="flex-1 text-center py-2 rounded-md bg-toyota-red text-[11px] font-bold text-white hover:bg-toyota-red/90">
                        Itinéraire →
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
