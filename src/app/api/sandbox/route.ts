import { NextResponse } from "next/server";
import { Sandbox } from "e2b";
import { supabaseUpdateProject } from "@/lib/supabase/projects";
import { guarded, preflightResponse, readJsonBody } from "@/lib/security";

const PROJECT_DIR = "/home/user/project";
const VITE_PORT = 5173;

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
        const previewUrl = `https://${updateSandbox.getHost(VITE_PORT)}`;
        return NextResponse.json({ sandboxId, previewUrl, isNew: false });
      }
    } catch {
      // Sandbox expired or not found — fall through to full create below
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
      } else {
        throw new Error("Sandbox is not running");
      }
    } catch {
      // Sandbox expired or not found — create a new one
      sandbox = await Sandbox.create({ apiKey, timeoutMs });
      isNewSandbox = true;
    }
  } else {
    sandbox = await Sandbox.create({ apiKey, timeoutMs });
    isNewSandbox = true;
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
    await sandbox.commands.run(
      `mkdir -p ${PROJECT_DIR}/src/components ${PROJECT_DIR}/src/pages ${PROJECT_DIR}/src/lib`,
      { timeoutMs: 10000 }
    );

    // Write all project files, then forcibly overwrite vite.config.ts so the
    // E2B-compatible server config is always in place.
    await Promise.all(
      files.map((file) =>
        sandbox.files.write(`${PROJECT_DIR}/${file.path}`, file.content)
      )
    );

    // Always overwrite vite.config — regardless of what the AI generated
    await sandbox.files.write(`${PROJECT_DIR}/vite.config.ts`, E2B_VITE_CONFIG);

    if (isNewSandbox) {
      // ── Fresh sandbox: install deps and start Vite ───────────────────────────
      // Ensure Node.js is available (E2B base image has it, but verify)
      await sandbox.commands.run(
        `command -v node || (curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs)`,
        { timeoutMs: 90000 }
      );

      // npm install (with cache-friendly flags)
      const installResult = await sandbox.commands.run(
        `cd ${PROJECT_DIR} && npm install --prefer-offline --no-audit --no-fund`,
        { timeoutMs: 120000 }
      );

      if (installResult.exitCode !== 0) {
        console.error("npm install failed:", installResult.stderr);
      }

      // Start Vite dev server as a background process (persists in sandbox)
      await sandbox.commands.run(
        `cd ${PROJECT_DIR} && npx vite --host 0.0.0.0 --port ${VITE_PORT} > /tmp/vite.log 2>&1`,
        { background: true }
      );

      // Wait for Vite to respond (up to ~40s)
      const ready = await waitForVite(sandbox);
      if (!ready) {
        try {
          const log = await sandbox.commands.run("tail -20 /tmp/vite.log", { timeoutMs: 5000 });
          console.warn("Vite not ready. Log:\n", log.stdout);
        } catch { /* ignore */ }
        // Vite failed to start — return without a previewUrl so the client
        // falls back to the self-contained HTML preview instead of showing
        // the E2B "Closed Port Error" page.
        if (projectId) {
          try { await supabaseUpdateProject(projectId, { sandbox_id: sandbox.sandboxId }); } catch { /* ignore */ }
        }
        return NextResponse.json({ sandboxId: sandbox.sandboxId, previewUrl: null, isNew: true });
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
        viteReadyForReconnect = await waitForVite(sandbox);
        if (!viteReadyForReconnect) {
          // Log for debugging
          try {
            const log = await sandbox.commands.run("tail -20 /tmp/vite.log", { timeoutMs: 5000 });
            console.warn("Vite (reconnect) not ready. Log:\n", log.stdout);
          } catch { /* ignore */ }
        }
      } catch {
        viteReadyForReconnect = false;
      }
    }

    // Only hand back a live URL if Vite is confirmed running.
    // Otherwise fall back gracefully — the client will render the HTML preview.
    if (!isNewSandbox && !viteReadyForReconnect) {
      if (projectId) {
        try { await supabaseUpdateProject(projectId, { sandbox_id: sandbox.sandboxId }); } catch { /* ignore */ }
      }
      return NextResponse.json({ sandboxId: sandbox.sandboxId, previewUrl: null, isNew: false });
    }

    const previewUrl = `https://${sandbox.getHost(VITE_PORT)}`;

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
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("E2B sandbox error:", message);

    // Kill the (likely broken) fresh sandbox
    if (isNewSandbox) {
      try { await sandbox.kill(); } catch { /* ignore */ }
    }

    return NextResponse.json(
      { error: `Sandbox error: ${message}` },
      { status: 500 }
    );
  }
}

export const POST = guarded(handlePost, 8);
export const OPTIONS = preflightResponse;
