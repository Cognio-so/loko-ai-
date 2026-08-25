import { getOpenRouterConfig } from "@/lib/openrouterConfig";
import { getLocalGeneratedProject } from "@/lib/localGeneratedProject";

const MAX_RETRIES = 2;
const RETRYABLE_STATUS_CODES = new Set([408, 409, 425, 429, 500, 502, 503, 504]);
const REQUEST_TIMEOUT_MS = 90000;

type OpenRouterResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stripJsonFences(text: string) {
  return text
    .replace(/```json\s*/i, "```")
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

function toTitleFromPrompt(prompt: string) {
  const cleaned = prompt
    .replace(/[^a-z0-9\s-_]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "Generated Website";

  const words = cleaned.split(" ").slice(0, 4);
  const titled = words
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return titled;
}

export function getOfflineGeneratedProject(userPrompt: string) {
  return getLocalGeneratedProject(userPrompt);

  const projectTitle = toTitleFromPrompt(userPrompt);
  const description = userPrompt.trim() || "Offline generated starter";

  const previewHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${projectTitle}</title>
    <style>
      :root{color-scheme:light}
      *{box-sizing:border-box}
      body{margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial; background: radial-gradient(1200px 800px at 20% 10%, #dbeafe, #ffffff); color:#0f172a;}
      .wrap{max-width:1100px;margin:0 auto;padding:48px 20px 64px}
      .card{background:rgba(255,255,255,.7);backdrop-filter:blur(10px);border:1px solid rgba(15,23,42,.08);border-radius:24px;box-shadow:0 20px 60px rgba(15,23,42,.08);padding:28px}
      .grid{display:grid;grid-template-columns:1.2fr .8fr;gap:22px;align-items:start}
      h1{margin:0 0 10px;font-size:42px;letter-spacing:-.03em}
      p{margin:0 0 16px;line-height:1.6;color:#334155}
      .pill{display:inline-flex;gap:8px;align-items:center;padding:10px 14px;border-radius:999px;background:rgba(14,165,233,.10);border:1px solid rgba(14,165,233,.25);color:#0369a1;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.12em}
      .btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}
      .btn{border:0;border-radius:14px;padding:12px 14px;font-weight:800;cursor:pointer}
      .primary{background:#0ea5e9;color:white}
      .secondary{background:white;border:1px solid rgba(15,23,42,.12);color:#0f172a}
      .list{display:grid;gap:10px;margin-top:14px}
      .item{padding:12px 14px;border-radius:16px;background:white;border:1px solid rgba(15,23,42,.08)}
      .muted{font-size:12px;color:#64748b}
      @media (max-width:900px){.grid{grid-template-columns:1fr}}
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="pill">Offline Mode � No API key</div>
      <div style="height:14px"></div>
      <div class="card">
        <div class="grid">
          <div>
            <h1>${projectTitle}</h1>
            <p>${description}</p>
            <div class="btns">
              <button class="btn primary" onclick="alert('Next step: connect an API when ready')">Generate Pages</button>
              <button class="btn secondary" onclick="alert('This is a local offline preview')">Preview</button>
            </div>
            <div class="list">
              <div class="item"><strong>Hero</strong><div class="muted">Headline + CTA ready</div></div>
              <div class="item"><strong>Sections</strong><div class="muted">Features, testimonials, pricing</div></div>
              <div class="item"><strong>Export</strong><div class="muted">Save files into generated/</div></div>
            </div>
          </div>
          <div class="item">
            <strong>Offline Mode</strong>
            <div class="muted" style="margin-top:8px">LokoAI is generating a starter template locally. Add an AI provider key to enable AI generation.</div>
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`;

  return {
    projectTitle,
    workflowLogs: [
      { agent: "Product Manager", action: "Offline: outlining structure..." },
      { agent: "UI/UX Designer", action: "Offline: choosing a clean style..." },
      { agent: "Lead Developer", action: "Offline: generating starter files..." },
      { agent: "QA Tester", action: "Offline: sanity checks..." },
    ],
    pmSpecs: `Offline mode: basic structure for "${projectTitle}"`,
    designSpecs: "Light, modern, glassy card layout",    files: [
      {
        path: "app/layout.tsx",
        content: `import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui" }}>{children}</body>
    </html>
  );
}
`,
      },
      {
        path: "components/navbar.tsx",
        content: `export default function Navbar() {
  return (
    <header style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 18px",
      borderBottom: "1px solid rgba(15,23,42,0.08)",
      position: "sticky",
      top: 0,
      background: "rgba(255,255,255,0.85)",
      backdropFilter: "blur(10px)",
    }}>
      <div style={{ fontWeight: 900 }}>${projectTitle.replace(/\"/g, "")}</div>
      <nav style={{ display: "flex", gap: 12, fontSize: 13, fontWeight: 800 }}>
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <a href="#faq">FAQ</a>
      </nav>
    </header>
  );
}
`,
      },
      {
        path: "components/sidebar.tsx",
        content: `export default function Sidebar() {
  const items = ["Overview", "Orders", "Menu", "Customers", "Settings"];
  return (
    <aside style={{
      width: 260,
      padding: 16,
      borderRight: "1px solid rgba(15,23,42,0.08)",
      background: "rgba(255,255,255,0.7)",
      backdropFilter: "blur(10px)",
    }}>
      <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: 1.5, opacity: 0.6 }}>DASHBOARD</div>
      <div style={{ height: 10 }} />
      <div style={{ display: "grid", gap: 8 }}>
        {items.map((label) => (
          <div key={label} style={{
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(15,23,42,0.08)",
            background: "white",
            fontSize: 13,
            fontWeight: 800,
          }}>
            {label}
          </div>
        ))}
      </div>
    </aside>
  );
}
`,
      },
      {
        path: "app/page.tsx",
        content: `import Navbar from "../components/navbar";

export default function Page() {
  return (
    <div>
      <Navbar />
      <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
        <div style={{
          padding: 22,
          borderRadius: 20,
          border: "1px solid rgba(15,23,42,0.08)",
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(10px)",
        }}>
          <h1 style={{ margin: 0, fontSize: 42, letterSpacing: "-0.03em" }}>${projectTitle.replace(/\"/g, "")}</h1>
          <p style={{ marginTop: 10, lineHeight: 1.6, opacity: 0.8 }}>${description.replace(/\"/g, "")}</p>
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="/dashboard" style={{
              padding: "12px 14px",
              borderRadius: 14,
              background: "#0ea5e9",
              color: "white",
              fontWeight: 900,
              textDecoration: "none",
            }}>Open Dashboard</a>
            <a href="#features" style={{
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid rgba(15,23,42,0.12)",
              background: "white",
              color: "#0f172a",
              fontWeight: 900,
              textDecoration: "none",
            }}>See Features</a>
          </div>
        </div>

        <section id="features" style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {["Beautiful UI", "Fast setup", "Easy editing", "Ready preview"].map((t) => (
            <div key={t} style={{ padding: 16, borderRadius: 18, border: "1px solid rgba(15,23,42,0.08)", background: "white" }}>
              <div style={{ fontWeight: 900 }}>{t}</div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.7 }}>Offline starter file � replace with AI output when API is ready.</div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
`,
      },
      {
        path: "app/dashboard/page.tsx",
        content: `import Sidebar from "../../components/sidebar";
import Navbar from "../../components/navbar";

export default function DashboardPage() {
  return (
    <div>
      <Navbar />
      <div style={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: 18 }}>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>Dashboard</h2>
          <p style={{ marginTop: 8, opacity: 0.75 }}>This is a starter dashboard generated in offline mode.</p>
          <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
            {["Revenue", "Orders", "Customers", "Conversion"].map((k) => (
              <div key={k} style={{ padding: 16, borderRadius: 18, border: "1px solid rgba(15,23,42,0.08)", background: "white" }}>
                <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.6 }}>{k.toUpperCase()}</div>
                <div style={{ marginTop: 6, fontSize: 24, fontWeight: 900 }}>{Math.floor(Math.random() * 900 + 100)}</div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
`,
      },
      {
        path: "lib/auth.ts",
        content: `export type SessionUser = { id: string; email: string };

export function isAuthenticated(): boolean {
  // Offline mode stub. Replace with Supabase/auth provider when ready.
  return true;
}
`,
      },
      {
        path: "app/api/health/route.ts",
        content: `export async function GET() {
  return Response.json({ ok: true });
}
`,
      },
      {
        path: "supabase/schema.sql",
        content: `-- Offline starter schema
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  title text not null,
  description text,
  generated_code jsonb default '[]'::jsonb,
  preview_url text,
  created_at timestamptz default now()
);
`,
      },
    ],    previewHtml,
  };
}

async function requestOpenRouter(
  apiKey: string,
  chatCompletionsUrl: string,
  model: string,
  systemPrompt: string,
  userPrompt: string
) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(chatCompletionsUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:302",
        "X-OpenRouter-Title": "LokoAI",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 32000,
      }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    const data = (await response.json()) as OpenRouterResponse;

    if (response.ok) {
      return data;
    }

    const isRetryable = RETRYABLE_STATUS_CODES.has(response.status);
    if (!isRetryable || attempt === MAX_RETRIES) {
      throw new Error(
        `OpenRouter request failed (${response.status}) with model "${model}": ${
          data.error?.message || response.statusText
        }`
      );
    }

    await delay(800 * (attempt + 1));
  }

  throw new Error(`OpenRouter request failed with model "${model}" after retries.`);
}

export async function getOpenRouterResponse(
  systemPrompt: string,
  userPrompt: string,
  isJson: boolean = false,
  useFreeModel: boolean = false
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const { chatCompletionsUrl, model, generateModel } = getOpenRouterConfig();
  const selectedModel = isJson ? generateModel : model;

  // If key is missing, fall back to offline generation for JSON flows.
  if (!apiKey) {
    if (isJson) return JSON.stringify(getOfflineGeneratedProject(userPrompt));
    throw new Error("Missing OPENROUTER_API_KEY in environment variables.");
  }

  try {
    const data = await requestOpenRouter(apiKey, chatCompletionsUrl, selectedModel, systemPrompt, userPrompt);
    let text = data.choices?.[0]?.message?.content;

    if (!text) {
      throw new Error(`OpenRouter returned no content with model "${selectedModel}".`);
    }

    if (isJson) {
      text = stripJsonFences(text);
    }

    return text;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    // If any JSON generation path fails, return an offline starter so the app still works.
    if (isJson) {
      return JSON.stringify(getOfflineGeneratedProject(userPrompt));
    }

    throw new Error(message);
  }
}







