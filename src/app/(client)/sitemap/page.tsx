import Link from "next/link";
import { VEHICLES_DATA } from "@/data/vehicles";

export default function SitemapPage() {
  const pages = [
    { href: "/", label: "Accueil" },
    { href: "/vehicles", label: "Gamme véhicules" },
    { href: "/configurator", label: "Configurateur" },
    { href: "/acheter", label: "Acheter" },
    { href: "/concessions", label: "Concessions" },
    { href: "/acheter", label: "Acheter / RDV" },
    { href: "/privacy", label: "Confidentialité" },
    { href: "/terms", label: "CGU" },
  ];

  return (
    <div className="section-container py-24 pt-32">
      <h1 className="text-3xl font-bold text-white mb-8">Plan du site</h1>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-white font-semibold mb-4">Pages</h2>
          <ul className="space-y-2">
            {pages.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="text-toyota-muted hover:text-toyota-red text-sm">
                  {p.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-white font-semibold mb-4">Véhicules</h2>
          <ul className="space-y-2">
            {VEHICLES_DATA.map((v) => (
              <li key={v.id}>
                <Link href={`/vehicles/${v.id}`} className="text-toyota-muted hover:text-toyota-red text-sm">
                  {v.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
