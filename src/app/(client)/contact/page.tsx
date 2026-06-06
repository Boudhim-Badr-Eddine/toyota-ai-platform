"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Clock, Mail, ChevronLeft, Send, CheckCircle2, ChevronDown } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DEALERSHIPS } from "@/data/dealerships";
import { dealershipGoogleMaps } from "@/lib/geo";
import { getChatHistoryForLead } from "@/lib/chatHistory";
import { VEHICLES_DATA } from "@/data/vehicles";

// ─── Contact form ─────────────────────────────────────────────────────────────

type FormField = "firstName" | "lastName" | "email" | "phone" | "subject" | "message";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleId: string;
  subject: string;
  message: string;
}

const SUBJECTS = [
  "Demande d'information sur un véhicule",
  "Prise de rendez-vous essai",
  "Demande de devis",
  "Service après-vente",
  "Réclamation",
  "Autre",
];

function ContactForm() {
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    vehicleId: VEHICLES_DATA[0]?.id ?? "rav4",
    subject: SUBJECTS[0],
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<FormField, string>>>({});

  function validate(): boolean {
    const e: Partial<Record<FormField, string>> = {};
    if (!form.firstName.trim()) e.firstName = "Prénom requis";
    if (!form.lastName.trim()) e.lastName = "Nom requis";
    if (!form.email.includes("@")) e.email = "Email invalide";
    if (!form.message.trim()) e.message = "Message requis";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
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
          configuration: { subject: form.subject, message: form.message },
          chatHistory: getChatHistoryForLead(),
          type: "quote",
        }),
      });
      if (!res.ok) throw new Error("Erreur");
      setSubmitted(true);
    } catch {
      setErrors({ message: "Erreur d'envoi. Réessayez." });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#111111] border border-white/8 rounded-2xl p-8 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <h3 className="text-white text-xl font-bold mb-2">Message envoyé !</h3>
        <p className="text-toyota-muted text-sm mb-6">
          Notre équipe vous répondra dans les <strong className="text-white">24 heures</strong> ouvrées.
        </p>
        <button
          onClick={() => { setSubmitted(false); setForm({ firstName: "", lastName: "", email: "", phone: "", vehicleId: VEHICLES_DATA[0]?.id ?? "", subject: SUBJECTS[0], message: "" }); }}
          className="px-5 py-2 border border-white/10 text-toyota-muted hover:text-white rounded-xl text-sm font-medium transition-colors"
        >
          Envoyer un autre message
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Name row */}
      <div className="grid grid-cols-2 gap-3">
        {(["firstName", "lastName"] as const).map((field) => (
          <div key={field}>
            <label className="block text-xs font-semibold text-toyota-muted/70 mb-1.5">
              {field === "firstName" ? "Prénom" : "Nom"} <span className="text-toyota-red">*</span>
            </label>
            <input
              type="text"
              value={form[field]}
              onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
              placeholder={field === "firstName" ? "Mohamed" : "Benali"}
              className={cn(
                "w-full bg-white/4 border rounded-xl px-3.5 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-toyota-red/50 transition-colors",
                errors[field] ? "border-red-500/50" : "border-white/10"
              )}
            />
            {errors[field] && <p className="text-red-400 text-[11px] mt-1">{errors[field]}</p>}
          </div>
        ))}
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-toyota-muted/70 mb-1.5">
            Email <span className="text-toyota-red">*</span>
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="exemple@gmail.com"
            className={cn(
              "w-full bg-white/4 border rounded-xl px-3.5 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-toyota-red/50 transition-colors",
              errors.email ? "border-red-500/50" : "border-white/10"
            )}
          />
          {errors.email && <p className="text-red-400 text-[11px] mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-xs font-semibold text-toyota-muted/70 mb-1.5">Téléphone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            placeholder="+212 6XX XXX XXX"
            className="w-full bg-white/4 border border-white/10 rounded-xl px-3.5 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-toyota-red/50 transition-colors"
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="block text-xs font-semibold text-toyota-muted/70 mb-1.5">Modèle (optionnel)</label>
        <select
          value={form.vehicleId}
          onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
          className="w-full appearance-none bg-white/4 border border-white/10 rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none focus:border-toyota-red/50 mb-4"
        >
          {VEHICLES_DATA.map((v) => (
            <option key={v.id} value={v.id} className="bg-[#111111]">{v.name}</option>
          ))}
        </select>
        <label className="block text-xs font-semibold text-toyota-muted/70 mb-1.5">Sujet</label>
        <div className="relative">
          <select
            value={form.subject}
            onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
            className="w-full appearance-none bg-white/4 border border-white/10 rounded-xl px-3.5 py-3 text-white text-sm focus:outline-none focus:border-toyota-red/50 transition-colors cursor-pointer"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s} className="bg-[#111111] text-white">{s}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-toyota-muted/40 pointer-events-none" />
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-xs font-semibold text-toyota-muted/70 mb-1.5">
          Message <span className="text-toyota-red">*</span>
        </label>
        <textarea
          rows={5}
          value={form.message}
          onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          placeholder="Décrivez votre demande..."
          className={cn(
            "w-full bg-white/4 border rounded-xl px-3.5 py-3 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-toyota-red/50 transition-colors resize-none",
            errors.message ? "border-red-500/50" : "border-white/10"
          )}
        />
        {errors.message && <p className="text-red-400 text-[11px] mt-1">{errors.message}</p>}
      </div>

      <motion.button
        type="submit"
        disabled={submitting}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center justify-center gap-2 toyota-btn-primary disabled:opacity-60 !normal-case"
      >
        {submitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Envoi en cours…
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Envoyer le message
          </>
        )}
      </motion.button>
    </form>
  );
}

