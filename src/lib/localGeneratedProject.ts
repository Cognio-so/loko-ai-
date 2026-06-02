import { detectGenerationIntent } from "@/lib/generationIntent";

export interface LocalGeneratedFile {
  path: string;
  content: string;
}

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function js(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

function buildWebsitePreview(prompt: string) {
  const intent = detectGenerationIntent(prompt);
  const { title, summary, styleDirection, sectionLabels, palette, category } = intent;

  const featureCards = sectionLabels
    .map(
      (label, index) => `
        <article class="card">
          <span class="kicker">0${index + 1}</span>
          <h3>${esc(label)}</h3>
          <p>${esc(
            `${label} is shaped around the ${category.replace(/_/g, " ")} brief with crisp copy, useful UI detail, and a focused conversion path.`
          )}</p>
        </article>`
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <style>
    *{box-sizing:border-box} html{scroll-behavior:smooth} body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:${palette.bg};color:${palette.text}}
    .shell{position:relative;overflow:hidden;min-height:100vh}
    .shell:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 12% 12%,${palette.accent}33,transparent 28%),radial-gradient(circle at 88% 8%,${palette.accent2}2e,transparent 25%),linear-gradient(180deg,rgba(255,255,255,.06),transparent 36%);pointer-events:none}
    .wrap{max-width:1220px;margin:0 auto;padding:22px 24px 72px;position:relative}
    .nav{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:12px 14px 12px 18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);backdrop-filter:blur(18px);border-radius:24px;box-shadow:0 18px 60px rgba(0,0,0,.18)}
    .brand{display:flex;align-items:center;gap:10px;font-size:18px;font-weight:850;letter-spacing:-.035em}
    .brand-mark{width:34px;height:34px;border-radius:12px;background:linear-gradient(135deg,${palette.accent},${palette.accent2});box-shadow:0 12px 30px ${palette.accent}3d}
    .nav-links{display:flex;gap:18px;color:${palette.muted};font-size:14px}
    .cta{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:999px;background:linear-gradient(135deg,${palette.accent},${palette.accent2});color:#06111f;text-decoration:none;font-weight:850;box-shadow:0 14px 34px ${palette.accent}35}
    .hero{display:grid;grid-template-columns:minmax(0,1fr) minmax(420px,.9fr);gap:34px;align-items:center;padding:70px 0 42px}
    .badge{display:inline-flex;gap:8px;align-items:center;padding:8px 13px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);font-size:11px;font-weight:850;text-transform:uppercase;letter-spacing:.14em;color:${palette.accent2}}
    h1{font-size:clamp(46px,7vw,82px);line-height:.95;letter-spacing:-.065em;margin:18px 0 20px;max-width:780px}
    .sub{font-size:18px;line-height:1.75;color:${palette.muted};max-width:680px}
    .actions{display:flex;gap:14px;flex-wrap:wrap;margin-top:28px}
    .secondary{padding:12px 18px;border-radius:999px;border:1px solid rgba(255,255,255,.14);text-decoration:none;color:${palette.text};font-weight:760;background:rgba(255,255,255,.06)}
    .stats{display:flex;gap:18px;flex-wrap:wrap;margin-top:34px;color:${palette.muted}}
    .stats strong{display:block;color:${palette.text};font-size:24px;letter-spacing:-.04em}
    .mock{border:1px solid rgba(255,255,255,.12);background:linear-gradient(180deg,rgba(255,255,255,.12),rgba(255,255,255,.05));border-radius:32px;padding:16px;box-shadow:0 32px 90px rgba(0,0,0,.28);overflow:hidden}
    .mock-top{display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid rgba(255,255,255,.1);padding:8px 8px 14px;color:${palette.muted};font-size:13px}
    .dots{display:flex;gap:7px}.dots span{width:10px;height:10px;border-radius:999px;background:rgba(255,255,255,.28)}
    .dashboard{padding:18px;display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .wide{grid-column:1/-1}
    .tile{padding:18px;border-radius:22px;background:rgba(5,12,24,.46);border:1px solid rgba(255,255,255,.1)}
    .tile span{display:block;color:${palette.muted};font-size:12px}.tile strong{display:block;font-size:26px;margin-top:7px;letter-spacing:-.045em}
    .chart{height:170px;display:flex;align-items:end;gap:10px}.bar{flex:1;border-radius:999px 999px 10px 10px;background:linear-gradient(180deg,${palette.accent2},${palette.accent});min-height:34px;opacity:.92}
    .list{display:grid;gap:10px}.row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border-radius:16px;background:rgba(255,255,255,.06);color:${palette.muted}}.row b{color:${palette.text}}
    .section{padding-top:26px}
    .eyebrow{font-size:12px;text-transform:uppercase;letter-spacing:.18em;color:${palette.accent2};font-weight:850}
    .section h2{font-size:clamp(28px,4.5vw,54px);line-height:1.02;letter-spacing:-.05em;margin:12px 0 14px}
    .grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:24px}
    .card{padding:22px;border-radius:26px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.055);box-shadow:0 16px 45px rgba(0,0,0,.12)}
    .kicker{display:inline-flex;min-width:40px;height:40px;align-items:center;justify-content:center;border-radius:14px;background:rgba(255,255,255,.08);font-size:11px;font-weight:900;color:${palette.accent2}}
    .card h3{margin:18px 0 10px;font-size:20px}
    .card p,.quote p,.mock p{line-height:1.75;color:${palette.muted}}
    .quotes{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-top:26px}
    .quote{padding:22px;border-radius:26px;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.1)}
    .final{margin-top:30px;padding:30px;border-radius:30px;border:1px solid rgba(255,255,255,.1);background:linear-gradient(135deg,rgba(255,255,255,.09),rgba(255,255,255,.04));display:flex;align-items:center;justify-content:space-between;gap:18px}
    .footer{margin-top:36px;padding-top:24px;border-top:1px solid rgba(255,255,255,.08);display:flex;justify-content:space-between;gap:16px;color:${palette.muted};font-size:14px}
    @media (max-width: 960px){.hero,.grid,.quotes,.dashboard{grid-template-columns:1fr}.hero{padding-top:42px}.wrap{padding-left:18px;padding-right:18px}h1{font-size:52px}.nav-links{display:none}.mock{border-radius:24px}}
  </style>
