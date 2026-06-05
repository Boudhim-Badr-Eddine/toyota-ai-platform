import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // Warn when unicode escapes are used in JSX — use literal UTF-8 chars instead
      "no-unicode-codepoint-escapes": "off", // not a standard rule name, use below
      "no-useless-escape": "warn",
    },
  },
]);

export default eslintConfig;
