import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../public/images/vehicles");

const heroSize = (url) => {
  const base = url.split("?")[0];
  return `${base}?fmt=png-alpha&wid=1280&hei=800&qlt=90`;
};

const VEHICLE_IMAGES = {
  supra: [
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/grsupra//2376/d12/36/5.png?fmt=png-alpha&wid=930&qlt=90",
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/grsupra/3-0/2372/d13/1.png?fmt=png-alpha&wid=930&qlt=90",
  ],
  rav4: [
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/rav4//4530/m22/36/3.png?fmt=png-alpha&wid=930&qlt=90",
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/rav4/le/4521/4v8/1.png?fmt=png-alpha&wid=930&qlt=90",
  ],
  yaris: [
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/corollacross//6305/089/36/5.png?fmt=png-alpha&wid=930&qlt=90",
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/corollacross/l/6301/089/1.png?fmt=png-alpha&wid=930&qlt=90",
  ],
  corolla: [
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/corolla//1866/1k3/36/5.png?fmt=png-alpha&wid=930&qlt=90",
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/corolla/le/1852/1k3/1.png?fmt=png-alpha&wid=930&qlt=90",
  ],
  camry: [
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/camry//2558/3u5/36/5.png?fmt=png-alpha&wid=930&qlt=90",
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/camry/le/2559/3u5/1.png?fmt=png-alpha&wid=930&qlt=90",
  ],
  landcruiser: [
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2027/landcruiser//6167/8x0/18/3.png?fmt=png-alpha&wid=930&qlt=90",
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2027/landcruiser/landcruiser1958/6165/229/1.png?fmt=png-alpha&wid=930&qlt=90",
  ],
  hilux: [
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/tacoma//7598/m73/36/5.png?fmt=png-alpha&wid=930&qlt=90",
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/tacoma/sr/7162/040/1.png?fmt=png-alpha&wid=930&qlt=90",
  ],
  prius: [
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/prius//1266/5c5/36/5.png?fmt=png-alpha&wid=930&qlt=90",
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/prius/le/1223/3u5/1.png?fmt=png-alpha&wid=930&qlt=90",
  ],
  chr: [
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/c-hr//2419/m67/36/5.png?fmt=png-alpha&wid=930&qlt=90",
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/c-hr/se/2416/6y1/1.png?fmt=png-alpha&wid=930&qlt=90",
  ],
  highlander: [
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/highlander//6959/3t3/36/5.png?fmt=png-alpha&wid=930&qlt=90",
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/highlander/xle/6953/3t3/1.png?fmt=png-alpha&wid=930&qlt=90",
  ],
  granvia: [
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/sienna//5409/1h5/36/5.png?fmt=png-alpha&wid=930&qlt=90",
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/sienna/le/5402/3t3/1.png?fmt=png-alpha&wid=930&qlt=90",
  ],
  "corolla-2": [
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/corolla//1866/1k3/36/5.png?fmt=png-alpha&wid=930&qlt=90",
    "https://tmna.aemassets.toyota.com/is/image/toyota/toyota/jellies/max/2026/corolla/le/1852/1k3/1.png?fmt=png-alpha&wid=930&qlt=90",
  ],
  kijang: [
    "https://content.toyota.com.ph/uploads/vehicles/49/001_49_1687327845800_000.webp",
  ],
};

fs.mkdirSync(outDir, { recursive: true });

for (const [id, urls] of Object.entries(VEHICLE_IMAGES)) {
  for (let i = 0; i < urls.length; i++) {
    const url = heroSize(urls[i]);
    const dest = path.join(outDir, `${id}-hero-${i + 1}.png`);
    const res = await fetch(url, {
      headers: {
        Referer: "https://www.toyota.com/",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (!res.ok) {
      console.error(`FAIL ${id} #${i + 1}: ${res.status}`);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    console.log(`OK ${dest} (${buf.length} bytes)`);
  }
}