</head>
<body>
  <div class="shell">
    <div class="wrap">
      <nav class="nav">
        <div class="brand"><span class="brand-mark"></span>${esc(title)}</div>
        <div class="nav-links"><span>Product</span><span>Solutions</span><span>Pricing</span></div>
        <a class="cta" href="#contact">Start now</a>
      </nav>
      <section class="hero">
        <div>
          <span class="badge">${esc(category.replace(/_/g, " "))} mode</span>
          <h1>${esc(title)}</h1>
          <p class="sub">${esc(summary)}</p>
          <div class="actions">
            <a class="cta" href="#features">Explore platform</a>
            <a class="secondary" href="#proof">See results</a>
          </div>
          <div class="stats">
            <span><strong>3.8x</strong> faster launch</span>
            <span><strong>92%</strong> cleaner handoff</span>
            <span><strong>24/7</strong> workflow ready</span>
          </div>
        </div>
        <div class="mock">
          <div class="mock-top">
            <div class="dots"><span></span><span></span><span></span></div>
            <strong>Live product preview</strong>
            <span>Updated today</span>
          </div>
          <div class="dashboard">
            <div class="tile"><span>Revenue pipeline</span><strong>$128k</strong></div>
            <div class="tile"><span>Active teams</span><strong>48</strong></div>
            <div class="tile wide">
              <span>Growth signal</span>
              <div class="chart">
                <i class="bar" style="height:46%"></i><i class="bar" style="height:62%"></i><i class="bar" style="height:54%"></i><i class="bar" style="height:78%"></i><i class="bar" style="height:92%"></i>
              </div>
            </div>
            <div class="tile wide list">
              <div class="row"><b>Onboarding</b><span>Ready</span></div>
              <div class="row"><b>Analytics</b><span>Live</span></div>
              <div class="row"><b>Automation</b><span>Synced</span></div>
            </div>
          </div>
        </div>
      </section>
      <section id="features" class="section">
        <span class="eyebrow">Product system</span>
        <h2>${esc(styleDirection)}</h2>
        <div class="grid">${featureCards}</div>
      </section>
      <section id="proof" class="section">
        <span class="eyebrow">Premium proof</span>
        <h2>Every section is designed to feel intentional, useful, and ready to refine.</h2>
        <div class="quotes">
          <div class="quote"><p>The hero leads with a real product promise, not placeholder marketing copy.</p></div>
          <div class="quote"><p>The preview includes dashboard-style UI detail so the page feels like a product, not only a poster.</p></div>
          <div class="quote"><p>Cards, stats, and proof blocks are tuned for quick iteration inside LokoAI.</p></div>
        </div>
      </section>
      <section id="contact" class="section">
        <div class="final">
          <div>
            <span class="eyebrow">Next action</span>
            <h2>Launch a sharper first draft and keep improving it from chat.</h2>
          </div>
          <a class="cta" href="#top">Upgrade this design</a>
        </div>
      </section>
      <footer class="footer">
        <span>Generated by LokoAI</span>
        <span>${esc(category.replace(/_/g, " "))} experience</span>
      </footer>
    </div>
  </div>
