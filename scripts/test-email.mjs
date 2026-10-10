import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");

if (!fs.existsSync(envPath)) {
  console.error("Missing .env.local");
  process.exit(1);
}

for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
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

const user = process.env.GMAIL_USER ?? process.env.SMTP_USER;
const pass = (process.env.GMAIL_APP_PASSWORD ?? process.env.SMTP_PASS ?? "").replace(/\s/g, "");
const to = process.env.ADMIN_NOTIFICATION_EMAIL ?? user;

if (!user || !pass) {
  console.error("GMAIL_USER and GMAIL_APP_PASSWORD required in .env.local");
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT ?? "587"),
  secure: false,
  auth: { user, pass },
});

console.log("Verifying SMTP…");
await transport.verify();
console.log("SMTP OK — sending test to", to);

const info = await transport.sendMail({
  from: process.env.SMTP_FROM ?? `"Toyota Maroc Test" <${user}>`,
  to,
  subject: "[Toyota Maroc] Test notification admin",
  text: "Si vous recevez cet email, les notifications achat / rendez-vous fonctionnent.",
  html: "<p>Si vous recevez cet email, les notifications <strong>achat / rendez-vous</strong> fonctionnent.</p>",
});

console.log("Sent:", info.messageId);
