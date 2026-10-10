import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? "587");
  const user = process.env.SMTP_USER ?? process.env.GMAIL_USER;
  const rawPass = process.env.SMTP_PASS ?? process.env.GMAIL_APP_PASSWORD;
  const pass = rawPass?.replace(/\s/g, "");

  if (!user || !pass) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  }

  return transporter;
}

export function isEmailConfigured(): boolean {
  return getTransporter() !== null;
}

export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[email] SMTP not configured — skipping send:", options.subject);
    return false;
  }

  const from =
    process.env.SMTP_FROM ??
    `"Toyota Maroc Platform" <${process.env.SMTP_USER ?? process.env.GMAIL_USER}>`;

  try {
    await transport.verify();
    const info = await transport.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    console.info("[email] Sent:", info.messageId, "→", options.to);
    return true;
  } catch (error) {
    console.error("[email] Send failed:", error);
    return false;
  }
}

export function adminInbox(): string {
  return (
    process.env.ADMIN_NOTIFICATION_EMAIL ??
    process.env.SMTP_USER ??
    process.env.GMAIL_USER ??
    "admin@toyota-ma.com"
  );
}

function esc(value: unknown): string {
  if (value == null || value === "") return "—";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDateFr(date: Date | string): string {
  return new Intl.DateTimeFormat("fr-MA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Casablanca",
  }).format(new Date(date));
}

function formatMoney(value: unknown): string {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 0,
  }).format(n);
}

function row(label: string, value: unknown): string {
  return `<tr>
    <td style="padding:10px 14px;border-bottom:1px solid #eee;color:#666;width:38%;font-size:13px;">${esc(label)}</td>
    <td style="padding:10px 14px;border-bottom:1px solid #eee;color:#111;font-weight:600;font-size:13px;">${esc(value)}</td>
  </tr>`;
}

