import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../public/images/vehicles");

// Full exterior shot — NOT dashboard/interior (5990 = dashboard, avoid)
const EXTERIOR_CANDIDATES = [
  "https://content.toyota.com.ph/uploads/vehicles/49/001_49_1687327846121_000.webp",
  "https://content.toyota.com.ph/uploads/vehicles/49/001_49_1687327845800_000.webp",
  "https://content.toyota.com.ph/uploads/vehicles/49/001_49_1687327846277_000.webp",
  "https://content.toyota.com.ph/uploads/vehicles/49/001_49_1687327846390_000.webp",
  "https://content.toyota.com.ph/uploads/vehicles/49/001_49_1687327747693_000.webp",
];

fs.mkdirSync(outDir, { recursive: true });

// Scrape zenix page for more gallery URLs
const pageRes = await fetch("https://toyota.com.ph/zenix", {
  headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
});
const html = await pageRes.text();
const scraped = [
  ...html.matchAll(
    /https:\/\/content\.toyota\.com\.ph\/uploads\/vehicles\/49\/[^"'\s]+\.(?:webp|png|jpg)/g
  ),
].map((m) => m[0]);

const allUrls = [...new Set([...EXTERIOR_CANDIDATES, ...scraped])].filter(
  (u) => !u.includes("_206x135") && !u.includes("Banner")
);

console.log("Trying", allUrls.length, "URLs...");

for (const url of allUrls) {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  });
  if (!res.ok) {
    console.log("SKIP", res.status, url.slice(-40));
    continue;
  }
  const buf = Buffer.from(await res.arrayBuffer());
  // Skip tiny thumbnails (< 80KB likely dashboard/detail crops)
  if (buf.length < 80000) {
    console.log("SKIP small", buf.length, url.slice(-40));
    continue;
  }
  const ext = url.includes(".png") ? "png" : "webp";
  const dest = path.join(outDir, `kijang-hero-2.${ext}`);
  fs.writeFileSync(dest, buf);
  console.log("SAVED", dest, buf.length, "bytes from", url);
  break;
}
