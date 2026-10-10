import { config } from "dotenv";
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const localPath = path.join(root, ".env.local");

if (!fs.existsSync(localPath)) {
  console.error("Missing .env.local — copy .env.example and fill in your values.");
  process.exit(1);
}

config({ path: localPath });

if (!process.env.DATABASE_URL?.trim()) {
  console.error(
    "DATABASE_URL is empty in .env.local on disk.\n" +
      "If you edited the file in Cursor, press Ctrl+S to save, then run this command again."
  );
  process.exit(1);
}

if (!process.env.DIRECT_URL?.trim()) {
  process.env.DIRECT_URL = process.env.DATABASE_URL;
}

const cmd = process.argv.slice(2).join(" ");
if (!cmd) {
  console.error("Usage: node scripts/run-with-env.mjs <command>");
  process.exit(1);
}

execSync(cmd, { stdio: "inherit", env: process.env, cwd: root });
