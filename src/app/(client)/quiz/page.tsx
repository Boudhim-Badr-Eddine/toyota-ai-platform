"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Award, ArrowRight, Loader2, Sparkles, Settings2, ShoppingBag, Check } from "lucide-react";
import { QUIZ_QUESTIONS } from "@/data/quizQuestions";
import { PermisLegendeCard } from "@/components/fun/PermisLegendeCard";
import { PremiumHeroDecor } from "@/components/ui/PremiumHeroDecor";
import { cn } from "@/lib/utils";
import { BorderDrawButton } from "@/components/ui/BorderDrawButton";

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const;
const TITLE_WORDS = ["Permis", "de", "Légende"] as const;

interface QuizResult {
  personaTitle: string;
  tagline: string;
  vehicleId: string;
  vehicleName: string;
  imageUrl: string;
  source: "groq" | "rules";
}

const optionVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.12 + i * 0.07, duration: 0.45, ease: EASE_PREMIUM },
  }),
};

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [holderName, setHolderName] = useState("");

  const currentQuestion = QUIZ_QUESTIONS[step];
  const isComplete = step >= QUIZ_QUESTIONS.length;
  const progress = Math.round((step / QUIZ_QUESTIONS.length) * 100);
  const stepLabel = String(step + 1).padStart(2, "0");
  const totalLabel = String(QUIZ_QUESTIONS.length).padStart(2, "0");

  const fireConfetti = useCallback(() => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#EB0A1E", "#C9A84C", "#FFFFFF"],
    });
  }, []);

  const submitQuiz = async (finalAnswers: Record<string, string>) => {
    setLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: Object.entries(finalAnswers).map(([questionId, optionId]) => ({
            questionId,
            optionId,
          })),
        }),
      });
      if (!res.ok) throw new Error("Erreur quiz");
      const data = (await res.json()) as QuizResult;
      setResult(data);
      setStep(QUIZ_QUESTIONS.length);
      setTimeout(fireConfetti, 300);
    } catch {
      setStep(step);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (optionId: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(newAnswers);

    if (step < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 280);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
    setHolderName("");
  };

  return (
    <div className="toyota-page pb-28 lg:pb-16">
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-[#000000]">
        <PremiumHeroDecor variant="minimal" />

        <div className="section-container relative z-10 py-14 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: EASE_PREMIUM }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#EB0A1E]/30 bg-[#EB0A1E]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#EB0A1E]"
              style={{ animation: "dna-badge-glow 2.8s ease-in-out infinite" }}
            >
              <Award className="h-3.5 w-3.5" />
              Toyota DNA
            </motion.div>

            <h1 className="text-display text-white flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1">
              {TITLE_WORDS.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: EASE_PREMIUM }}
                  className={cn(
                    word === "Légende" && "text-[#EB0A1E]"
                  )}
                >
                  {word}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55, ease: EASE_PREMIUM }}
              className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-white/45"
            >
              8 questions pour révéler votre ADN Toyota Maroc — et découvrir le véhicule qui vous correspond.
            </motion.p>
          </div>
        </div>
      </section>

      <div className="section-container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          {!isComplete && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-sm font-bold tracking-wider text-white/55">
                  {stepLabel}
                  <span className="text-white/25 mx-1">/</span>
                  {totalLabel}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">
                  {progress}%
                </span>
              </div>
              <div className="h-[4px] rounded-full bg-white/[0.08] overflow-hidden">
                <motion.div
                  className="h-full w-full origin-left bg-white/35 rounded-full will-change-transform"
                  initial={false}
                  animate={{ scaleX: progress / 100 }}
                  transition={{ duration: 0.55, ease: EASE_PREMIUM }}
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!isComplete && currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 48 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -48 }}
                transition={{ duration: 0.45, ease: EASE_PREMIUM }}
                className="relative rounded-2xl border border-white/[0.08] bg-[#111111] overflow-hidden"
              >
                <div className="h-px bg-white/10" />

                <div className="p-6 md:p-8">
                  <h2 className="text-2xl md:text-3xl font-black text-white leading-snug tracking-tight">
                    {currentQuestion.question}
                  </h2>
                  {currentQuestion.subtitle && (
                    <p className="mt-3 text-sm text-white/40">{currentQuestion.subtitle}</p>
                  )}

                  <div className="mt-8 flex flex-col gap-3">
                    {currentQuestion.options.map((opt, i) => {
                      const selected = answers[currentQuestion.id] === opt.id;
                      return (
                        <motion.button
                          key={opt.id}
                          type="button"
                          custom={i}
                          variants={optionVariants}
                          initial="hidden"
                          animate="visible"
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelect(opt.id)}
                          disabled={loading}
                          className={cn(
                            "group flex items-center gap-4 rounded-full border px-5 py-4 text-left transition-colors duration-300",
                            selected
                              ? "border-white/30 bg-white/[0.06]"
                              : "border-white/[0.1] bg-[#0a0a0a]",
                            "hover:border-[#EB0A1E]/40 hover:bg-[#EB0A1E]/[0.07]",
                            loading && "opacity-50 pointer-events-none"
                          )}
                        >
                          <span className="text-2xl shrink-0">{opt.emoji}</span>
                          <span className="flex-1 font-semibold text-sm text-white/90 group-hover:text-white">
                            {opt.label}
                          </span>
                          {selected && !loading && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: [0, 1.2, 1] }}
                              transition={{ duration: 0.35, ease: EASE_PREMIUM }}
                              className="shrink-0 w-6 h-6 rounded-full bg-white/15 border border-white/20 flex items-center justify-center"
                            >
                              <Check className="h-3.5 w-3.5 text-white/90" />
                            </motion.span>
                          )}
                          {loading && selected && (
                            <Loader2 className="h-4 w-4 animate-spin text-white/70 ml-auto shrink-0" />
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {isComplete && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 rounded-full border border-toyota-red/25 bg-toyota-red/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-toyota-red mb-4">
                    <Sparkles className="h-3.5 w-3.5" />
                    Votre ADN révélé
                  </div>
                  <p className="text-xs text-white/30">
                    Analyse {result.source === "groq" ? "IA Groq" : "Toyota DNA"}
                  </p>
                </div>

                <div className="toyota-panel p-4 md:p-6">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                    Personnalisez votre permis
                  </label>
                  <input
                    type="text"
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    placeholder="Votre prénom ou surnom"
                    className="mt-2 w-full rounded-md border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 focus:border-toyota-red focus:outline-none"
                  />
                </div>

                <PermisLegendeCard
                  personaTitle={result.personaTitle}
                  tagline={result.tagline}
                  vehicleName={result.vehicleName}
                  vehicleImageUrl={result.imageUrl}
                  holderName={holderName || "Légende Toyota"}
                />

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <BorderDrawButton
                    href={`/configurator/${result.vehicleId}`}
                    accent="red"
                    className="justify-center"
                  >
                    <Settings2 className="h-4 w-4" />
                    Configurer ma Toyota
                  </BorderDrawButton>
                  <BorderDrawButton
                    href={`/acheter?vehicle=${result.vehicleId}`}
                    className="justify-center"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Acheter / Essai
                  </BorderDrawButton>
                  <BorderDrawButton href="/road-trip" className="justify-center">
                    Road Trip Légendaire
                    <ArrowRight className="h-4 w-4" />
                  </BorderDrawButton>
                </div>

                <button
                  type="button"
                  onClick={handleRestart}
                  className="block mx-auto text-sm text-white/40 hover:text-white transition-colors"
                >
                  Refaire le quiz
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
