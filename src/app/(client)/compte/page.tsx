"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  User,
  LogOut,
  ShoppingBag,
  Settings2,
  Shield,
  FileText,
  Bookmark,
  Loader2,
  Save,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/admin/DataTable";

interface CustomerLead {
  id: string;
  type: string;
  status: string;
  createdAt: string;
  vehicle: { id: string; name: string; slug: string };
  dealership: { city: string } | null;
}

interface SavedConfig {
  id: string;
  name: string;
  createdAt: string;
  vehicleId: string;
  configuration: Record<string, unknown>;
  vehicle: { id: string; name: string; slug: string };
}

export default function AccountPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [leads, setLeads] = useState<CustomerLead[]>([]);
  const [configs, setConfigs] = useState<SavedConfig[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    city: "",
    address: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/compte/connexion?callbackUrl=/compte");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && session.user.role === "customer") {
      setForm({
        firstName: session.user.firstName ?? "",
        lastName: session.user.lastName ?? "",
        phone: session.user.phone ?? "",
        city: session.user.city ?? "",
        address: session.user.address ?? "",
      });
    }
  }, [session]);

  const fetchLeads = useCallback(async () => {
    setLoadingLeads(true);
    try {
      const res = await fetch("/api/my-leads");
      if (res.ok) {
        const json = (await res.json()) as { data: CustomerLead[] };
        setLeads(json.data);
      }
    } finally {
      setLoadingLeads(false);
    }
  }, []);

  const fetchConfigs = useCallback(async () => {
    setLoadingConfigs(true);
    try {
      const res = await fetch("/api/saved-configurations");
      if (res.ok) {
        const json = (await res.json()) as { data: SavedConfig[] };
        setConfigs(json.data);
      }
    } finally {
      setLoadingConfigs(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "customer") {
      fetchLeads();
      fetchConfigs();
    }
  }, [status, session, fetchLeads, fetchConfigs]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    setProfileError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = (await res.json()) as { error?: string; data?: typeof form };
      if (!res.ok) throw new Error(json.error ?? "Erreur de sauvegarde");

      await update({
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || null,
        city: form.city || null,
        address: form.address || null,
        name: `${form.firstName} ${form.lastName}`,
      });
      setProfileMsg("Profil mis à jour avec succès.");
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSavingProfile(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-toyota-dark pt-24 pb-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-toyota-red border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session?.user) return null;

  const user = session.user;
  const isAdmin = user.role === "admin";

  return (
    <div className="min-h-screen bg-toyota-dark pt-24 pb-20">
      <div className="section-container max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Mon compte</h1>
          <p className="text-toyota-muted mt-2">
            Gérez votre profil, consultez vos demandes et configurations sauvegardées.
          </p>
        </div>

        <div className="toyota-card rounded-2xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-toyota-red/10 border border-toyota-red/20 flex items-center justify-center">
              <User className="h-7 w-7 text-toyota-red" />
            </div>
            <div>
              <p className="text-white font-bold text-lg">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.name}
              </p>
              <p className="text-toyota-muted text-sm">{user.email}</p>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold uppercase tracking-wider text-toyota-gold bg-toyota-gold/10 px-2 py-0.5 rounded">
                  <Shield className="h-3 w-3" />
                  Administrateur
                </span>
              )}
            </div>
          </div>

          {isAdmin ? (
            <div className="p-6 border-t border-white/5 flex flex-wrap gap-3">
              <Link href="/dashboard" className="toyota-btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-5">
                <Shield className="h-4 w-4" />
                Espace Admin
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="inline-flex items-center gap-2 text-sm py-2.5 px-5 rounded-xl border border-white/10 text-toyota-muted hover:text-white ml-auto"
              >
                <LogOut className="h-4 w-4" />
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="p-6">
              <Tabs defaultValue="profile">
                <TabsList className="w-full flex-wrap h-auto gap-1">
                  <TabsTrigger value="profile" className="flex-1 min-w-[100px]">
                    Profil
                  </TabsTrigger>
                  <TabsTrigger value="leads" className="flex-1 min-w-[100px]">
                    Mes demandes
                  </TabsTrigger>
                  <TabsTrigger value="configs" className="flex-1 min-w-[100px]">
                    Configurations
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <form onSubmit={saveProfile} className="space-y-4 mt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Prénom">
                        <Input
                          value={form.firstName}
                          onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                          required
                        />
                      </Field>
                      <Field label="Nom">
                        <Input
                          value={form.lastName}
                          onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                          required
                        />
                      </Field>
                    </div>
                    <Field label="Email">
                      <Input value={user.email ?? ""} disabled className="opacity-60" />
                    </Field>
                    <Field label="Téléphone">
                      <Input
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="+212 6XX XX XX XX"
                      />
                    </Field>
                    <Field label="Ville">
                      <Input
                        value={form.city}
                        onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                      />
                    </Field>
                    <Field label="Adresse">
                      <Input
                        value={form.address}
                        onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                      />
                    </Field>

                    {profileMsg && <p className="text-emerald-400 text-sm">{profileMsg}</p>}
                    {profileError && <p className="text-red-400 text-sm">{profileError}</p>}

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="toyota-btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-5 disabled:opacity-50"
                    >
                      {savingProfile ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Enregistrer
                    </button>
                  </form>
                </TabsContent>

                <TabsContent value="leads">
                  {loadingLeads ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-toyota-red" />
                    </div>
                  ) : leads.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-10 w-10 text-toyota-muted/30 mx-auto mb-3" />
                      <p className="text-toyota-muted text-sm">Aucune demande pour l&apos;instant.</p>
                      <Link href="/acheter" className="text-toyota-red text-sm font-semibold mt-2 inline-block hover:underline">
                        Faire une demande →
                      </Link>
                    </div>
                  ) : (
                    <ul className="space-y-3 mt-2">
                      {leads.map((lead) => (
                        <li
                          key={lead.id}
                          className="rounded-xl border border-white/5 bg-[#111111] p-4 flex flex-wrap items-center justify-between gap-3"
                        >
                          <div>
                            <p className="text-white font-semibold text-sm">{lead.vehicle.name}</p>
                            <p className="text-toyota-muted text-xs mt-0.5">
                              {new Date(lead.createdAt).toLocaleDateString("fr-MA")}
                              {lead.dealership ? ` · ${lead.dealership.city}` : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusBadge status={lead.type} />
                            <StatusBadge status={lead.status} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </TabsContent>

                <TabsContent value="configs">
                  {loadingConfigs ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-toyota-red" />
                    </div>
                  ) : configs.length === 0 ? (
                    <div className="text-center py-12">
                      <Bookmark className="h-10 w-10 text-toyota-muted/30 mx-auto mb-3" />
                      <p className="text-toyota-muted text-sm">Aucune configuration sauvegardée.</p>
                      <Link href="/configurator" className="text-toyota-red text-sm font-semibold mt-2 inline-block hover:underline">
                        Configurer un véhicule →
                      </Link>
                    </div>
                  ) : (
                    <ul className="space-y-3 mt-2">
                      {configs.map((cfg) => {
                        const color = (cfg.configuration as { selectedColor?: { name: string } })
                          ?.selectedColor?.name;
                        return (
                          <li
                            key={cfg.id}
                            className="rounded-xl border border-white/5 bg-[#111111] p-4 flex flex-wrap items-center justify-between gap-3"
                          >
                            <div>
                              <p className="text-white font-semibold text-sm">{cfg.name}</p>
                              <p className="text-toyota-muted text-xs mt-0.5">
                                {cfg.vehicle.name}
                                {color ? ` · ${color}` : ""}
                              </p>
                            </div>
                            <Link
                              href={`/configurator/${cfg.vehicle.slug}`}
                              className="text-xs font-bold text-toyota-red hover:underline"
                            >
                              Reprendre →
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </TabsContent>
              </Tabs>

              <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-3">
                <Link href="/acheter" className="toyota-btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-5">
                  <ShoppingBag className="h-4 w-4" />
                  Acheter / Essai
                </Link>
                <Link href="/configurator" className="toyota-btn-secondary inline-flex items-center gap-2 text-sm py-2.5 px-5">
                  <Settings2 className="h-4 w-4" />
                  Configurateur
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex items-center gap-2 text-sm py-2.5 px-5 rounded-xl border border-white/10 text-toyota-muted hover:text-white hover:border-white/20 transition-colors ml-auto"
                >
                  <LogOut className="h-4 w-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-toyota-muted mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
