/** Branded PDF generator for quote devis (no external deps). */

const PAGE_W = 595;
const PAGE_H = 842;
const MARGIN = 48;

const RED = { r: 235 / 255, g: 10 / 255, b: 30 / 255 };
const DARK = { r: 13 / 255, g: 13 / 255, b: 13 / 255 };
const GRAY_BG = { r: 245 / 255, g: 245 / 255, b: 245 / 255 };
const GRAY_TEXT = { r: 100 / 255, g: 100 / 255, b: 100 / 255 };
const BORDER = { r: 220 / 255, g: 220 / 255, b: 220 / 255 };

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

/** Map Unicode to WinAnsi bytes for Helvetica built-in font. */
function toWinAnsi(text: string): string {
  const c = String.fromCharCode;
  const map: Record<string, string> = {
    é: c(0xe9),
    è: c(0xe8),
    ê: c(0xea),
    ë: c(0xeb),
    à: c(0xe0),
    â: c(0xe2),
    ä: c(0xe4),
    ù: c(0xf9),
    û: c(0xfb),
    ü: c(0xfc),
    ô: c(0xf4),
    ö: c(0xf6),
    î: c(0xee),
    ï: c(0xef),
    ç: c(0xe7),
    É: c(0xc9),
    È: c(0xc8),
    À: c(0xc0),
    "—": "-",
    "–": "-",
    "'": "'",
    '"': '"',
  };
  let out = "";
  for (const ch of text) {
    out += map[ch] ?? ch;
  }
  return out;
}

