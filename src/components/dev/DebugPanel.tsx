"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, X, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { VEHICLES_DATA } from "@/data/vehicles";
import { cn } from "@/lib/utils";

// ─── Only rendered in development ─────────────────────────────────────────────

type GeminiStatus = "idle" | "testing" | "ok" | "error";
type ModelStatus = "pending" | "loaded" | "failed";

const ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_APP_URL",
];

// Track GLTF load status globally (modules set this)
if (typeof window !== "undefined") {
  (window as Window & { __gltfStatus?: Record<string, ModelStatus> }).__gltfStatus ??= {};
}

export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState<GeminiStatus>("idle");
  const [geminiMsg, setGeminiMsg] = useState("");
  const [modelStatuses, setModelStatuses] = useState<Record<string, ModelStatus>>({});

  // Poll GLTF statuses every 2 seconds while open
  useEffect(() => {
    if (!open) return;
    const tick = () => {
      const map = (window as Window & { __gltfStatus?: Record<string, ModelStatus> }).__gltfStatus ?? {};
      setModelStatuses({ ...map });
    };
    tick();
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, [open]);

  const testGemini = useCallback(async () => {
    setGeminiStatus("testing");
    setGeminiMsg("");
    try {
      const res = await fetch("/api/chat/test");
      const data = await res.json() as { status: string; message?: string; response?: string };
      if (data.status === "ok") {
        setGeminiStatus("ok");
        setGeminiMsg(data.response ?? "OK");
      } else {
        setGeminiStatus("error");
        setGeminiMsg(data.message ?? "Error");
      }
    } catch {
      setGeminiStatus("error");
      setGeminiMsg("Network error");
    }
  }, []);

  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all",
          open
            ? "bg-red-500 text-white"
            : "bg-[#1A1A1A] border border-white/10 text-toyota-muted hover:text-white hover:border-white/30"
        )}
        title="Debug Panel"
      >
        {open ? <X className="h-4 w-4" /> : <Bug className="h-4 w-4" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 12 }}
            transition={{ duration: 0.18 }}
            className="absolute bottom-12 right-0 w-80 bg-[#0E0E0E] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bug className="h-3.5 w-3.5 text-yellow-400" />
                <span className="text-white text-xs font-bold tracking-wide">DEBUG PANEL</span>
              </div>
              <span className="text-[10px] text-toyota-muted/50 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                DEV ONLY
              </span>
            </div>

            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">

              {/* ── Gemini Status ──────────────────────────────────────────── */}
              <section>
                <p className="text-[10px] font-bold text-toyota-muted/60 uppercase tracking-wider mb-2">Gemini API</p>
                <div className="flex items-center gap-3">
                  <StatusDot status={geminiStatus} />
                  <span className="text-white text-xs flex-1 truncate">
                    {geminiStatus === "idle" && "Non testé"}
                    {geminiStatus === "testing" && "Test en cours…"}
                    {geminiStatus === "ok" && `Connecté — "${geminiMsg}"`}
                    {geminiStatus === "error" && `Erreur: ${geminiMsg}`}
                  </span>
                  <button
                    onClick={testGemini}
                    disabled={geminiStatus === "testing"}
                    className="flex items-center gap-1 text-[10px] text-toyota-muted hover:text-white border border-white/10 hover:border-white/20 rounded-lg px-2 py-1 transition-colors disabled:opacity-40"
                  >
                    <RefreshCw className={cn("h-3 w-3", geminiStatus === "testing" && "animate-spin")} />
                    Tester
                  </button>
                </div>
              </section>

              {/* ── GLTF Models ───────────────────────────────────────────── */}
              <section>
                <p className="text-[10px] font-bold text-toyota-muted/60 uppercase tracking-wider mb-2">
                  Modèles GLTF ({VEHICLES_DATA.length})
                </p>
                <div className="space-y-1">
                  {VEHICLES_DATA.map((v) => {
                    const st = modelStatuses[v.id] ?? "pending";
                    return (
                      <div key={v.id} className="flex items-center gap-2">
                        <ModelStatusIcon status={st} />
                        <span className="text-white text-[11px] flex-1">{v.name}</span>
                        <span className={cn(
                          "text-[10px]",
                          st === "loaded" && "text-green-400",
                          st === "failed" && "text-red-400",
                          st === "pending" && "text-toyota-muted/50"
                        )}>
                          {st === "loaded" ? "Chargé" : st === "failed" ? "Erreur" : "En attente"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ── Env vars ──────────────────────────────────────────────── */}
              <section>
                <p className="text-[10px] font-bold text-toyota-muted/60 uppercase tracking-wider mb-2">
                  Variables d&apos;environnement
                </p>
                <div className="space-y-1">
                  {ENV_VARS.map((key) => {
                    const set = Boolean(process.env[key]);
                    return (
                      <div key={key} className="flex items-center gap-2">
                        {set
                          ? <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0" />
                          : <XCircle className="h-3 w-3 text-red-400 shrink-0" />
                        }
                        <code className="text-[10px] text-toyota-muted">{key}</code>
                        <span className={cn("ml-auto text-[10px]", set ? "text-green-400" : "text-red-400")}>
                          {set ? "Défini" : "Manquant"}
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-2 mt-1">
                    {process.env.GEMINI_API_KEY
                      ? <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0" />
                      : <XCircle className="h-3 w-3 text-red-400 shrink-0" />
                    }
                    <code className="text-[10px] text-toyota-muted">GEMINI_API_KEY</code>
                    <span className={cn("ml-auto text-[10px]", process.env.GEMINI_API_KEY ? "text-green-400" : "text-red-400")}>
                      {process.env.GEMINI_API_KEY ? "Défini" : "Manquant"}
                    </span>
                  </div>
                </div>
              </section>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Micro helpers ────────────────────────────────────────────────────────────

function StatusDot({ status }: { status: GeminiStatus }) {
  return (
    <span className={cn(
      "w-2.5 h-2.5 rounded-full shrink-0",
      status === "ok" && "bg-green-400",
      status === "error" && "bg-red-400",
      status === "testing" && "bg-yellow-400 animate-pulse",
      status === "idle" && "bg-white/20",
    )} />
  );
}

function ModelStatusIcon({ status }: { status: ModelStatus }) {
  if (status === "loaded") return <CheckCircle2 className="h-3 w-3 text-green-400 shrink-0" />;
  if (status === "failed") return <XCircle className="h-3 w-3 text-red-400 shrink-0" />;
  return <Clock className="h-3 w-3 text-toyota-muted/40 shrink-0" />;
}

// ─── Exported helper for CarModel.tsx to call ─────────────────────────────────
export function reportGltfStatus(vehicleId: string, status: ModelStatus) {
  if (typeof window === "undefined" || process.env.NODE_ENV !== "development") return;
  const win = window as Window & { __gltfStatus?: Record<string, ModelStatus> };
  win.__gltfStatus ??= {};
  win.__gltfStatus[vehicleId] = status;
}
