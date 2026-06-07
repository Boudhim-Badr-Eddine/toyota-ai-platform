"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import {
  User,
  Mail,
  Phone,
  Car,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useConfiguratorStore } from "@/store/configuratorStore";
import { useProfile } from "@/hooks/useProfile";
import { formatPrice, cn } from "@/lib/utils";
import { getChatHistoryForLead } from "@/lib/chatHistory";
import type { VehicleColor, VehicleWheel, VehicleInterior } from "@/types";

// ─── Zod schema ────────────────────────────────────────────────────────────────

const formSchema = z
  .object({
    firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères").max(50),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(50),
    email: z.string().email("Adresse email invalide"),
    phone: z
      .string()
      .regex(/^[+\d\s\-()]{7,20}$/, "Numéro de téléphone invalide")
      .optional()
      .or(z.literal("")),
    type: z.enum(["test_drive", "quote"]),
    date: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "test_drive") {
        if (!data.date) return false;
        // Date must be in the future
        const selected = new Date(data.date);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        return selected >= tomorrow;
      }
      return true;
    },
    {
      message: "Veuillez choisir une date à partir de demain",
      path: ["date"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** ISO date string for tomorrow (min date for date picker) */
function tomorrowDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

/** ISO date string 3 months from now (max date) */
function maxDateString(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 3);
  return d.toISOString().split("T")[0];
}

function launchConfetti() {
  const end = Date.now() + 1600;
  const colors = ["#EB0A1E", "#ffffff", "#C9A84C"];
  (function frame() {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

// ─── LeadFormContent ───────────────────────────────────────────────────────────
// The pure form — used both inline and inside the Dialog

interface LeadFormContentProps {
  /** Override vehicle id (defaults to configuratorStore's selected vehicle) */
  vehicleId?: string;
  vehicleName?: string;
  selectedColor?: VehicleColor | null;
  selectedWheels?: VehicleWheel | null;
  selectedInterior?: VehicleInterior | null;
  totalPrice?: number;
  onSuccess?: () => void;
  /** Show vehicle summary header */
  showSummary?: boolean;
}

export function LeadFormContent({
  vehicleId: vehicleIdProp,
  vehicleName: vehicleNameProp,
  selectedColor: colorProp,
  selectedWheels: wheelsProp,
  selectedInterior: interiorProp,
  totalPrice: totalPriceProp,
  onSuccess,
  showSummary = false,
}: LeadFormContentProps) {
  const store = useConfiguratorStore();
  const { isCustomer, profile } = useProfile();

  // Resolve from props or store
  const vehicleId = vehicleIdProp ?? store.selectedVehicle?.id ?? "";
  const vehicleName = vehicleNameProp ?? store.selectedVehicle?.name ?? "Véhicule";
  const selectedColor = colorProp !== undefined ? colorProp : store.selectedColor;
  const selectedWheels = wheelsProp !== undefined ? wheelsProp : store.selectedWheels;
  const selectedInterior = interiorProp !== undefined ? interiorProp : store.selectedInterior;
  const totalPrice = totalPriceProp !== undefined ? totalPriceProp : store.totalPrice;

  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "test_drive",
      firstName: profile?.firstName ?? "",
      lastName: profile?.lastName ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
    },
  });

  const watchType = watch("type");

  useEffect(() => {
    if (profile) {
      reset((prev) => ({
        ...prev,
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
      }));
    }
  }, [profile, reset]);

  const onSubmit = async (formValues: FormValues) => {
    setSubmitStatus("loading");
    setErrorMessage("");

    const values = isCustomer && profile
      ? {
          ...formValues,
          firstName: formValues.firstName || profile.firstName,
          lastName: formValues.lastName || profile.lastName,
          email: formValues.email || profile.email,
          phone: formValues.phone || profile.phone,
        }
      : formValues;

    try {
      const configuration = {
        vehicleId,
        selectedColor: selectedColor ?? null,
        selectedWheel: selectedWheels ?? null,
        selectedInterior: selectedInterior ?? null,
      };

      // 1. Create lead
      const leadRes = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone ?? "",
          vehicleId,
          configuration,
          chatHistory: getChatHistoryForLead(),
          type: values.type,
        }),
      });

      if (!leadRes.ok) {
        const data = (await leadRes.json()) as { error?: string };
        throw new Error(data.error ?? "Erreur lors de la soumission");
      }

      const { data: lead } = (await leadRes.json()) as { data: { id: string } };
      if (!lead?.id) throw new Error("Réponse serveur invalide");

      // 2. Create reservation if test drive + date provided
      if (values.type === "test_drive" && values.date) {
        const slot = new Date(`${values.date}T10:00:00`);
        if (slot.getTime() <= Date.now() + 5 * 60 * 1000) {
          throw new Error("Choisissez une date dans le futur");
        }
        const reservationRes = await fetch("/api/reservations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId: lead.id,
            vehicleId,
            date: slot.toISOString(),
            type: "test_drive",
          }),
        });

        if (!reservationRes.ok) {
          const data = (await reservationRes.json().catch(() => ({}))) as { error?: string };
          throw new Error(data.error ?? "Impossible de confirmer le rendez-vous");
        }
      }

      // Success
      launchConfetti();
      toast.success("✅ Votre essai a été réservé avec succès !", {
        description: "Notre équipe vous contactera sous 24h.",
        duration: 5000,
      });
      setSubmitStatus("success");
      reset();
      onSuccess?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue";
      setErrorMessage(msg);
      toast.error("❌ Erreur de connexion", { description: msg, duration: 5000 });
      setSubmitStatus("error");
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitStatus === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center text-center py-10 px-4"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 250, damping: 18, delay: 0.1 }}
          className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/25 flex items-center justify-center mb-4"
        >
          <CheckCircle2 className="h-8 w-8 text-green-400" />
        </motion.div>
        <h3 className="text-white font-bold text-xl mb-2">Demande envoyée !</h3>
        <p className="text-toyota-muted text-sm leading-relaxed max-w-xs">
          Merci pour votre intérêt pour le{" "}
          <span className="text-white font-semibold">{vehicleName}</span>. Un conseiller Toyota
          vous contactera dans les{" "}
          <span className="text-toyota-red font-semibold">24 heures</span>.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* ── Vehicle summary header ──────────────────────────────────────────── */}
      {showSummary && vehicleId && (
        <div className="bg-white/3 border border-white/8 rounded-xl p-3.5 flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-lg bg-toyota-red/10 border border-toyota-red/20 flex items-center justify-center shrink-0">
            <Car className="h-4 w-4 text-toyota-red" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">{vehicleName}</p>
            <div className="flex items-center gap-2 flex-wrap mt-0.5">
              {selectedColor && (
                <span className="flex items-center gap-1 text-[10px] text-toyota-muted/70">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/15"
                    style={{ backgroundColor: selectedColor.hex }}
                  />
                  {selectedColor.name}
                </span>
              )}
              {selectedWheels && (
                <span className="text-[10px] text-toyota-muted/70">{selectedWheels.name}</span>
              )}
            </div>
          </div>
          {totalPrice > 0 && (
            <p className="text-toyota-gold font-bold text-sm shrink-0">{formatPrice(totalPrice)}</p>
          )}
        </div>
      )}

      {/* ── Type selector ────────────────────────────────────────────────────── */}
      <div>
        <label className="block text-xs font-semibold text-toyota-muted/70 uppercase tracking-wider mb-2">
          Type de demande
        </label>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              { value: "test_drive", label: "Essai routier", icon: "🚗" },
              { value: "quote", label: "Demande de devis", icon: "📋" },
            ] as const
          ).map(({ value, label, icon }) => (
            <label
              key={value}
              className={cn(
                "flex items-center gap-2.5 px-3 py-3 rounded-xl border cursor-pointer transition-all",
                watchType === value
                  ? "border-toyota-red/50 bg-toyota-red/8 text-white"
                  : "border-white/8 bg-white/3 text-toyota-muted hover:border-white/20"
              )}
            >
              <input type="radio" value={value} {...register("type")} className="sr-only" />
              <span className="text-base">{icon}</span>
              <span className="text-sm font-medium">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Logged-in profile summary ──────────────────────────────────────── */}
      {isCustomer && profile && (
        <div className="bg-toyota-red/5 border border-toyota-red/20 rounded-xl p-4 space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-toyota-red">
            Vos informations enregistrées
          </p>
          <p className="text-white text-sm font-semibold">
            {profile.firstName} {profile.lastName}
          </p>
          <p className="text-toyota-muted text-xs">
            {profile.email} · {profile.phone}
          </p>
          <p className="text-toyota-muted/70 text-[11px]">
            Confirmez simplement — pas besoin de remplir à nouveau.
          </p>
        </div>
      )}

      {/* ── Name row ─────────────────────────────────────────────────────────── */}
      {!isCustomer && (
      <div className="grid grid-cols-2 gap-3">
        <FormField
          label="Prénom"
          icon={<User className="h-4 w-4" />}
          error={errors.firstName?.message}
        >
          <input
            {...register("firstName")}
            placeholder="Mohammed"
            className={inputClass(!!errors.firstName)}
          />
        </FormField>
        <FormField
          label="Nom"
          icon={<User className="h-4 w-4" />}
          error={errors.lastName?.message}
        >
          <input
            {...register("lastName")}
            placeholder="El Idrissi"
            className={inputClass(!!errors.lastName)}
          />
        </FormField>
      </div>
      )}

      {!isCustomer && (
      <>
      {/* ── Email ────────────────────────────────────────────────────────────── */}
      <FormField label="Email" icon={<Mail className="h-4 w-4" />} error={errors.email?.message}>
        <input
          {...register("email")}
          type="email"
          placeholder="vous@exemple.com"
          className={inputClass(!!errors.email)}
        />
      </FormField>

      {/* ── Phone ────────────────────────────────────────────────────────────── */}
      <FormField
        label="Téléphone (optionnel)"
        icon={<Phone className="h-4 w-4" />}
        error={errors.phone?.message}
      >
        <input
          {...register("phone")}
          type="tel"
          placeholder="+212 6XX XXX XXX"
          className={inputClass(!!errors.phone)}
        />
      </FormField>
      </>
      )}

      {/* ── Date (only when test_drive) ───────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {watchType === "test_drive" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <FormField
              label="Date d'essai souhaitée"
              icon={<Calendar className="h-4 w-4" />}
              error={errors.date?.message}
            >
              <input
                {...register("date")}
                type="date"
                min={tomorrowDateString()}
                max={maxDateString()}
                className={cn(inputClass(!!errors.date), "cursor-pointer")}
              />
            </FormField>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error banner ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {submitStatus === "error" && errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/25 rounded-xl px-3.5 py-3"
          >
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Submit ───────────────────────────────────────────────────────────── */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={submitStatus === "loading"}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-toyota-red hover:bg-toyota-red/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg shadow-toyota-red/20"
      >
        {submitStatus === "loading" ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Envoi en cours…
          </>
        ) : watchType === "test_drive" ? (
          <>
            <Calendar className="h-4 w-4" />
            {isCustomer ? "Confirmer l'essai" : "Réserver un essai"}
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            {isCustomer ? "Confirmer la demande" : "Envoyer la demande"}
          </>
        )}
      </motion.button>

      <p className="text-toyota-muted/40 text-[11px] text-center">
        Vos données sont protégées et ne seront jamais partagées.
      </p>
    </form>
  );
}

