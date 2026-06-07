"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Loader2,
  ArrowLeft,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const RegisterSchema = z
  .object({
    firstName: z.string().min(2, "Prénom requis").max(50),
    lastName: z.string().min(2, "Nom requis").max(50),
    email: z.string().email("Email invalide"),
    phone: z.string().regex(/^[+\d\s\-()]{7,20}$/, "Téléphone invalide"),
    city: z.string().min(2, "Ville requise").max(80),
    address: z.string().max(200).optional().or(z.literal("")),
    password: z.string().min(8, "Minimum 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof RegisterSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
  });

  async function onSubmit(values: RegisterValues) {
    setServerError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        city: values.city,
        address: values.address,
        password: values.password,
      }),
    });

    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setServerError(data.error ?? "Erreur lors de l'inscription");
      return;
    }

    const signInResult = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (signInResult?.error) {
      router.push("/compte/connexion");
      return;
    }

    router.replace("/compte");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-toyota-dark pt-24 pb-20 px-4">
      <div className="section-container max-w-lg mx-auto">
        <Link
          href="/compte/connexion"
          className="inline-flex items-center gap-1.5 text-toyota-muted hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Link>

        <div className="toyota-card rounded-2xl border border-white/5 p-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Créer votre compte</h1>
            <p className="text-toyota-muted text-sm mt-2 leading-relaxed">
              Renseignez vos informations une seule fois. Lors d&apos;un achat ou d&apos;un essai,
              vous n&apos;aurez qu&apos;à confirmer — sans remplir le formulaire à nouveau.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {serverError && (
              <div className="bg-toyota-red/10 border border-toyota-red/30 rounded-xl px-4 py-3 text-sm text-red-400">
                {serverError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Prénom" icon={<User className="h-4 w-4" />} error={errors.firstName?.message}>
                <input {...register("firstName")} placeholder="Karim" className={inputCls(!!errors.firstName)} />
              </Field>
              <Field label="Nom" icon={<User className="h-4 w-4" />} error={errors.lastName?.message}>
                <input {...register("lastName")} placeholder="Benali" className={inputCls(!!errors.lastName)} />
              </Field>
            </div>

            <Field label="Email" icon={<Mail className="h-4 w-4" />} error={errors.email?.message}>
              <input {...register("email")} type="email" placeholder="vous@exemple.com" className={inputCls(!!errors.email)} />
            </Field>

            <Field label="Téléphone" icon={<Phone className="h-4 w-4" />} error={errors.phone?.message}>
              <input {...register("phone")} type="tel" placeholder="+212 6XX XXX XXX" className={inputCls(!!errors.phone)} />
            </Field>

            <Field label="Ville" icon={<MapPin className="h-4 w-4" />} error={errors.city?.message}>
              <input {...register("city")} placeholder="Casablanca" className={inputCls(!!errors.city)} />
            </Field>

            <Field label="Adresse (optionnel)" icon={<Home className="h-4 w-4" />} error={errors.address?.message}>
              <input {...register("address")} placeholder="123, Bd Mohammed V" className={inputCls(!!errors.address)} />
            </Field>

            <Field label="Mot de passe" icon={<Lock className="h-4 w-4" />} error={errors.password?.message}>
              <input {...register("password")} type="password" placeholder="••••••••" className={inputCls(!!errors.password)} />
            </Field>

            <Field label="Confirmer le mot de passe" icon={<Lock className="h-4 w-4" />} error={errors.confirmPassword?.message}>
              <input {...register("confirmPassword")} type="password" placeholder="••••••••" className={inputCls(!!errors.confirmPassword)} />
            </Field>

            <BorderDrawButton
              type="submit"
              accent="red"
              disabled={isSubmitting}
              className="w-full justify-center !py-3.5 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Création…
                </>
              ) : (
                "Créer mon compte"
              )}
            </BorderDrawButton>
          </form>

          <p className="text-center text-sm text-toyota-muted mt-6">
            Déjà inscrit ?{" "}
            <Link href="/compte/connexion" className="text-toyota-red font-semibold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
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
      <label className="flex items-center gap-1.5 text-xs font-semibold text-toyota-muted uppercase tracking-wider mb-1.5">
        <span className="text-toyota-muted/50">{icon}</span>
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return cn(
    "w-full bg-toyota-gray border rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-toyota-red/40 transition-all",
    hasError ? "border-red-500/60" : "border-toyota-border"
  );
}