function section(title: string, rows: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;background:#fafafa;border-radius:8px;border:1px solid #eee;">
      <tr>
        <td colspan="2" style="padding:12px 14px;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#EB0A1E;border-bottom:1px solid #eee;">
          ${esc(title)}
        </td>
      </tr>
      ${rows}
    </table>`;
}

const TYPE_LABELS: Record<string, string> = {
  purchase: "Demande d'achat",
  test_drive: "Essai routier",
  quote: "Demande de devis",
  visit: "Rendez-vous concession",
};

const SERVICE_LABELS: Record<string, string> = {
  revision: "Révision périodique",
  vidange: "Vidange & filtres",
  pneus: "Pneus & géométrie",
  diagnostic: "Diagnostic électronique",
};

export function buildAdminNotificationEmail(payload: {
  kind: "lead" | "reservation";
  leadType: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  vehicleName: string;
  vehicleCategory?: string;
  vehiclePrice?: number;
  dealershipName?: string | null;
  dealershipCity?: string | null;
  dealershipPhone?: string | null;
  dealershipAddress?: string | null;
  appointmentDate?: Date | string | null;
  reservationType?: string | null;
  reservationNotes?: string | null;
  configuration?: Record<string, unknown>;
  leadId: string;
  reservationId?: string;
}): { subject: string; html: string; text: string } {
  const fullName = `${payload.firstName} ${payload.lastName}`.trim();
  const config = payload.configuration ?? {};
  const isService =
    payload.leadType === "quote" && typeof config.serviceType === "string";
  const isPurchase = payload.leadType === "purchase";
  const isTestDrive = payload.leadType === "test_drive";

  let headline = "Nouvelle demande client";
  if (payload.kind === "reservation" && isPurchase) headline = "Achat confirmé — rendez-vous planifié";
  else if (payload.kind === "reservation" && isTestDrive) headline = "Essai routier confirmé";
  else if (payload.kind === "reservation") headline = "Rendez-vous confirmé";
  else if (isService) headline = "Rendez-vous SAV demandé";
  else if (isPurchase) headline = "Demande d'achat reçue";
  else if (isTestDrive) headline = "Demande d'essai routier";

  const subject = `[Toyota Maroc] ${headline} — ${fullName}`;

  const clientRows = [
    row("Nom complet", fullName),
    row("Email", payload.email),
    row("Téléphone", payload.phone),
    row("Type de demande", TYPE_LABELS[payload.leadType] ?? payload.leadType),
  ].join("");

  const vehicleRows = [
    row("Modèle", payload.vehicleName),
    row("Catégorie", payload.vehicleCategory),
    row("Prix à partir de", formatMoney(payload.vehiclePrice)),
  ].join("");

  const configRows: string[] = [];
  if (config.selectedColor && typeof config.selectedColor === "object" && "name" in config.selectedColor) {
    configRows.push(row("Couleur", (config.selectedColor as { name: string }).name));
  }
  if (config.selectedWheel && typeof config.selectedWheel === "object" && "name" in config.selectedWheel) {
    configRows.push(row("Jantes", (config.selectedWheel as { name: string }).name));
  }
  if (config.selectedInterior && typeof config.selectedInterior === "object" && "name" in config.selectedInterior) {
    configRows.push(row("Intérieur", (config.selectedInterior as { name: string }).name));
  }
  if (config.color && typeof config.color === "object" && "name" in config.color) {
    configRows.push(row("Couleur", (config.color as { name: string }).name));
  }
  if (typeof config.mileage === "string" && config.mileage) {
    configRows.push(row("Kilométrage", `${config.mileage} km`));
  }
  if (typeof config.serviceType === "string") {
    configRows.push(row("Service SAV", SERVICE_LABELS[config.serviceType] ?? config.serviceType));
  }
  if (typeof config.city === "string" && config.city) {
    configRows.push(row("Ville client", config.city));
  }

  const appointmentDate =
    payload.appointmentDate ??
    (typeof config.appointmentDate === "string"
      ? `${config.appointmentDate}${config.appointmentTime ? ` ${config.appointmentTime}` : ""}`
      : null);

  const appointmentRows = [
    row("Date & heure", appointmentDate ? formatDateFr(appointmentDate) : "—"),
    row("Type RDV", payload.reservationType ? TYPE_LABELS[payload.reservationType] ?? payload.reservationType : "—"),
    row("Notes", payload.reservationNotes),
  ].join("");

  const dealerRows = [
    row("Concession", payload.dealershipName),
    row("Ville", payload.dealershipCity),
    row("Adresse", payload.dealershipAddress),
    row("Téléphone", payload.dealershipPhone),
  ].join("");

  const refRows = [
    row("Réf. lead", payload.leadId),
    ...(payload.reservationId ? [row("Réf. rendez-vous", payload.reservationId)] : []),
    row("Reçu le", formatDateFr(new Date())),
  ].join("");

  const dashboardUrl =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:24px 12px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:#111;padding:24px 28px;border-bottom:4px solid #EB0A1E;">
            <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#EB0A1E;font-weight:700;">Toyota Maroc — Plateforme AI</p>
            <h1 style="margin:0;color:#fff;font-size:22px;line-height:1.3;">${esc(headline)}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <p style="margin:0 0 20px;color:#444;font-size:14px;line-height:1.6;">
              Un client vient de confirmer une demande sur la plateforme. Voici le récapitulatif complet pour un suivi rapide.
            </p>
            ${section("Client", clientRows)}
            ${section("Véhicule", vehicleRows)}
            ${configRows.length ? section("Configuration", configRows.join("")) : ""}
            ${payload.dealershipName ? section("Concession", dealerRows) : ""}
            ${appointmentDate || payload.reservationType ? section("Rendez-vous", appointmentRows) : ""}
            ${section("Références", refRows)}
            <table cellpadding="0" cellspacing="0" style="margin-top:8px;">
              <tr>
                <td style="border-radius:8px;background:#EB0A1E;">
                  <a href="${esc(`${dashboardUrl}/leads`)}" style="display:inline-block;padding:12px 22px;color:#fff;text-decoration:none;font-weight:700;font-size:13px;">
                    Voir dans l'admin →
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 28px;background:#fafafa;border-top:1px solid #eee;color:#999;font-size:11px;">
            Notification automatique — Toyota AI Experience Maroc. Ne pas répondre à cet email.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    headline,
    "",
    `Client: ${fullName}`,
    `Email: ${payload.email}`,
    `Téléphone: ${payload.phone ?? "—"}`,
    `Type: ${TYPE_LABELS[payload.leadType] ?? payload.leadType}`,
    "",
    `Véhicule: ${payload.vehicleName}`,
    payload.dealershipName ? `Concession: ${payload.dealershipName}` : "",
    appointmentDate ? `RDV: ${formatDateFr(appointmentDate)}` : "",
    "",
    `Lead ID: ${payload.leadId}`,
    payload.reservationId ? `Reservation ID: ${payload.reservationId}` : "",
    "",
    `Admin: ${dashboardUrl}/leads`,
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, html, text };
}