// ─── Helper: FormField wrapper ─────────────────────────────────────────────────

function FormField({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-toyota-muted/70 uppercase tracking-wider mb-1.5">
        <span className="text-toyota-muted/40">{icon}</span>
        {label}
      </label>
      <div className="relative">{children}</div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-red-400 text-xs mt-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    "w-full bg-white/4 border text-white text-sm placeholder:text-toyota-muted/30 rounded-xl px-3.5 py-2.5 focus:outline-none transition-colors",
    hasError
      ? "border-red-500/40 focus:border-red-500/60"
      : "border-white/8 focus:border-toyota-red/40"
  );
}

// ─── LeadFormDialog ────────────────────────────────────────────────────────────
// Wraps LeadFormContent in a Radix Dialog

interface LeadFormDialogProps extends LeadFormContentProps {
  /** The trigger element (Button, Link, etc.) */
  trigger: React.ReactNode;
  title?: string;
}

export function LeadFormDialog({
  trigger,
  title = "Réserver / Demande de devis",
  ...formProps
}: LeadFormDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    formProps.onSuccess?.();
    // Auto-close dialog after 3 seconds
    setTimeout(() => setOpen(false), 3000);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
        </Dialog.Overlay>

        {/* Panel */}
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-x-0 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-50 w-full sm:w-[480px] max-h-[92vh] overflow-y-auto bg-[#0E0E0E] border border-white/8 rounded-t-2xl sm:rounded-2xl shadow-2xl"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#0E0E0E]/95 backdrop-blur-sm border-b border-white/5 flex items-center justify-between px-5 py-4 z-10">
              <div>
                <Dialog.Title className="text-white font-bold text-base leading-tight">
                  {title}
                </Dialog.Title>
                <Dialog.Description className="text-toyota-muted/60 text-xs mt-0.5">
                  Un conseiller vous contacte sous 24h
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  aria-label="Fermer"
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-toyota-muted hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* Form */}
            <div className="px-5 py-5">
              <LeadFormContent {...formProps} showSummary onSuccess={handleSuccess} />
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
