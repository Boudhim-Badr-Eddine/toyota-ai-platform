import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const localPath = path.join(root, ".env.local");
const envPath = path.join(root, ".env");

if (!fs.existsSync(localPath)) {
  console.error("Missing .env.local — copy .env.example and fill in your values.");
  process.exit(1);
}

fs.copyFileSync(localPath, envPath);

let content = fs.readFileSync(envPath, "utf8");
const readVar = (name) => {
  const match = content.match(new RegExp(`^${name}="([^"]*)"`, "m"));
  return match?.[1]?.trim() ?? "";
};

const databaseUrl = readVar("DATABASE_URL");
const directUrl = readVar("DIRECT_URL");

if (databaseUrl && !directUrl) {
  content = content.replace(/^DIRECT_URL=""/m, `DIRECT_URL="${databaseUrl}"`);
  fs.writeFileSync(envPath, content, "utf8");
  console.log("Filled DIRECT_URL from DATABASE_URL for Prisma CLI");
}

console.log("Synced .env.local → .env for Prisma CLI");
