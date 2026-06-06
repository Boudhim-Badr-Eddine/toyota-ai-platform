/** Minimal PDF generator for quote devis (no external deps). */

function escapePdfText(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export interface QuoteLine {
  label: string;
  amount: number;
}

export interface QuoteData {
  vehicleName: string;
  trimName?: string;
  color?: string;
  wheels?: string;
  interior?: string;
  dealership?: string;
  basePrice: number;
  options: QuoteLine[];
  totalPrice: number;
  downPayment: number;
  termMonths: number;
  monthlyPayment: number;
  annualRate: number;
  customerName?: string;
}

function formatMad(n: number): string {
  return `${n.toLocaleString("fr-MA")} MAD`;
}

export function buildQuotePdf(data: QuoteData): Buffer {
  const lines: string[] = [
    "Toyota Maroc — Devis indicatif",
    `Véhicule: ${data.vehicleName}`,
  ];
  if (data.trimName) lines.push(`Finition: ${data.trimName}`);
  if (data.color) lines.push(`Couleur: ${data.color}`);
  if (data.wheels) lines.push(`Jantes: ${data.wheels}`);
  if (data.interior) lines.push(`Sellerie: ${data.interior}`);
  if (data.dealership) lines.push(`Concession: ${data.dealership}`);
  lines.push("");
  lines.push(`Prix de base: ${formatMad(data.basePrice)}`);
  for (const opt of data.options) {
    if (opt.amount > 0) lines.push(`${opt.label}: +${formatMad(opt.amount)}`);
  }
  lines.push(`Total TTC: ${formatMad(data.totalPrice)}`);
  lines.push("");
  lines.push("Financement indicatif:");
  lines.push(`Apport: ${formatMad(data.downPayment)}`);
  lines.push(`Durée: ${data.termMonths} mois — Taux ${data.annualRate}%`);
  lines.push(`Mensualité estimée: ${formatMad(data.monthlyPayment)}`);
  lines.push("");
  lines.push("Simulation hors assurance et frais. Offre sous réserve d'acceptation.");

  const contentStream = [
    "BT",
    "/F1 11 Tf",
    "50 780 Td",
    ...lines.flatMap((line, i) => {
      const prefix = i === 0 ? "" : "0 -14 Td ";
      return [`${prefix}(${escapePdfText(line)}) Tj`];
    }),
    "ET",
  ].join("\n");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${Buffer.byteLength(contentStream, "utf8")} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += obj;
  }
  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}