// ─── Dealership accordion ─────────────────────────────────────────────────────

function DealershipCard({ d, defaultOpen }: { d: (typeof DEALERSHIPS)[0]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const maps = dealershipGoogleMaps(d);
  return (
    <div className="toyota-panel overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/3 transition-colors"
      >
        <div className={cn("w-2 h-2 rounded-full shrink-0", d.type === "succursale" ? "bg-toyota-red" : "bg-white/30")} />
        <span className="flex-1 text-left text-white font-semibold text-sm">{d.city}</span>
        <ChevronDown className={cn("h-4 w-4 text-toyota-muted/40 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-2.5">
              <p className="text-white text-sm font-medium">{d.name}</p>
              <div className="flex items-start gap-2 text-toyota-muted text-xs">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-toyota-muted/50" />
                {d.address}
              </div>
              <div className="flex items-center gap-2 text-toyota-muted text-xs">
                <Phone className="h-3.5 w-3.5 shrink-0 text-toyota-muted/50" />
                {d.phone}
              </div>
              <div className="flex items-center gap-2 text-toyota-muted text-xs">
                <Clock className="h-3.5 w-3.5 shrink-0 text-toyota-muted/50" />
                Lun–Ven {d.hours.mon ?? "8h–18h"}
              </div>
              <a
                href={maps.place}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-toyota-red font-semibold hover:underline underline-offset-2"
              >
                <MapPin className="h-3 w-3" />
                Voir sur la carte →
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  return (
    <div className="toyota-page pb-28 lg:pb-20">
      <div className="section-container py-10 md:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm font-medium mb-10 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Accueil
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-12"
        >
          <SectionHeading
            title="Contactez-nous"
            subtitle="Notre équipe est à votre disposition pour répondre à toutes vos questions sur la gamme Toyota Maroc."
          />
        </motion.div>

        {/* ── Two-column layout ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Left: contact form (3/5) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div className="toyota-panel p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-toyota-red/10 border border-toyota-red/20 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-toyota-red" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base leading-tight">Envoyez-nous un message</h2>
                  <p className="text-toyota-muted/60 text-xs">Réponse garantie sous 24h ouvrées</p>
                </div>
              </div>
              <ContactForm />
            </div>
          </motion.div>

          {/* Right: info + dealerships (2/5) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Contact info */}
            <div className="toyota-panel p-5 space-y-4">
              <h2 className="text-white font-bold text-sm mb-1">Informations générales</h2>
              {[
                { icon: Phone, label: "Téléphone", value: "+212 522 XX XX XX" },
                { icon: Mail, label: "Email", value: "contact@toyota-ma.com" },
                { icon: Clock, label: "Horaires", value: "Lun–Ven 8h–18h · Sam 9h–13h" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/4 border border-white/8 flex items-center justify-center shrink-0">
                    <Icon className="h-3.5 w-3.5 text-toyota-muted/60" />
                  </div>
                  <div>
                    <p className="text-toyota-muted/50 text-[10px] uppercase tracking-wider">{label}</p>
                    <p className="text-white text-xs font-medium">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map placeholder */}
            <div className="rounded-2xl overflow-hidden border border-white/8 bg-[#111111]">
              <iframe
                title="Toyota Maroc Casablanca"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.852!2d-7.6349!3d33.5731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zTG9jYXRpb24!5e0!3m2!1sfr!2sma!4v1000000000000"
                width="100%"
                height="200"
                style={{ border: 0, display: "block", filter: "invert(90%) hue-rotate(180deg)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Dealerships accordion */}
            <div>
              <h2 className="text-white font-bold text-sm mb-3">Nos concessions au Maroc</h2>
              <div className="space-y-2">
                {DEALERSHIPS.slice(0, 8).map((d, i) => (
                  <DealershipCard key={d.id} d={d} defaultOpen={i === 0} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
