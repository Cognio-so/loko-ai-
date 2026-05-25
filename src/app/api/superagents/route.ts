import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { resolve } from "path";
import { getAIResponse } from "@/lib/ai";
import { getErrorMessage } from "@/lib/api";
import { getLocalGeneratedProject } from "@/lib/localGeneratedProject";

const GENERATION_TIMEOUT_MS = 90000;

// ─── Load design-system.md ────────────────────────────────────────────────────
function getDesignSystemDocs(): string {
  try {
    return readFileSync(
      resolve(process.cwd(), "src/prompts/design-system.md"),
      "utf8"
    );
  } catch {
    return "";
  }
}

// ─── JSON helpers ─────────────────────────────────────────────────────────────
function parseAIJson(content: string) {
  const trimmed = content
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1));
      } catch {
        throw new Error("AI response was not valid JSON.");
      }
    }
    throw new Error("AI response was not valid JSON.");
  }
}

// ─── Design Paradigm System ───────────────────────────────────────────────────
// Each paradigm gives the AI an exact design DNA: colors, card style, hero layout,
// button style, typography, animations, section layouts, and copy tone.
// This forces genuine variety instead of always producing dark glassmorphism + indigo.

type DesignParadigm =
  | "DARK_GLASS"
  | "LIGHT_EDITORIAL"
  | "BOLD_BRUTALIST"
  | "NEON_CYBERPUNK"
  | "EARTH_ORGANIC"
  | "LUXURY_NOIR"
  | "VIBRANT_GRADIENT"
  | "MINIMAL_MONO"
  | "RETRO_VINTAGE"
  | "TECH_3D"
  | "SOFT_PASTEL"
  | "MAGAZINE_EDITORIAL";

