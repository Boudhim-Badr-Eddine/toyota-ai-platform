"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Tag, Calendar } from "lucide-react";
import { OFFERS_DATA, OFFER_CATEGORIES, type OfferCategory } from "@/data/offers";
import { FinanceSimulator } from "@/components/commerce/FinanceSimulator";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

const CATEGORIES: Array<OfferCategory | "all"> = [
  "all",
  "seasonal",
  "financing",
  "hybrid",
  "trade-in",
  "fleet",
];

export default function OffresPage() {
  const [filter, setFilter] = useState<OfferCategory | "all">("all");

  const filtered =
    filter === "all" ? OFFERS_DATA : OFFERS_DATA.filter((o) => o.category === filter);

  return (
    <div className="min-h-screen bg-toyota-dark pt-24 pb-28 lg:pb-20">
      <div className="section-container">
        <SectionHeading
          eyebrow="Promotions"
          title="Offres Spéciales"
          subtitle="Financements avantageux, reprises garanties et offres saisonnières sur toute la gamme Toyota Maroc."
          className="mb-10"
        />

        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide border transition-colors",
                filter === cat
                  ? "bg-toyota-red border-toyota-red text-white"
                  : "border-white/10 text-toyota-muted hover:text-white hover:border-white/20"
              )}
            >
              {cat === "all" ? "Toutes" : OFFER_CATEGORIES[cat]}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          {filtered.map((offer, i) => (
            <motion.article
              key={offer.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group rounded-2xl overflow-hidden bg-[#111111] border border-white/5 hover:border-toyota-red/25 transition-colors"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={offer.imageUrl}
                  alt={offer.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-[#111111] via-transparent to-transparent" />
                {offer.badge && (
                  <span className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-toyota-red text-white text-[10px] font-bold uppercase">
                    {offer.badge}
                  </span>
                )}
              </div>

              <div className="p-6">
                <p className="text-toyota-red text-[10px] font-bold uppercase tracking-widest mb-1">
                  {OFFER_CATEGORIES[offer.category]}
                </p>
                <h2 className="text-white text-xl font-black mb-1">{offer.title}</h2>
                <p className="text-toyota-gold text-sm font-semibold mb-3">{offer.subtitle}</p>
                <p className="text-toyota-muted text-sm leading-relaxed mb-4">{offer.description}</p>

                <div className="flex flex-wrap items-center gap-4 mb-5 text-xs text-toyota-muted/70">
                  <span className="inline-flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-toyota-red" />
                    {offer.highlight}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Jusqu&apos;au {new Date(offer.validUntil).toLocaleDateString("fr-MA")}
                  </span>
                </div>

                <Link
                  href={offer.ctaHref}
                  className="inline-flex items-center gap-2 text-sm font-bold text-toyota-red hover:gap-3 transition-all"
                >
                  {offer.ctaLabel}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>

        <FinanceSimulator defaultPrice={320000} />
      </div>
    </div>
  );
}
