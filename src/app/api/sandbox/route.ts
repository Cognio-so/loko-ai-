import { NextResponse } from "next/server";
import { Sandbox } from "e2b";
import { supabaseUpdateProject } from "@/lib/supabase/projects";
import { guarded, preflightResponse, readJsonBody } from "@/lib/security";

const PROJECT_DIR = "/home/user/project";
const VITE_PORT = 5173;

type SandboxWorkflowLog = {
  label: string;
  detail: string;
  command?: string;
  output?: string[];
  status: "running" | "completed" | "error";
};

function getSandboxTimeoutMs(): number {
  const minutes = parseInt(process.env.E2B_SANDBOX_TIMEOUT_MINUTES || "10", 10);
  return Math.max(2, minutes) * 60 * 1000;
}

/** Detect if the generated files include a real React/Vite project */
function hasReactProject(files: Array<{ path: string; content: string }>): boolean {
  return files.some(
    (f) => f.path === "src/App.tsx" || f.path === "src/app.tsx"
  );
}

/** Poll until HTTP 200 on localhost:VITE_PORT inside the sandbox, or give up. */
async function waitForVite(sandbox: Sandbox, maxAttempts = 20): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    try {
      const result = await sandbox.commands.run(
        `curl -s -o /dev/null -w "%{http_code}" http://localhost:${VITE_PORT} || echo "fail"`,
        { timeoutMs: 5000 }
      );
      const code = (result.stdout ?? "").trim();
      if (code === "200" || code === "304") return true;
    } catch {
      // keep polling
    }
  }
  return false;
}

