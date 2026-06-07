"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, RefreshCw, Sparkles, Zap } from "lucide-react";
import { useConfiguratorStore } from "@/store/configuratorStore";
import { cn } from "@/lib/utils";

// ─── Typewriter hook ──────────────────────────────────────────────────────────

function useTypewriter(text: string, isActive: boolean, speed = 28) {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    if (!isActive || !text) {
      setDisplayed(text);
      return;
    }
    // Reset
    setDisplayed("");
    indexRef.current = 0;

    const tick = setInterval(() => {
      indexRef.current++;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) clearInterval(tick);
    }, speed);

    return () => clearInterval(tick);
  }, [text, isActive, speed]);

  return displayed;
}

// ─── Quick tips ───────────────────────────────────────────────────────────────

const QUICK_TIPS = [
  { label: "Rouge + Jantes Sport", text: "Le Rouge Toyota avec des jantes sport, c'est l'alliance parfaite entre audace et performance sur la route. 🔥" },
  { label: "Blanc Nacré + Cuir", text: "La sellerie en cuir sublime l'élégance du Blanc Nacré — une combinaison intemporelle et raffinée. ✨" },
  { label: "Gris + Tout-terrain", text: "Le gris foncé avec des jantes tout-terrain donne un look robuste et aventurier à votre Toyota. 🏔️" },
];

// ─── Groq API call ────────────────────────────────────────────────────────────

async function fetchStyleTip(
  vehicleName: string,
  colorName: string,
  wheelsName: string
): Promise<string> {
  const prompt = `Donne UNE phrase courte et enthousiaste en français (max 20 mots) sur cette configuration Toyota:
Véhicule: ${vehicleName}, Couleur: ${colorName}, Jantes: ${wheelsName}.
Style: élégant et dynamique. Termine avec 1 emoji.
Réponds UNIQUEMENT avec la phrase, sans guillemets.`;

  const res = await fetch("/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) throw new Error("API error");
  const data = (await res.json()) as { tip?: string; error?: string };
  if (data.error) throw new Error(data.error);
  return data.tip ?? "Excellente configuration ! 🚗";
}

function GroqLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect width="28" height="28" rx="8" fill="#EB0A1E" />
      <text x="14" y="18" textAnchor="middle" fill="white" fontSize="11" fontWeight="900" fontFamily="Inter, sans-serif">G</text>
    </svg>
  );
}

// ─── AIStyleAdvisor ───────────────────────────────────────────────────────────

export function AIStyleAdvisor() {
  const { selectedVehicle, selectedColor, selectedWheels } = useConfiguratorStore();

  const [collapsed, setCollapsed] = useState(false);
  const [tipText, setTipText] = useState(QUICK_TIPS[0].text);
  const [loading, setLoading] = useState(false);
  const [typeActive, setTypeActive] = useState(false);
  const lastComboRef = useRef("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayedText = useTypewriter(tipText, typeActive);

  const fetchTip = useCallback(async (force = false) => {
    if (!selectedVehicle || !selectedColor || !selectedWheels) return;

    const combo = `${selectedVehicle.id}-${selectedColor.id}-${selectedWheels.id}`;
    if (!force && combo === lastComboRef.current) return;
    lastComboRef.current = combo;

    setLoading(true);
    setTypeActive(false);

    try {
      const text = await fetchStyleTip(
        selectedVehicle.name,
        selectedColor.name,
        selectedWheels.name
      );
      setTipText(text);
      setTypeActive(true);
    } catch {
      setTipText("Belle configuration ! Votre Toyota vous attend. 🚗");
      setTypeActive(true);
    } finally {
      setLoading(false);
    }
  }, [selectedVehicle, selectedColor, selectedWheels]);

  // Debounce: fetch 900ms after color OR wheel change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchTip(false), 900);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [fetchTip]);

  if (!selectedVehicle) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="absolute bottom-4 left-4 z-20 w-72"
    >
      <div className="bg-[#0f0f0f]/92 backdrop-blur-md border border-white/8 rounded-2xl shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-white/3 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#1a1a2e] border border-white/10 flex items-center justify-center shrink-0 shadow-md">
            <GroqLogo className="w-4 h-4" />
          </div>

          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-white text-xs font-semibold leading-tight">Style Advisor</p>
              <Sparkles className="h-3 w-3 text-toyota-gold" />
            </div>
            <p className="text-toyota-muted/45 text-[10px] leading-tight">Propulsé par Groq</p>
          </div>

          <ChevronDown className={cn(
            "h-4 w-4 text-toyota-muted/40 transition-transform shrink-0",
            collapsed && "-rotate-90"
          )} />
        </button>

        {/* ── Body ── */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-0">
                <div className="border-t border-white/5 pt-3">

                  {/* Tip text or loading dots */}
                  <div className="min-h-[3rem]">
                    {loading ? (
                      <div className="flex items-start gap-2">
                        <div className="flex gap-0.5 mt-1">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="w-1.5 h-1.5 rounded-full bg-toyota-muted/50"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                        <p className="text-toyota-muted/60 text-xs italic">Génération du conseil…</p>
                      </div>
                    ) : (
                      <p className="text-sm text-white/85 leading-relaxed">
                        {displayedText}
                        {typeActive && displayedText.length < tipText.length && (
                          <span className="inline-block w-0.5 h-3.5 bg-white/60 ml-0.5 align-middle animate-pulse" />
                        )}
                      </p>
                    )}
                  </div>

                  {/* Quick tips */}
                  <div className="mt-3 space-y-1">
                    <p className="text-[9px] uppercase tracking-widest text-toyota-muted/30 mb-1.5">Essayer aussi</p>
                    {QUICK_TIPS.map((qt) => (
                      <button
                        key={qt.label}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTipText(qt.text);
                          setTypeActive(true);
                          lastComboRef.current = "";
                        }}
                        className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded-lg hover:bg-white/5 transition-colors group"
                      >
                        <Zap className="h-2.5 w-2.5 text-toyota-gold/60 shrink-0" />
                        <span className="text-[10px] text-toyota-muted/50 group-hover:text-toyota-muted/80 transition-colors">
                          {qt.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Refresh */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      lastComboRef.current = "";
                      fetchTip(true);
                    }}
                    disabled={loading}
                    className="mt-2.5 flex items-center gap-1 text-[10px] text-toyota-muted/40 hover:text-toyota-red transition-colors disabled:opacity-30"
                  >
                    <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                    Nouveau conseil
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!collapsed && (
          <div className="flex items-center gap-1.5 px-4 py-2 border-t border-white/5 bg-white/2">
            <GroqLogo className="w-3 h-3" />
            <span className="text-[9px] text-toyota-muted/30 tracking-wide">Propulsé par Groq AI</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
