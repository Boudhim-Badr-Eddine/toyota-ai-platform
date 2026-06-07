import { spawnSync } from "node:child_process";

process.env.TS_NODE_COMPILER_OPTIONS = JSON.stringify({
  module: "CommonJS",
  moduleResolution: "node",
});

const result = spawnSync(
  process.execPath,
  ["--require", "ts-node/register/transpile-only", "--test", "tests/smoke.test.ts"],
  { stdio: "inherit", shell: false }
);

process.exit(result.status ?? 1);
