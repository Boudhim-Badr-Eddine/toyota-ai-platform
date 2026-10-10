import Link from "next/link";
import { Mail, Phone } from "lucide-react";

export const CONTACT_PHONE = "0771815763";
export const CONTACT_EMAIL = "badreddineboudhim@gmail.com";

export function ContactStrip({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${className}`}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-toyota-red">Contact direct</p>
        <p className="text-sm text-white/60 mt-1">Un conseiller Toyota vous répond sous 24h.</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 text-sm">
        <a
          href={`tel:+212${CONTACT_PHONE.replace(/^0/, "")}`}
          className="inline-flex items-center gap-2 text-white hover:text-toyota-red transition-colors"
        >
          <Phone className="h-4 w-4 text-toyota-red" />
          {CONTACT_PHONE}
        </a>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="inline-flex items-center gap-2 text-white hover:text-toyota-red transition-colors"
        >
          <Mail className="h-4 w-4 text-toyota-red" />
          {CONTACT_EMAIL}
        </a>
      </div>
    </div>
  );
}

export function ContactFooterLinks() {
  return (
    <div className="flex flex-col gap-1 text-xs text-white/45">
      <a href={`tel:+212${CONTACT_PHONE.replace(/^0/, "")}`} className="hover:text-white/70 transition-colors">
        {CONTACT_PHONE}
      </a>
      <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white/70 transition-colors">
        {CONTACT_EMAIL}
      </a>
    </div>
  );
}
