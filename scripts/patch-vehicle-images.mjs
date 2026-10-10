import fs from "node:fs";
import path from "node:path";

const filePath = path.join(process.cwd(), "src/data/vehicles.ts");
let text = fs.readFileSync(filePath, "utf8");

const replacements = [
  ['"/images/vehicles/supra.jpg"', '"/images/vehicles/supra-hero-2.png"'],
  ['"/images/vehicles/rav4.jpg"', '"/images/vehicles/rav4-hero-2.png"'],
  ['"/images/vehicles/yaris.jpg"', '"/images/vehicles/yaris-hero-2.png"'],
  ['"/images/vehicles/corolla.jpg"', '"/images/vehicles/corolla-hero-2.png"'],
  ['"/images/vehicles/camry.jpg"', '"/images/vehicles/camry-hero-2.png"'],
  ['"/images/vehicles/landcruiser.jpg"', '"/images/vehicles/landcruiser-hero-2.png"'],
  ['"/images/vehicles/hilux.jpg"', '"/images/vehicles/hilux-hero-2.png"'],
  ['"/images/vehicles/prius.jpg"', '"/images/vehicles/prius-hero-2.png"'],
  ['"/images/vehicles/chr.jpg"', '"/images/vehicles/chr-hero-2.png"'],
  ['"/images/vehicles/highlander.jpg"', '"/images/vehicles/highlander-hero-2.png"'],
];

for (const [from, to] of replacements) {
  text = text.split(from).join(to);
}

// Granvia, corolla-2, kijang had wrong placeholder jpg paths — set explicitly
text = text.replace(
  /id: "granvia"[\s\S]*?imageUrl: "[^"]+"/m,
  (block) => block.replace(/imageUrl: "[^"]+"/, 'imageUrl: "/images/vehicles/granvia-hero-2.png"')
);
text = text.replace(
  /id: "corolla-2"[\s\S]*?imageUrl: "[^"]+"/m,
  (block) => block.replace(/imageUrl: "[^"]+"/, 'imageUrl: "/images/vehicles/corolla-2-hero-2.png"')
);
text = text.replace(
  /id: "kijang"[\s\S]*?imageUrl: "[^"]+"/m,
  (block) => block.replace(/imageUrl: "[^"]+"/, 'imageUrl: "/images/vehicles/kijang-hero-1.png"')
);

text = text.replace(
  /id: "granvia"[\s\S]*?images: \[([\s\S]*?)\]/m,
  (block) =>
    block.replace(
      /images: \[[\s\S]*?\]/,
      'images: [\n      "/images/vehicles/granvia-hero-2.png",\n      "/images/vehicles/granvia-hero-2.png",\n    ]'
    )
);
text = text.replace(
  /id: "corolla-2"[\s\S]*?images: \[([\s\S]*?)\]/m,
  (block) =>
    block.replace(
      /images: \[[\s\S]*?\]/,
      'images: [\n      "/images/vehicles/corolla-2-hero-2.png",\n      "/images/vehicles/corolla-2-hero-2.png",\n    ]'
    )
);
text = text.replace(
  /id: "kijang"[\s\S]*?images: \[([\s\S]*?)\]/m,
  (block) =>
    block.replace(
      /images: \[[\s\S]*?\]/,
      'images: [\n      "/images/vehicles/kijang-hero-1.png",\n      "/images/vehicles/rav4-hero-2.png",\n    ]'
    )
);

fs.writeFileSync(filePath, text, "utf8");
console.log("Updated vehicle hero images");
