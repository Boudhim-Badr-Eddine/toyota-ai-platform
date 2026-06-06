"use client";

import { useMemo, useState } from "react";
import { Calculator, Info } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";

interface FinanceSimulatorProps {
  defaultPrice?: number;
  className?: string;
}

const TERMS = [36, 48, 60, 72] as const;

function computeMonthlyPayment(principal: number, annualRate: number, months: number): number {
  if (principal <= 0 || months <= 0) return 0;
  if (annualRate <= 0) return Math.round(principal / months);
  const monthlyRate = annualRate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, months);
  return Math.round((principal * monthlyRate * factor) / (factor - 1));
}

export function FinanceSimulator({ defaultPrice = 350000, className }: FinanceSimulatorProps) {
  const [price, setPrice] = useState(defaultPrice);
  const [downPayment, setDownPayment] = useState(() => Math.round(defaultPrice * 0.2));
  const [term, setTerm] = useState<number>(48);
  const [rate, setRate] = useState(5.9);

  const principal = Math.max(0, price - downPayment);
  const monthly = useMemo(
    () => computeMonthlyPayment(principal, rate, term),
    [principal, rate, term]
  );
  const totalCost = monthly * term + downPayment;
  const totalInterest = Math.max(0, totalCost - price);

  return (
    <div
      id="finance"
      className={cn(
        "toyota-card rounded-2xl border border-white/5 p-6 lg:p-8",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-toyota-red/10 border border-toyota-red/20 flex items-center justify-center">
          <Calculator className="h-5 w-5 text-toyota-red" />
        </div>
        <div>
          <h2 className="text-white text-xl font-bold">Simulateur de financement</h2>
          <p className="text-toyota-muted text-sm">Estimez votre mensualité en quelques secondes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <Field label="Prix du véhicule (MAD)">
          <input
            type="number"
            min={50000}
            step={5000}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value) || 0)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-toyota-red/50"
          />
        </Field>
        <Field label="Apport (MAD)">
          <input
            type="number"
            min={0}
            max={price}
            step={5000}
            value={downPayment}
            onChange={(e) => setDownPayment(Math.min(price, Number(e.target.value) || 0))}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-toyota-red/50"
          />
        </Field>
        <Field label="Durée">
          <div className="flex flex-wrap gap-2">
            {TERMS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTerm(m)}
                className={cn(
                  "px-3 py-2 rounded-lg text-xs font-bold border transition-colors",
                  term === m
                    ? "bg-toyota-red border-toyota-red text-white"
                    : "border-white/10 text-toyota-muted hover:text-white hover:border-white/20"
                )}
              >
                {m} mois
              </button>
            ))}
          </div>
        </Field>
        <Field label={`Taux annuel (${rate}%)`}>
          <input
            type="range"
            min={3}
            max={12}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full accent-toyota-red"
          />
        </Field>
      </div>

      <div className="rounded-xl bg-[#111111] border border-white/5 p-5">
        <p className="text-toyota-muted text-xs uppercase tracking-wider mb-1">Mensualité estimée</p>
        <p className="text-4xl font-black text-white mb-4">
          {formatPrice(monthly)}
          <span className="text-lg font-semibold text-toyota-muted"> /mois</span>
        </p>
        <div className="grid grid-cols-3 gap-3 text-center">
          <Stat label="Montant financé" value={formatPrice(principal)} />
          <Stat label="Coût total" value={formatPrice(totalCost)} />
          <Stat label="Intérêts" value={formatPrice(totalInterest)} />
        </div>
      </div>

      <p className="flex items-start gap-2 mt-4 text-[11px] text-toyota-muted/60 leading-relaxed">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        Simulation indicative hors assurance et frais de dossier. Offre soumise à acceptation de Toyota Finance Maroc.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-toyota-muted mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] px-2 py-2">
      <p className="text-[9px] uppercase tracking-wider text-toyota-muted/50">{label}</p>
      <p className="text-xs font-bold text-white mt-0.5">{value}</p>
    </div>
  );
}