const PARADIGM_SPECS: Record<DesignParadigm, string> = {

  DARK_GLASS: `
═══ DESIGN PARADIGM: Dark Glassmorphism ═══
COLORS → bg:#020617 | surface:#0f172a | primary:#6366f1 | accent:#a5b4fc | text:#f8fafc | primary-rgb:99,102,241
CARDS → background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:20px; backdrop-filter:blur(12px)
  hover → background:rgba(99,102,241,0.08); border-color:rgba(99,102,241,0.3); transform:translateY(-4px)
HERO → Centered full-viewport. Radial gradient orb: radial-gradient(ellipse at 30% 40%,rgba(99,102,241,0.22) 0%,transparent 60%) animated with pulseGlow. 3-4 floating orb divs with blur. Gradient headline text (135deg, #fff 0%, #a5b4fc 50%, #6366f1 100%).
BUTTONS → Primary: background:linear-gradient(135deg,#6366f1,#8b5cf6); border-radius:9999px; padding:14px 32px; box-shadow:0 8px 32px rgba(99,102,241,0.4)
  Secondary: border:1.5px solid rgba(99,102,241,0.4); color:#a5b4fc; background:rgba(99,102,241,0.08); border-radius:9999px
TYPOGRAPHY → h1:font-size:clamp(52px,8vw,96px); weight:900; letter-spacing:-0.05em; gradient text | h2:clamp(32px,5vw,56px); weight:800; color:#fff
ANIMATIONS → fadeInUp(0.7s), float(6s infinite on orbs), pulseGlow(6s on radial bg), shimmer on gradient text
FEATURES → 3-column grid of 6 glass cards, emoji/icon at top, gradient icon background circle
STATS → 4 glass cards in a horizontal row, large gradient number + label
COPY TONE → Premium SaaS: precise, benefit-driven, specific metrics ("10× faster", "99.9% uptime")`,

  LIGHT_EDITORIAL: `
═══ DESIGN PARADIGM: Light Editorial ═══
COLORS → bg:#FFFFFF | surface:#F8FAFC | primary:#0F172A | accent:#6366F1 | text:#1E293B | muted:#64748B | border:#E2E8F0
CARDS → background:#FFFFFF; border:1px solid #E2E8F0; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.06)
  hover → box-shadow:0 8px 40px rgba(0,0,0,0.12); transform:translateY(-4px)
HERO → LEFT-ALIGNED SPLIT. Left 55%: left-aligned content (text-align:left; max-width:560px). Right 45%: a CSS-built UI mockup — a dark rounded rectangle (background:#0F172A; border-radius:24px; padding:28px) containing colored block rows simulating a dashboard/app screen, with inner cards and colored bars.
  Headline: dark slate, NO gradient, serious and confident. A thin 2px indigo underline accent under section labels.
BUTTONS → Primary: background:#0F172A; color:#fff; border-radius:10px; padding:14px 32px; font-weight:700
  Secondary: border:2px solid #0F172A; color:#0F172A; background:transparent; border-radius:10px; padding:14px 32px
TYPOGRAPHY → font-family:Georgia,'Times New Roman',serif for h1/h2; system-ui for body
  h1:font-size:clamp(40px,6vw,72px); weight:800; letter-spacing:-0.03em; color:#0F172A; line-height:1.1
  h2:clamp(28px,4vw,48px); weight:700; color:#0F172A
  Section labels: 2px solid #6366F1 underline; width:40px; margin-bottom:16px (decorative rule)
ANIMATIONS → Subtle slideInLeft for hero text (0.6s ease-out), gentle fadeIn for cards
FEATURES → Alternating left-right rows: odd rows have icon/visual left + text right; even rows text left + visual right
STATS → 2×2 white card grid, each card: large bold number (color:#0F172A), descriptive label (color:#64748B)
COPY TONE → Professional B2B: trustworthy, outcome-focused ("Reduce costs by 40%", specific measurable benefits)`,

  BOLD_BRUTALIST: `
═══ DESIGN PARADIGM: Bold Brutalism ═══
COLORS → bg:#F5F0E8 | surface:#FFFFFF | primary:#000000 | accent:#FF3B00 | text:#000000 | cream:#F5F0E8
CARDS → background:#FFFFFF; border:2.5px solid #000; border-radius:0; box-shadow:6px 6px 0 #000
  hover → transform:translate(-3px,-3px); box-shadow:9px 9px 0 #000
HERO → ASYMMETRIC LEFT-ALIGNED. Background:#F5F0E8. Left 60%: massive headline with ONE accent word in #FF3B00, left-aligned, line-height:0.9. Below: bold subtext. Big brutalist CTA. Right 40%: solid black rectangle (background:#000; border-radius:0; aspect-ratio:0.75) containing large white text or a bold number/stat.
  Section numbers behind content: position:absolute; font-size:120px; font-weight:900; color:rgba(0,0,0,0.05); top:-20px; left:-10px; pointer-events:none
BUTTONS → Primary: background:#000; color:#fff; border:2.5px solid #000; border-radius:0; box-shadow:4px 4px 0 #FF3B00; padding:14px 36px; font-weight:900; text-transform:uppercase; letter-spacing:0.06em
  hover → box-shadow:7px 7px 0 #FF3B00; transform:translate(-2px,-2px)
  Secondary: background:#FF3B00; color:#fff; border:2.5px solid #000; border-radius:0; box-shadow:4px 4px 0 #000
TYPOGRAPHY → system-ui, font-weight:900 forced throughout
  h1:font-size:clamp(56px,10vw,120px); weight:900; letter-spacing:-0.04em; line-height:0.9; color:#000; text-transform:uppercase
  h2:clamp(36px,6vw,72px); weight:900; color:#000; text-transform:uppercase
  Separators: 3px solid #000 horizontal rules between major sections
ANIMATIONS → Fast snap-in (0.25s ease), NO fades — elements appear sharply. Bold hover states only.
FEATURES → Full-width bold rows: each feature is a bordered row (border-top:2.5px solid #000; padding:24px 0) with large bold feature name left + description right
STATS → 4 massive numbers on a solid black strip (#000 background): white text, large red number, white label
COPY TONE → Direct, bold, imperative. "We ship. You win." Short sentences. No fluff. High confidence.`,

  NEON_CYBERPUNK: `
═══ DESIGN PARADIGM: Neon Cyberpunk ═══
COLORS → bg:#0A0010 | surface:#0D0020 | primary:#FF2AFF | accent:#00FFC8 | text:#E0E0FF | primary-rgb:255,42,255
CARDS → background:rgba(13,0,32,0.9); border:1px solid rgba(255,42,255,0.28); border-radius:12px;
  box-shadow:0 0 30px rgba(255,42,255,0.07), inset 0 0 30px rgba(0,255,200,0.02)
  hover → border-color:rgba(255,42,255,0.65); box-shadow:0 0 40px rgba(255,42,255,0.18)
HERO → Centered. Grid-pattern background using:
  background-image:linear-gradient(rgba(255,42,255,0.08) 1px,transparent 1px),linear-gradient(90deg,rgba(255,42,255,0.08) 1px,transparent 1px); background-size:40px 40px
  Add a "SYSTEM_ONLINE >" prefix line in #00FFC8 monospace ABOVE the main headline.
  Headline: font-family:'Courier New',monospace; color:#FF2AFF; text-shadow:0 0 30px rgba(255,42,255,0.8),0 0 60px rgba(255,42,255,0.4)
  Scanline overlay: repeating-linear-gradient(transparent 0,transparent 2px,rgba(0,0,0,0.03) 2px,rgba(0,0,0,0.03) 4px) over entire page
BUTTONS → Primary: background:transparent; border:2px solid #FF2AFF; color:#FF2AFF; border-radius:4px; box-shadow:0 0 20px rgba(255,42,255,0.3),inset 0 0 20px rgba(255,42,255,0.05); padding:14px 32px; font-family:monospace
  hover → box-shadow:0 0 40px rgba(255,42,255,0.7); background:rgba(255,42,255,0.1)
  Secondary: same style with #00FFC8
TYPOGRAPHY → 'Courier New',Consolas,monospace for headings and labels; system-ui for body paragraphs
  h1:font-size:clamp(48px,7vw,88px); weight:900; color:#FF2AFF; letter-spacing:-0.02em; neon text-shadow
  h2: color:#00FFC8; text-shadow:0 0 20px rgba(0,255,200,0.5)
  Labels: uppercase monospace with "▶" or ">" prefix
ANIMATIONS → glitchShake on h1 (3px x-translate every 3s), neon flicker @keyframes, border pulse
FEATURES → Terminal-style cards: each card looks like a CLI block — monospace header with > prefix, neon-bordered, tag chips in pink/green
STATS → Horizontal scrolling ticker/marquee of stats on a neon-bordered strip
COPY TONE → Tech-forward edgy. "Neural-accelerated", "Zero-latency pipeline", "Quantum-grade encryption". Bold metrics.`,

  EARTH_ORGANIC: `
═══ DESIGN PARADIGM: Earth Organic ═══
COLORS → bg:#FAF7F0 | surface:#F0EBE3 | primary:#5C4A2A | accent:#7CAE7A | text:#2D2416 | green:#4A7C59 | warm:#E8D5B7
CARDS → background:#F0EBE3; border:none; border-radius:24px; box-shadow:0 8px 32px rgba(92,74,42,0.11)
  hover → box-shadow:0 16px 48px rgba(92,74,42,0.18); transform:translateY(-4px)
HERO → LEFT-ALIGNED SPLIT. Left 55%: warm earthy content, text-align:left. Right 45%: LARGE ORGANIC BLOB SHAPE:
  width:100%; aspect-ratio:1; background:linear-gradient(135deg,#7CAE7A,#4A7C59); border-radius:60% 40% 30% 70%/60% 30% 70% 40%;
  @keyframes morphBlob { 0%,100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%} 50%{border-radius:30% 60% 70% 40%/50% 60% 30% 60%} }
  animation:morphBlob 8s ease-in-out infinite
  Add small floating leaf/dot shapes around the blob.
BUTTONS → Primary: background:#5C4A2A; color:#FAF7F0; border-radius:9999px; padding:14px 36px; font-weight:700
  Secondary: border:2px solid #5C4A2A; color:#5C4A2A; background:transparent; border-radius:9999px; padding:14px 36px
TYPOGRAPHY → Georgia,'Times New Roman',serif for headings; system-ui for body with line-height:1.8
  h1:font-size:clamp(44px,6vw,80px); weight:700; color:#2D2416; letter-spacing:-0.02em; line-height:1.1
  h2:clamp(30px,4vw,52px); weight:700; color:#2D2416
  Body text: warm tone, generous line-height
ANIMATIONS → Gentle fadeInUp(1s ease), morphBlob(8s on the blob shape), slow organic float
FEATURES → Bento grid: 2 wide feature cards (colspan:2, with organic green top accent) + 4 regular cards in second row
STATS → Large warm-brown numbers on a soft background band, no card boxes, just number+label pairs
COPY TONE → Warm, human, community-driven. "We believe in...", "Sustainably crafted", "For people who care". Inclusive language.`,

  LUXURY_NOIR: `
═══ DESIGN PARADIGM: Luxury Noir ═══
COLORS → bg:#0C0C0C | surface:#141414 | primary:#C9A96E | accent:#F0E6D0 | text:#F0E6D0 | gold:#C9A96E | gold-dim:rgba(201,169,110,0.18)
CARDS → background:#141414; border:1px solid rgba(201,169,110,0.14); border-radius:4px; border-top:2px solid #C9A96E;
  box-shadow:0 8px 40px rgba(0,0,0,0.6)
  hover → border-top-color:#F0E6D0; box-shadow:0 16px 60px rgba(0,0,0,0.8)
HERO → ULTRA-MINIMAL CENTERED. Background:#0C0C0C with very subtle radial gold glow: radial-gradient(ellipse at 50% 40%,rgba(201,169,110,0.05) 0%,transparent 55%)
  OVERLINE TEXT (above headline): font-size:11px; letter-spacing:0.4em; text-transform:UPPERCASE; color:#C9A96E; font-weight:400; margin-bottom:32px
  Thin gold rule: width:40px; height:1px; background:#C9A96E; margin:20px auto (between overline and headline)
  HEADLINE: font-family:Georgia,serif; font-weight:200 (thin, elegant); color:#F0E6D0; font-size:clamp(36px,5vw,80px)
  ONE single gold CTA button. Minimal. Lots of whitespace.
BUTTONS → Primary ONLY: background:transparent; border:1px solid #C9A96E; color:#C9A96E; padding:16px 48px; letter-spacing:0.22em; text-transform:uppercase; font-size:11px; font-weight:500; border-radius:0
  hover → background:#C9A96E; color:#0C0C0C
TYPOGRAPHY → Georgia,'Didot','Garamond',serif for ALL headings
  h1:font-size:clamp(36px,5vw,80px); weight:200-300 (light/thin for elegance); letter-spacing:0.02em; color:#F0E6D0; line-height:1.15
  h2:clamp(24px,3.5vw,52px); weight:300; color:#F0E6D0
  Gold rule dividers: 1px solid #C9A96E; width:40px; margin:20px 0
ANIMATIONS → Very slow, very subtle fadeIn(1.8s ease). NO bouncing. NO floating. Elegance = restraint.
FEATURES → Spacious alternating rows, text only (no icon cards). Thin gold top-border separator between each feature. Lots of whitespace.
STATS → Roman numerals (I II III IV) as labels, gold numbers on dark background. Minimal.
COPY TONE → Exclusivity, heritage, perfection. "For those who demand the extraordinary." "Crafted by artisans." Short. Powerful. No adjective overload.`,

  VIBRANT_GRADIENT: `
═══ DESIGN PARADIGM: Vibrant Gradient ═══
COLORS → bg:#FFFFFF | surface:#F8F7FF | primary:#6C47FF | accent:#FF6B9D | text:#1A1A2E | hero-bg:linear-gradient(135deg,#6C47FF 0%,#FF6B9D 60%,#FFB347 100%) | primary-rgb:108,71,255
CARDS → background:#FFFFFF; border:2px solid transparent; border-radius:20px; box-shadow:0 8px 32px rgba(108,71,255,0.11)
  hover → transform:translateY(-6px); box-shadow:0 20px 60px rgba(108,71,255,0.2)
HERO → CENTERED with full gradient background. Apply linear-gradient(135deg,#6C47FF 0%,#FF6B9D 60%,#FFB347 100%) to hero section.
  Pill badge ABOVE headline: background:rgba(255,255,255,0.2); border:1px solid rgba(255,255,255,0.4); border-radius:9999px; padding:6px 18px; font-size:13px; color:#fff; backdrop-filter:blur(8px)
  Floating colorful blobs behind (4 divs, each a large blurred circle in different gradient colors, absolute positioned, opacity:0.3-0.4, blur:60px).
  WHITE WAVE SVG at the bottom of the hero section separating it from the next section.
  Headline: color:#fff; font-weight:900; text-shadow:0 4px 24px rgba(0,0,0,0.15)
BUTTONS → Primary: background:#fff; color:#6C47FF; border-radius:9999px; font-weight:800; padding:14px 36px; box-shadow:0 8px 32px rgba(0,0,0,0.15)
  hover → transform:scale(1.05)
  Secondary: border:2px solid rgba(255,255,255,0.6); color:#fff; background:rgba(255,255,255,0.12); border-radius:9999px; backdrop-filter:blur(8px)
TYPOGRAPHY → system-ui rounded and friendly
  h1 (in hero): font-size:clamp(48px,7vw,96px); weight:900; color:#fff; letter-spacing:-0.03em
  h2 (outside hero): font-size:clamp(32px,5vw,60px); weight:800; color:#1A1A2E; gradient on accent words
ANIMATIONS → float(playful 4s), scale-pulse on hero badge, colorful gradient shift
FEATURES → 3-col cards: each card has a gradient icon circle (different gradient per card: purple→pink, orange→red, blue→purple etc.), bold colored title
STATS → Wide gradient band (gradient bg) with 4 large white numbers + white labels
COPY TONE → Energetic, inclusive, exciting. "Join 50,000+ creators", "Start free today", upbeat and welcoming.`,

  MINIMAL_MONO: `
═══ DESIGN PARADIGM: Minimal Monochrome ═══
COLORS → bg:#FAFAFA | surface:#F4F4F4 | primary:#111111 | accent:#888888 | text:#111111 | muted:#888888 | border:#E0E0E0
CARDS → background:#FFFFFF; border:1px solid #E0E0E0; border-radius:8px; box-shadow:none
  hover → border-color:#111; box-shadow:4px 4px 0 #111
HERO → FULL-BLEED TYPOGRAPHY, left-aligned. Background:#FAFAFA.
  DECORATIVE BACKGROUND ELEMENT: a giant typographic character (first letter of brand, or "01", or "#1"):
  position:absolute; font-size:clamp(200px,30vw,420px); font-weight:900; color:#EBEBEB; right:-20px; top:-40px; line-height:1; pointer-events:none; user-select:none; z-index:0
  Real content in position:relative; z-index:1. Left-aligned. Confident. "We make X. Simply."
  NO gradient text. Plain black. Typography IS the design.
BUTTONS → Primary: background:#111; color:#fff; border-radius:6px; padding:14px 32px; font-weight:700
  Secondary: border:1.5px solid #111; color:#111; background:transparent; border-radius:6px; padding:14px 32px
TYPOGRAPHY → system-ui,-apple-system (pure system font stack)
  h1:font-size:clamp(48px,8vw,100px); weight:900; color:#111; letter-spacing:-0.06em; line-height:0.9
  h2:clamp(28px,4vw,52px); weight:800; color:#111; letter-spacing:-0.04em
  Labels: font-size:11px; letter-spacing:0.15em; text-transform:UPPERCASE; color:#888; font-weight:600
  Section separators: 1px solid #E0E0E0
ANIMATIONS → Precise minimal fade(0.35s ease-out). No decorative animations. Intentional and clean.
FEATURES → Numbered list (01–06): each row has a large bold number left (color:#E0E0E0; font-size:48px; font-weight:900), feature title center-left, description right. Thin separator lines between rows.
STATS → 4 huge numbers (no cards): arranged in a 2×2 or 4-column grid, number in #111 at clamp(56px,8vw,96px); label in #888 uppercase
COPY TONE → Precise, confident, zero fluff. "It just works." "No setup required." "The tool that gets out of your way." Functional language.`,

  RETRO_VINTAGE: `
═══ DESIGN PARADIGM: Retro Vintage ═══
COLORS → bg:#F5E6C8 | surface:#EDD9A3 | primary:#5C3D11 | accent:#C0392B | text:#2C1810 | paper:#F5E6C8
CARDS → background:#F5E6C8; border:2px solid #5C3D11; border-radius:8px; box-shadow:4px 4px 0 rgba(92,61,17,0.4)
  hover → box-shadow:7px 7px 0 rgba(92,61,17,0.5)
HERO → CENTERED VINTAGE POSTER. Background:#F5E6C8 with subtle dot texture:
  background-image:radial-gradient(circle,rgba(92,61,17,0.09) 1px,transparent 1px); background-size:24px 24px
  DECORATIVE DOUBLE BORDER around hero content box: outer border + offset inner border (use outline+outline-offset or nested div with border)
  DECORATIVE DIVIDER above headline: 3 short horizontal lines with a ◆ diamond shape in the center (use CSS or spans)
  Small overline text: "EST. [YEAR] —" in brown caps with letter-spacing
  Headline: Georgia serif, dark brown, timeless
BUTTONS → Primary: background:#C0392B; color:#F5E6C8; border:2px solid #7B241C; border-radius:4px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; padding:12px 32px
  Secondary: background:transparent; border:2px solid #5C3D11; color:#5C3D11; border-radius:4px; padding:12px 32px; text-transform:uppercase; letter-spacing:0.1em
TYPOGRAPHY → Georgia,'Times New Roman',serif for ALL headings
  h1:font-size:clamp(42px,6vw,80px); weight:700; color:#2C1810; letter-spacing:-0.01em; line-height:1.1
  h2:clamp(28px,4vw,52px); weight:700; color:#2C1810
  Section headers: centered, with thin rule lines on each side (use flex + hr elements)
ANIMATIONS → Subtle slow fadeIn(1.2s). Nothing that feels modern or digital. Still, timeless.
FEATURES → Centered grid of vintage badge-style cards: round bordered icon badge at top, serif card title, descriptive text
STATS → "Achievement" style: circular bordered badges (border-radius:50%; border:2px solid #5C3D11; padding:32px) with large number inside
COPY TONE → Heritage, quality craftsmanship. "Trusted since [year]", "Handcrafted with care", "A legacy of excellence". Warm but authoritative.`,

  TECH_3D: `
═══ DESIGN PARADIGM: Tech 3D / Dimensional ═══
COLORS → bg:#0F1117 | surface:#1A1F2E | primary:#00D4FF | accent:#7B61FF | text:#E0F0FF | dim:#8899AA | primary-rgb:0,212,255
CARDS → background:linear-gradient(145deg,#1E2435,#161B28); border:1px solid rgba(0,212,255,0.12); border-radius:16px;
  box-shadow:0 20px 60px rgba(0,212,255,0.07),-4px -4px 8px rgba(255,255,255,0.02),4px 4px 8px rgba(0,0,0,0.4)
  hover → transform:perspective(800px) rotateX(-2deg) translateY(-8px); box-shadow:0 30px 80px rgba(0,212,255,0.15)
HERO → Centered. PERSPECTIVE GRID behind content:
  <div style="position:absolute;inset:0;top:-20%;background-image:linear-gradient(rgba(0,212,255,0.1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.1) 1px,transparent 1px);background-size:60px 60px;transform:perspective(400px) rotateX(60deg);transform-origin:top;opacity:0.6"/>
  Gradient headline: background:linear-gradient(135deg,#00D4FF,#7B61FF); gradient-text.
  Tech label chip above headline: background:rgba(0,212,255,0.1); border:1px solid rgba(0,212,255,0.3); border-radius:6px; padding:4px 14px; color:#00D4FF; font-family:monospace; font-size:12px; letter-spacing:0.1em
BUTTONS → Primary: background:linear-gradient(135deg,#00D4FF,#7B61FF); color:#0F1117; border-radius:10px; font-weight:800; padding:14px 36px; box-shadow:0 8px 32px rgba(0,212,255,0.3)
  Secondary: border:1px solid rgba(0,212,255,0.3); color:#00D4FF; background:rgba(0,212,255,0.06); border-radius:10px; padding:14px 36px
TYPOGRAPHY → system-ui technical
  h1:font-size:clamp(48px,7vw,92px); weight:900; letter-spacing:-0.04em; gradient text (cyan→purple)
  h2:clamp(30px,4vw,56px); weight:800; color:#E0F0FF
  Tech labels: font-size:11px; letter-spacing:0.2em; text-transform:uppercase; color:#00D4FF
ANIMATIONS → 3D card tilt on hover (perspective rotateX/Y), floating depth layers, perspective grid subtle pulse
FEATURES → Bento grid: row-1 has 2 WIDE cards (each spanning 50% width, height:280px), row-2 has 4 regular equal cards
STATS → 4 cards with animated gradient border effect, large cyan metric number, dim label
COPY TONE → Technical precision, performance numbers, developer-focused. "Sub-100ms", "99.99% uptime", API-first, built for engineering teams.`,

  SOFT_PASTEL: `
═══ DESIGN PARADIGM: Soft Pastel / Aurora ═══
COLORS → bg:#FFF8FF | surface:#FAF0FE | primary:#A855F7 | accent:#818CF8 | text:#1E1B4B | light-purple:#F3E8FF | primary-rgb:168,85,247
CARDS → background:#FFFFFF; border:1.5px solid rgba(168,85,247,0.15); border-radius:24px; box-shadow:0 8px 32px rgba(168,85,247,0.1)
  hover → box-shadow:0 20px 60px rgba(168,85,247,0.2); transform:translateY(-6px)
HERO → Centered. Soft AURORA gradient background:
  background: radial-gradient(ellipse at 20% 20%,rgba(168,85,247,0.15) 0%,transparent 50%), radial-gradient(ellipse at 80% 80%,rgba(129,140,248,0.15) 0%,transparent 50%), radial-gradient(ellipse at 60% 30%,rgba(236,72,153,0.08) 0%,transparent 40%); background-color:#FFF8FF
  PILL BADGE above headline: background:rgba(168,85,247,0.1); border:1.5px solid rgba(168,85,247,0.25); border-radius:9999px; padding:6px 18px; font-size:13px; color:#A855F7 — with sparkle ✨ character before text
  Headline: dark indigo (#1E1B4B), weight:800. Key word accented in solid #A855F7 (not gradient, just the purple color).
  Background BLOB shapes: 3-4 divs with border-radius:60% 40% 70% 30%/30% 60% 40% 70%; blur:80px; opacity:0.15-0.2; absolute positioned
BUTTONS → Primary: background:linear-gradient(135deg,#A855F7,#818CF8); color:#fff; border-radius:9999px; padding:14px 36px; box-shadow:0 8px 32px rgba(168,85,247,0.4); font-weight:700
  Secondary: border:2px solid rgba(168,85,247,0.3); color:#A855F7; background:rgba(168,85,247,0.05); border-radius:9999px; padding:14px 36px
TYPOGRAPHY → system-ui friendly and rounded feel
  h1:font-size:clamp(44px,6vw,80px); weight:800; color:#1E1B4B; letter-spacing:-0.03em; line-height:1.15
  h2:clamp(30px,4vw,56px); weight:700; color:#1E1B4B
ANIMATIONS → Slow aurora gradient shift (8s infinite), gentle blob morphing, soft fadeInUp
FEATURES → 3-column white cards with gradient icon circle at top (purple→indigo), colored title, soft border
STATS → 4 cards with very soft purple shadow, large purple numbers (#A855F7), dark indigo labels
COPY TONE → Warm, inclusive, uplifting. "Made for everyone", "Simple and delightful", "You deserve better tools". Gentle encouragement.`,

  MAGAZINE_EDITORIAL: `
═══ DESIGN PARADIGM: Magazine Editorial ═══
COLORS → bg:#FFFFFF | surface:#F9F9F9 | primary:#1A1A1A | accent:#E63946 | text:#1A1A1A | gray:#6B7280 | red:#E63946
CARDS → background:#FFFFFF; border:none; border-bottom:2px solid #1A1A1A; border-radius:0; box-shadow:none; padding-bottom:28px
  hover → border-bottom-color:#E63946
HERO → EDITORIAL SPLIT or FULL-BLEED TYPOGRAPHY.
  Option A — Asymmetric Split: Left 60%: large section tag ("FEATURE") in red uppercase 11px; enormous headline in Georgia serif below, line-height:0.85. Right 40%: solid red vertical strip (background:#E63946; height:100%; min-height:500px) with white vertical text (writing-mode:vertical-rl; transform:rotate(180deg)) or red-on-white bold typographic element.
  Option B — Typographic flood: background:#FFFFFF; headline font-size:clamp(64px,11vw,140px); color:#1A1A1A; weight:900; line-height:0.82; with ONE line or word in red (#E63946).
  Large decorative background number: position:absolute; font-size:clamp(200px,35vw,500px); font-weight:900; color:#F0F0F0; right:-40px; top:-60px; z-index:0
BUTTONS → Primary: background:#E63946; color:#fff; border-radius:0; padding:14px 32px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em
  Secondary: border-bottom:3px solid #1A1A1A; color:#1A1A1A; border-radius:0; background:transparent; padding:14px 0; font-weight:700; text-transform:uppercase
TYPOGRAPHY → Georgia/serif for h1/h2; system-ui for body
  h1:font-size:clamp(52px,9vw,120px); weight:900; letter-spacing:-0.05em; line-height:0.85; color:#1A1A1A; font-family:Georgia,serif
  Section headers: ALL CAPS + 3px solid red underline rule (width:60px; background:#E63946; height:3px; margin-bottom:16px)
  Pull quotes: font-style:italic; font-size:clamp(20px,2.5vw,28px); color:#1A1A1A; border-left:5px solid #E63946; padding-left:24px; font-family:Georgia,serif
ANIMATIONS → Fast horizontal slide-in (0.35s ease-out). Bold, deliberate transitions.
FEATURES → Editorial "article cards": each card has a red top-strip (height:4px; background:#E63946), bold Georgia serif title, body text. No icons. Typography-forward.
STATS → Large editorial numbers on a grid: red number color (#E63946), black labels, red horizontal rules between sections
COPY TONE → Authority, expertise, thought leadership. "The industry is changing." "Here's what you need to know." Bold declarative statements.`,
};

