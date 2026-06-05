"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Validation ────────────────────────────────────────────────────────────────

const LoginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormValues = z.infer<typeof LoginSchema>;

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
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
      setAuthError("Email ou mot de passe incorrect. Veuillez réessayer.");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-toyota-dark flex items-center justify-center px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-toyota-dark via-toyota-gray/30 to-toyota-dark pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-toyota-red/5 blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="toyota-card rounded-2xl border border-white/5 p-8 shadow-2xl shadow-black/60">

          {/* Logo / wordmark */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-toyota-red font-black text-3xl tracking-tight">TOYOTA</span>
            </div>
            <h1 className="text-white text-xl font-semibold">Administration</h1>
            <p className="text-toyota-muted text-sm mt-1">Connectez-vous à votre espace admin</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Auth error banner */}
            {authError && (
              <div className="bg-toyota-red/10 border border-toyota-red/30 rounded-xl px-4 py-3 text-sm text-red-400 text-center animate-fade-in">
                {authError}
              </div>
            )}

            {/* Email */}
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
                  placeholder="admin@toyota-ma.com"
                  {...register("email")}
                  className={cn(
                    "w-full bg-toyota-gray border rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/20",
                    "focus:outline-none focus:ring-2 focus:ring-toyota-red/50 transition-all",
                    errors.email
                      ? "border-red-500/60 focus:ring-red-500/40"
                      : "border-toyota-border focus:border-toyota-red/50"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
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
                    errors.password
                      ? "border-red-500/60 focus:ring-red-500/40"
                      : "border-toyota-border focus:border-toyota-red/50"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-toyota-muted hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "toyota-btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-full mt-2",
                isSubmitting && "opacity-70 cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Connexion en cours…
                </>
              ) : (
                "Se connecter"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-toyota-muted/40 text-xs mt-6">
          Toyota AI Experience Platform © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