</body>
</html>`;
}

function buildImagePreview(prompt: string) {
  const intent = detectGenerationIntent(prompt);
  const { title, summary, palette } = intent;
  const safeTitle = esc(title);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <style>
    *{box-sizing:border-box} body{margin:0;font-family:Inter,system-ui,sans-serif;background:${palette.bg};color:${palette.text}}
    .wrap{max-width:1280px;margin:0 auto;padding:28px 24px 70px}
    .hero{display:grid;grid-template-columns:1.05fr .95fr;gap:24px;align-items:center}
    .panel,.artboard,.mini{border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);border-radius:30px}
    .panel{padding:26px}
    h1{font-size:clamp(42px,6vw,78px);line-height:.98;letter-spacing:-.06em;margin:18px 0}
    .sub{color:${palette.muted};line-height:1.8;font-size:17px}
    .tag{display:inline-flex;padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.05);font-size:12px;letter-spacing:.16em;font-weight:900;text-transform:uppercase;color:${palette.accent2}}
    .artboard{padding:24px;min-height:540px;display:flex;align-items:center;justify-content:center;overflow:hidden}
    .grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin-top:18px}
    .mini{padding:16px}
    .mini svg{width:100%;height:180px}
    @media (max-width: 980px){.hero,.grid{grid-template-columns:1fr}.artboard{min-height:380px}}
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hero">
      <section class="panel">
        <span class="tag">Image concept mode</span>
        <h1>${safeTitle}</h1>
        <p class="sub">${esc(summary)}</p>
        <p class="sub">Instead of forcing a business landing page, LokoAI can show a premium asset board with a main visual, variations, and usable prompt notes when the request is image-first.</p>
      </section>
      <section class="artboard">
        <svg viewBox="0 0 700 700" width="100%" height="100%" aria-label="${safeTitle}">
          <defs>
            <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="${palette.accent}" />
              <stop offset="100%" stop-color="${palette.accent2}" />
            </linearGradient>
            <radialGradient id="g2" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stop-color="rgba(255,255,255,0.9)" />
              <stop offset="100%" stop-color="rgba(255,255,255,0)" />
            </radialGradient>
          </defs>
          <rect width="700" height="700" rx="42" fill="#0b1728"/>
          <circle cx="220" cy="210" r="160" fill="url(#g1)" opacity="0.95" />
          <circle cx="460" cy="420" r="180" fill="${palette.accent2}" opacity="0.24" />
          <path d="M160 520 C 230 360, 440 300, 560 170" stroke="white" stroke-opacity="0.24" stroke-width="18" fill="none" />
          <rect x="120" y="120" width="460" height="460" rx="42" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
          <circle cx="350" cy="350" r="150" fill="url(#g2)" opacity="0.45" />
          <text x="350" y="330" text-anchor="middle" fill="white" font-size="36" font-weight="800" letter-spacing="-1">${safeTitle}</text>
          <text x="350" y="376" text-anchor="middle" fill="${palette.accent2}" font-size="16" font-weight="700">Premium AI asset board</text>
        </svg>
      </section>
    </div>
    <section class="grid">
      <div class="mini"><strong>Variation A</strong><svg viewBox="0 0 260 180"><rect width="260" height="180" rx="26" fill="#0f1f35"/><circle cx="88" cy="86" r="48" fill="${palette.accent}"/><rect x="126" y="54" width="78" height="78" rx="20" fill="${palette.accent2}" opacity=".7"/></svg></div>
      <div class="mini"><strong>Variation B</strong><svg viewBox="0 0 260 180"><rect width="260" height="180" rx="26" fill="#0f1f35"/><path d="M30 140 C 90 30, 180 40, 230 130" stroke="${palette.accent}" stroke-width="18" fill="none"/><circle cx="130" cy="90" r="28" fill="white" opacity=".82"/></svg></div>
      <div class="mini"><strong>Prompt Notes</strong><p style="line-height:1.7;color:${palette.muted};margin-top:12px">Use this board to refine composition, art direction, color intensity, and CTA copy before exporting a dedicated image workflow.</p></div>
    </section>
  </div>
</body>
</html>`;
}