// ─── Category → paradigm mapping ─────────────────────────────────────────────
function detectCategory(prompt: string): string {
  const p = prompt.toLowerCase();
  if (/\b(ai|saas|software|app|platform|tool|api|developer|cloud|data|analytics|automation|workflow|devops|b2b|startup|tech)\b/.test(p)) return "tech";
  if (/\b(health|wellness|yoga|meditation|fitness|gym|sport|nutrition|diet|mental|therapy|medical|clinic|beauty|spa|mindful)\b/.test(p)) return "health";
  if (/\b(finance|fintech|crypto|blockchain|bank|invest|trading|payment|wallet|defi|wealth|insurance|money)\b/.test(p)) return "finance";
  if (/\b(luxury|jewel|watch|fashion|haute|couture|premium|exclusive|boutique|perfume|bespoke|designer)\b/.test(p)) return "luxury";
  if (/\b(food|restaurant|cafe|coffee|bakery|recipe|meal|delivery|kitchen|chef|catering|organic|farm|eat)\b/.test(p)) return "food";
  if (/\b(creative|design|agency|studio|portfolio|art|branding|marketing|advertising|photography)\b/.test(p)) return "creative";
  if (/\b(ecommerce|ecom|shop|store|product|marketplace|brand|retail|merch|dropship)\b/.test(p)) return "ecommerce";
  if (/\b(education|learn|course|tutor|school|academy|university|training|bootcamp|skill|teach)\b/.test(p)) return "education";
  if (/\b(game|gaming|esport|play|entertainment|media|streaming|music|podcast|video)\b/.test(p)) return "entertainment";
  return "general";
}

