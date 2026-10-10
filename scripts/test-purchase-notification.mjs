import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const line of fs.readFileSync(path.join(root, ".env.local"), "utf8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  process.env[key] = value;
}

const user = process.env.GMAIL_USER;
const pass = (process.env.GMAIL_APP_PASSWORD ?? "").replace(/\s/g, "");
const to = process.env.ADMIN_NOTIFICATION_EMAIL ?? user;

const subject = "[Toyota Maroc] Achat confirmé — rendez-vous planifié — Karim Test";
const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;padding:24px">
<h1 style="color:#EB0A1E">Achat confirmé — rendez-vous planifié</h1>
<p><strong>Client:</strong> Karim Test</p>
<p><strong>Email:</strong> client@toyota-ma.com</p>
<p><strong>Téléphone:</strong> +212 612 345 678</p>
<p><strong>Véhicule:</strong> Toyota RAV4</p>
<p><strong>Concession:</strong> Toyota Casablanca</p>
<p><strong>RDV:</strong> demain 10:00</p>
<p style="color:#666;font-size:12px">Test notification achat / rendez-vous — Toyota AI Platform</p>
</body></html>`;

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: { user, pass },
});

await transport.verify();
const info = await transport.sendMail({
  from: process.env.SMTP_FROM ?? `"Toyota Maroc" <${user}>`,
  to,
  subject,
  html,
  text: "Test achat confirmé — Karim Test — Toyota RAV4 — Casablanca",
});
console.log("Purchase notification test sent:", info.messageId);
