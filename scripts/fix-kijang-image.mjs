import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../public/images/vehicles");

const SOURCE_URL =
  "https://content.toyota.com.ph/uploads/vehicles/49/001_49_1687327845800_000.webp";

fs.mkdirSync(outDir, { recursive: true });
const sharp = (await import("sharp")).default;

const res = await fetch(SOURCE_URL, {
  headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
});
if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);

const input = Buffer.from(await res.arrayBuffer());
const meta = await sharp(input).metadata();

const crop = {
  left: Math.round(meta.width * 0.08),
  top: Math.round(meta.height * 0.12),
  width: Math.round(meta.width * 0.84),
  height: Math.round(meta.height * 0.72),
};

const dest = path.join(outDir, "kijang-hero-2.png");
await sharp(input)
  .extract(crop)
  .resize({ width: 1280, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(dest);

console.log("SAVED", dest);