function buildTextPreview(prompt: string) {
  const intent = detectGenerationIntent(prompt);
  const { title, summary, palette } = intent;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(title)}</title>
  <style>
    *{box-sizing:border-box} body{margin:0;font-family:Georgia,'Times New Roman',serif;background:${palette.bg};color:${palette.text}}
    .wrap{max-width:980px;margin:0 auto;padding:52px 22px 80px}
    .label{font:700 12px/1 Inter,system-ui,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:${palette.accent};}
    h1{font-size:clamp(40px,6vw,74px);line-height:.98;letter-spacing:-.05em;margin:14px 0 18px}
    .lead{font:400 20px/1.9 Inter,system-ui,sans-serif;color:${palette.muted};max-width:820px}
    .paper{margin-top:34px;padding:30px;border-radius:28px;background:${palette.surface};border:1px solid rgba(31,41,55,.08);box-shadow:0 22px 70px rgba(15,23,42,.08)}
    p{font-size:18px;line-height:1.95;margin:0 0 18px}
    blockquote{margin:28px 0;padding:22px 24px;border-left:4px solid ${palette.accent};background:rgba(139,92,246,.06);border-radius:0 22px 22px 0;font:600 22px/1.6 Inter,system-ui,sans-serif}
  </style>
</head>
<body>
  <div class="wrap">
    <span class="label">Editorial mode</span>
    <h1>${esc(title)}</h1>
    <p class="lead">${esc(summary)}</p>
    <article class="paper">
      <p>LokoAI now treats content-heavy prompts as editorial experiences instead of flattening them into the same repeated landing page formula.</p>
      <p>This makes brochures, articles, sales letters, and structured text pages feel far more intentional, readable, and premium during generation and fallback.</p>
      <blockquote>Text-first requests deserve typography, rhythm, and hierarchy — not another generic SaaS hero.</blockquote>
      <p>When the request is content-led, the builder can prioritize structure, pull quotes, supporting sections, and stronger reading flow so the result is much closer to the original brief.</p>
    </article>
  </div>