// Weighted arrays: more copies = higher probability for that category
const CATEGORY_PARADIGM_MAP: Record<string, DesignParadigm[]> = {
  tech:          ["DARK_GLASS", "TECH_3D", "NEON_CYBERPUNK", "MINIMAL_MONO", "BOLD_BRUTALIST", "DARK_GLASS", "TECH_3D"],
  health:        ["EARTH_ORGANIC", "SOFT_PASTEL", "LIGHT_EDITORIAL", "VIBRANT_GRADIENT", "MINIMAL_MONO", "EARTH_ORGANIC"],
  finance:       ["LUXURY_NOIR", "MINIMAL_MONO", "DARK_GLASS", "LIGHT_EDITORIAL", "TECH_3D", "LUXURY_NOIR"],
  luxury:        ["LUXURY_NOIR", "LIGHT_EDITORIAL", "MINIMAL_MONO", "MAGAZINE_EDITORIAL", "LUXURY_NOIR"],
  food:          ["EARTH_ORGANIC", "VIBRANT_GRADIENT", "MAGAZINE_EDITORIAL", "RETRO_VINTAGE", "LIGHT_EDITORIAL"],
  creative:      ["BOLD_BRUTALIST", "MAGAZINE_EDITORIAL", "NEON_CYBERPUNK", "VIBRANT_GRADIENT", "MINIMAL_MONO", "BOLD_BRUTALIST"],
  ecommerce:     ["LIGHT_EDITORIAL", "MINIMAL_MONO", "SOFT_PASTEL", "VIBRANT_GRADIENT", "BOLD_BRUTALIST"],
  education:     ["LIGHT_EDITORIAL", "SOFT_PASTEL", "VIBRANT_GRADIENT", "MINIMAL_MONO", "EARTH_ORGANIC"],
  entertainment: ["NEON_CYBERPUNK", "BOLD_BRUTALIST", "VIBRANT_GRADIENT", "DARK_GLASS", "MAGAZINE_EDITORIAL", "NEON_CYBERPUNK"],
  general:       ["DARK_GLASS", "LIGHT_EDITORIAL", "BOLD_BRUTALIST", "VIBRANT_GRADIENT", "TECH_3D", "SOFT_PASTEL", "MINIMAL_MONO", "EARTH_ORGANIC", "MAGAZINE_EDITORIAL"],
};

