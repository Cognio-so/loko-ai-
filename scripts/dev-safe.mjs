import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const projectRoot = process.cwd();
const devOutputDir = resolve(projectRoot, ".next", "dev");
const envLocalPath = resolve(projectRoot, ".env.local");

function parseEnvLocal(path) {
  if (!existsSync(path)) return {};

  const entries = {};
  const lines = readFileSync(path, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    entries[key] = value;
  }

  return entries;
}

const localEnv = parseEnvLocal(envLocalPath);

// Deleting `.next/dev` can cause transient 500s (missing manifest files) on first requests.
// Only clear it when explicitly requested.
if (process.env.DEV_SAFE_CLEAR === "1" && existsSync(devOutputDir)) {
  rmSync(devOutputDir, { recursive: true, force: true });
  console.log(`[dev-safe] Cleared ${devOutputDir}`);
}

const nextBin = resolve(projectRoot, "node_modules", "next", "dist", "bin", "next");
const child = spawn(
  process.execPath,
  ["--max-old-space-size=4096", nextBin, "dev", "--webpack", "-p", "302"],
  {
    stdio: "inherit",
    env: { ...process.env, ...localEnv },
  }
);

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
