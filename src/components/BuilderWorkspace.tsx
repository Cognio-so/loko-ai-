"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type KeyboardEvent as ReactKeyboardEvent,
  type SetStateAction,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  ArrowUp,
  Check,
  Search,
  ChevronRight,
  ChevronDown,
  Circle,
  Download,
  Expand,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Mic,
  Monitor,
  Bot,
  Plus,
  RefreshCcw,
  Share2,
  Smartphone,
  Sparkles,
  Wand2,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGeneratorStore } from "@/lib/store";
import { clearProjectPendingPrompt, readProjectPendingPrompt } from "@/lib/builder-session";
import { cn } from "@/lib/utils";
import FileExplorer from "./FileExplorer";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

type TaskStatus = "completed" | "active" | "pending";
type TaskKind = "plan" | "code" | "file" | "design" | "debug" | "deploy";

type GenerationTask = {
  id: string;
  label: string;
  status: TaskStatus;
  kind: TaskKind;
  agent: string;
  filePath?: string;
};

type DeviceMode = "desktop" | "mobile";
type BuildMode = "Landing" | "App" | "Dashboard";

type SpeechRecognitionResultEvent = {
  results: { [index: number]: { [index: number]: { transcript: string } } };
};

type SpeechRecognitionInstance = {
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  start: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechRecognitionWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

const GENERATION_TASK_BLUEPRINT: Array<Omit<GenerationTask, "status">> = [
  { id: "research", label: "Searching for modern SaaS & UI trends 2026", kind: "plan", agent: "Research Agent" },
  { id: "code", label: "Executing Python code for design analysis", kind: "plan", agent: "System Agent" },
  { id: "analysis", label: "Analyzing requirements & structural plan", kind: "plan", agent: "Design Architect" },
  { id: "palette", label: "Establishing color palette & typography", kind: "design", agent: "Visual Designer" },
  { id: "layout", label: "Building responsive layout structure", kind: "code", agent: "Layout Engineer" },
  { id: "hero", label: "Crafting hero section & dashboard mockup", kind: "design", agent: "UI Designer", filePath: "index.html" },
  { id: "features", label: "Designing feature cards & visual assets", kind: "design", agent: "UI Designer" },
  { id: "social-proof", label: "Adding testimonials & social proof", kind: "design", agent: "Conversion Expert" },
  { id: "animations", label: "Adding CSS & Framer Motion animations", kind: "code", agent: "Motion Designer" },
  { id: "responsive", label: "Ensuring mobile responsiveness", kind: "debug", agent: "QA Engineer" },
  { id: "optimize", label: "Optimizing for conversion & SEO", kind: "deploy", agent: "Growth Engineer" },
  { id: "finalize", label: "Final polish & review", kind: "deploy", agent: "QA Engineer" },
];

const EMPTY_MESSAGES: ChatMessage[] = [];

// ── Live code typing component shown while generation is in progress ──────────
const LIVE_CODE_FRAMES = [
  { file: "src/App.tsx", code: `import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Stats from './components/Stats';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import HowItWorks from './components/HowItWorks';
import CTASection from './components/CTASection';
import Footer from './components/Footer';

export default function App() {
  return (
    <main style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTASection />
      <Footer />
    </main>
  );
}` },
  { file: "src/components/Navbar.tsx", code: `import React, { useState, useEffect } from 'react';

const NAV_LINKS = ['Features', 'Pricing', 'Testimonials', 'FAQ'];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '0 32px',
      height: 64,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: scrolled
        ? 'rgba(2,6,23,0.95)'
        : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em' }}>
        Brand
      </div>
      <div style={{ display: 'flex', gap: 32 }}>
        {NAV_LINKS.map(link => (
          <a key={link} href={\`#\${link.toLowerCase()}\`} style={{
            color: 'rgba(255,255,255,0.7)',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 500,
          }}>
            {link}
          </a>
        ))}
      </div>
      <button style={{
        padding: '10px 24px',
        borderRadius: 9999,
        background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
        color: '#fff',
        fontWeight: 700,
        border: 'none',
        cursor: 'pointer',
        fontSize: 14,
      }}>
        Get Started
      </button>
    </nav>
  );
}` },
  { file: "src/components/Hero.tsx", code: `import React from 'react';

export default function Hero() {
  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '100px 24px 80px',
      position: 'relative',
      overflow: 'hidden',
      background: '#020617',
    }}>
      {/* Radial glow orbs */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 30% 40%, rgba(99,102,241,0.22) 0%, transparent 60%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-20%', right: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', textAlign: 'center', maxWidth: 860, zIndex: 1 }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.28)',
          borderRadius: 9999, padding: '6px 18px',
          fontSize: 13, fontWeight: 600, color: '#a5b4fc',
          marginBottom: 28,
        }}>
          ✦ Powered by AI
        </div>

        <h1 style={{
          fontSize: 'clamp(52px,8vw,96px)',
          fontWeight: 900,
          letterSpacing: '-0.05em',
          lineHeight: 1.05,
          marginBottom: 24,
          background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 50%, #6366f1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Transform Your Workflow
        </h1>

        <p style={{ fontSize: 20, lineHeight: 1.7, color: 'rgba(255,255,255,0.6)', marginBottom: 44 }}>
          The all-in-one platform that helps modern teams ship faster,
          collaborate better, and build products customers love.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{
            padding: '16px 36px', borderRadius: 9999,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            color: '#fff', fontWeight: 700, border: 'none',
            cursor: 'pointer', fontSize: 16,
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
          }}>
            Start Free Trial
          </button>
          <button style={{
            padding: '16px 36px', borderRadius: 9999,
            background: 'rgba(99,102,241,0.08)',
            border: '1.5px solid rgba(99,102,241,0.4)',
            color: '#a5b4fc', fontWeight: 700, cursor: 'pointer', fontSize: 16,
          }}>
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
}` },
  { file: "src/components/Features.tsx", code: `import React from 'react';

const FEATURES = [
  {
    icon: '⚡',
    title: 'Lightning Fast',
    desc: 'Sub-100ms response times guaranteed. Deploy globally with zero cold starts.',
  },
  {
    icon: '🔒',
    title: 'Enterprise Security',
    desc: 'SOC2 Type II certified. End-to-end encryption on all data in motion and at rest.',
  },
  {
    icon: '📊',
    title: 'Real-time Analytics',
    desc: 'Live dashboards with instant insights. Track every metric that matters to your team.',
  },
  {
    icon: '🤝',
    title: 'Team Collaboration',
    desc: 'Invite unlimited teammates. Assign roles, review changes, and ship together.',
  },
  {
    icon: '🔌',
    title: 'API-First Design',
    desc: '200+ native integrations. Webhooks, REST & GraphQL APIs for any workflow.',
  },
  {
    icon: '🌍',
    title: 'Global CDN',
    desc: 'Served from 50+ edge locations. Your users get a fast experience everywhere.',
  },
];

export default function Features() {
  return (
    <section id="features" style={{ padding: '96px 24px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <p style={{
          fontSize: 12, fontWeight: 700, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: '#6366f1', marginBottom: 12,
        }}>
          Features
        </p>
        <h2 style={{
          fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800,
          letterSpacing: '-0.04em', color: '#fff',
        }}>
          Everything you need to ship
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: 24,
      }}>
        {FEATURES.map((f) => (
          <div key={f.title} style={{
            padding: '32px',
            borderRadius: 20,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            transition: 'all 0.25s ease',
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, marginBottom: 20,
            }}>
              {f.icon}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 10 }}>
              {f.title}
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}` },
  { file: "src/components/Pricing.tsx", code: `import React from 'react';

const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever free',
    features: ['Up to 3 projects', '5GB storage', 'Community support', 'Basic analytics'],
    cta: 'Start for free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    features: ['Unlimited projects', '100GB storage', 'Priority support', 'Advanced analytics', 'Team collaboration', 'Custom domains'],
    cta: 'Start Pro trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'tailored plan',
    features: ['Everything in Pro', 'SSO & SAML', 'SLA guarantee', 'Dedicated account manager', 'Custom integrations', 'On-premise option'],
    cta: 'Contact sales',
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" style={{ padding: '96px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <h2 style={{
          fontSize: 'clamp(32px,5vw,56px)', fontWeight: 800,
          letterSpacing: '-0.04em', color: '#fff', marginBottom: 16,
        }}>
          Simple, transparent pricing
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 17 }}>
          Start free. Scale as you grow.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 24, alignItems: 'start',
      }}>
        {PLANS.map((plan) => (
          <div key={plan.name} style={{
            padding: 32, borderRadius: 24,
            background: plan.highlight
              ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))'
              : 'rgba(255,255,255,0.03)',
            border: plan.highlight
              ? '1.5px solid rgba(99,102,241,0.45)'
              : '1px solid rgba(255,255,255,0.07)',
            position: 'relative',
          }}>
            {plan.highlight && (
              <div style={{
                position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: '#fff', fontSize: 11, fontWeight: 800,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                padding: '4px 18px', borderRadius: 9999,
              }}>
                Most Popular
              </div>
            )}
            <p style={{ fontSize: 14, fontWeight: 700, color: '#a5b4fc', marginBottom: 8 }}>
              {plan.name}
            </p>
            <div style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 42, fontWeight: 900, color: '#fff' }}>{plan.price}</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>
                {plan.period}
              </span>
            </div>
            <div style={{ margin: '24px 0', borderTop: '1px solid rgba(255,255,255,0.07)' }} />
            <ul style={{ listStyle: 'none', marginBottom: 28 }}>
              {plan.features.map((f) => (
                <li key={f} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 12, fontSize: 14, color: 'rgba(255,255,255,0.7)',
                }}>
                  <span style={{ color: '#6366f1', fontWeight: 800 }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button style={{
              width: '100%', padding: '13px 0', borderRadius: 12,
              background: plan.highlight
                ? 'linear-gradient(135deg,#6366f1,#8b5cf6)'
                : 'rgba(255,255,255,0.07)',
              color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: 15,
            }}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}` },
  { file: "src/components/Testimonials.tsx", code: `import React from 'react';

const TESTIMONIALS = [
  {
    name: 'Sarah Chen',
    role: 'Head of Product, Vercel',
    avatar: 'SC',
    color: '#6366f1',
    quote: 'Reduced our deployment pipeline from 45 minutes to under 8 minutes. The team adopted it in a single afternoon.',
  },
  {
    name: 'Marcus Thompson',
    role: 'CTO, Linear',
    avatar: 'MT',
    color: '#8b5cf6',
    quote: 'We evaluated 12 tools before choosing this one. ROI was clear within the first week — churn dropped 34%.',
  },
  {
    name: 'Priya Sharma',
    role: 'Engineering Lead, Stripe',
    avatar: 'PS',
    color: '#06b6d4',
    quote: 'Our team ships 3× faster now. The collaboration features alone saved us 12 hours of meetings per week.',
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" style={{ padding: '96px 24px', background: 'rgba(255,255,255,0.02)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{
            fontSize: 'clamp(32px,5vw,52px)', fontWeight: 800,
            letterSpacing: '-0.04em', color: '#fff',
          }}>
            Trusted by the best teams
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))',
          gap: 24,
        }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} style={{
              padding: 28, borderRadius: 20,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}>
              <div style={{
                fontSize: 28, color: t.color, marginBottom: 18, lineHeight: 1,
              }}>
                "
              </div>
              <p style={{
                fontSize: 15, lineHeight: 1.7,
                color: 'rgba(255,255,255,0.8)', marginBottom: 24, fontStyle: 'italic',
              }}>
                {t.quote}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: \`\${t.color}22\`, border: \`1.5px solid \${t.color}44\`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, color: t.color,
                }}>
                  {t.avatar}
                </div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{t.name}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}` },
  { file: "src/index.css", code: `/* Global styles */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --bg: #020617;
  --surface: #0f172a;
  --primary: #6366f1;
  --primary-light: #818cf8;
  --accent: #a5b4fc;
  --text: #f1f5f9;
  --text-muted: #94a3b8;
  --border: rgba(255, 255, 255, 0.08);
  --radius: 16px;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

/* Animations */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-12px); }
}

@keyframes shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}

@keyframes pulseGlow {
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 1; }
}

.fade-in-up { animation: fadeInUp 0.7s ease-out both; }
.float      { animation: float 6s ease-in-out infinite; }` },
  { file: "src/components/Footer.tsx", code: `import React from 'react';

const LINKS = {
  Product: ['Features', 'Pricing', 'Changelog', 'Roadmap'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Legal: ['Privacy', 'Terms', 'Security', 'Cookies'],
};

export default function Footer() {
  return (
    <footer style={{
      background: '#020617',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      padding: '64px 24px 32px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr repeat(3, 1fr)',
          gap: 48, marginBottom: 56,
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 14 }}>Brand</div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 240 }}>
              The platform that helps modern teams ship faster and collaborate better.
            </p>
          </div>
          {Object.entries(LINKS).map(([group, items]) => (
            <div key={group}>
              <p style={{
                fontSize: 12, fontWeight: 700, letterSpacing: '0.1em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 16,
              }}>
                {group}
              </p>
              <ul style={{ listStyle: 'none' }}>
                {items.map((item) => (
                  <li key={item} style={{ marginBottom: 10 }}>
                    <a href="#" style={{
                      fontSize: 14, color: 'rgba(255,255,255,0.55)',
                      textDecoration: 'none',
                    }}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} Brand. All rights reserved.
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
            Built with DesignAI ✦
          </p>
        </div>
      </div>
    </footer>
  );
}` },
];

function LiveCodeWriter({ activeTasks }: { activeTasks: Array<{ status: string; label: string }> }) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const activeTaskCount = activeTasks.filter(t => t.status === "completed").length;

  // Advance frame as tasks complete; also auto-cycle frames when typing finishes
  useEffect(() => {
    const targetFrame = Math.min(
      Math.floor((activeTaskCount / Math.max(1, activeTasks.length)) * LIVE_CODE_FRAMES.length),
      LIVE_CODE_FRAMES.length - 1
    );
    if (targetFrame !== frameIndex) {
      setFrameIndex(targetFrame);
      setCharCount(0);
    }
  }, [activeTaskCount, activeTasks.length, frameIndex]);

  const currentFrame = LIVE_CODE_FRAMES[frameIndex];

  useEffect(() => {
    setCharCount(0);
    // Speed: faster at start, slows when nearing end for dramatic effect
    const interval = window.setInterval(() => {
      setCharCount((c) => {
        const remaining = currentFrame.code.length - c;
        const speed = remaining > 200 ? 12 : remaining > 50 ? 6 : 3;
        const next = c + speed;
        if (next >= currentFrame.code.length) {
          window.clearInterval(interval);
          // Auto-advance to next frame after a pause
          window.setTimeout(() => {
            setFrameIndex((fi) => (fi + 1) % LIVE_CODE_FRAMES.length);
          }, 800);
          return currentFrame.code.length;
        }
        return next;
      });
    }, 16);
    return () => window.clearInterval(interval);
  }, [frameIndex, currentFrame.code.length]);

  const displayed = currentFrame.code.slice(0, charCount);

  return (
    <div style={{ height: "100%", background: "#1e1e1e", display: "flex", flexDirection: "column", fontFamily: '"Geist Mono","Fira Code",Consolas,monospace' }}>
      {/* File tab */}
      <div style={{ padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(99,102,241,0.6)" }} />
        <span style={{ fontSize: 12, color: "#a5b4fc", fontWeight: 600 }}>{currentFrame.file}</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#475569" }}>Generating…</span>
      </div>
      {/* Code output */}
      <div style={{ flex: 1, overflow: "auto", padding: "16px 20px", fontSize: 13, lineHeight: 1.6, color: "#d4d4d4", whiteSpace: "pre", userSelect: "none" }}>
        <span style={{ color: "#9cdcfe" }}>{/* color syntax for imports */}</span>
        {displayed.split("\n").map((line, i) => (
          <div key={i} style={{ display: "flex", gap: 16 }}>
            <span style={{ color: "#4a5568", minWidth: 28, textAlign: "right", userSelect: "none" }}>{i + 1}</span>
            <span style={{ color: line.startsWith("import") ? "#c586c0" : line.includes("export") ? "#569cd6" : line.includes("//") ? "#6a9955" : line.includes("style") ? "#9cdcfe" : "#d4d4d4" }}>{line}</span>
          </div>
        ))}
        <div style={{ display: "flex", gap: 16 }}>
          <span style={{ color: "#4a5568", minWidth: 28, textAlign: "right" }}>{displayed.split("\n").length}</span>
          <span style={{ display: "inline-block", width: 2, height: 16, background: "#6366f1", animation: "blink 1s step-end infinite", verticalAlign: "text-bottom" }} />
        </div>
      </div>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

function getChatKey(projectId?: string): string {
  if (!projectId) return `lokoai.chat.orphan`;
  return `lokoai.chat.${projectId}`;
}

function parseMessages(raw: string | null): ChatMessage[] {
  if (!raw) return EMPTY_MESSAGES;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ChatMessage[]) : EMPTY_MESSAGES;
  } catch {
    return EMPTY_MESSAGES;
  }
}

function readMessages(key: string): ChatMessage[] {
  if (typeof window === "undefined") return EMPTY_MESSAGES;
  return parseMessages(localStorage.getItem(key));
}

function writeMessages(key: string, messages: ChatMessage[]) {
  try {
    localStorage.setItem(key, JSON.stringify(messages));
  } catch {
    // ignore quota errors
  }
  window.dispatchEvent(new CustomEvent(`lokoai.chat.sync.${key}`));
}

// Cache shape stored in a module-level Map so it survives component re-renders
// but is keyed per chatKey, solving the useSyncExternalStore "getSnapshot must
// return a stable reference" requirement.
type SnapshotCache = { raw: string | null; messages: ChatMessage[] };
const snapshotCache = new Map<string, SnapshotCache>();

function makeCachedSnapshot(chatKey: string): () => ChatMessage[] {
  return () => {
    if (typeof window === "undefined") return EMPTY_MESSAGES;
    const raw = localStorage.getItem(chatKey);
    const cached = snapshotCache.get(chatKey);
    if (cached && cached.raw === raw) return cached.messages; // same ref
    const messages = parseMessages(raw);
    snapshotCache.set(chatKey, { raw, messages });
    return messages;
  };
}

function useProjectChat(
  projectId?: string
): [ChatMessage[], Dispatch<SetStateAction<ChatMessage[]>>] {
  const chatKey = useMemo(() => getChatKey(projectId), [projectId]);

  // Stable subscribe — recreated only when chatKey changes
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") return () => {};

      const handleStorage = (e: StorageEvent) => {
        if (e.key === chatKey) {
          // Invalidate cache so next getSnapshot sees the new data
          snapshotCache.delete(chatKey);
          onStoreChange();
        }
      };
      const handleCustom = () => {
        snapshotCache.delete(chatKey);
        onStoreChange();
      };

      window.addEventListener("storage", handleStorage);
      window.addEventListener(`lokoai.chat.sync.${chatKey}`, handleCustom);

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(`lokoai.chat.sync.${chatKey}`, handleCustom);
      };
    },
    [chatKey]
  );

  // getSnapshot is stable for a given chatKey; returns cached ref when data unchanged
  const getSnapshot = useMemo(() => makeCachedSnapshot(chatKey), [chatKey]);
  const getServerSnapshot = useCallback(() => EMPTY_MESSAGES, []);

  const messages = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setMessages: Dispatch<SetStateAction<ChatMessage[]>> = useCallback(
    (value) => {
      const current = readMessages(chatKey);
      const next =
        typeof value === "function"
          ? (value as (c: ChatMessage[]) => ChatMessage[])(current)
          : value;
      writeMessages(chatKey, next);
    },
    [chatKey]
  );

  return [messages, setMessages];
}

