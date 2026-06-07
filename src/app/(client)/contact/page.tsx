"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  Clock,
  Mail,
  ChevronLeft,
  Send,
  CheckCircle2,
  ChevronDown,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { PremiumHeroDecor } from "@/components/ui/PremiumHeroDecor";
import { PageSectionReveal } from "@/components/ui/PageSectionReveal";
import { DEALERSHIPS } from "@/data/dealerships";
import { dealershipGoogleMaps } from "@/lib/geo";
import { getChatHistoryForLead } from "@/lib/chatHistory";
import { VEHICLES_DATA } from "@/data/vehicles";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";

const TOYOTA_RED = "#EB0A1E";
const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;

const fieldVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.15 + i * 0.07, duration: 0.55, ease: EASE_PREMIUM },
  }),
};

const PEXELS = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=640`;

const CONTACT_INFO = [
  {
    icon: Phone,
    label: "Téléphone",
    value: "+212 522 XX XX XX",
    href: "tel:+212522000000",
    image: PEXELS(6078125),
    imageAlt: "Smartphone — contact téléphonique Toyota",
    span: "half" as const,
  },
  {
    icon: Mail,
    label: "Email",
    value: "contact@toyota-ma.com",
    href: "mailto:contact@toyota-ma.com",
    image: PEXELS(7693705),
    imageAlt: "Envoi d'un e-mail sur ordinateur portable",
    span: "half" as const,
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: "Boulevard Zerktouni, Casablanca 20000",
    href: "https://maps.google.com/?q=Casablanca+Morocco",
    image: PEXELS(9146740),
    imageAlt: "Casablanca, Maroc — skyline et architecture locale",
    span: "full" as const,
  },
  {
    icon: Clock,
    label: "Horaires",
    value: "Lun–Ven 8h–18h · Sam 9h–13h",
    image: PEXELS(5835359),
    imageAlt: "Horloge murale symbolisant les heures d'ouverture",
    span: "full" as const,
  },
] as const;

// ─── Floating field ───────────────────────────────────────────────────────────

interface FloatingFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  index: number;
  value: string;
  multiline?: boolean;
  children: (handlers: {
    id: string;
    onFocus: () => void;
    onBlur: () => void;
    className: string;
  }) => React.ReactNode;
}

function FloatingField({
  id,
  label,
  required,
  error,
  index,
  value,
  multiline,
  children,
}: FloatingFieldProps) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0 || multiline;

  return (
    <motion.div
      custom={index}
      variants={fieldVariants}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      <div
        className={cn(
          "relative rounded-xl bg-[#0a0a0a] border overflow-hidden transition-[border-color,box-shadow] duration-300",
          error
            ? "border-red-500/50"
            : focused
              ? "border-[#EB0A1E]/70"
              : "border-white/[0.08]"
        )}
      >
        <AnimatePresence>
          {focused && (
            <motion.span
              className="absolute inset-0 rounded-xl border-2 border-[#EB0A1E] pointer-events-none z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.35, 0.85, 0.35] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </AnimatePresence>

        <label
          htmlFor={id}
          className={cn(
            "absolute left-4 z-20 transition-all duration-200 pointer-events-none font-semibold",
            floated
              ? "top-2.5 text-[10px] uppercase tracking-[0.12em] text-white/45"
              : cn(
                  "text-sm text-white/35",
                  multiline ? "top-4" : "top-1/2 -translate-y-1/2"
                )
          )}
        >
          {label}
          {required && <span className="text-[#EB0A1E] ml-0.5">*</span>}
        </label>

        {children({
          id,
          onFocus: () => setFocused(true),
          onBlur: () => setFocused(false),
          className: cn(
            "relative z-[1] w-full bg-transparent text-white text-sm focus:outline-none",
            multiline ? "pt-9 pb-3 px-4 resize-none" : "pt-7 pb-3 px-4"
          ),
        })}
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-[11px] mt-1.5 pl-1"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}

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
        transition={{ duration: 0.5, ease: EASE_PREMIUM }}
        className="bg-[#111111] border border-white/[0.08] rounded-2xl p-10 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </div>
        <h3 className="text-white text-xl font-black mb-2">Message envoyé !</h3>
        <p className="text-white/45 text-sm mb-8 max-w-sm mx-auto">
          Notre équipe vous répondra dans les{" "}
          <strong className="text-white">24 heures</strong> ouvrées.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setForm({
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              vehicleId: VEHICLES_DATA[0]?.id ?? "",
              subject: SUBJECTS[0],
              message: "",
            });
          }}
          className="px-6 py-2.5 border border-white/15 text-white/60 hover:text-white hover:border-white/30 rounded-full text-sm font-semibold transition-colors"
        >
          Envoyer un autre message
        </button>
      </motion.div>
    );
  }

  let fieldIndex = 0;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(["firstName", "lastName"] as const).map((field) => {
          const idx = fieldIndex++;
          return (
            <FloatingField
              key={field}
              id={field}
              label={field === "firstName" ? "Prénom" : "Nom"}
              required
              error={errors[field]}
              index={idx}
              value={form[field]}
            >
              {(handlers) => (
                <input
                  {...handlers}
                  type="text"
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                />
              )}
            </FloatingField>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FloatingField
          id="email"
          label="Email"
          required
          error={errors.email}
          index={fieldIndex++}
          value={form.email}
        >
          {(handlers) => (
            <input
              {...handlers}
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          )}
        </FloatingField>

        <FloatingField
          id="phone"
          label="Téléphone"
          index={fieldIndex++}
          value={form.phone}
        >
          {(handlers) => (
            <input
              {...handlers}
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          )}
        </FloatingField>
      </div>

      <FloatingField
        id="vehicleId"
        label="Modèle (optionnel)"
        index={fieldIndex++}
        value={form.vehicleId}
      >
        {(handlers) => (
          <div className="relative">
            <select
              {...handlers}
              value={form.vehicleId}
              onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
              className={cn(handlers.className, "appearance-none cursor-pointer pr-10")}
            >
              {VEHICLES_DATA.map((v) => (
                <option key={v.id} value={v.id} className="bg-[#111111]">
                  {v.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none z-[2]" />
          </div>
        )}
      </FloatingField>

      <FloatingField
        id="subject"
        label="Sujet"
        index={fieldIndex++}
        value={form.subject}
      >
        {(handlers) => (
          <div className="relative">
            <select
              {...handlers}
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              className={cn(handlers.className, "appearance-none cursor-pointer pr-10")}
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s} className="bg-[#111111] text-white">
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none z-[2]" />
          </div>
        )}
      </FloatingField>

      <FloatingField
        id="message"
        label="Message"
        required
        error={errors.message}
        index={fieldIndex++}
        value={form.message}
        multiline
      >
        {(handlers) => (
          <textarea
            {...handlers}
            rows={5}
            value={form.message}
            onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
          />
        )}
      </FloatingField>

      <motion.div custom={fieldIndex} variants={fieldVariants} initial="hidden" animate="visible" className="mt-2">
        <BorderDrawButton type="submit" accent="red" disabled={submitting} className="w-full">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi en cours…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Envoyer le message
            </>
          )}
        </BorderDrawButton>
      </motion.div>
    </form>
  );
}

// ─── Dealership accordion ─────────────────────────────────────────────────────

function DealershipCard({ d, defaultOpen }: { d: (typeof DEALERSHIPS)[0]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  const maps = dealershipGoogleMaps(d);
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.03] transition-colors"
      >
        <div
          className={cn(
            "w-2 h-2 rounded-full shrink-0",
            d.type === "succursale" ? "bg-[#EB0A1E]" : "bg-white/30"
          )}
        />
        <span className="flex-1 text-left text-white font-semibold text-sm">{d.city}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-white/30 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
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
            <div className="px-4 pb-4 border-t border-white/[0.05] pt-3 space-y-2.5">
              <p className="text-white text-sm font-medium">{d.name}</p>
              <div className="flex items-start gap-2 text-white/45 text-xs">
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-white/25" />
                {d.address}
              </div>
              <div className="flex items-center gap-2 text-white/45 text-xs">
                <Phone className="h-3.5 w-3.5 shrink-0 text-white/25" />
                {d.phone}
              </div>
              <div className="flex items-center gap-2 text-white/45 text-xs">
                <Clock className="h-3.5 w-3.5 shrink-0 text-white/25" />
                Lun–Ven {d.hours.mon ?? "8h–18h"}
              </div>
              <a
                href={maps.place}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#EB0A1E] font-semibold hover:underline underline-offset-2"
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

// ─── Contact info card ────────────────────────────────────────────────────────

function ContactInfoCard({
  icon: Icon,
  label,
  value,
  href,
  image,
  imageAlt,
  span,
  index,
}: {
  icon: typeof Phone;
  label: string;
  value: string;
  image: string;
  imageAlt: string;
  span: "half" | "full";
  href?: string;
  index: number;
}) {
  const content = (
    <motion.div
      custom={index}
      variants={fieldVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3 }}
      className={cn(
        "group relative overflow-hidden rounded-none border border-white/[0.08] bg-[#111111] transition-[border-color] duration-300 hover:border-white/20",
        span === "full" ? "col-span-2" : "col-span-1"
      )}
    >
      <div className={cn("relative overflow-hidden", span === "full" ? "h-36" : "h-28")}>
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes={span === "full" ? "320px" : "160px"}
          loading="lazy"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/55 to-[#111111]/10" />
        <div className="absolute top-3 left-3 w-9 h-9 rounded-none bg-black/55 backdrop-blur-md border border-white/10 flex items-center justify-center transition-colors">
          <Icon className="h-4 w-4 text-white/50" />
        </div>
      </div>

      <div className="p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40 group-hover:text-[#EB0A1E]/90 mb-1 transition-colors">
          {label}
        </p>
        <p
          className={cn(
            "text-white font-semibold leading-snug",
            span === "full" ? "text-sm" : "text-xs"
          )}
        >
          {value}
        </p>
      </div>
    </motion.div>
  );

  if (href) {
    return (
      <a
        href={href}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel="noopener noreferrer"
        className="block"
      >
        {content}
      </a>
    );
  }

  return content;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  return (
    <div className="toyota-page pb-28 lg:pb-20">
      {/* ── Dark hero ─────────────────────────────────────────────────────── */}
      <section className="relative w-full overflow-hidden bg-[#050505] border-b border-white/[0.06]">
        <PremiumHeroDecor variant="contact" />

        <div className="section-container relative z-10 py-14 md:py-20 lg:py-24">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm font-medium mb-10 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Accueil
          </Link>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_PREMIUM }}
            className="text-[#EB0A1E] text-[10px] font-bold uppercase tracking-[0.45em] mb-4"
          >
            Toyota Maroc
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, delay: 0.06, ease: EASE_PREMIUM }}
            className="text-[clamp(3rem,10vw,6.5rem)] font-black text-white leading-[0.9] tracking-[-0.04em] mb-6"
          >
            Contactez
            <br />
            <span
              style={{ WebkitTextStroke: `2px ${TOYOTA_RED}`, color: "transparent" }}
            >
              -Nous
            </span>
          </motion.h1>

          <motion.span
            className="block h-[3px] bg-[#EB0A1E] mb-6 max-w-[120px]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE_PREMIUM }}
            style={{ transformOrigin: "left" }}
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.28, ease: EASE_PREMIUM }}
            className="text-white/45 text-base md:text-lg max-w-xl leading-relaxed"
          >
            Notre équipe est à votre disposition pour répondre à toutes vos questions sur la
            gamme Toyota Maroc.
          </motion.p>
        </div>
      </section>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="section-container py-12 md:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* Left: contact info cards */}
          <PageSectionReveal direction="left" className="lg:col-span-3">
            <div className="rounded-none border border-white/[0.08] bg-[#0a0a0a] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.04] to-transparent">
                <h2 className="text-white font-black text-lg tracking-tight">
                  Nos coordonnées
                </h2>
                <p className="text-white/40 text-xs mt-1">
                  Service client Toyota Maroc — réponse sous 24h
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 p-3">
                {CONTACT_INFO.map((item, i) => (
                  <ContactInfoCard
                    key={item.label}
                    icon={item.icon}
                    label={item.label}
                    value={item.value}
                    image={item.image}
                    imageAlt={item.imageAlt}
                    span={item.span}
                    href={"href" in item ? item.href : undefined}
                    index={i}
                  />
                ))}
              </div>
            </div>
          </PageSectionReveal>

          {/* Center: form */}
          <PageSectionReveal delay={0.08} className="lg:col-span-5">
            <div className="rounded-none border border-white/[0.08] bg-[#111111] p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-none bg-white/[0.04] border border-white/10 flex items-center justify-center">
                  <Mail className="h-4 w-4 text-white/50" />
                </div>
                <div>
                  <h2 className="text-white font-black text-base leading-tight">
                    Envoyez-nous un message
                  </h2>
                  <p className="text-white/40 text-xs mt-0.5">Réponse garantie sous 24h ouvrées</p>
                </div>
              </div>
              <ContactForm />
            </div>
          </PageSectionReveal>

          {/* Right: map + dealerships */}
          <PageSectionReveal direction="right" delay={0.12} className="lg:col-span-4 space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0a0a0a] group">
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10 pointer-events-none opacity-60" />
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10">
                <MapPin className="h-3.5 w-3.5 text-[#EB0A1E]" />
                <span className="text-white text-xs font-semibold">Casablanca, Maroc</span>
              </div>
              <iframe
                title="Toyota Maroc Casablanca"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3323.852!2d-7.6349!3d33.5731!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zTG9jYXRpb24!5e0!3m2!1sfr!2sma!4v1000000000000"
                width="100%"
                height="280"
                style={{ border: 0, display: "block", filter: "invert(92%) hue-rotate(180deg) saturate(0.8)" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              />
            </div>

            <div>
              <h2 className="text-white font-black text-sm mb-3 tracking-tight">
                Nos concessions au Maroc
              </h2>
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                {DEALERSHIPS.slice(0, 8).map((d, i) => (
                  <DealershipCard key={d.id} d={d} defaultOpen={i === 0} />
                ))}
              </div>
            </div>
          </PageSectionReveal>
        </div>
      </div>
    </div>
  );
}