function pickDesignParadigm(prompt: string): DesignParadigm {
  const category = detectCategory(prompt);
  const options = CATEGORY_PARADIGM_MAP[category] ?? CATEGORY_PARADIGM_MAP.general;
  return options[Math.floor(Math.random() * options.length)];
}

// ─── System prompts ───────────────────────────────────────────────────────────

function buildGenerateSystemPrompt(designDocs: string, userPrompt: string): string {
  const paradigm = pickDesignParadigm(userPrompt);
  const paradigmSpec = PARADIGM_SPECS[paradigm];

  return `You are DesignAI — the world's most advanced landing page generator.
You create STUNNING, pixel-perfect landing pages that look GENUINELY UNIQUE — not like every other AI-generated site.

## ⚠️ MANDATORY DESIGN PARADIGM — IMPLEMENT EXACTLY AS SPECIFIED
You have been assigned a specific design style. Implement it precisely and consistently across ALL sections.
Do NOT default to generic dark glassmorphism or indigo colors unless the paradigm below specifies them.
Do NOT mix paradigms. Do NOT ignore these instructions.

${paradigmSpec}

## TECHNICAL REFERENCE
${designDocs}

## OUTPUT FORMAT (strict JSON — no markdown wrapper)
{
  "projectTitle": "Short descriptive name (3-6 words)",
  "previewHtml": "<!DOCTYPE html>...(complete self-contained HTML document)...",
  "files": [
    { "path": "package.json",                    "content": "..." },
    { "path": "vite.config.ts",                  "content": "..." },
    { "path": "index.html",                      "content": "..." },
    { "path": "src/main.tsx",                    "content": "..." },
    { "path": "src/App.tsx",                     "content": "..." },
    { "path": "src/index.css",                   "content": "..." },
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
  "workflowLogs": [
    { "agent": "Design Architect",  "action": "Assigned paradigm and established visual identity" },
    { "agent": "Layout Engineer",   "action": "Implemented paradigm-specific layout and grid" },
    { "agent": "Visual Designer",   "action": "Applied exact colors, typography, and motion from spec" },
    { "agent": "QA Engineer",       "action": "Verified paradigm consistency across all 10 sections" }
  ]
}

## ABSOLUTE RULES
- previewHtml MUST be a COMPLETE valid HTML5 document (<!DOCTYPE html> through </html>)
- previewHtml must be self-contained: ALL CSS in a <style> block, NO external dependencies
- React components MUST use inline styles only (style={{ ... }}) — no Tailwind, no CSS imports
- vite.config.ts MUST include server: { host:'0.0.0.0', port:5173, allowedHosts:true, cors:true, strictPort:true, hmr:{ clientPort:443, protocol:'wss' } }
- ALL content must be SPECIFIC to the product/service described — NO generic placeholder copy
- Pricing tier names must be creative and product-appropriate (NOT "Free/Pro/Enterprise")
- Testimonials must include SPECIFIC metrics: "Saved us 12 hours/week", "Grew revenue 3× in 90 days"
- The previewHtml and React components must implement the SAME design paradigm consistently`;
}

