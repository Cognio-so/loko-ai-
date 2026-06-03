import { spawn } from "child_process";
import path from "path";

export type BuilderCommandResult = {
  command: string;
  exitCode: number | null;
  stdout: string;
  stderr: string;
};

const DEFAULT_TIMEOUT_MS = 120000;
const ALLOWED_COMMANDS = new Set(["npm", "pnpm", "npx"]);
const ALLOWED_NPM_ARGS = new Set(["install", "run", "build", "dev", "test", "lint"]);

function isAllowedCommand(command: string, args: string[]) {
  if (!ALLOWED_COMMANDS.has(command)) return false;

  if (command === "npm" || command === "pnpm") {
    const firstArg = args[0];
    if (!firstArg || !ALLOWED_NPM_ARGS.has(firstArg)) return false;

    if (firstArg === "run") {
      const scriptName = args[1];
      return !!scriptName && ALLOWED_NPM_ARGS.has(scriptName);
    }
  }

  if (command === "npx") {
    return args[0] === "vite" || args[0] === "next";
  }

  return true;
}

function resolveWorkspaceCwd(cwd?: string) {
  const workspaceRoot = path.resolve(process.cwd(), "workspace");
  const relativeCwd = cwd?.replace(/\\/g, "/").replace(/^\/+/, "") || ".";
  const target = path.resolve(workspaceRoot, relativeCwd);

  if (!target.startsWith(workspaceRoot)) {
    throw new Error("Terminal commands may only run inside the workspace directory.");
  }

  return target;
}

export function runBuilderCommand(params: {
  command: string;
  args?: string[];
  cwd?: string;
  timeoutMs?: number;
}): Promise<BuilderCommandResult> {
  const args = params.args ?? [];
  if (!isAllowedCommand(params.command, args)) {
    throw new Error(`Command is not allowed for builder automation: ${params.command} ${args.join(" ")}`);
  }

  const cwd = resolveWorkspaceCwd(params.cwd);
  const displayCommand = [params.command, ...args].join(" ");

  return new Promise((resolve, reject) => {
    const child = spawn(params.command, args, {
      cwd,
      shell: process.platform === "win32",
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error(`Command timed out after ${(params.timeoutMs ?? DEFAULT_TIMEOUT_MS) / 1000}s: ${displayCommand}`));
    }, params.timeoutMs ?? DEFAULT_TIMEOUT_MS);

    child.stdout?.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr?.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (exitCode) => {
      clearTimeout(timeout);
      resolve({
        command: displayCommand,
        exitCode,
        stdout,
        stderr,
      });
    });
  });
}
