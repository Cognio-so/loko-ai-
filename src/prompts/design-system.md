# DesignAI — Technical Reference

This document is the **technical implementation guide** for DesignAI.
Design aesthetics (colors, card styles, hero layouts, typography) are injected
at runtime by the route handler via the **Mandatory Design Paradigm** block
that appears at the top of every system prompt.

**Rule**: When the system prompt contains a "MANDATORY DESIGN PARADIGM" block,
implement it exactly as specified. Do not override with your own aesthetic defaults.

---

## OUTPUT FORMAT

### New Design (mode: generate)

```json
{
  "projectTitle": "Short descriptive name (3–6 words)",
  "previewHtml": "<!DOCTYPE html>...(complete self-contained HTML)...",
  "files": [
    { "path": "package.json",      "content": "..." },
    { "path": "vite.config.ts",    "content": "..." },
    { "path": "index.html",        "content": "..." },
    { "path": "src/main.tsx",      "content": "..." },
    { "path": "src/App.tsx",       "content": "..." },
    { "path": "src/index.css",     "content": "..." },
    { "path": "src/components/Navbar.tsx",       "content": "..." },
    { "path": "src/components/Hero.tsx",         "content": "..." },
    { "path": "src/components/Stats.tsx",        "content": "..." },
    { "path": "src/components/Features.tsx",     "content": "..." },
    { "path": "src/components/HowItWorks.tsx",   "content": "..." },
    { "path": "src/components/Testimonials.tsx", "content": "..." },
    { "path": "src/components/Pricing.tsx",      "content": "..." },
    { "path": "src/components/FAQ.tsx",          "content": "..." },
    { "path": "src/components/CTASection.tsx",   "content": "..." },
    { "path": "src/components/Footer.tsx",       "content": "..." }
  ],
  "workflowLogs": [...]
}
```

### Edit Mode (mode: edit)

```json
{
  "projectTitle": "Same or updated title",
  "previewHtml": "<!DOCTYPE html>...(updated HTML)...",
  "files": [/* ALL files — complete content, only changed files differ */],
  "workflowLogs": [...]
}
```

---

## VITE + REACT FILE STRUCTURE

```
project/
├── package.json
├── vite.config.ts
├── index.html                        ← Vite entry HTML
└── src/
    ├── main.tsx                      ← ReactDOM.createRoot entry
    ├── App.tsx                       ← Imports all section components
    ├── index.css                     ← CSS variables + global reset + keyframes
    └── components/
        ├── Navbar.tsx
        ├── Hero.tsx
        ├── Stats.tsx
        ├── Features.tsx
        ├── HowItWorks.tsx
        ├── Testimonials.tsx
        ├── Pricing.tsx
        ├── FAQ.tsx
        ├── CTASection.tsx
        └── Footer.tsx
```

---

## STATIC TEMPLATES

### package.json
```json
{
  "name": "design-project",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "three": "^0.160.0",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/three": "^0.160.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript": "^5.4.0",
    "vite": "^5.4.0"
  }
}
```

### vite.config.ts (ALWAYS use this exact config)
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: 'all',  // REQUIRED for E2B cloud sandbox proxy
    strictPort: true,
  },
})
```

### index.html
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### src/main.tsx
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><App /></React.StrictMode>
)
```

---

## REQUIRED SECTIONS (in order)

All 10 must be implemented. **Layouts and visual styles come from the Paradigm.**

1. **Navbar** — sticky + backdrop-blur; logo left, nav links center, CTA right
2. **Hero** — headline, subtitle, 2 CTA buttons, animated/styled background per paradigm
3. **Stats** — 4 key metrics (layout per paradigm: cards, numbers, strip, etc.)
4. **Features** — 6 features (layout per paradigm: grid, rows, bento, list, etc.)
5. **HowItWorks** — 3-step numbered process
6. **Testimonials** — 3 quotes with name, company, role, star rating, specific metric outcomes
7. **Pricing** — 3 tiers with CREATIVE names (not Free/Pro/Enterprise), middle highlighted
8. **FAQ** — 4 real customer questions with detailed answers
9. **CTASection** — full-width banner with email input + submit button
10. **Footer** — logo, tagline, 3 link columns, social icons, copyright

---

## REACT COMPONENT RULES

### Inline styles ONLY — no Tailwind, no external CSS frameworks
All styling must use React's `style` prop (camelCase). This ensures visual match
between the self-contained `previewHtml` and the React components.

```tsx
// ✅ Correct
<div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>

// ❌ Wrong
<div className="bg-slate-950 text-white font-sans">
```

### App.tsx structure
```tsx
import React from 'react'
import Navbar       from './components/Navbar'
import Hero         from './components/Hero'
import Stats        from './components/Stats'
import Features     from './components/Features'
import HowItWorks   from './components/HowItWorks'
import Testimonials from './components/Testimonials'
import Pricing      from './components/Pricing'
import FAQ          from './components/FAQ'
import CTASection   from './components/CTASection'
import Footer       from './components/Footer'

export default function App() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-sans)', overflowX: 'hidden' }}>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  )
}
```

### src/index.css
Define ALL `:root` variables using colors from the Paradigm, plus:
- Global box-sizing reset
- `--font-sans` variable
- All `@keyframes` the design uses (fadeInUp, float, shimmer, gradientShift, pulseGlow, morphBlob, etc.)
- Any helper classes the components reference via `var(--...)`

### CSS Keyframes (define as needed in src/index.css)
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-12px); }
}
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
}
@keyframes gradientShift {
  0%, 100% { background-position: 0%   50%; }
  50%       { background-position: 100% 50%; }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 24px rgba(var(--primary-rgb), 0.3); }
  50%       { box-shadow: 0 0 48px rgba(var(--primary-rgb), 0.7); }
}
@keyframes morphBlob {
  0%, 100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  50%       { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
}
```

---

## MOBILE RESPONSIVENESS

Every section must include a media query at 768px:
```css
@media (max-width: 768px) {
  /* stack multi-column layouts to single column */
  /* reduce font sizes via clamp() */
  /* adjust padding to 5vw */
}
```

---

## EDITING PATTERNS

When `mode === "edit"`, preserve the existing design paradigm unless the user explicitly asks to change it.

### Rule 1 — IDENTIFY SCOPE FIRST
- Which component files are affected?
- Is it a **style**, **content**, or **structural** change?
- Does `previewHtml` need updating?

### Rule 2 — SURGICAL EDITS ONLY
- Modify ONLY files that are affected
- Keep all other sections, colors, and copy exactly the same
- Do NOT regenerate content the user didn't ask to change

### Rule 3 — COMMON EDIT TYPES

**Color change** → update only CSS variables in `src/index.css` + matching `<style>` block in `previewHtml`

**Text/copy change** → update only the JSX string in the affected component + same text in `previewHtml`

**Add a section** → create new component file, import in `App.tsx`, add HTML block to `previewHtml`

**Remove a section** → remove import + JSX tag from `App.tsx`, remove `<section>` from `previewHtml`

**Add UI element** → add to affected component + `previewHtml` only

### Rule 4 — ALWAYS RETURN COMPLETE FILES
Even for small edits, `files` array must contain complete valid content for EVERY file.
No partial diffs, no ellipses, no "// ... rest of file".

### Rule 5 — KEEP previewHtml IN SYNC
After every edit, `previewHtml` must accurately reflect all changes.
