"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Award, ArrowRight, Loader2, Sparkles, Settings2, ShoppingBag } from "lucide-react";
import { QUIZ_QUESTIONS } from "@/data/quizQuestions";
import { PermisLegendeCard } from "@/components/fun/PermisLegendeCard";
import { cn } from "@/lib/utils";

interface QuizResult {
  personaTitle: string;
  tagline: string;
  vehicleId: string;
  vehicleName: string;
  imageUrl: string;
  source: "groq" | "rules";
}

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [holderName, setHolderName] = useState("");

  const currentQuestion = QUIZ_QUESTIONS[step];
  const isComplete = step >= QUIZ_QUESTIONS.length;
  const progress = Math.round((step / QUIZ_QUESTIONS.length) * 100);

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
      <section className="border-b border-white/[0.06] bg-[#000000]">
        <div className="section-container py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-toyota-gold/25 bg-toyota-gold/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-toyota-gold">
              <Award className="h-3.5 w-3.5" />
              Toyota DNA
            </div>
            <h1 className="text-display text-white">
              Permis de <span className="text-toyota-red">Légende</span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/45">
              8 questions pour révéler votre ADN Toyota Maroc — et découvrir le véhicule qui vous correspond.
            </p>
          </div>
        </div>
      </section>

      <div className="section-container py-12 md:py-16">
        <div className="mx-auto max-w-2xl">
          {!isComplete && (
            <div className="mb-8">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-white/40 mb-2">
                <span>
                  Question {step + 1} / {QUIZ_QUESTIONS.length}
                </span>
                <span>{progress}%</span>
              </div>
              <div className="h-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-toyota-red"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {!isComplete && currentQuestion && (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="toyota-panel p-6 md:p-8"
              >
                <h2 className="text-xl md:text-2xl font-bold text-white leading-snug">
                  {currentQuestion.question}
                </h2>
                {currentQuestion.subtitle && (
                  <p className="mt-2 text-sm text-white/40">{currentQuestion.subtitle}</p>
                )}

                <div className="mt-6 grid gap-3">
                  {currentQuestion.options.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelect(opt.id)}
                      disabled={loading}
                      className={cn(
                        "flex items-center gap-4 rounded-lg border border-white/[0.08] bg-white/[0.02] p-4 text-left transition-all",
                        "hover:border-toyota-red/40 hover:bg-toyota-red/5 active:scale-[0.99]",
                        answers[currentQuestion.id] === opt.id && "border-toyota-red bg-toyota-red/10",
                        loading && "opacity-50 pointer-events-none"
                      )}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="font-semibold text-sm text-white">{opt.label}</span>
                      {loading && answers[currentQuestion.id] === opt.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-toyota-red ml-auto" />
                      )}
                    </button>
                  ))}
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
                  <Link
                    href={`/configurator/${result.vehicleId}`}
                    className="toyota-btn-primary inline-flex items-center justify-center gap-2"
                  >
                    <Settings2 className="h-4 w-4" />
                    Configurer ma Toyota
                  </Link>
                  <Link
                    href={`/acheter?vehicle=${result.vehicleId}`}
                    className="toyota-btn-secondary inline-flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Acheter / Essai
                  </Link>
                  <Link
                    href="/road-trip"
                    className="toyota-btn-ghost inline-flex items-center justify-center gap-2"
                  >
                    Road Trip Légendaire
                    <ArrowRight className="h-4 w-4" />
                  </Link>
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