function escapePdfText(text: string): string {
  return toWinAnsi(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function formatMad(n: number): string {
  const abs = Math.round(Math.abs(n));
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return n < 0 ? `-${formatted} MAD` : `${formatted} MAD`;
}

function pdfY(top: number): number {
  return PAGE_H - top;
}

function setFill(rgb: { r: number; g: number; b: number }): string {
  return `${rgb.r} ${rgb.g} ${rgb.b} rg`;
}

function setStroke(rgb: { r: number; g: number; b: number }): string {
  return `${rgb.r} ${rgb.g} ${rgb.b} RG`;
}

function rect(
  x: number,
  top: number,
  w: number,
  h: number,
  fill: { r: number; g: number; b: number }
): string {
  return `${setFill(fill)}\n${x} ${pdfY(top + h)} ${w} ${h} re f`;
}

function strokeRect(
  x: number,
  top: number,
  w: number,
  h: number,
  stroke: { r: number; g: number; b: number },
  lineW = 0.75
): string {
  return `${setStroke(stroke)}\n${lineW} w\n${x} ${pdfY(top + h)} ${w} ${h} re S`;
}

function hLine(x: number, top: number, w: number): string {
  return `${setStroke(BORDER)}\n0.5 w\n${x} ${pdfY(top)} m\n${x + w} ${pdfY(top)} l S`;
}

function text(
  x: number,
  top: number,
  size: number,
  font: "F1" | "F2",
  content: string,
  color: { r: number; g: number; b: number } = DARK
): string {
  const y = pdfY(top);
  return [
    "BT",
    setFill(color),
    `/${font} ${size} Tf`,
    `1 0 0 1 ${x} ${y} Tm`,
    `(${escapePdfText(content)}) Tj`,
    "ET",
  ].join("\n");
}

function textRight(
  rightX: number,
  top: number,
  size: number,
  font: "F1" | "F2",
  content: string,
  color: { r: number; g: number; b: number } = DARK
): string {
  const approxWidth = content.length * size * 0.52;
  return text(rightX - approxWidth, top, size, font, content, color);
}

function buildContentStream(data: QuoteData): string {
  const innerW = PAGE_W - MARGIN * 2;
  const date = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const ref = `DEV-${Date.now().toString(36).toUpperCase().slice(-8)}`;

  const parts: string[] = [];

  // Header band
  parts.push(rect(0, 0, PAGE_W, 88, RED));
  parts.push(rect(0, 88, PAGE_W, 4, { r: 0.75, g: 0.02, b: 0.1 }));

  parts.push(text(MARGIN, 38, 22, "F2", "TOYOTA", { r: 1, g: 1, b: 1 }));
  parts.push(text(MARGIN + 108, 42, 11, "F1", "MAROC", { r: 1, g: 1, b: 0.85 }));
  parts.push(text(MARGIN, 62, 10, "F1", "Devis indicatif de configuration", { r: 1, g: 1, b: 0.9 }));
  parts.push(textRight(PAGE_W - MARGIN, 38, 9, "F1", date, { r: 1, g: 1, b: 0.85 }));
  parts.push(textRight(PAGE_W - MARGIN, 52, 8, "F1", `Ref. ${ref}`, { r: 1, g: 1, b: 0.7 }));

  // Vehicle title
  parts.push(text(MARGIN, 118, 20, "F2", data.vehicleName));
  if (data.trimName) {
    parts.push(text(MARGIN, 140, 11, "F1", `Finition ${data.trimName}`, GRAY_TEXT));
  }
  if (data.customerName) {
    parts.push(textRight(PAGE_W - MARGIN, 118, 10, "F1", data.customerName, GRAY_TEXT));
  }

  // Configuration section
  const configTop = 168;
  parts.push(text(MARGIN, configTop, 8, "F2", "CONFIGURATION", RED));
  parts.push(rect(MARGIN, configTop + 10, 40, 2, RED));

  const configBoxTop = configTop + 22;
  const configRows: [string, string][] = [];
  if (data.color) configRows.push(["Couleur extérieure", data.color]);
  if (data.wheels) configRows.push(["Jantes", data.wheels]);
  if (data.interior) configRows.push(["Sellerie", data.interior]);
  if (data.dealership) configRows.push(["Concession", data.dealership]);

  const configBoxH = Math.max(56, configRows.length * 22 + 24);
  parts.push(rect(MARGIN, configBoxTop, innerW, configBoxH, GRAY_BG));
  parts.push(strokeRect(MARGIN, configBoxTop, innerW, configBoxH, BORDER));

  configRows.forEach(([label, value], i) => {
    const rowTop = configBoxTop + 16 + i * 22;
    parts.push(text(MARGIN + 16, rowTop, 9, "F1", label, GRAY_TEXT));
    parts.push(text(MARGIN + 180, rowTop, 10, "F2", value));
  });

  // Pricing section
  const priceTop = configBoxTop + configBoxH + 32;
  parts.push(text(MARGIN, priceTop, 8, "F2", "DETAIL DES PRIX", RED));
  parts.push(rect(MARGIN, priceTop + 10, 40, 2, RED));

  const tableTop = priceTop + 22;
  const priceRows: [string, string, boolean][] = [
    ["Prix de base", formatMad(data.basePrice), false],
    ...data.options
      .filter((o) => o.amount > 0)
      .map((o) => [o.label, `+${formatMad(o.amount)}`, false] as [string, string, boolean]),
  ];

  const rowH = 26;
  const tableH = priceRows.length * rowH + 8;
  parts.push(rect(MARGIN, tableTop, innerW, tableH, { r: 1, g: 1, b: 1 }));
  parts.push(strokeRect(MARGIN, tableTop, innerW, tableH, BORDER));

  priceRows.forEach(([label, amount], i) => {
    const rowTop = tableTop + 14 + i * rowH;
    if (i > 0) parts.push(hLine(MARGIN + 12, tableTop + 8 + i * rowH, innerW - 24));
    parts.push(text(MARGIN + 16, rowTop, 10, "F1", label));
    parts.push(textRight(PAGE_W - MARGIN - 16, rowTop, 10, "F2", amount));
  });

  // Total box
  const totalTop = tableTop + tableH + 16;
  parts.push(rect(MARGIN, totalTop, innerW, 48, DARK));
  parts.push(rect(MARGIN, totalTop, 5, 48, RED));
  parts.push(text(MARGIN + 20, totalTop + 18, 11, "F2", "TOTAL TTC", { r: 1, g: 1, b: 1 }));
  parts.push(
    textRight(PAGE_W - MARGIN - 16, totalTop + 16, 16, "F2", formatMad(data.totalPrice), {
      r: 1,
      g: 1,
      b: 1,
    })
  );

  // Finance section
  const financeTop = totalTop + 72;
  parts.push(text(MARGIN, financeTop, 8, "F2", "FINANCEMENT INDICATIF", RED));
  parts.push(rect(MARGIN, financeTop + 10, 40, 2, RED));

  const financeBoxTop = financeTop + 22;
  const financeH = 88;
  parts.push(rect(MARGIN, financeBoxTop, innerW, financeH, GRAY_BG));
  parts.push(strokeRect(MARGIN, financeBoxTop, innerW, financeH, BORDER));

  const financeRows: [string, string][] = [
    ["Apport (20%)", formatMad(data.downPayment)],
    ["Durée", `${data.termMonths} mois`],
    ["Taux annuel", `${data.annualRate}%`],
    ["Mensualité estimée", formatMad(data.monthlyPayment)],
  ];

  financeRows.forEach(([label, value], i) => {
    const col = i < 2 ? 0 : 1;
    const row = i % 2;
    const x = MARGIN + 16 + col * (innerW / 2);
    const y = financeBoxTop + 18 + row * 36;
    parts.push(text(x, y, 8, "F1", label, GRAY_TEXT));
    parts.push(text(x, y + 14, 12, "F2", value, i === 3 ? RED : DARK));
  });

  // Footer
  const footerTop = financeBoxTop + financeH + 40;
  parts.push(hLine(MARGIN, footerTop, innerW));
  parts.push(
    text(
      MARGIN,
      footerTop + 16,
      8,
      "F1",
      "Simulation hors assurance et frais. Offre sous réserve d'acceptation par Toyota Maroc.",
      GRAY_TEXT
    )
  );
  parts.push(
    text(
      MARGIN,
      footerTop + 30,
      7,
      "F1",
      "Document généré automatiquement depuis le configurateur Toyota AI Platform. Non contractuel.",
      GRAY_TEXT
    )
  );
  parts.push(
    textRight(PAGE_W - MARGIN, PAGE_H - 28, 7, "F1", "toyota.ma  |  configurateur 3D", GRAY_TEXT)
  );

  return parts.join("\n");
}

export function buildQuotePdf(data: QuoteData): Buffer {
  const contentStream = buildContentStream(data);
  const contentBytes = Buffer.byteLength(contentStream, "utf8");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n",
    `4 0 obj\n<< /Length ${contentBytes} >>\nstream\n${contentStream}\nendstream\nendobj\n`,
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n",
    "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n",
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
