import fs from "node:fs";

const pageRes = await fetch("https://toyota.com.ph/zenix", {
  headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
});
const html = await pageRes.text();
const urls = [
  ...new Set([
    ...html.matchAll(
      /https:\/\/content\.toyota\.com\.ph\/uploads\/vehicles\/49\/[^"'\s]+\.(?:webp|png|jpg)/g
    ),
  ].map((m) => m[0])),
].filter((u) => !u.includes("_206x135") && !u.includes("Banner"));

console.log(urls.join("\n"));