function TaskStatusIcon({ status }: { status: TaskStatus }) {
  if (status === "completed") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-400/30">
        <Check className="h-3 w-3" />
      </span>
    );
  }
  if (status === "active") {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-400/30">
        <Loader2 className="h-3 w-3 animate-spin" />
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded-full text-slate-600 ring-1 ring-slate-600/50">
      <Circle className="h-2.5 w-2.5 fill-current" />
    </span>
  );
}

function SandboxLoadingState({ isEdit }: { isEdit: boolean }) {
  const [step, setStep] = useState(0);
  const steps = isEdit
    ? ["Applying your changes...", "Updating components...", "Refreshing preview..."]
    : ["Installing packages...", "Starting Vite dev server...", "Connecting preview..."];

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => (s + 1) % steps.length), isEdit ? 1000 : 4000);
    return () => clearInterval(timer);
  }, [steps.length, isEdit]);

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#020617",
        gap: 24,
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))",
          border: "1px solid rgba(99,102,241,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2
          style={{
            width: 28,
            height: 28,
            color: "#6366f1",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: "0 0 8px" }}>
          {isEdit ? "Applying changes" : "Building live environment"}
        </p>
        <p style={{ color: "#6366f1", fontSize: 13, margin: "0 0 4px" }}>{steps[step]}</p>
        {!isEdit && (
          <p style={{ color: "#475569", fontSize: 12, margin: 0 }}>
            This takes ~60s for first load
          </p>
        )}
      </div>
      {!isEdit && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 240 }}>
          {steps.map((s, i) => (
            <div
              key={s}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                opacity: i <= step ? 1 : 0.3,
                transition: "opacity 0.3s",
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background:
                    i < step ? "#10b981" : i === step ? "#6366f1" : "#334155",
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color:
                    i < step ? "#10b981" : i === step ? "#a5b4fc" : "#475569",
                }}
              >
                {s}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface BuilderWorkspaceProps {
  projectId?: string;
}

export default function BuilderWorkspace({ projectId }: BuilderWorkspaceProps = {}) {
  const router = useRouter();
  const {
    generateProject,
    editProject,
    isGenerating,
    view,
    setView,
    generatedFiles,
    activeFilePath,
    openFile,
    previewHtml,
    updateFileContent,
    getFileContent,
    projectTitle,
    reset,
  } = useGeneratorStore();

  const [messages, setMessages] = useProjectChat(projectId);
  const [draft, setDraft] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [buildMode, setBuildMode] = useState<BuildMode>("Landing");
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [generationTasks, setGenerationTasks] = useState<GenerationTask[]>([]);
  const [isTaskPanelLive, setIsTaskPanelLive] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Sync theme with localStorage — builder has its own independent key, defaults dark
  useEffect(() => {
    const stored = localStorage.getItem("lokoai.theme.builder");
    if (stored === "light") setIsDark(false);
    // If no stored preference, always default to dark
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("lokoai.theme.builder", next ? "dark" : "light");
      return next;
    });
  };

  // ── E2B sandbox state ───────────────────────────────────────────────────────
  const [sandboxUrl, setSandboxUrl] = useState<string | null>(null);
  const [isSandboxLoading, setIsSandboxLoading] = useState(false);
  const sandboxIdRef = useRef<string | null>(null);
  const isEditModeRef = useRef(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const taskPanelRef = useRef<HTMLDivElement | null>(null);
  const taskTimersRef = useRef<number[]>([]);
  const streamTimerRef = useRef<number | null>(null);
  const pendingPromptRef = useRef(false);
  const shareTimerRef = useRef<number | null>(null);
  // Use a ref for project-loaded state to avoid setState-in-effect lint errors
  const projectLoadedRef = useRef(false);

  // Exclude the virtual "preview.html" blob — that's only for the iframe, not for editing
  const filesForEditor = useMemo(() => {
    if (!generatedFiles?.length) return [] as { path: string; title: string }[];
    return generatedFiles
      .filter((f) => f.path !== "preview.html")
      .map((f) => ({
        path: f.path,
        title: f.path.split("/").pop() ?? f.path,
      }));
  }, [generatedFiles]);

  const activePath = activeFilePath ?? filesForEditor[0]?.path ?? null;
  const activeLanguage = useMemo(() => {
    if (!activePath) return "html";
    if (activePath.endsWith(".tsx") || activePath.endsWith(".ts")) return "typescript";
    if (activePath.endsWith(".js")) return "javascript";
    if (activePath.endsWith(".css")) return "css";
    if (activePath.endsWith(".json")) return "json";
    if (activePath.endsWith(".html")) return "html";
    return "html";
  }, [activePath]);

  const previewWidthClass = deviceMode === "mobile" ? "w-[390px] max-w-[92vw]" : "w-full";
  const projectLabel = projectTitle || "Untitled Design";

  // Reset store when projectId changes
  useEffect(() => {
    reset();
    pendingPromptRef.current = false;
    projectLoadedRef.current = false;
    // Clear sandbox state for new project
    setSandboxUrl(null);
    setIsSandboxLoading(false);
    sandboxIdRef.current = null;
  }, [projectId, reset]);

  // Load project from Supabase
  useEffect(() => {
    if (!projectId || projectLoadedRef.current) return;
    projectLoadedRef.current = true;

    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json() as {
            project?: {
              preview_html?: string | null;
              title?: string;
              generated_code?: Array<{ path: string; content: string }>;
              sandbox_id?: string | null;
            };
          };
          const project = data.project;
          if (project?.preview_html) {
            const files = Array.isArray(project.generated_code)
              ? project.generated_code
              : [];
            useGeneratorStore.setState({
              previewHtml: project.preview_html,
              projectTitle: project.title ?? "Untitled Design",
              generatedFiles: files,
              view: "preview",
              isGenerating: false,
            });
            sandboxIdRef.current = project.sandbox_id ?? null;
            if (files.some((f) => f.path === "src/App.tsx")) {
              void spinUpSandbox(files, projectId);
            }
          }
        }
      } catch (e) {
        console.warn("Failed to load project:", e);
      }
    }

    void loadProject();
  }, [projectId]);

  // Auto-resize textarea (plain ref — textareaRef never goes stale)
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(Math.max(el.scrollHeight, 80), 200)}px`;
  }, [draft]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (streamTimerRef.current) window.clearInterval(streamTimerRef.current);
      taskTimersRef.current.forEach((t) => window.clearTimeout(t));
      if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current);
    };
  }, []);

  // Scroll task panel
  useEffect(() => {
    taskPanelRef.current?.scrollTo({ top: taskPanelRef.current.scrollHeight, behavior: "smooth" });
  }, [generationTasks]);

  const startGenerationTimeline = () => {
    taskTimersRef.current.forEach((t) => window.clearTimeout(t));
    taskTimersRef.current = [];
    setIsTaskPanelLive(true);
    setGenerationTasks([]);

    GENERATION_TASK_BLUEPRINT.forEach((task, index) => {
      const tid = window.setTimeout(() => {
        setGenerationTasks(
          GENERATION_TASK_BLUEPRINT.slice(0, Math.min(GENERATION_TASK_BLUEPRINT.length, index + 3)).map(
            (item, i) => ({
              ...item,
              status: (i < index ? "completed" : i === index ? "active" : "pending") as TaskStatus,
            })
          )
        );
      }, 400 + index * 680);
      taskTimersRef.current.push(tid);
    });

    const finishTid = window.setTimeout(() => {
      setGenerationTasks((c) => c.map((t) => ({ ...t, status: "completed" as TaskStatus })));
      setIsTaskPanelLive(false);
    }, 400 + GENERATION_TASK_BLUEPRINT.length * 680 + 800);
    taskTimersRef.current.push(finishTid);
  };

  const startVoiceInput = () => {
    const Recognition =
      (window as SpeechRecognitionWindow).SpeechRecognition ??
      (window as SpeechRecognitionWindow).webkitSpeechRecognition;
    if (!Recognition) {
      alert("Speech recognition not supported.");
      return;
    }
    const rec = new Recognition();
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => {
      const t = e.results[0][0].transcript;
      setDraft((prev) => `${prev}${prev ? " " : ""}${t}`);
    };
    rec.start();
  };

  // Keep latest setMessages in a ref so event-handler callbacks don't become stale
  const setMessagesRef = useRef(setMessages);
  useLayoutEffect(() => {
    setMessagesRef.current = setMessages;
  });

  const pushMessage = useCallback(
    (msg: Omit<ChatMessage, "id" | "createdAt"> & { id?: string; createdAt?: number }) => {
      const now = Date.now();
      const rand = Math.random().toString(16).slice(2);
      const id = msg.id ?? `${msg.role}-${now}-${rand}`;
      const createdAt = msg.createdAt ?? now;
      const full: ChatMessage = { id, role: msg.role, content: msg.content, createdAt };
      setMessagesRef.current((c) => [...c, full]);
      return id;
    },
    []
  );

  const updateMessage = useCallback((id: string, content: string) => {
    setMessagesRef.current((c) => c.map((m) => (m.id === id ? { ...m, content } : m)));
  }, []);

  const streamMessage = useCallback(
    (id: string, fullText: string) => {
      if (streamTimerRef.current) {
        window.clearInterval(streamTimerRef.current);
        streamTimerRef.current = null;
      }
      let i = 0;
      streamTimerRef.current = window.setInterval(() => {
        i += Math.max(1, Math.floor(fullText.length / 100));
        updateMessage(id, fullText.slice(0, i));
        if (i >= fullText.length) {
          window.clearInterval(streamTimerRef.current!);
          streamTimerRef.current = null;
        }
      }, 16);
    },
    [updateMessage]
  );

  const saveToProject = async (
    title: string,
    html: string,
    files: Array<{ path: string; content: string }>
  ) => {
    if (!projectId) return;
    try {
      await fetch(`/api/projects/${projectId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, preview_html: html, generated_code: files }),
      });
    } catch (e) {
      console.warn("Failed to save project:", e);
    }
  };

  /**
   * Spin up (or reconnect to) an E2B sandbox with the generated files.
   * Runs in the background — never awaited in sendPrompt.
   */
  const spinUpSandbox = useCallback(
    async (
      files: Array<{ path: string; content: string }>,
      currentProjectId?: string,
      mode: "create" | "update" = "create"
    ) => {
      // Only run if E2B is configured (API key present) and files include React project
      const hasAppTsx = files.some((f) => f.path === "src/App.tsx");
      if (!hasAppTsx) return;

      setIsSandboxLoading(true);
      if (mode === "create") setSandboxUrl(null); // Only clear URL for new sandboxes

      try {
        const res = await fetch("/api/sandbox", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files,
            sandboxId: sandboxIdRef.current ?? undefined,
            projectId: currentProjectId,
            mode,
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as { error?: string };
          console.warn("Sandbox error:", err.error ?? res.status);
          return;
        }

        const data = await res.json() as {
          sandboxId?: string;
          previewUrl?: string;
          isNew?: boolean;
        };

        if (data.sandboxId) sandboxIdRef.current = data.sandboxId;
        if (data.previewUrl) setSandboxUrl(data.previewUrl);
      } catch (e) {
        console.warn("Sandbox unavailable:", e);
      } finally {
        setIsSandboxLoading(false);
      }
    },
    []
  );

  const sendPrompt = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || isGenerating) return;

    setDraft("");
    setView("preview");

    pushMessage({ role: "user", content: trimmed });
    startGenerationTimeline();

    // Determine mode: if we already have generated files, this is an edit
    const currentState = useGeneratorStore.getState();
    const existingFiles = (currentState.generatedFiles ?? []).filter(
      (f) => f.path !== "preview.html"
    );
    // Treat as edit when we have real React files (sandbox-first; previewHtml is secondary)
    const hasExistingDesign = existingFiles.some((f) => f.path === "src/App.tsx") || !!(currentState.previewHtml);
    // Capture the original title so we can preserve it during edits
    // (the AI must not rename an existing project when it only edits the design)
    const originalTitle = currentState.projectTitle || "";

    const assistantId = pushMessage({
      role: "assistant",
      content: hasExistingDesign ? "Applying your changes..." : "Generating your design...",
    });

    if (hasExistingDesign) {
      // EDIT MODE — keep sandbox visible so user sees their design while AI processes
      // (HMR will update the preview when files are written to the sandbox)
      await editProject(trimmed, existingFiles, currentState.previewHtml ?? "", projectId);
      // Restore the original title — the AI should never rename an existing project
      if (originalTitle) {
        useGeneratorStore.setState({ projectTitle: originalTitle });
      }
    } else {
      // GENERATE MODE — switch to code view to show live code writing
      setView("code");
      await generateProject(
        `${trimmed}\n\nBuild mode: ${buildMode} page. Make it absolutely stunning.`,
        projectId
      );
    }

    const state = useGeneratorStore.getState();
    if (state.error) {
      updateMessage(
        assistantId,
        `Sorry, something went wrong: ${state.error}\n\nPlease try rephrasing your request.`
      );
      setView("preview");
      return;
    }

    // For edits: always keep the original project title
    const title = hasExistingDesign
      ? (originalTitle || state.projectTitle || "Your Design")
      : (state.projectTitle || "Your Design");
    const html = state.previewHtml ?? "";
    const files = (state.generatedFiles ?? []).filter((f) => f.path !== "preview.html");

    // Switch to preview after generation/edit completes
    setView("preview");

    await saveToProject(title, html, files);

    let responseText: string;
    if (state.description) {
      responseText = state.description;
    } else if (hasExistingDesign) {
      const short = trimmed.length > 60 ? `${trimmed.slice(0, 57)}…` : trimmed;
      responseText = `Done! I've applied "${short}" to your design.\n\nThe live preview updates automatically. Want to tweak anything else?`;
    } else {
      const codeFileCount = files.length;
      responseText = `${title} is ready! 🎉\n\nI've generated ${codeFileCount} React file${codeFileCount === 1 ? "" : "s"} with a matching live preview.\n\nI'm also spinning up a live Vite environment — you'll see the sandbox preview appear shortly.\n\nTry asking me to change colors, add sections, or refine any part!`;
    }
    streamMessage(assistantId, responseText);

    // ── Spin up E2B sandbox in the background (non-blocking) ─────────────────
    isEditModeRef.current = hasExistingDesign;
    if (hasExistingDesign) {
      // Edit: update files in existing sandbox via HMR (fast, no npm reinstall)
      void spinUpSandbox(files, projectId, "update");
    } else {
      // New design: create fresh sandbox with npm install + vite start
      void spinUpSandbox(files, projectId, "create");
    }
  };

  const handleSend = async (nextPrompt = draft) => {
    await sendPrompt(nextPrompt);
  };

  // Stable ref so the timer callback always calls the latest sendPrompt
  // (avoids stale closure and replaces useEffectEvent for broader compatibility)
  const sendPromptStableRef = useRef(sendPrompt);
  useLayoutEffect(() => {
    sendPromptStableRef.current = sendPrompt;
  });

  // Handle pending prompt from session storage (fires once per projectId after load)
  useEffect(() => {
    if (pendingPromptRef.current || isGenerating || !projectId) return;

    const pending = readProjectPendingPrompt(projectId);
    if (!pending) return;

    pendingPromptRef.current = true;
    // NOTE: Do NOT clear sessionStorage here.
    // React StrictMode runs effects twice in dev: the first timer gets cancelled
    // by the cleanup, and pendingPromptRef is reset by Effect 1 on the second mount.
    // If we cleared sessionStorage in the first run the second run would find nothing.
    // Instead, clear inside the timer so it only happens when we actually fire.

    const tid = window.setTimeout(() => {
      clearProjectPendingPrompt(projectId);
      void sendPromptStableRef.current(pending);
    }, 200);
    return () => window.clearTimeout(tid);
  }, [projectId, isGenerating]);

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareFeedback("Link copied!");
      } else {
        window.prompt("Copy link:", url);
        setShareFeedback("Ready to copy");
      }
    } catch {
      window.prompt("Copy link:", url);
      setShareFeedback("Ready to copy");
    }
    if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current);
    shareTimerRef.current = window.setTimeout(() => setShareFeedback(null), 2500);
  };

  const handleOpenExternal = () => {
    if (sandboxUrl) {
      window.open(sandboxUrl, "_blank");
    } else if (previewHtml) {
      const blob = new Blob([previewHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      window.setTimeout(() => URL.revokeObjectURL(url), 30000);
    } else {
      window.open(window.location.href, "_blank");
    }
  };

  /**
   * Download all generated Vite+React files as a ZIP with the exact folder structure.
   * Excludes the virtual "preview.html" blob — users only need the real source.
   */
  const handleDownload = async () => {
    const downloadFiles = (generatedFiles ?? []).filter((f) => f.path !== "preview.html");
    if (!downloadFiles.length) return;

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (const file of downloadFiles) {
        zip.file(file.path, file.content);
      }

      // Add a README.md so the user knows how to run the project
      zip.file(
        "README.md",
        `# ${projectLabel}\n\nGenerated with DesignAI.\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\nOpen http://localhost:5173 in your browser.\n`
      );

      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${projectLabel.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "design"}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Download failed:", e);
    }
  };

  const activeEditorValue = activePath ? getFileContent(activePath) : "";
  const chatSidebarContent = (
    <>
      <div className="flex shrink-0 items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">AI Chat</p>
            <p className="text-[10px] text-slate-500">Edit &amp; refine your design</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="rounded-md px-2 py-1 text-[10px] font-semibold text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
          >
            Clear
          </button>
        )}
      </div>

      <div
        ref={taskPanelRef}
        className="flex-1 overflow-y-auto px-4 py-4 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.1)_transparent]"
      >
        {messages.length === 0 && !isTaskPanelLive && !isGenerating ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 ring-1 ring-white/5">
              <Wand2 className="h-7 w-7 text-indigo-400" />
            </div>
            <div>
              <p className="font-bold text-white">Start designing</p>
              <p className="mt-1 text-xs text-slate-500">
                Describe your website, app, image, dashboard, or text page below
              </p>
            </div>
            <div className="mt-2 flex w-full flex-col gap-1.5">
              {[
                "Build a premium fashion store with cart, filters, and reviews",
                "Create an app dashboard with analytics and team activity",
                "Design a poster-style image concept board for a coffee brand",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => void handleSend(suggestion)}
                  className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-left text-xs text-slate-400 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-slate-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex flex-col", msg.role === "user" ? "items-end" : "items-start")}
              >
                <div className={cn("flex gap-3 max-w-[95%]", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  {msg.role === "assistant" && (
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "text-sm leading-relaxed transition-all",
                      msg.role === "user"
                        ? "text-slate-200 font-medium"
                        : "text-slate-300"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            ))}

            <AnimatePresence>
              {(generationTasks.length > 0 || isTaskPanelLive || isGenerating) && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                >
                  <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
                    <div>
                      <p className="text-xs font-bold text-white">Generation Pipeline</p>
                      <p className="text-[10px] text-slate-500">AI design agents at work</p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                        isTaskPanelLive || isGenerating
                          ? "border-indigo-400/25 bg-indigo-500/10 text-indigo-300"
                          : "border-emerald-400/25 bg-emerald-500/10 text-emerald-300"
                      )}
                    >
                      {isTaskPanelLive || isGenerating ? "Live" : "Done"}
                    </span>
                  </div>
                  <div className="space-y-1 px-3 py-3">
                    <AnimatePresence initial={false}>
                      {generationTasks.map((task) => {
                        const isKimiStyle = task.id === "research" || task.id === "code";
                        
                        if (isKimiStyle) {
                          return (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className={cn(
                                "flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 transition-all hover:bg-white/[0.08]",
                                task.status === "active" && "border-indigo-500/30 ring-1 ring-indigo-500/20"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                {task.id === "research" ? (
                                  <Search className="h-3.5 w-3.5 text-slate-400" />
                                ) : (
                                  <Bot className="h-3.5 w-3.5 text-slate-400" />
                                )}
                                <p className="text-[13px] font-medium text-slate-300">
                                  {task.id === "research" ? "Search" : "Executing"}
                                  <span className="mx-2 text-slate-600">|</span>
                                  <span className={cn(task.status === "active" ? "text-indigo-300" : "text-slate-500")}>
                                    {task.label}
                                  </span>
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {task.status === "active" ? (
                                  <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                                ) : (
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                )}
                                <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
                              </div>
                            </motion.div>
                          );
                        }

                        return (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className={cn("flex gap-3 rounded-xl px-2.5 py-2", task.status === "active" && "bg-indigo-500/10")}
                          >
                            <div className="mt-0.5 shrink-0">
                              <TaskStatusIcon status={task.status} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p
                                className={cn(
                                  "truncate text-xs font-semibold",
                                  task.status === "completed"
                                    ? "text-slate-400"
                                    : task.status === "active"
                                      ? "text-indigo-200"
                                      : "text-slate-600"
                                )}
                              >
                                {task.label}
                              </p>
                              <p className="mt-0.5 text-[10px] text-slate-600">{task.agent}</p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                    {generationTasks.length === 0 && (
                      <div className="flex items-center gap-3 px-2.5 py-2 text-xs text-slate-500">
                        <TaskStatusIcon status="active" />
                        Initializing AI agents...
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-white/5 p-4">
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] px-4 pb-3 pt-4 transition-all focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20">
          <input ref={fileInputRef} type="file" multiple className="hidden" />
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isGenerating ? "Generating..." : "What do you want to build?"}
            disabled={isGenerating}
            className="w-full resize-none bg-transparent text-sm leading-relaxed text-slate-200 outline-none placeholder:text-slate-600 disabled:opacity-50"
            style={{ minHeight: 60, maxHeight: 160 }}
          />
          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/5 hover:text-slate-300"
                title="Attach file"
              >
                <Plus className="h-4 w-4" />
              </button>
              <button
                onClick={startVoiceInput}
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition",
                  isListening ? "animate-pulse text-red-400" : "hover:bg-white/5 hover:text-slate-300"
                )}
                title="Voice input"
              >
                <Mic className="h-4 w-4" />
              </button>
              <div className="h-4 w-px bg-white/10 mx-1" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 transition hover:bg-white/5 hover:text-slate-300">
                    {buildMode}
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-32 border-white/10 bg-slate-900 shadow-2xl">
                  {(["Landing", "App", "Dashboard"] as BuildMode[]).map((m) => (
                    <DropdownMenuItem
                      key={m}
                      onSelect={() => setBuildMode(m)}
                      className="text-xs font-bold uppercase tracking-wider text-slate-400 focus:bg-white/10 focus:text-white"
                    >
                      {m}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <button
              onClick={() => void handleSend()}
              disabled={isGenerating || !draft.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-20 disabled:grayscale"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
          LokoAI Design Engine v4.0
        </p>
      </div>
    </>
  );
  const workspaceMainContent = (
    <>
      <AnimatePresence>
        {view === "code" && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-r border-white/5"
          >
            <FileExplorer
              files={generatedFiles}
              activeFile={activeFilePath}
              onFileSelect={openFile}
              className="h-full w-[260px]"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {view === "code" && (
          <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-slate-950/60 px-4 py-2">
            <p className="text-sm font-bold text-white">{projectLabel}</p>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-400 transition">
                <FileText className="h-3.5 w-3.5 text-indigo-400" />
                {activePath || "No file selected"}
              </div>
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {view === "preview" ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full w-full justify-center bg-slate-950"
              >
                <div className={cn("relative h-full overflow-hidden transition-all", previewWidthClass)}>
                  {sandboxUrl && !isSandboxLoading ? (
                    <iframe
                      key={`sandbox-${sandboxUrl}-${refreshKey}`}
                      src={sandboxUrl}
                      className="h-full w-full border-0"
                      title="Live Vite preview"
                      allow="cross-origin-isolated"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                    />
                  ) : (
                    <SandboxLoadingState isEdit={isSandboxLoading && isEditModeRef.current} />
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="code"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-hidden"
              >
                {isGenerating ? (
                  <LiveCodeWriter activeTasks={generationTasks} />
                ) : (
                  <Editor
                    theme="vs-dark"
                    language={activeLanguage}
                    value={activeEditorValue}
                    onChange={(val) => {
                      if (activePath) updateFileContent(activePath, val ?? "");
                    }}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 13,
                      fontFamily: '"Geist Mono", "Fira Code", Consolas, monospace',
                      wordWrap: "on",
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      padding: { top: 16, bottom: 16 },
                      smoothScrolling: true,
                      lineNumbers: "on",
                      folding: true,
                    }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </>
  );

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-[#020617] text-white" data-theme={isDark ? "dark" : "light"}>
      {/* Light mode overrides — only apply when isDark is explicitly false */}
      {!isDark && (
        <style dangerouslySetInnerHTML={{ __html: `
          [data-theme="light"].relative { background: #f8fafc !important; }
          /* Header */
          [data-theme="light"] header.flex { background: rgba(255,255,255,0.97) !important; border-color: rgba(0,0,0,0.1) !important; }
          [data-theme="light"] header .text-slate-400 { color: #475569 !important; }
          [data-theme="light"] header span { color: #1e293b !important; }
          /* Sidebar */
          [data-theme="light"] aside.flex { background: rgba(255,255,255,0.97) !important; border-color: rgba(0,0,0,0.08) !important; }
          [data-theme="light"] aside p.text-xs.font-bold { color: #1e293b !important; }
          [data-theme="light"] aside p.text-\\[10px\\] { color: #64748b !important; }
          [data-theme="light"] aside .text-slate-500 { color: #64748b !important; }
          [data-theme="light"] aside .border-white\\/5 { border-color: rgba(0,0,0,0.07) !important; }
          [data-theme="light"] aside .bg-white\\/\\[0\\.04\\] { background: rgba(0,0,0,0.03) !important; border-color: rgba(0,0,0,0.1) !important; }
          [data-theme="light"] aside .bg-white\\/\\[0\\.05\\] { background: rgba(0,0,0,0.04) !important; }
          [data-theme="light"] aside .bg-white\\/\\[0\\.03\\] { background: rgba(0,0,0,0.02) !important; }
          [data-theme="light"] aside textarea { color: #1e293b !important; background: transparent !important; }
          [data-theme="light"] aside textarea::placeholder { color: #9ca3af !important; }
          [data-theme="light"] aside .text-slate-300 { color: #334155 !important; }
          [data-theme="light"] aside .text-slate-600 { color: #475569 !important; }
          [data-theme="light"] aside .text-indigo-200 { color: #4f46e5 !important; }
          [data-theme="light"] aside .border-white\\/10 { border-color: rgba(0,0,0,0.08) !important; }
          /* Preview area */
          [data-theme="light"] section.flex.min-w-0 { background: #e2e8f0 !important; }
          [data-theme="light"] .bg-slate-950 { background: #f1f5f9 !important; }
          /* Code panel toolbar */
          [data-theme="light"] .bg-slate-950\\/60 { background: rgba(255,255,255,0.9) !important; }
          [data-theme="light"] .text-white { color: #1e293b !important; }
        `}} />
      )}
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-0 h-[400px] w-[400px] rounded-full bg-indigo-600/6 blur-[100px]" />
        <div className="absolute right-0 top-1/3 h-[300px] w-[300px] rounded-full bg-purple-600/6 blur-[80px]" />
      </div>

      <div className="relative z-10 flex h-full flex-col">
        {/* Header */}
        <header className="flex h-12 shrink-0 items-center gap-2 border-b border-white/5 bg-slate-950/80 px-3 backdrop-blur-xl">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Back</span>
          </button>

          <div className="h-4 w-px bg-white/10" />

          {/* View toggle */}
          <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border border-white/5 bg-white/[0.03] p-0.5 sm:flex" style={{ maxWidth: 200 }}>
            <button
              onClick={() => setView("preview")}
              className={cn(
                "min-w-[70px] rounded-md px-3 py-1.5 text-xs font-semibold transition",
                view === "preview"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Preview
            </button>
            <button
              onClick={() => setView("code")}
              className={cn(
                "min-w-[60px] rounded-md px-3 py-1.5 text-xs font-semibold transition",
                view === "code"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              )}
            >
              Code
            </button>
          </div>

          <div className="flex-1 sm:hidden" />

          <div className="hidden items-center gap-1.5 text-[13px] font-semibold text-slate-100 lg:flex">
            <span className="max-w-[280px] truncate">{projectLabel}</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            </button>
            {/* E2B Sandbox status indicator */}
            {isSandboxLoading && (
              <div className="hidden items-center gap-1.5 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold text-indigo-300 sm:flex">
                <Loader2 className="h-2.5 w-2.5 animate-spin" />
                Starting sandbox…
              </div>
            )}
            {sandboxUrl && !isSandboxLoading && (
              <div className="hidden items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-300 sm:flex">
                <Globe className="h-2.5 w-2.5" />
                Live
              </div>
            )}
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
              title="Refresh preview"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={handleOpenExternal}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
              title={sandboxUrl ? "Open live sandbox" : "Open in new tab"}
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
                  title="Device mode"
                >
                  {deviceMode === "desktop" ? (
                    <Monitor className="h-3.5 w-3.5" />
                  ) : (
                    <Smartphone className="h-3.5 w-3.5" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 border-white/10 bg-slate-900">
                <DropdownMenuItem
                  onSelect={() => setDeviceMode("desktop")}
                  className="text-slate-300 focus:bg-white/10 focus:text-white"
                >
                  Desktop
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setDeviceMode("mobile")}
                  className="text-slate-300 focus:bg-white/10 focus:text-white"
                >
                  Mobile
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={() => setIsFullscreen(true)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
              title="Fullscreen"
            >
              <Expand className="h-3.5 w-3.5" />
            </button>
            {/* Download ZIP — only when code files are available */}
            {filesForEditor.length > 0 && (
              <button
                onClick={() => void handleDownload()}
                className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                title="Download source code as ZIP"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}
            <button
              onClick={() => void handleShare()}
              className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-xs font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
            >
              <Share2 className="h-3.5 w-3.5" />
              {shareFeedback ?? "Share"}
            </button>
          </div>
        </header>

        {/* Main layout */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <aside className="relative z-20 flex h-full w-[360px] min-w-[320px] shrink-0 flex-col border-r border-white/5 bg-slate-950/95 shadow-2xl backdrop-blur-xl max-[900px]:w-[320px]">
            {chatSidebarContent}
          </aside>

          <div className="relative z-0 flex h-full min-w-0 flex-1 overflow-hidden">
            {workspaceMainContent}
          </div>
          {false && (
          <div className="hidden">
            {/* File Explorer Sidebar (VS Code style) */}
            <AnimatePresence>
            {view === "code" && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 260, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden border-r border-white/5"
              >
                <FileExplorer
                  files={generatedFiles}
                  activeFile={activeFilePath}
                  onFileSelect={openFile}
                  className="h-full w-[260px]"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preview / Code Panel */}
          <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
            {/* Code toolbar */}
            {view === "code" && (
              <div className="flex shrink-0 items-center justify-between border-b border-white/5 bg-slate-950/60 px-4 py-2">
                <p className="text-sm font-bold text-white">{projectLabel}</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-slate-400 transition">
                    <FileText className="h-3.5 w-3.5 text-indigo-400" />
                    {activePath || "No file selected"}
                  </div>
                </div>
              </div>
            )}

            {/* Content area */}
            <div className="min-h-0 flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {view === "preview" ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full w-full justify-center bg-slate-950"
                  >
                    <div className={cn("relative h-full overflow-hidden transition-all", previewWidthClass)}>
                      {sandboxUrl && !isSandboxLoading ? (
                        /* E2B live sandbox — primary preview */
                        <iframe
                          key={`sandbox-${sandboxUrl}-${refreshKey}`}
                          src={sandboxUrl ?? undefined}
                          className="h-full w-full border-0"
                          title="Live Vite preview"
                          allow="cross-origin-isolated"
                          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                        />
                      ) : (
                        /* Loading state while sandbox is being set up */
                        <SandboxLoadingState
                          isEdit={isSandboxLoading && isEditModeRef.current}
                        />
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="code"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full overflow-hidden"
                  >
                    {isGenerating ? (
                      <LiveCodeWriter activeTasks={generationTasks} />
                    ) : (
                      <Editor
                        theme="vs-dark"
                        language={activeLanguage}
                        value={activeEditorValue}
                        onChange={(val) => {
                          if (activePath) updateFileContent(activePath, val ?? "");
                        }}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 13,
                          fontFamily: '"Geist Mono", "Fira Code", Consolas, monospace',
                          wordWrap: "on",
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          padding: { top: 16, bottom: 16 },
                          smoothScrolling: true,
                          lineNumbers: "on",
                          folding: true,
                        }}
                      />
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
          </div>
          )}
        </div>
      </div>

      {/* Fullscreen overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl"
          >
            <div className="flex h-full flex-col p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-bold text-white">{projectLabel}</p>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                  Exit
                </button>
              </div>
              <div className="flex-1 overflow-hidden rounded-2xl bg-slate-950 shadow-2xl">
                {sandboxUrl && !isSandboxLoading ? (
                  <iframe
                    src={sandboxUrl}
                    className="h-full w-full border-0"
                    title="Live Vite preview (fullscreen)"
                    allow="cross-origin-isolated"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                  />
                ) : (
                  <SandboxLoadingState
                    isEdit={isSandboxLoading && isEditModeRef.current}
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
