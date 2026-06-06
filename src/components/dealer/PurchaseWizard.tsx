"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Check, ChevronRight, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DEALERSHIPS } from "@/data/dealerships";
import { VEHICLES_DATA } from "@/data/vehicles";
import { DealerMap, DealerCard, type DealerWithDistance } from "@/components/dealer/DealerMap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { requestUserLocation, getGeolocationErrorMessage, sortByDistance, dealershipGoogleMaps } from "@/lib/geo";
import { useProfile } from "@/hooks/useProfile";
import { useConfiguratorStore } from "@/store/configuratorStore";
import { getChatHistoryForLead } from "@/lib/chatHistory";
import { cn } from "@/lib/utils";

const STEPS = ["Véhicule", "Vos infos", "Concession", "Rendez-vous", "Confirmation"];

const stepMotion = {
  initial: false as const,
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  type: "purchase" | "test_drive" | "quote";
};

export function PurchaseWizard() {
  const searchParams = useSearchParams();
  const prefillVehicle = searchParams.get("vehicle") ?? "";
  const prefillType = searchParams.get("type") as FormData["type"] | null;
  const { isCustomer, profile } = useProfile();

  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(0);
  const [vehicleId, setVehicleId] = useState(
    prefillVehicle || VEHICLES_DATA[0]?.id || ""
  );

  useEffect(() => {
    setMounted(true);
    setMinAppointmentDate(new Date().toISOString().slice(0, 10));
    if (!prefillVehicle) {
      const savedId = useConfiguratorStore.getState().getConfiguration().vehicleId;
      if (savedId) setVehicleId(savedId);
    }
  }, [prefillVehicle]);

  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    type: prefillType && ["purchase", "test_drive", "quote"].includes(prefillType) ? prefillType : "purchase",
  });
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("10:00");
  const [minAppointmentDate, setMinAppointmentDate] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoDenied, setGeoDenied] = useState(false);
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedDealer, setSubmittedDealer] = useState<(typeof DEALERSHIPS)[0] | null>(null);

  const profileComplete =
    isCustomer &&
    !!profile?.firstName &&
    !!profile?.lastName &&
    !!profile?.email &&
    !!profile?.phone;

  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        city: profile.city || f.city,
      }));
    }
  }, [profile]);

  const sortedDealers = useMemo((): DealerWithDistance[] => {
    if (userLocation) {
      return sortByDistance(DEALERSHIPS, userLocation).map(({ item, distanceKm }) => ({
        ...item,
        distanceKm,
      }));
    }
    if (form.city) {
      const cityDealers = DEALERSHIPS.filter(
        (d) => d.city.toLowerCase() === form.city.toLowerCase()
      );
      if (cityDealers.length) return cityDealers;
    }
    return DEALERSHIPS;
  }, [userLocation, form.city]);

  const requestGeo = useCallback(async () => {
    setGeoLoading(true);
    setGeoDenied(false);
    try {
      const loc = await requestUserLocation();
      setUserLocation(loc);
      toast.success("Position détectée");
    } catch (err) {
      setGeoDenied(true);
      toast.error("Géolocalisation impossible", {
        description: getGeolocationErrorMessage(err),
      });
    } finally {
      setGeoLoading(false);
    }
  }, []);

  useEffect(() => {
    if (step === 2 && !userLocation && !geoDenied) void requestGeo();
  }, [step, userLocation, geoDenied, requestGeo]);

  const selectedDealer = sortedDealers.find((d) => d.id === selectedDealerId) ?? sortedDealers[0];

  const submit = async () => {
    if (!selectedDealer) return;
    if (!appointmentDate) {
      toast.error("Choisissez une date de rendez-vous");
      return;
    }
    const configSummary = useConfiguratorStore.getState().getConfiguration();
    setSubmitting(true);
    try {
      const configuration = configSummary.vehicleId
        ? {
            ...configSummary,
            intent: form.type,
            city: form.city,
            appointmentDate,
            appointmentTime,
          }
        : { intent: form.type, city: form.city, appointmentDate, appointmentTime };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          vehicleId,
          dealershipId: selectedDealer.id,
          userLat: userLocation?.lat,
          userLng: userLocation?.lng,
          configuration,
          chatHistory: getChatHistoryForLead(),
          type: form.type === "purchase" ? "purchase" : form.type,
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error ?? "Erreur");
      }
      const leadData = (await res.json()) as { data: { id: string } };
      const slot = new Date(`${appointmentDate}T${appointmentTime}:00`);
      const reservationType = form.type === "test_drive" ? "test_drive" : "visit";
      await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: leadData.data.id,
          vehicleId,
          date: slot.toISOString(),
          type: reservationType,
          notes: `Concession: ${selectedDealer.name}`,
        }),
      });
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      setSubmittedDealer(selectedDealer);
      setStep(4);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur de soumission");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) {
    return <div className="section-container py-20 text-white/40">Chargement…</div>;
  }

  const configSummary = useConfiguratorStore.getState().getConfiguration();

  return (
    <div className="section-container py-8 lg:py-12 pb-28 lg:pb-12">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-2 mb-10 overflow-x-auto">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2 shrink-0">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border",
                i < step
                  ? "bg-toyota-red border-toyota-red text-white"
                  : i === step
                    ? "border-toyota-red text-toyota-red"
                    : "border-white/20 text-toyota-muted"
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={cn("text-xs font-medium hidden sm:block", i === step ? "text-white" : "text-toyota-muted")}>
              {label}
            </span>
            {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-white/20 mx-1" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="s0" {...stepMotion} className="max-w-xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-2">Quel véhicule vous intéresse ?</h1>
            <p className="text-toyota-muted text-sm mb-6">Sélectionnez le modèle Toyota que vous souhaitez acheter ou essayer.</p>
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {VEHICLES_DATA.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVehicleId(v.id)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border text-left transition-all",
                    vehicleId === v.id ? "border-toyota-red bg-toyota-red/10" : "border-white/8 hover:border-white/20"
                  )}
                >
                  <div>
                    <p className="text-white font-semibold">{v.name}</p>
                    <p className="text-toyota-muted text-xs">{v.category}</p>
                  </div>
                  {v.isHybrid && <Badge variant="success">Hybride</Badge>}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-2">
              {(["purchase", "test_drive", "quote"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={cn(
                    "flex-1 py-2 rounded-xl text-xs font-semibold border transition-all",
                    form.type === t ? "border-toyota-red bg-toyota-red/10 text-white" : "border-white/8 text-toyota-muted"
                  )}
                >
                  {t === "purchase" ? "Achat" : t === "test_drive" ? "Essai" : "Devis"}
                </button>
              ))}
            </div>
            <Button
              className="w-full mt-6"
              onClick={() => setStep(profileComplete ? 2 : 1)}
            >
              Continuer
            </Button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="s1" {...stepMotion} className="max-w-xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-white mb-2">Vos coordonnées</h1>

            {profileComplete ? (
              <div className="toyota-card p-5 space-y-2 border-toyota-red/20">
                <p className="text-xs font-bold uppercase tracking-wider text-toyota-red">
                  Profil enregistré
                </p>
                <p className="text-white font-semibold">
                  {form.firstName} {form.lastName}
                </p>
                <p className="text-toyota-muted text-sm">{form.email}</p>
                <p className="text-toyota-muted text-sm">{form.phone}</p>
                {form.city && <p className="text-toyota-muted text-sm">{form.city}</p>}
                <p className="text-toyota-muted/70 text-xs pt-2">
                  Confirmez pour passer à la sélection de concession.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Input placeholder="Prénom" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
                  <Input placeholder="Nom" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
                </div>
                <Input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                <Input type="tel" placeholder="Téléphone (+212…)" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
                <Input placeholder="Ville (optionnel)" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
              </>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(0)}>Retour</Button>
              <Button
                className="flex-1"
                disabled={!form.firstName || !form.lastName || !form.email}
                onClick={() => setStep(2)}
              >
                {profileComplete ? "Confirmer et continuer" : "Trouver une concession"}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="s2" {...stepMotion}>
            <div className="flex flex-col lg:flex-row items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-white">Choisissez votre concession</h1>
                <p className="text-toyota-muted text-sm mt-1">Concessions Toyota au Maroc, triées par proximité.</p>
              </div>
              <Button variant="secondary" size="sm" onClick={requestGeo} disabled={geoLoading}>
                {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                {userLocation ? "Actualiser position" : "Utiliser ma position"}
              </Button>
            </div>
            <div className="grid lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <DealerMap
              dealers={sortedDealers}
              userLocation={userLocation}
              selectedId={selectedDealerId ?? sortedDealers[0]?.id}
              onSelect={(d) => setSelectedDealerId(d.id)}
              flyToUser={!!userLocation}
              height="420px"
            />
              </div>
              <div className="lg:col-span-2 space-y-3 max-h-[420px] overflow-y-auto">
                {sortedDealers.slice(0, 6).map((d, i) => (
                  <DealerCard
                    key={d.id}
                    dealer={d}
                    distanceKm={d.distanceKm}
                    selected={(selectedDealerId ?? sortedDealers[0]?.id) === d.id}
                    recommended={i === 0 && !!userLocation}
                    onSelect={() => setSelectedDealerId(d.id)}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="secondary" onClick={() => setStep(profileComplete ? 0 : 1)}>Retour</Button>
              <Button className="flex-1" disabled={submitting || !selectedDealer} onClick={() => setStep(3)}>
                Choisir un créneau
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="s3" {...stepMotion} className="max-w-xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold text-white">Choisissez votre créneau</h1>
            <p className="text-toyota-muted text-sm">Date et heure souhaitées pour votre {form.type === "test_drive" ? "essai" : "rendez-vous"}.</p>
            <Input type="date" value={appointmentDate} min={minAppointmentDate || undefined} onChange={(e) => setAppointmentDate(e.target.value)} />
            <Input type="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} />
            {configSummary.vehicleId && (
              <div className="toyota-panel p-4 text-sm text-white/70">
                Configuration importée : {configSummary.vehicleName}
                {configSummary.color && ` · ${configSummary.color.name}`}
              </div>
            )}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)}>Retour</Button>
              <Button className="flex-1" disabled={submitting || !appointmentDate} onClick={submit}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmer la demande"}
              </Button>
            </div>
          </motion.div>
        )}

        {step === 4 && submittedDealer && (
          <motion.div key="s4" initial={false} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Demande envoyée !</h1>
            <p className="text-toyota-muted text-sm mb-6">
              Votre demande a été transmise à{" "}
              <span className="text-white font-semibold">{submittedDealer.name}</span>.
              Un conseiller vous contactera sous 24h.
            </p>
            <Button asChild>
              <a href={dealershipGoogleMaps(submittedDealer).directions(userLocation ?? undefined)} target="_blank" rel="noopener noreferrer">
                <MapPin className="h-4 w-4" />
                Voir l&apos;itinéraire
              </a>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