// ─── Smart file selection for edits ──────────────────────────────────────────
// Only sends files relevant to the requested change, keeping the prompt small
// and fast. Always include App.tsx and index.css as the integration layer.

function selectFilesForEdit(
  editPrompt: string,
  files: Array<{ path: string; content: string }>
): Array<{ path: string; content: string }> {
  const p = editPrompt.toLowerCase();

  // Broad changes need all files
  if (/color|theme|background|font|typograph|style|palette|scheme|rebrand|redesign|all|every|entire|whole/.test(p)) {
    return files;
  }
  // New sections / pages need full context to add to App.tsx imports
  if (/add|new section|new page|create section|insert|include|append|build a|make a/.test(p)) {
    return files;
  }

  const alwaysInclude = new Set(["src/App.tsx", "src/index.css", "src/main.tsx"]);

  const componentKeywords: [RegExp, string][] = [
    [/hero|headline|banner|above.fold|first.section/, "Hero.tsx"],
    [/nav|menu|header|logo|navigation/, "Navbar.tsx"],
    [/feature|benefit|why|grid|card/, "Features.tsx"],
    [/pric|plan|tier|subscr|billing|cost/, "Pricing.tsx"],
    [/testim|review|customer|quote|social.proof/, "Testimonials.tsx"],
    [/faq|question|answer|accordion/, "FAQ.tsx"],
    [/footer|copyright|bottom/, "Footer.tsx"],
    [/stat|metric|number|achievement|count/, "Stats.tsx"],
    [/cta|call.to.action|call-to-action|sign.up|get.started|bottom.cta/, "CTASection.tsx"],
    [/how.it.works|step|process|workflow|how.to/, "HowItWorks.tsx"],
  ];

  const wantedComponents = new Set<string>();
  for (const [pattern, component] of componentKeywords) {
    if (pattern.test(p)) wantedComponents.add(component);
  }

  return files.filter((f) => {
    if (alwaysInclude.has(f.path)) return true;
    const fileName = f.path.split("/").pop() ?? "";
    return wantedComponents.has(fileName);
  });
}

