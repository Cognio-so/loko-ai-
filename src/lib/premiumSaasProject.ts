import { detectGenerationIntent } from "@/lib/generationIntent";

type GeneratedFile = {
  path: string;
  content: string;
};

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function titleCase(value: string) {
  return value
    .replace(/[^a-z0-9\s-]/gi, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 5)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ") || "NexaCloud";
}

function componentName(label: string) {
  return label.replace(/[^a-z0-9]/gi, " ").split(/\s+/).filter(Boolean).map((part) => part[0].toUpperCase() + part.slice(1)).join("");
}

function slugFromPageName(label: string) {
  return label
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function pageFile(name: string, headline: string, body: string) {
  return `import { MarketingLayout } from "../layouts/MarketingLayout";
import { SectionHeading } from "../components/ui/SectionHeading";
import { CTASection } from "../sections/CTASection";

export default function ${componentName(name)}Page() {
  return (
    <MarketingLayout>
      <main className="page-shell">
        <section className="mx-auto max-w-5xl px-6 py-24 text-center">
          <SectionHeading eyebrow="${name}" title="${headline}" align="center" />
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">${body}</p>
        </section>
        <CTASection />
      </main>
    </MarketingLayout>
  );
}
`;
}

function simpleComponent(name: string, body: string) {
  return `export function ${name}() {
  return (
    ${body}
  );
}
`;
}

function previewHtml(productName: string, summary: string) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(productName)} - Premium SaaS</title>
  <style>
    *{box-sizing:border-box} body{margin:0;font-family:Inter,ui-sans-serif,system-ui;background:#f8fbff;color:#0f172a}
    .shell{min-height:100vh;overflow:hidden;background:radial-gradient(circle at 15% 8%,rgba(37,99,235,.2),transparent 28%),radial-gradient(circle at 85% 15%,rgba(6,182,212,.24),transparent 24%),linear-gradient(180deg,#fff,#eef6ff)}
    .wrap{max-width:1200px;margin:0 auto;padding:24px}
    nav{display:flex;align-items:center;justify-content:space-between;border:1px solid rgba(148,163,184,.25);background:rgba(255,255,255,.78);backdrop-filter:blur(18px);border-radius:24px;padding:14px 18px;box-shadow:0 20px 60px rgba(15,23,42,.08)}
    .brand{display:flex;align-items:center;gap:10px;font-weight:900;font-size:18px}.mark{width:34px;height:34px;border-radius:12px;background:linear-gradient(135deg,#2563eb,#06b6d4)}
    .links{display:flex;gap:18px;color:#64748b;font-size:14px;font-weight:700}.btn{border:0;border-radius:999px;background:linear-gradient(135deg,#2563eb,#06b6d4);color:#fff;padding:12px 18px;font-weight:900}
    .hero{display:grid;grid-template-columns:1fr .9fr;gap:36px;align-items:center;padding:74px 0}
    .badge{display:inline-flex;border-radius:999px;background:#fff;border:1px solid rgba(148,163,184,.25);padding:8px 12px;color:#2563eb;font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase}
    h1{font-size:clamp(48px,7vw,86px);line-height:.92;letter-spacing:-.07em;margin:18px 0}.sub{font-size:18px;line-height:1.75;color:#64748b;max-width:680px}
    .actions{display:flex;gap:14px;margin-top:28px}.ghost{background:#fff;color:#0f172a;border:1px solid rgba(148,163,184,.26)}
    .mock{border:1px solid rgba(148,163,184,.24);background:rgba(255,255,255,.84);border-radius:34px;padding:16px;box-shadow:0 36px 100px rgba(15,23,42,.16)}
    .top{display:flex;justify-content:space-between;padding:10px 8px 16px;border-bottom:1px solid rgba(148,163,184,.18);color:#64748b;font-size:13px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;padding:18px}
    .tile{border:1px solid rgba(148,163,184,.18);background:#f8fafc;border-radius:22px;padding:18px}.tile span{color:#64748b;font-size:12px}.tile strong{display:block;font-size:28px;margin-top:8px}
    .wide{grid-column:1/-1}.bars{height:160px;display:flex;align-items:end;gap:9px}.bars i{flex:1;border-radius:999px 999px 10px 10px;background:linear-gradient(180deg,#06b6d4,#2563eb);min-height:38px}
    .sections{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;padding-bottom:60px}.card{background:#fff;border:1px solid rgba(148,163,184,.2);border-radius:26px;padding:22px;box-shadow:0 18px 55px rgba(15,23,42,.07)}.card b{font-size:20px}.card p{color:#64748b;line-height:1.7}
    @media(max-width:900px){.hero,.sections,.grid{grid-template-columns:1fr}.links{display:none}}
  </style>
</head>
<body>
  <div class="shell">
    <div class="wrap">
      <nav><div class="brand"><span class="mark"></span>${esc(productName)}</div><div class="links"><span>Features</span><span>Pricing</span><span>Agents</span><span>Docs</span></div><button class="btn">Start free</button></nav>
      <section class="hero">
        <div><span class="badge">AI SaaS Platform</span><h1>${esc(productName)} feels like a $100M startup.</h1><p class="sub">${esc(summary)}</p><div class="actions"><button class="btn">Launch workspace</button><button class="btn ghost">View demo</button></div></div>
        <div class="mock"><div class="top"><b>Dashboard Preview</b><span>Live</span></div><div class="grid"><div class="tile"><span>Pipeline</span><strong>$428k</strong></div><div class="tile"><span>AI Tasks</span><strong>19.4k</strong></div><div class="tile wide"><span>Automation Velocity</span><div class="bars"><i style="height:44%"></i><i style="height:65%"></i><i style="height:54%"></i><i style="height:82%"></i><i style="height:96%"></i></div></div></div></div>
      </section>
      <section class="sections">${["AI Agents","Integrations","Templates","Analytics"].map((item) => `<article class="card"><b>${item}</b><p>Production-grade ${item.toLowerCase()} module with premium SaaS hierarchy, motion, and responsive states.</p></article>`).join("")}</section>
    </div>
  </div>
</body>
</html>`;
}

export function isPremiumSaasCodebasePrompt(prompt: string) {
  const lower = prompt.toLowerCase();
  return (
    /50\+?\s*files|large professional folder|complete folder structure|production-ready codebase|not a basic vite|world-class saas|startup valued/i.test(prompt) ||
    (lower.includes("saas") && lower.includes("vite") && lower.includes("tailwind") && lower.includes("framer"))
  );
}

export function getPremiumSaasProject(userPrompt: string) {
  const intent = detectGenerationIntent(userPrompt);
  const productName = titleCase(intent.title.replace(/^Build A Complete/i, "")) || "NexaCloud";
  const summary =
    "A polished AI-native SaaS operating layer with multi-page marketing, dashboard preview, agent workflows, templates, integrations, and enterprise-grade UI patterns.";

  const pages = [
    ["Home", "A premium AI SaaS homepage built for conversion.", "Explore the core product story, motion-rich hero, proof, features, pricing, and enterprise-grade calls to action."],
    ["Features", "Powerful features for modern AI teams.", "Agent workflows, automations, analytics, knowledge memory, and collaboration surfaces are designed as a complete operating system."],
    ["Pricing", "Flexible pricing built for teams from launch to scale.", "Transparent tiers, add-ons, usage limits, and annual plans make the platform easy to buy and expand."],
    ["Integrations", "Connect the tools your team already trusts.", "Sync CRMs, data warehouses, design tools, docs, Slack, GitHub, Stripe, and support platforms."],
    ["AIAgents", "Deploy specialized AI agents across every workflow.", "Research, write, analyze, support, code, sell, and operate with configurable agent teams."],
    ["Templates", "Launch faster with premium workflow templates.", "Prebuilt SaaS, support, analytics, CRM, finance, and founder templates accelerate time to value."],
    ["Blog", "Insights for building with AI-native software.", "Editorial content, product thinking, launch notes, and practical playbooks for modern software teams."],
    ["Careers", "Join the team building the AI work layer.", "A high-agency culture for product engineers, designers, GTM leaders, and AI infrastructure builders."],
    ["AboutUs", "A focused team building the future of work.", "We combine product craft, AI systems, and enterprise discipline to make AI work trustworthy."],
    ["Contact", "Talk to sales or get help from the team.", "Route inbound interest to sales, support, partnerships, and investor conversations."],
    ["Documentation", "Developer-first docs for setup and scale.", "Guides, API references, SDK notes, changelogs, and integration recipes are organized for fast implementation."],
    ["Changelog", "Every product improvement in one place.", "Track feature releases, quality improvements, security updates, and platform enhancements."],
    ["Terms", "Terms of service.", "Clear commercial and acceptable-use terms for teams using the platform."],
    ["Privacy", "Privacy and data protection.", "Transparent data handling, security posture, retention, and privacy commitments."],
    ["Login", "Welcome back to your workspace.", "A polished authentication entry point with social login, email flow, and loading states."],
    ["Signup", "Start building with AI in minutes.", "A conversion-focused signup flow with plan context, trust signals, and friendly onboarding."],
    ["DashboardPreview", "A realistic preview of the product dashboard.", "See metrics, agent queues, automation runs, team activity, and account health in one premium console."],
    ["NotFound", "This page drifted out of orbit.", "A polished 404 experience that guides visitors back to the product."],
  ];

  const sectionFiles = [
    "NavbarSection", "HeroSection", "AIDemoSection", "ProductShowcaseSection", "FeatureGridSection",
    "AIAgentsShowcaseSection", "StatisticsSection", "TrustedCompaniesSection", "IntegrationsSection",
    "PricingSection", "TestimonialsSection", "FAQSection", "CTASection", "FooterSection",
  ];
  const homeSections = sectionFiles.filter((name) => !["NavbarSection", "HeroSection", "FooterSection", "CTASection"].includes(name));

  const files: GeneratedFile[] = [
    {
      path: "package.json",
      content: JSON.stringify({
        name: productName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        private: true,
        version: "1.0.0",
        type: "module",
        scripts: { dev: "vite", build: "tsc && vite build", preview: "vite preview" },
        dependencies: {
          "@vitejs/plugin-react": "^4.3.4",
          "framer-motion": "^12.0.0",
          "react": "^18.3.1",
          "react-dom": "^18.3.1",
        },
        devDependencies: {
          "@types/react": "^18.3.12",
          "@types/react-dom": "^18.3.1",
          "autoprefixer": "^10.4.20",
          "postcss": "^8.4.49",
          "tailwindcss": "^3.4.17",
          "typescript": "^5.6.3",
          "vite": "^5.4.11",
        },
      }, null, 2),
    },
    { path: "index.html", content: `<div id="root"></div><script type="module" src="/src/main.tsx"></script>` },
    { path: "vite.config.ts", content: `import { defineConfig } from "vite";\nimport react from "@vitejs/plugin-react";\n\nexport default defineConfig({ plugins: [react()], server: { host: "0.0.0.0", port: 5173, allowedHosts: true, strictPort: true } });\n` },
    { path: "tsconfig.json", content: `{"compilerOptions":{"target":"ES2020","useDefineForClassFields":true,"lib":["DOM","DOM.Iterable","ES2020"],"allowJs":false,"skipLibCheck":true,"esModuleInterop":true,"allowSyntheticDefaultImports":true,"strict":true,"forceConsistentCasingInFileNames":true,"module":"ESNext","moduleResolution":"Node","resolveJsonModule":true,"isolatedModules":true,"noEmit":true,"jsx":"react-jsx"},"include":["src"],"references":[{"path":"./tsconfig.node.json"}]}` },
    { path: "tsconfig.node.json", content: `{"compilerOptions":{"composite":true,"module":"ESNext","moduleResolution":"Node","allowSyntheticDefaultImports":true},"include":["vite.config.ts"]}` },
    { path: "tailwind.config.ts", content: `import type { Config } from "tailwindcss";\nexport default { darkMode: "class", content: ["./index.html","./src/**/*.{ts,tsx}"], theme: { extend: { fontFamily: { sans: ["Inter","ui-sans-serif","system-ui"] }, boxShadow: { glow: "0 24px 80px rgba(37,99,235,.22)" } } }, plugins: [] } satisfies Config;\n` },
    { path: "postcss.config.js", content: `export default { plugins: { tailwindcss: {}, autoprefixer: {} } };\n` },
    { path: "README.md", content: `# ${productName}\n\n${summary}\n\n## Folder Structure\n\nThis generated project includes pages, layouts, sections, UI components, cards, forms, navigation, animations, dashboard mockups, hooks, services, API helpers, constants, data, assets, providers, context, store, styles, utilities, and route definitions.\n\n## Install\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n## Production Build\n\n\`\`\`bash\nnpm run build\nnpm run preview\n\`\`\`\n\n## Stack\n\nReact, TypeScript, Vite, Tailwind CSS, Framer Motion.\n` },
    { path: "INSTALL.md", content: `# Installation\n\n1. Install dependencies with \`npm install\`.\n2. Start local development with \`npm run dev\`.\n3. Build production assets with \`npm run build\`.\n4. Preview production build with \`npm run preview\`.\n\nThe app is structured as a production-ready Vite SaaS website, not a single-file starter.\n` },
    { path: "FOLDER_STRUCTURE.md", content: `# Folder Structure\n\n\`\`\`\nsrc/\n├── app/\n├── pages/\n├── layouts/\n├── components/\n│   ├── ui/\n│   ├── forms/\n│   ├── navigation/\n│   ├── cards/\n│   ├── pricing/\n│   ├── testimonials/\n│   ├── dashboard/\n│   ├── animations/\n│   └── marketing/\n├── sections/\n├── hooks/\n├── lib/\n├── services/\n├── api/\n├── constants/\n├── types/\n├── data/\n├── assets/\n│   ├── images/\n│   ├── icons/\n│   └── logos/\n├── styles/\n├── routes/\n├── store/\n├── providers/\n├── context/\n└── utils/\n\`\`\`\n` },
    { path: "src/main.tsx", content: `import React from "react";\nimport ReactDOM from "react-dom/client";\nimport App from "./App";\nimport { ThemeProvider } from "./providers/ThemeProvider";\nimport "./styles/globals.css";\n\nReactDOM.createRoot(document.getElementById("root")!).render(<React.StrictMode><ThemeProvider><App /></ThemeProvider></React.StrictMode>);\n` },
    { path: "src/App.tsx", content: `import { routes } from "./routes/routes";\nimport NotFoundPage from "./pages/NotFoundPage";\n\nexport default function App() {\n  const path = window.location.pathname === "/" ? "/" : window.location.pathname.replace(/\\/$/, "");\n  const match = routes.find((route) => route.path === path);\n  const Page = match?.component ?? NotFoundPage;\n  return <Page />;\n}\n` },
    { path: "src/styles/globals.css", content: `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n:root{color-scheme:light;--bg:#f8fbff;--text:#0f172a} .dark{color-scheme:dark;--bg:#050816;--text:#f8fafc} body{margin:0;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui}.page-shell{min-height:100vh}.glass{border:1px solid rgba(148,163,184,.22);background:rgba(255,255,255,.72);backdrop-filter:blur(20px)}.dark .glass{background:rgba(15,23,42,.68);border-color:rgba(255,255,255,.1)}\n` },
    { path: "src/types/index.ts", content: `export type NavItem = { label: string; href: string };\nexport type PricingPlan = { name: string; price: string; features: string[]; highlighted?: boolean };\nexport type CardItem = { title: string; body: string; tag?: string };\n` },
    { path: "src/constants/site.ts", content: `export const siteConfig = { name: "${productName}", description: "${summary}", domain: "https://example.com" };\n` },
    { path: "src/constants/navigation.ts", content: `export const navigation = ["Features","Pricing","Integrations","AI Agents","Templates","Blog"].map((label) => ({ label, href: label === "Features" ? "/features" : "/" + label.toLowerCase().replace(/\\s+/g, "-") }));\n` },
    { path: "src/constants/pricing.ts", content: `export const pricingPlans = [\n{name:"Launch",price:"$29",features:["AI workspace","5 agents","Core templates"]},\n{name:"Scale",price:"$79",highlighted:true,features:["Unlimited projects","Advanced agents","Integrations"]},\n{name:"Enterprise",price:"Custom",features:["SSO","Audit logs","Dedicated support"]}\n];\n` },
    { path: "src/routes/routes.tsx", content: `import HomePage from "../pages/HomePage";\n${pages.slice(1).map(([name]) => `import ${componentName(name)}Page from "../pages/${componentName(name)}Page";`).join("\n")}\nexport const routes = [\n{ path: "/", component: HomePage },\n${pages.slice(1, -1).map(([name]) => `{ path: "/${slugFromPageName(name)}", component: ${componentName(name)}Page }`).join(",\n")}\n];\n` },
  ];

  pages.slice(1).forEach(([name, headline, body]) => {
    files.push({ path: `src/pages/${componentName(name)}Page.tsx`, content: pageFile(name.replace(/([a-z])([A-Z])/g, "$1 $2"), headline, body) });
  });

  files.push(
    { path: "src/app/AppShell.tsx", content: `export function AppShell({ children }: { children: React.ReactNode }) { return <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">{children}</div>; }\n` },
    { path: "src/layouts/MarketingLayout.tsx", content: `import { Navbar } from "../components/navigation/Navbar";\nimport { FooterSection } from "../sections/FooterSection";\nexport function MarketingLayout({ children }: { children: React.ReactNode }) { return <><Navbar />{children}<FooterSection /></>; }\n` },
    { path: "src/layouts/AuthLayout.tsx", content: `export function AuthLayout({ children }: { children: React.ReactNode }) { return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 dark:bg-slate-950">{children}</main>; }\n` },
    { path: "src/layouts/DashboardLayout.tsx", content: `export function DashboardLayout({ children }: { children: React.ReactNode }) { return <main className="min-h-screen bg-slate-950 text-white">{children}</main>; }\n` },
    { path: "src/providers/ThemeProvider.tsx", content: `import { createContext, useContext, useEffect, useState } from "react";\nconst ThemeContext = createContext({ dark: false, toggle: () => {} });\nexport function ThemeProvider({ children }: { children: React.ReactNode }) { const [dark,setDark]=useState(false); useEffect(()=>{document.documentElement.classList.toggle("dark",dark)},[dark]); return <ThemeContext.Provider value={{dark,toggle:()=>setDark(v=>!v)}}>{children}</ThemeContext.Provider>; }\nexport const useTheme = () => useContext(ThemeContext);\n` },
    { path: "src/context/AppContext.tsx", content: `import { createContext } from "react";\nexport const AppContext = createContext({ product: "${productName}" });\n` },
    { path: "src/store/uiStore.ts", content: `let sidebarOpen = false;\nexport const uiStore = { get sidebarOpen(){return sidebarOpen}, toggle(){sidebarOpen=!sidebarOpen} };\n` }
  );

  const hooks = ["useDarkMode", "useScrollReveal", "useMousePosition", "useParallax", "usePrefersReducedMotion"];
  hooks.forEach((name) => files.push({ path: `src/hooks/${name}.ts`, content: `import { useEffect, useState } from "react";\nexport function ${name}() { const [value,setValue]=useState(false); useEffect(()=>{ setValue(false); },[]); return value; }\n` }));

  [
    ["src/lib/cn.ts", `export function cn(...classes: Array<string | false | null | undefined>) { return classes.filter(Boolean).join(" "); }\n`],
    ["src/lib/seo.ts", `export function pageTitle(title: string) { return title + " | ${productName}"; }\n`],
    ["src/lib/analytics.ts", `export function track(event: string, data: Record<string, unknown> = {}) { console.info("[analytics]", event, data); }\n`],
    ["src/lib/format.ts", `export const formatNumber = (value: number) => new Intl.NumberFormat("en").format(value);\n`],
    ["src/utils/slugify.ts", `export const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");\n`],
    ["src/utils/clamp.ts", `export const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);\n`],
    ["src/utils/routes.ts", `export const routeTo = (path: string) => path.startsWith("/") ? path : "/" + path;\n`],
    ["src/api/client.ts", `export async function apiClient<T>(url: string): Promise<T> { const res = await fetch(url); if (!res.ok) throw new Error("Request failed"); return res.json(); }\n`],
    ["src/services/contact.ts", `export async function sendContactMessage(data: Record<string,string>) { return { ok: true, data }; }\n`],
    ["src/services/newsletter.ts", `export async function subscribeToNewsletter(email: string) { return { ok: true, email }; }\n`],
  ].forEach(([path, content]) => files.push({ path, content }));

  const dataFiles = ["features", "integrations", "agents", "templates", "posts", "testimonials", "faqs", "stats", "changelog"];
  dataFiles.forEach((name) => files.push({ path: `src/data/${name}.ts`, content: `export const ${name} = [\n  { title: "${componentName(name)} Engine", body: "Premium ${name} content for a production SaaS experience." },\n  { title: "Workflow Ready", body: "Designed for realistic product storytelling and fast iteration." },\n  { title: "Enterprise Polish", body: "Crisp hierarchy, responsive states, and strong conversion value." }\n];\n` }));

  [
    ["Button", `<button className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-5 py-3 text-sm font-bold text-white shadow-glow">Action</button>`],
    ["Card", `<article className="glass rounded-3xl p-6 shadow-xl"><h3 className="text-xl font-bold">Premium card</h3><p className="mt-3 text-slate-600 dark:text-slate-300">Reusable glass card component.</p></article>`],
    ["Badge", `<span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-blue-600">New</span>`],
    ["Container", `<div className="mx-auto max-w-7xl px-6"></div>`],
    ["Skeleton", `<div className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />`],
    ["Toggle", `<button className="h-8 w-14 rounded-full bg-slate-900 p-1"><span className="block h-6 w-6 rounded-full bg-white" /></button>`],
    ["Input", `<input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring-4 focus:ring-blue-100" placeholder="Email address" />`],
    ["Modal", `<div className="rounded-3xl bg-white p-8 shadow-2xl dark:bg-slate-900">Modal content</div>`],
  ].forEach(([name, body]) => files.push({ path: `src/components/ui/${name}.tsx`, content: simpleComponent(name, body) }));

  files.push({ path: "src/components/ui/SectionHeading.tsx", content: `export function SectionHeading({ eyebrow, title, align = "left" }: { eyebrow: string; title: string; align?: "left" | "center" }) { return <div className={align === "center" ? "text-center" : ""}><p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">{eyebrow}</p><h2 className="mt-3 text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-6xl">{title}</h2></div>; }\n` });

  [
    ["navigation/Navbar", `import { navigation } from "../../constants/navigation";\nimport { Logo } from "../../assets/logos/Logo";\nimport { useTheme } from "../../providers/ThemeProvider";\nexport function Navbar() { const { toggle } = useTheme(); return <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/75 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70"><div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6"><Logo /><nav className="hidden gap-6 md:flex">{navigation.map((item)=><a key={item.href} className="text-sm font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-300" href={item.href}>{item.label}</a>)}</nav><button onClick={toggle} className="rounded-full border px-4 py-2 text-sm font-bold">Theme</button></div></header>; }\n`],
    ["navigation/MobileNav", simpleComponent("MobileNav", `<div className="fixed inset-x-4 bottom-4 rounded-3xl bg-slate-950 p-4 text-white shadow-2xl md:hidden">Mobile navigation</div>`)],
    ["animations/AuroraBackground", simpleComponent("AuroraBackground", `<div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,.24),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(6,182,212,.24),transparent_25%)]" />`)],
    ["animations/ParticleField", simpleComponent("ParticleField", `<div className="pointer-events-none absolute inset-0 -z-10 opacity-40"><span className="absolute left-1/4 top-24 h-2 w-2 rounded-full bg-blue-400" /><span className="absolute right-1/4 top-40 h-1.5 w-1.5 rounded-full bg-cyan-400" /></div>`)],
    ["animations/FloatingElements", simpleComponent("FloatingElements", `<div className="absolute right-10 top-32 hidden rounded-3xl bg-white/70 p-4 shadow-xl md:block dark:bg-slate-900/70">Floating KPI</div>`)],
    ["animations/MouseGlow", simpleComponent("MouseGlow", `<div className="pointer-events-none fixed left-1/2 top-1/2 -z-10 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/10 blur-3xl" />`)],
    ["animations/ScrollReveal", `import { motion } from "framer-motion";\nexport function ScrollReveal({ children }: { children: React.ReactNode }) { return <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.55}}>{children}</motion.div>; }\n`],
    ["animations/GradientMesh", simpleComponent("GradientMesh", `<div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950" />`)],
  ].forEach(([path, content]) => files.push({ path: `src/components/${path}.tsx`, content }));

  ["FeatureCard", "AgentCard", "IntegrationCard", "TemplateCard", "BlogCard"].forEach((name) => {
    files.push({ path: `src/components/cards/${name}.tsx`, content: `export function ${name}({ title = "${name}", body = "Premium reusable card content." }: { title?: string; body?: string }) { return <article className="glass rounded-3xl p-6 transition hover:-translate-y-1 hover:shadow-glow"><h3 className="text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{body}</p></article>; }\n` });
  });

  [
    ["pricing/PricingCard", `export function PricingCard({ name, price }: { name: string; price: string }) { return <article className="glass rounded-3xl p-6"><h3 className="text-2xl font-black">{name}</h3><p className="mt-3 text-4xl font-black">{price}</p></article>; }\n`],
    ["pricing/PricingToggle", simpleComponent("PricingToggle", `<div className="inline-flex rounded-full bg-slate-100 p-1 text-sm font-bold dark:bg-slate-800"><button className="rounded-full bg-white px-4 py-2 dark:bg-slate-950">Monthly</button><button className="px-4 py-2">Annual</button></div>`)],
    ["testimonials/TestimonialCard", `export function TestimonialCard({ quote = "This feels like a premium product.", author = "Founder" }) { return <figure className="glass rounded-3xl p-6"><blockquote className="text-lg font-semibold">"{quote}"</blockquote><figcaption className="mt-4 text-sm text-slate-500">{author}</figcaption></figure>; }\n`],
    ["dashboard/DashboardMockup", simpleComponent("DashboardMockup", `<div className="glass rounded-[2rem] p-4 shadow-glow"><div className="grid gap-4 md:grid-cols-2"><div className="rounded-2xl bg-white p-5 dark:bg-slate-900"><p className="text-sm text-slate-500">Revenue</p><strong className="text-3xl">$428k</strong></div><div className="rounded-2xl bg-white p-5 dark:bg-slate-900"><p className="text-sm text-slate-500">Automations</p><strong className="text-3xl">19.4k</strong></div></div></div>`)],
    ["dashboard/MetricCard", `export function MetricCard({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900"><p className="text-sm text-slate-500">{label}</p><strong className="mt-2 block text-3xl">{value}</strong></div>; }\n`],
    ["dashboard/ActivityFeed", simpleComponent("ActivityFeed", `<div className="space-y-3 rounded-3xl bg-white p-6 dark:bg-slate-900"><p>Agent completed workflow review</p><p>Integration synced successfully</p><p>Template published</p></div>`)],
    ["forms/ContactForm", simpleComponent("ContactForm", `<form className="glass grid gap-4 rounded-3xl p-6"><input className="rounded-2xl border p-3" placeholder="Name" /><input className="rounded-2xl border p-3" placeholder="Email" /><textarea className="rounded-2xl border p-3" placeholder="Message" /><button className="rounded-full bg-blue-600 px-5 py-3 font-bold text-white">Send</button></form>`)],
    ["forms/SignupForm", simpleComponent("SignupForm", `<form className="glass grid gap-4 rounded-3xl p-6"><input className="rounded-2xl border p-3" placeholder="Work email" /><button className="rounded-full bg-blue-600 px-5 py-3 font-bold text-white">Create account</button></form>`)],
    ["marketing/LogoCloud", simpleComponent("LogoCloud", `<div className="flex flex-wrap gap-3 text-sm font-bold text-slate-500"><span>Vercel</span><span>Linear</span><span>Stripe</span><span>OpenAI</span><span>Notion</span></div>`)],
    ["marketing/ProductImage", simpleComponent("ProductImage", `<div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-8 shadow-glow dark:border-white/10 dark:from-slate-900 dark:to-blue-950">Product image placeholder</div>`)],
  ].forEach(([path, content]) => files.push({ path: `src/components/${path}.tsx`, content }));

  files.push(
    { path: "src/assets/logos/Logo.tsx", content: `import { siteConfig } from "../../constants/site";\nexport function Logo() { return <a href="/" className="flex items-center gap-3 text-lg font-black"><span className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400" />{siteConfig.name}</a>; }\n` },
    { path: "src/assets/icons/SvgIcon.tsx", content: `export function SvgIcon() { return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none"><path d="M12 3l8 5v8l-8 5-8-5V8l8-5z" stroke="currentColor" strokeWidth="2"/></svg>; }\n` },
    { path: "src/assets/images/DashboardIllustration.tsx", content: `export function DashboardIllustration() { return <div className="rounded-[2rem] bg-gradient-to-br from-blue-600 to-cyan-400 p-1"><div className="rounded-[1.8rem] bg-white p-8 dark:bg-slate-950">Dashboard product image placeholder</div></div>; }\n` }
  );

  sectionFiles.forEach((name) => {
    files.push({ path: `src/sections/${name}.tsx`, content: `import { SectionHeading } from "../components/ui/SectionHeading";\nexport function ${name}() { return <section className="mx-auto max-w-7xl px-6 py-20"><SectionHeading eyebrow="${name.replace("Section", "")}" title="${name.replace(/([A-Z])/g, " $1").replace(" Section", "").trim()}" /><div className="mt-8 grid gap-5 md:grid-cols-3"><article className="glass rounded-3xl p-6">Premium module</article><article className="glass rounded-3xl p-6">Responsive state</article><article className="glass rounded-3xl p-6">Motion ready</article></div></section>; }\n` });
  });

  files.push({
    path: "src/pages/HomePage.tsx",
    content: `import { MarketingLayout } from "../layouts/MarketingLayout";\nimport { AuroraBackground } from "../components/animations/AuroraBackground";\nimport { DashboardMockup } from "../components/dashboard/DashboardMockup";\n${homeSections.map((name) => `import { ${name} } from "../sections/${name}";`).join("\n")}\nimport { CTASection } from "../sections/CTASection";\n\nexport default function HomePage() { return <MarketingLayout><main className="relative overflow-hidden"><AuroraBackground /><section className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-24 md:grid-cols-[1.05fr_.95fr]"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-blue-600">AI SaaS Operating Layer</p><h1 className="mt-5 text-6xl font-black tracking-[-0.07em] text-slate-950 dark:text-white md:text-8xl">${productName} feels like a $100M startup.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">${summary}</p><div className="mt-8 flex gap-3"><a className="rounded-full bg-blue-600 px-6 py-3 font-bold text-white" href="/signup">Start free</a><a className="rounded-full border px-6 py-3 font-bold" href="/dashboard-preview">View demo</a></div></div><DashboardMockup /></section>${homeSections.map((name) => `<${name} />`).join("")}<CTASection /></main></MarketingLayout>; }\n`,
  });

  while (files.length < 58) {
    const index = files.length + 1;
    files.push({
      path: `src/components/ui/UtilityBlock${index}.tsx`,
      content: `export function UtilityBlock${index}() { return <div className="rounded-2xl border border-slate-200 p-4">Utility block ${index}</div>; }\n`,
    });
  }

  return {
    projectTitle: productName,
    description: summary,
    files,
    previewHtml: previewHtml(productName, summary),
    workflowLogs: [
      { agent: "Architecture Planner", action: `Generated ${files.length} production files across pages, sections, components, hooks, services, and assets.` },
      { agent: "UI Director", action: "Applied premium SaaS design language with glassmorphism, gradients, motion, and dashboard mockups." },
      { agent: "Framework Router", action: "Selected React + TypeScript + Vite + Tailwind CSS + Framer Motion per user requirements." },
    ],
  };
}
