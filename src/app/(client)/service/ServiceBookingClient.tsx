"use client";

import { useState } from "react";
import Link from "next/link";
import { Wrench, MapPin, Gauge } from "lucide-react";
import { toast } from "sonner";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DEALERSHIPS } from "@/data/dealerships";
import { VEHICLES_DATA } from "@/data/vehicles";
import { getChatHistoryForLead } from "@/lib/chatHistory";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";

const SERVICE_TYPES = [
  { id: "revision", label: "Révision périodique" },
  { id: "vidange", label: "Vidange & filtres" },
  { id: "pneus", label: "Pneus & géométrie" },
  { id: "diagnostic", label: "Diagnostic électronique" },
];

export function ServiceBookingClient() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    vehicleId: VEHICLES_DATA[0]?.id ?? "rav4",
    mileage: "",
    serviceType: SERVICE_TYPES[0].id,
    dealershipId: DEALERSHIPS[0]?.id ?? "",
    date: "",
    time: "09:00",
  });
  const [submitting, setSubmitting] = useState(false);

  const savDealers = DEALERSHIPS.filter((d) => d.services.includes("sav"));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          vehicleId: form.vehicleId,
          dealershipId: form.dealershipId,
          configuration: {
            serviceType: form.serviceType,
            mileage: form.mileage,
            appointmentDate: form.date,
            appointmentTime: form.time,
          },
          chatHistory: getChatHistoryForLead(),
          type: "quote",
        }),
      });
      if (!res.ok) throw new Error("Erreur");
      toast.success("Demande SAV envoyée — un conseiller vous rappelle sous 24h.");
    } catch {
      toast.error("Erreur d'envoi");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="toyota-page pb-28 lg:pb-16">
      <div className="section-container py-10 md:py-14 max-w-2xl">
        <SectionHeading
          title="Service & entretien"
          subtitle="Planifiez votre passage en atelier Toyota — révision, diagnostic et pièces d'origine."
        />

        <form onSubmit={submit} className="mt-10 space-y-4 toyota-panel p-6">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Prénom" value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} className="rounded-md border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white" />
            <input required placeholder="Nom" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} className="rounded-md border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white" />
          </div>
          <input required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white" />
          <input placeholder="Téléphone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white" />

          <select value={form.vehicleId} onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))} className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white">
            {VEHICLES_DATA.map((v) => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>

          <div className="relative">
            <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input placeholder="Kilométrage (ex. 45000)" value={form.mileage} onChange={(e) => setForm((f) => ({ ...f, mileage: e.target.value }))} className="w-full rounded-md border border-white/10 bg-black/40 pl-10 pr-3 py-2.5 text-sm text-white" />
          </div>

          <select value={form.serviceType} onChange={(e) => setForm((f) => ({ ...f, serviceType: e.target.value }))} className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white">
            {SERVICE_TYPES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>

          <select value={form.dealershipId} onChange={(e) => setForm((f) => ({ ...f, dealershipId: e.target.value }))} className="w-full rounded-md border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white">
            {savDealers.map((d) => (
              <option key={d.id} value={d.id}>{d.name} — {d.city}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input required type="date" value={form.date} min={new Date().toISOString().slice(0, 10)} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="rounded-md border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white" />
            <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} className="rounded-md border border-white/10 bg-black/40 px-3 py-2.5 text-sm text-white" />
          </div>

          <BorderDrawButton type="submit" accent="red" disabled={submitting} className="w-full justify-center !normal-case">
            <Wrench className="h-4 w-4" />
            {submitting ? "Envoi…" : "Demander un rendez-vous SAV"}
          </BorderDrawButton>

          <p className="text-[11px] text-white/30 flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            Besoin d&apos;une concession ?{" "}
            <Link href="/concessions" className="text-toyota-red hover:underline">Voir la carte</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