async function handlePost(req: Request) {
  const apiKey = process.env.E2B_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "E2B_API_KEY is not configured" },
      { status: 500 }
    );
  }

  let body: {
    files?: Array<{ path: string; content: string }>;
    sandboxId?: string;
    projectId?: string;
    mode?: "create" | "update";
  };

  try {
    body = await readJsonBody<typeof body>(req, 2_000_000);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { files = [], sandboxId, projectId, mode = "create" } = body;
  const workflowLogs: SandboxWorkflowLog[] = [];

  // Only accept projects that have a real React/Vite structure
  if (!hasReactProject(files)) {
    return NextResponse.json(
      { error: "No React project files found (src/App.tsx missing)" },
      { status: 400 }
    );
  }

  // ── "update" mode: write files to existing sandbox, let HMR reload ──────────
  // No npm install, no Vite restart — just overwrite source files in place.
  if (mode === "update" && sandboxId) {
    try {
      workflowLogs.push({
        label: "Connecting to existing sandbox",
        detail: "Reusing the current live preview container for hot updates.",
        command: "$ sandbox.connect --reuse",
        status: "completed",
      });
      const updateSandbox = await Sandbox.connect(sandboxId, { apiKey });
      const running = await updateSandbox.isRunning();
      if (running) {
        // Write source files — skip vite.config.ts and preview.html
        // (HMR doesn't need config restart; preview.html is dashboard-only)
        await Promise.all(
          files
            .filter((f) => f.path !== "vite.config.ts" && f.path !== "preview.html")
            .map((f) =>
              updateSandbox.files.write(`${PROJECT_DIR}/${f.path}`, f.content)
            )
        );
        workflowLogs.push({
          label: "Updated project files",
          detail: `Applied ${files.length} file updates to the running sandbox.`,
          command: "$ fs.write --hmr",
          output: files.slice(0, 12).map((file) => file.path),
          status: "completed",
        });
        const previewUrl = `https://${updateSandbox.getHost(VITE_PORT)}`;
        return NextResponse.json({ sandboxId, previewUrl, isNew: false, logs: workflowLogs });
      }
    } catch {
      // Sandbox expired or not found — fall through to full create below
      workflowLogs.push({
        label: "Sandbox reuse failed",
        detail: "Existing sandbox was unavailable, so Loko AI is provisioning a fresh one.",
        command: "$ sandbox.connect --reuse",
        status: "error",
      });
    }
  }

  const timeoutMs = getSandboxTimeoutMs();
  let sandbox: Sandbox;
  let isNewSandbox = true;

  // ── Try reconnecting to an existing sandbox ──────────────────────────────────
  if (sandboxId) {
    try {
      sandbox = await Sandbox.connect(sandboxId, { apiKey });
      const running = await sandbox.isRunning();
      if (running) {
        isNewSandbox = false;
        workflowLogs.push({
          label: "Connected to sandbox",
          detail: "Existing sandbox is running and ready for the next operation.",
          command: "$ sandbox.connect",
          status: "completed",
        });
      } else {
        throw new Error("Sandbox is not running");
      }
    } catch {
      // Sandbox expired or not found — create a new one
      sandbox = await Sandbox.create({ apiKey, timeoutMs });
      isNewSandbox = true;
      workflowLogs.push({
        label: "Created sandbox",
        detail: "Provisioned a fresh isolated runtime for the generated project.",
        command: "$ sandbox.create",
        status: "completed",
      });
    }
  } else {
    sandbox = await Sandbox.create({ apiKey, timeoutMs });
    isNewSandbox = true;
    workflowLogs.push({
      label: "Created sandbox",
      detail: "Provisioned a fresh isolated runtime for the generated project.",
      command: "$ sandbox.create",
      status: "completed",
    });
  }

  // ── Vite config that always allows E2B's proxy host ──────────────────────────
  // Vite 5.4+ blocks unknown hosts by default. The E2B URL
  // (e.g. 5173-xxxx.e2b.app) is not in Vite's allowedHosts, so it returns
  // "Blocked request."
  //
  // IMPORTANT: Vite 5.4+ requires boolean `true` (not the string 'all') to
  // allow all hosts. The string 'all' is silently ignored and leaves the
  // security restriction active, which is why the iframe shows "Blocked request".
  const E2B_VITE_CONFIG = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: ${VITE_PORT},
    allowedHosts: true,
    strictPort: true,
    cors: true,
    hmr: {
      clientPort: 443,
      protocol: 'wss',
    },
  },
})
`;

  try {
    // ── Write project files ──────────────────────────────────────────────────
    // Ensure directory structure exists
    const mkdirResult = await sandbox.commands.run(
      `mkdir -p ${PROJECT_DIR}/src/components ${PROJECT_DIR}/src/pages ${PROJECT_DIR}/src/lib`,
      { timeoutMs: 10000 }
    );
    workflowLogs.push({
      label: "Prepared workspace directories",
      detail: "Created the project folder structure inside the sandbox.",
      command: `mkdir -p ${PROJECT_DIR}/src/components ${PROJECT_DIR}/src/pages ${PROJECT_DIR}/src/lib`,
      output: [mkdirResult.stdout, mkdirResult.stderr].filter(Boolean),
      status: "completed",
    });

    // Write all project files, then forcibly overwrite vite.config.ts so the
    // E2B-compatible server config is always in place.
    await Promise.all(
      files.map((file) =>
        sandbox.files.write(`${PROJECT_DIR}/${file.path}`, file.content)
      )
    );
    workflowLogs.push({
      label: "Wrote generated source files",
      detail: `Copied ${files.length} generated files into the sandbox workspace.`,
      command: "$ fs.write --batch",
      output: files.slice(0, 16).map((file) => file.path),
      status: "completed",
    });

    // Always overwrite vite.config — regardless of what the AI generated
    await sandbox.files.write(`${PROJECT_DIR}/vite.config.ts`, E2B_VITE_CONFIG);
    workflowLogs.push({
      label: "Injected Vite preview config",
      detail: "Applied runtime-safe Vite settings for the live preview host.",
      command: "$ fs.write vite.config.ts",
      status: "completed",
    });

    if (isNewSandbox) {
      // ── Fresh sandbox: install deps and start Vite ───────────────────────────
      // Ensure Node.js is available (E2B base image has it, but verify)
      const nodeCheckResult = await sandbox.commands.run(
        `command -v node || (curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs)`,
        { timeoutMs: 90000 }
      );
      workflowLogs.push({
        label: "Verified Node.js runtime",
        detail: "Confirmed the JavaScript runtime is available inside the sandbox.",
        command: "command -v node",
        output: [nodeCheckResult.stdout, nodeCheckResult.stderr].filter(Boolean),
        status: "completed",
      });

      // npm install (with cache-friendly flags)
      const installResult = await sandbox.commands.run(
        `cd ${PROJECT_DIR} && npm install --prefer-offline --no-audit --no-fund`,
        { timeoutMs: 120000 }
      );
      workflowLogs.push({
        label: "Installed project dependencies",
        detail: installResult.exitCode === 0 ? "npm install completed successfully." : "npm install reported issues; Loko AI still attempted to continue.",
        command: `cd ${PROJECT_DIR} && npm install --prefer-offline --no-audit --no-fund`,
        output: [installResult.stdout, installResult.stderr].filter(Boolean).flatMap((chunk) => chunk.split("\n").filter(Boolean).slice(-8)),
        status: installResult.exitCode === 0 ? "completed" : "error",
      });

      if (installResult.exitCode !== 0) {
        console.error("npm install failed:", installResult.stderr);
      }

      // Start Vite dev server as a background process (persists in sandbox)
      await sandbox.commands.run(
        `cd ${PROJECT_DIR} && npx vite --host 0.0.0.0 --port ${VITE_PORT} > /tmp/vite.log 2>&1`,
        { background: true }
      );
      workflowLogs.push({
        label: "Started Vite dev server",
        detail: "Booting the live development server for the generated project.",
        command: `cd ${PROJECT_DIR} && npx vite --host 0.0.0.0 --port ${VITE_PORT}`,
        status: "completed",
      });

      // Wait for Vite to respond (up to ~40s)
      const ready = await waitForVite(sandbox);
      if (!ready) {
        try {
          const log = await sandbox.commands.run("tail -20 /tmp/vite.log", { timeoutMs: 5000 });
          console.warn("Vite not ready. Log:\n", log.stdout);
          workflowLogs.push({
            label: "Preview startup logs",
            detail: "Captured the latest Vite log output after a delayed startup.",
            command: "tail -20 /tmp/vite.log",
            output: [log.stdout, log.stderr].filter(Boolean).flatMap((chunk) => chunk.split("\n").filter(Boolean).slice(-20)),
            status: "error",
          });
        } catch { /* ignore */ }
        // Vite failed to start — return without a previewUrl so the client
        // falls back to the self-contained HTML preview instead of showing
        // the E2B "Closed Port Error" page.
        if (projectId) {
          try { await supabaseUpdateProject(projectId, { sandbox_id: sandbox.sandboxId }); } catch { /* ignore */ }
        }
        return NextResponse.json({ sandboxId: sandbox.sandboxId, previewUrl: null, isNew: true, logs: workflowLogs });
      }
    }
    // For reconnected sandboxes: restart Vite to pick up updated vite.config.ts
    // (HMR only watches source files, not config changes)
    let viteReadyForReconnect = true;
    if (!isNewSandbox) {
      try {
        // Kill all Vite processes — try multiple signal strategies
        await sandbox.commands.run(
          [
            `pkill -KILL -f "vite" 2>/dev/null || true`,
            `pkill -KILL -f "node.*vite" 2>/dev/null || true`,
            `fuser -k ${VITE_PORT}/tcp 2>/dev/null || true`,
          ].join("; "),
          { timeoutMs: 8000 }
        );
        // Give the OS time to release the port
        await new Promise<void>((r) => setTimeout(r, 2000));
        await sandbox.commands.run(
          `cd ${PROJECT_DIR} && npx vite --host 0.0.0.0 --port ${VITE_PORT} > /tmp/vite.log 2>&1`,
          { background: true }
        );
        workflowLogs.push({
          label: "Restarted Vite dev server",
          detail: "Reloading the preview server so config changes take effect.",
          command: `cd ${PROJECT_DIR} && npx vite --host 0.0.0.0 --port ${VITE_PORT}`,
          status: "completed",
        });
        viteReadyForReconnect = await waitForVite(sandbox);
        if (!viteReadyForReconnect) {
          // Log for debugging
          try {
            const log = await sandbox.commands.run("tail -20 /tmp/vite.log", { timeoutMs: 5000 });
            console.warn("Vite (reconnect) not ready. Log:\n", log.stdout);
            workflowLogs.push({
              label: "Reconnect preview logs",
              detail: "Captured Vite output while trying to restore the preview.",
              command: "tail -20 /tmp/vite.log",
              output: [log.stdout, log.stderr].filter(Boolean).flatMap((chunk) => chunk.split("\n").filter(Boolean).slice(-20)),
              status: "error",
            });
          } catch { /* ignore */ }
        }
      } catch {
        viteReadyForReconnect = false;
        workflowLogs.push({
          label: "Vite restart failed",
          detail: "The preview server could not be restarted on the reused sandbox.",
          command: "$ vite.restart",
          status: "error",
        });
      }
    }

    // Only hand back a live URL if Vite is confirmed running.
    // Otherwise fall back gracefully — the client will render the HTML preview.
    if (!isNewSandbox && !viteReadyForReconnect) {
      if (projectId) {
        try { await supabaseUpdateProject(projectId, { sandbox_id: sandbox.sandboxId }); } catch { /* ignore */ }
      }
      return NextResponse.json({ sandboxId: sandbox.sandboxId, previewUrl: null, isNew: false, logs: workflowLogs });
    }

    const previewUrl = `https://${sandbox.getHost(VITE_PORT)}`;
    workflowLogs.push({
      label: "Live preview ready",
      detail: "The development server responded successfully and the preview URL is active.",
      command: "$ preview.open",
      output: [previewUrl],
      status: "completed",
    });

    // Persist the sandbox_id to the project so it can be revived on next visit
    if (projectId) {
      try {
        await supabaseUpdateProject(projectId, { sandbox_id: sandbox.sandboxId });
      } catch (e) {
        console.warn("Failed to save sandbox_id to project:", e);
      }
    }

    return NextResponse.json({
      sandboxId: sandbox.sandboxId,
      previewUrl,
      isNew: isNewSandbox,
      logs: workflowLogs,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("E2B sandbox error:", message);

    // Kill the (likely broken) fresh sandbox
    if (isNewSandbox) {
      try { await sandbox.kill(); } catch { /* ignore */ }
    }

    return NextResponse.json(
      { error: `Sandbox error: ${message}`, logs: workflowLogs },
      { status: 500 }
    );
  }
}

export const POST = guarded(handlePost, 8);
export const OPTIONS = preflightResponse;