</body>
</html>`;
}

function buildAppTsx(prompt: string) {
  const intent = detectGenerationIntent(prompt);
  const title = js(intent.title);
  const summary = js(intent.summary);
  const category = js(intent.category.replace(/_/g, " "));

  return `export default function App() {
  const cards = ${JSON.stringify(intent.sectionLabels)};
  return (
    <div className="app-shell">
      <section className="hero-block">
        <span className="intent-chip">${category} mode</span>
        <h1>${title}</h1>
        <p>${summary}</p>
        <div className="button-row">
          <button className="primary-btn">Generate Premium</button>
          <button className="secondary-btn">Refine Further</button>
        </div>
      </section>
      <section className="card-grid">
        {cards.map((card, index) => (
          <article key={card} className="info-card">
            <span className="index-pill">0{index + 1}</span>
            <h3>{card}</h3>
            <p>Structured fallback content for a more premium and prompt-specific result.</p>
          </article>
        ))}
      </section>
    </div>
  );
}`;
}

function buildIndexCss(prompt: string) {
  const intent = detectGenerationIntent(prompt);
  const { palette } = intent;

  return `:root{
  --bg:${palette.bg};
  --surface:${palette.surface};
  --accent:${palette.accent};
  --accent-2:${palette.accent2};
  --text:${palette.text};
  --muted:${palette.muted};
}
*{box-sizing:border-box}
body{
  margin:0;
  font-family:Inter,system-ui,sans-serif;
  background:
    radial-gradient(circle at top left, color-mix(in srgb, var(--accent) 20%, transparent), transparent 30%),
    radial-gradient(circle at 85% 15%, color-mix(in srgb, var(--accent-2) 16%, transparent), transparent 24%),
    var(--bg);
  color:var(--text);
}
.app-shell{max-width:1200px;margin:0 auto;padding:28px 20px 72px}
.hero-block,.info-card{
  border:1px solid rgba(255,255,255,.08);
  background:rgba(255,255,255,.04);
  border-radius:28px;
}
.hero-block{padding:28px}
.hero-block h1{font-size:clamp(42px,6vw,80px);line-height:.98;letter-spacing:-.06em;margin:18px 0}
.hero-block p{max-width:760px;color:var(--muted);font-size:18px;line-height:1.8}
.intent-chip,.index-pill{
  display:inline-flex;align-items:center;justify-content:center;
  border-radius:999px;font-weight:800;letter-spacing:.14em;text-transform:uppercase
}
.intent-chip{padding:8px 14px;font-size:11px;background:rgba(255,255,255,.06);color:var(--accent-2)}
.button-row{display:flex;gap:14px;flex-wrap:wrap;margin-top:26px}
.primary-btn,.secondary-btn{border:0;border-radius:999px;padding:12px 18px;font-weight:800}
.primary-btn{background:linear-gradient(135deg,var(--accent),var(--accent-2));color:#081121}
.secondary-btn{background:rgba(255,255,255,.05);color:var(--text);border:1px solid rgba(255,255,255,.1)}
.card-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:22px}
.info-card{padding:20px}
.index-pill{width:42px;height:42px;background:rgba(255,255,255,.06);font-size:11px;color:var(--accent-2)}
.info-card h3{margin:18px 0 8px;font-size:20px}
.info-card p{margin:0;color:var(--muted);line-height:1.75}
@media (max-width: 920px){.card-grid{grid-template-columns:1fr}}
`;
}

export function getLocalGeneratedProject(userPrompt: string) {
  const intent = detectGenerationIntent(userPrompt);
  const previewHtml =
    intent.surface === "image"
      ? buildImagePreview(userPrompt)
      : intent.surface === "text"
        ? buildTextPreview(userPrompt)
        : buildWebsitePreview(userPrompt);

  const files: LocalGeneratedFile[] = [
    {
      path: "package.json",
      content:
        '{"name":"lokoai-generated-project","private":true,"version":"1.0.0","type":"module","scripts":{"dev":"vite","build":"vite build"},"dependencies":{"react":"^18.3.1","react-dom":"^18.3.1"},"devDependencies":{"@types/react":"^18.3.3","@types/react-dom":"^18.3.0","@vitejs/plugin-react":"^4.3.1","typescript":"^5.5.4","vite":"^5.4.2"}}',
    },
    {
      path: "vite.config.ts",
      content:
        "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  server: { host: '0.0.0.0', port: 5173, allowedHosts: true, strictPort: true },\n});\n",
    },
    {
      path: "index.html",
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(intent.title)}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`,
    },
    {
      path: "src/main.tsx",
      content:
        "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);\n",
    },
    { path: "src/App.tsx", content: buildAppTsx(userPrompt) },
    { path: "src/index.css", content: buildIndexCss(userPrompt) },
  ];

  return {
    projectTitle: intent.title,
    description: intent.summary,
    files,
    previewHtml,
    workflowLogs: [
      { agent: "Intent Router", action: `Detected ${intent.surface} request in ${intent.category} mode` },
      { agent: "Fallback Designer", action: "Built a category-aware premium preview instead of a generic landing page" },
      { agent: "UI Engineer", action: "Generated preview and starter React files for refinement" },
      { agent: "Quality Guard", action: "Kept the output aligned with the user prompt type" },
    ],
  };
}
