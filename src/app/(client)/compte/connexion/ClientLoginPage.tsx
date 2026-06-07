"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";

const LoginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

export default function ClientLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/compte";
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  });

  async function onSubmit(values: LoginFormValues) {
    setAuthError(null);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });

    if (result?.error) {
      setAuthError("Email ou mot de passe incorrect.");
      return;
    }

    const session = await getSession();
    if (session?.user?.role === "admin") {
      router.replace("/dashboard");
    } else {
      router.replace(callbackUrl);
    }
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-toyota-dark pt-24 pb-20 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-linear-to-br from-toyota-dark via-toyota-gray/20 to-toyota-dark pointer-events-none" />
      <div className="absolute top-24 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-toyota-red/5 blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-toyota-muted hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>

        <div className="toyota-card rounded-2xl border border-white/5 p-8 shadow-2xl shadow-black/60">
          <div className="text-center mb-8">
            <div className="w-10 h-10 bg-toyota-red rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-black text-sm">T</span>
            </div>
            <h1 className="text-white text-xl font-semibold">Connexion</h1>
            <p className="text-toyota-muted text-sm mt-1">Accédez à votre espace Toyota</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {authError && (
              <div className="bg-toyota-red/10 border border-toyota-red/30 rounded-xl px-4 py-3 text-sm text-red-400 text-center">
                {authError}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-toyota-muted">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-toyota-muted pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                  {...register("email")}
                  className={cn(
                    "w-full bg-toyota-gray border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20",
                    "focus:outline-none focus:ring-2 focus:ring-toyota-red/50 transition-all",
                    errors.email ? "border-red-500/60" : "border-toyota-border"
                  )}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-toyota-muted">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-toyota-muted pointer-events-none" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register("password")}
                  className={cn(
                    "w-full bg-toyota-gray border rounded-xl pl-10 pr-12 py-3 text-sm text-white placeholder:text-white/20",
                    "focus:outline-none focus:ring-2 focus:ring-toyota-red/50 transition-all",
                    errors.password ? "border-red-500/60" : "border-toyota-border"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-toyota-muted hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
            </div>

            <BorderDrawButton
              type="submit"
              accent="red"
              disabled={isSubmitting}
              className="w-full justify-center !py-3 !text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connexion…
                </>
              ) : (
                "Se connecter"
              )}
            </BorderDrawButton>
          </form>

          <p className="text-center text-sm text-toyota-muted mt-6">
            Pas encore de compte ?{" "}
            <Link href="/compte/inscription" className="text-toyota-red font-semibold hover:underline">
              Créer un compte
            </Link>
          </p>

          <p className="text-center text-xs text-toyota-muted/50 mt-4">
            Administrateur ?{" "}
            <Link href="/login" className="text-white/60 hover:text-white underline">
              Connexion admin
            </Link>
          </p>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-toyota-muted space-y-1">
            <p className="font-semibold text-white/80">Compte démo client</p>
            <p>client@toyota-ma.com / Client@2024!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
