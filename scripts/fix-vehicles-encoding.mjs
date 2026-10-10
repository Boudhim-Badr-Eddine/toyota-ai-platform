import fs from "node:fs";
import path from "node:path";

const filePath = path.join(process.cwd(), "src/data/vehicles.ts");
let text = fs.readFileSync(filePath, "utf8");

const replacements = [
  ["ÔöÇ", "─"],
  ["ÔÇö", "—"],
  ["ÔÇô", "–"],
  ["├®", "é"],
  ["├á", "à"],
  ["├¿", "è"],
  ["├®", "é"],
  ["├ë", "É"],
  ["├¬", "ê"],
  ["├«", "î"],
  ["├â", "â"],
  ["├┤", "ô"],
  ["├╗", "û"],
  ["├º", "ç"],
  ["├╣", "ù"],
  ["├╢", "ö"],
  ["├╡", "õ"],
  ["┬░", "°"],
  ["┬½", "«"],
  ["┬╗", "»"],
];

for (const [from, to] of replacements) {
  text = text.split(from).join(to);
}

fs.writeFileSync(filePath, text, "utf8");
console.log("Fixed mojibake in src/data/vehicles.ts");