function buildEditSystemPrompt(
  designDocs: string,
  selectedFiles: Array<{ path: string; content: string }>,
  existingHtml: string
): string {
  const filesBlock = selectedFiles
    .map((f) => `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``)
    .join("\n\n");

  const htmlPreview =
    existingHtml.length > 4000
      ? existingHtml.slice(0, 3800) + "\n... (truncated) ..."
      : existingHtml;

  return `You are DesignAI — a surgical editor for React landing pages.
Apply the requested change precisely. Return ONLY the files that actually changed.

## EDITING RULES
1. Read the provided files carefully — these are the ones most relevant to the request
2. Make the MINIMUM change needed to fulfil the request
3. Do NOT touch sections not mentioned in the request
4. Return ONLY the changed files in "changedFiles" — do NOT list unchanged files
5. The "previewHtml" MUST show the MAIN LANDING PAGE — see critical rule below
6. Do NOT rename the project title — keep it exactly as-is

## ⚠️ CRITICAL — previewHtml MUST ALWAYS SHOW THE MAIN LANDING PAGE
The previewHtml is an iframe preview of the HOMEPAGE/LANDING PAGE, not a router.
- NEVER replace it with a sub-page (login, dashboard, signup, etc.) even if asked to add one
- If the request adds a new page/route (login, signup, dashboard, about, etc.):
  → Create the React component file(s) for that page
  → Add a navigation link/button to it from the landing page Navbar or Hero
  → The previewHtml must STILL show the full landing page (with the new nav link visible)
  → Do NOT make previewHtml show the new sub-page — the landing page is always the preview
- If the request changes an existing section (hero text, colors, features):
  → Show the full landing page with that section changed
- The previewHtml is complete self-contained HTML — it has ALL sections (navbar, hero, features, etc.)

## OUTPUT FORMAT (strict JSON — no markdown wrapper)
{
  "projectTitle": "KEEP EXACTLY THE SAME TITLE — do not change it",
  "previewHtml": "<!DOCTYPE html>...(FULL LANDING PAGE with all sections)...",
  "changedFiles": [
    { "path": "src/components/Hero.tsx", "content": "...complete file content..." }
    // ONLY files you modified — omit unchanged files
  ],
  "workflowLogs": [
    { "agent": "Edit Analyst",  "action": "Identified which component to change" },
    { "agent": "Code Editor",   "action": "Made surgical edit to affected file(s)" },
    { "agent": "HTML Sync",     "action": "Updated previewHtml landing page to reflect the change" }
  ]
}

## ABSOLUTE RULES
- "changedFiles" contains ONLY the modified files — typically 1-3 files max
- "previewHtml" MUST be a complete <!DOCTYPE html> document with the FULL LANDING PAGE
- React components use inline styles only — no Tailwind, no CSS imports
- Preserve ALL existing copy, colors, fonts unless the request explicitly asks to change them

## PROVIDED FILES (only relevant files — others are unchanged)
${filesBlock}

## CURRENT HTML PREVIEW (the landing page — use this as the base for previewHtml)
\`\`\`html
${htmlPreview}
\`\`\``;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      prompt?: string;
      mode?: "generate" | "edit";
      existingFiles?: Array<{ path: string; content: string }>;
      existingHtml?: string;
      projectId?: string;
    };

    const { prompt, mode = "generate", existingFiles, existingHtml, projectId } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const designDocs = getDesignSystemDocs();
    const modelName = process.env.OPENROUTER_MODEL || "";
    const isFreeModel = modelName.toLowerCase().includes(":free");

    const liteDesignDocs = `
## OUTPUT FORMAT
Return strict JSON:
{
  "projectTitle": "String",
  "previewHtml": "<!DOCTYPE html>...",
  "files": [ { "path": "src/App.tsx", "content": "..." }, ... ],
  "workflowLogs": [ { "agent": "String", "action": "String" } ]
}

## RULES
- Use inline styles only: style={{ ... }}
- All 10 sections must be in App.tsx: Navbar, Hero, Stats, Features, HowItWorks, Testimonials, Pricing, FAQ, CTASection, Footer.
- previewHtml must be the full landing page.
- vite.config.ts MUST include server: { host:'0.0.0.0', port:5173, allowedHosts:true, strictPort:true }.
`;

    const effectiveDesignDocs = isFreeModel ? liteDesignDocs : designDocs;

    const cleanExisting = Array.isArray(existingFiles)
      ? (existingFiles as Array<{ path: string; content: string }>).filter((f) => f.path !== "preview.html")
      : [];
    const isEdit = mode === "edit" && cleanExisting.length > 0 && typeof existingHtml === "string" && existingHtml.length > 0;

    // ── Build system + user messages ─────────────────────────────────────────
    let systemPrompt: string;
    let userMessage: string;

    if (isEdit) {
      // Pick only files relevant to this edit (smaller prompt → faster, cheaper, more accurate)
      const selectedFiles = selectFilesForEdit(prompt, cleanExisting);

      systemPrompt = buildEditSystemPrompt(
        effectiveDesignDocs,
        selectedFiles,
        existingHtml as string
      );
      // Detect if user is asking to add a new page/route
      const isAddingNewPage = /\b(add|create|build|make|new)\b.{0,30}\b(page|route|screen|view|section)\b/i.test(prompt)
        || /\b(login|signup|sign.?up|register|dashboard|about|contact|pricing)\s+(page|screen|view|route)\b/i.test(prompt);

      userMessage = `Apply this change to the existing design: ${prompt}

Remember:
- Only change what was requested
- Keep all other sections, copy, colors, and styles exactly the same
- Return ONLY the changed files in "changedFiles" (1–3 files max)
- Do NOT change the projectTitle
- Write COMPLETE code for any file you modify — no placeholders
${isAddingNewPage ? `
⚠️ ADDING A NEW PAGE/ROUTE:
- Create the new page as a React component file (e.g. src/pages/Login.tsx)
- Update src/App.tsx to include the new route/page
- Add a navigation link/button to the new page in Navbar.tsx or Hero.tsx
- The previewHtml MUST show the MAIN LANDING PAGE — NOT the new sub-page
- The previewHtml should be the full landing page with the new nav link visible
- DO NOT show only the new page in previewHtml` : `
- Update previewHtml to reflect the changes — keep showing the full landing page`}`;

    } else {
      systemPrompt = buildGenerateSystemPrompt(effectiveDesignDocs, prompt);
      userMessage = `Create a stunning, complete landing page for: ${prompt}

FOLLOW THE MANDATORY DESIGN PARADIGM in the system prompt — every section must use the exact colors, card style, button style, and typography specified. Do NOT revert to a generic dark theme.

IMPORTANT: Write COMPLETE, high-quality code for every file. Do not use placeholders. Ensure all 10 sections are fully implemented with real content.

CONTENT REQUIREMENTS (all must be specific to "${prompt}"):
- Headline: clearly states what this product/service does and for whom
- Features: 6 real capabilities with specific, tangible benefits
- Stats: 4 impressive but realistic metrics relevant to this industry
- Pricing tiers: creative names that match the product (NOT "Free/Pro/Enterprise")
- Testimonials: 3 with specific outcomes + real numbers ("Reduced churn by 28%")
- FAQ: 4 questions real customers would actually ask about this type of product
- CTA section: urgency-driven copy specific to the product's value proposition

Generate BOTH previewHtml AND the full Vite+React file structure (16 files total).`;
    }

    // ── Call AI with timeout fallback ─────────────────────────────────────────
    
    let content: string;
    let parsed: any;
    try {
      content = await Promise.race([
        getAIResponse(systemPrompt, userMessage, true),
        new Promise<string>((resolve) =>
          setTimeout(
            () => resolve("__TIMEOUT__"),
            GENERATION_TIMEOUT_MS
          )
        ),
      ]);
    } catch (e) {
      console.error("AI Error:", e);
      content = "__ERROR__";
    }

    let isFallback = false;
    if (content === "__TIMEOUT__" || content === "__ERROR__") {
      isFallback = true;
      if (isEdit) {
        // Return existing files with a generic workflow log so user knows it failed
        parsed = {
          projectTitle: "Edit Failed (Timeout)",
          previewHtml: existingHtml,
          changedFiles: [],
          workflowLogs: [
            { agent: "System", action: "AI took too long or failed — no changes applied. Try again with a simpler request." }
          ]
        };
      } else {
        parsed = getLocalGeneratedProject(prompt);
      }
    } else {
      try {
        parsed = parseAIJson(content);
      } catch (e) {
        console.error("JSON Parse Error:", e);
        isFallback = true;
        if (isEdit) {
          parsed = {
            projectTitle: "Edit Failed (Invalid JSON)",
            previewHtml: existingHtml,
            changedFiles: [],
            workflowLogs: [
              { agent: "System", action: "AI returned invalid response — no changes applied." }
            ]
          };
        } else {
          parsed = getLocalGeneratedProject(prompt);
        }
      }
    }

    // ── Validate response ─────────────────────────────────────────────────────
    if (isEdit) {
      // Edit mode: AI returns changedFiles (surgical), merge with existing to get full set.
      // If the AI ignored the instruction and returned `files` instead, fall back to those.
      const rawChanged = Array.isArray(parsed.changedFiles) && parsed.changedFiles.length > 0
        ? (parsed.changedFiles as Array<{ path: string; content: string }>)
        : (Array.isArray(parsed.files) && parsed.files.length > 0
          ? (parsed.files as Array<{ path: string; content: string }>)
          : []);

      // Never pass preview.html as a real file
      const changedFiles = rawChanged.filter((f: { path: string }) => f.path !== "preview.html");

      // Merge changed files into the full existing set
      const merged: Array<{ path: string; content: string }> = cleanExisting.map((existing) => {
        const updated = changedFiles.find((f) => f.path === existing.path);
        return updated ?? existing;
      });
      // Append brand-new files the AI created (e.g. a new page component)
      const brandNew = changedFiles.filter((f) => !cleanExisting.some((e) => e.path === f.path));
      const finalFiles = [...merged, ...brandNew];

      // ── Validate previewHtml — must be the full landing page, not a sub-page ──
      // The AI sometimes ignores the instruction and returns a previewHtml that shows
      // only the new sub-page (e.g., just a login form). Detect this by checking:
      //   1. Too short compared to the original (< 30% of original = sub-page only)
      //   2. Missing landmark sections (no <nav, no hero/section pattern)
      // In either case, fall back to the existing HTML (still shows the landing page).
      function isSubPageOnly(html: string, originalHtml: string): boolean {
        if (html.length < originalHtml.length * 0.3) return true;   // way too short
        const lower = html.toLowerCase();
        // If it has no <nav element at all, it's probably not the full landing page
        const hasNav = lower.includes("<nav") || lower.includes("navbar") || lower.includes("navigation");
        if (!hasNav) return true;
        return false;
      }

      let finalHtml: string;
      if (typeof parsed.previewHtml === "string" && parsed.previewHtml.length > 100) {
        const aiHtml = parsed.previewHtml;
        const original = existingHtml as string;
        if (isSubPageOnly(aiHtml, original)) {
          // AI replaced the landing page with a sub-page — use existing HTML instead
          console.warn("[edit] AI returned sub-page-only previewHtml — keeping existing landing page HTML");
          finalHtml = original;
        } else {
          finalHtml = aiHtml;
        }
      } else {
        finalHtml = existingHtml as string;
      }

      // Auto-save merged result (don't touch title on edits — the client preserves original)
      if (projectId && finalHtml) {
        try {
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
          await fetch(`${siteUrl}/api/projects/${projectId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              // Intentionally omit title — let the client preserve it
              preview_html: finalHtml,
              generated_code: finalFiles,
              prompt,
            }),
          });
        } catch (e) {
          console.warn("Failed to auto-save edited project:", e);
        }
      }

      return NextResponse.json({
        ...parsed,
        files: finalFiles,                      // full merged set for client
        changedFiles,                           // surgical set so client can do its own merge too
        previewHtml: finalHtml,
        isFallback,
      });
    }

    // Generate mode validation
    if (!Array.isArray(parsed.files) || !parsed.files.length) {
      parsed.files = [{ path: "index.html", content: parsed.previewHtml || "" }];
    }

    if (!parsed.previewHtml || typeof parsed.previewHtml !== "string") {
      const htmlFile = (parsed.files as Array<{ path: string; content: string }>)
        .find((f) => f.path.endsWith(".html") && !f.path.includes("index.html"));
      parsed.previewHtml = htmlFile?.content ?? getLocalGeneratedProject(prompt).previewHtml;
    }

    // ── Auto-save to project ──────────────────────────────────────────────────
    if (projectId && parsed.previewHtml) {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
        await fetch(`${siteUrl}/api/projects/${projectId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: parsed.projectTitle || "Untitled Design",
            preview_html: parsed.previewHtml,
            generated_code: (parsed.files as Array<{ path: string; content: string }>).filter(
              (f) => f.path !== "preview.html"
            ),
            prompt,
          }),
        });
      } catch (e) {
        console.warn("Failed to auto-save project:", e);
      }
    }

    return NextResponse.json({ ...parsed, isFallback });
  } catch (error: unknown) {
    console.error("Generation Error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) || "Internal Server Error" },
      { status: 500 }
    );
  }
}
