"use client";

import Link from "next/link";
import { type ComponentType, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  BriefcaseBusiness,
  Globe,
  Layers3,
  LineChart,
  Rocket,
  ShoppingBag,
  Sparkles,
  UtensilsCrossed,
  WandSparkles,
} from "lucide-react";

type Mode = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  accent: string;
  prompt: string;
  headline: string;
  blurb: string;
  metrics: Array<{ label: string; value: string }>;
  chips: string[];
};

const modes: Mode[] = [
  {
    id: "fashion",
    label: "Fashion Store",
    icon: ShoppingBag,
    accent: "from-cyan-400/30 via-sky-400/20 to-transparent",
    prompt:
      "Create a premium fashion storefront with festive collections, WhatsApp ordering, and bilingual reviews.",
    headline: "Launch a catalog that feels editorial, not template-made.",
    blurb:
      "Product stories, smart collections, and conversion blocks are arranged for high-intent shoppers from the first scroll.",
    metrics: [
      { label: "Avg. hero CTR", value: "+38%" },
      { label: "Category depth", value: "24 SKUs" },
      { label: "Checkout friction", value: "-31%" },
    ],
    chips: ["Hover swap gallery", "Cart rail", "INR pricing", "Festive badges"],
  },
  {
    id: "agency",
    label: "Creative Agency",
    icon: BriefcaseBusiness,
    accent: "from-lime-400/30 via-emerald-400/20 to-transparent",
    prompt:
      "Build a kinetic agency site with case studies, neon proof points, and a warm lead capture flow.",
    headline: "Show your work like a pitch deck and a portfolio had a smarter child.",
    blurb:
      "Each section is structured to earn trust fast: proof, process, outcomes, and a clean route into your pipeline.",
    metrics: [
      { label: "Case study slots", value: "06" },
      { label: "Lead form steps", value: "02" },
      { label: "Mobile polish", value: "A+" },
    ],
    chips: ["Smooth reveals", "Client wall", "Project filters", "Team cards"],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    icon: UtensilsCrossed,
    accent: "from-amber-400/30 via-orange-400/20 to-transparent",
    prompt:
      "Design a warm food website with chef story, menu tabs, offers timer, and reservation form.",
    headline: "Turn cravings into reservations, orders, and repeat visits.",
    blurb:
      "The layout balances appetite, clarity, and trust with menu focus, local contact details, and strong offer placement.",
    metrics: [
      { label: "Menu sections", value: "04" },
      { label: "Reservation fields", value: "06" },
      { label: "Offer urgency", value: "Live" },
    ],
    chips: ["Cart summary", "Chef feature", "Hours block", "Map section"],
  },
];

const rails = [
  "Prompt to layout engine",
  "Brand-aware color system",
  "Auto section sequencing",
  "Responsive polish",
  "Instant copy refinement",
];

const workflow = [
  {
    title: "Describe the business",
    text: "Give LokoAI one messy sentence, a niche, or a rough offer. It starts from intent instead of a fixed template.",
    icon: WandSparkles,
  },
  {
    title: "Watch sections assemble",
    text: "Hero, trust blocks, pricing, forms, and industry-specific modules are composed in the right order automatically.",
    icon: Layers3,
  },
  {
    title: "Ship and keep iterating",
    text: "Change colors, swap sections, or rewrite positioning without restarting from zero every time.",
    icon: Rocket,
  },
];

const proof = [
  {
    quote:
      "We stopped stitching random sections together. LokoAI gave us a site structure that already felt conversion-aware.",
    name: "Nikita Rao",
    role: "Founder, DraftMint Studio",
  },
  {
    quote:
      "The first draft looked custom enough to present to clients immediately, which is rare for AI-generated web output.",
    name: "Hamza Ali",
    role: "Ops Lead, Northlane Media",
  },
  {
    quote:
      "The prompt-to-preview loop is the part that clicked. Fast enough to explore, polished enough to keep.",
    name: "Rhea Mathew",
    role: "Product Consultant, Fluxboard",
  },
];

function ModeCard({ mode, active, onClick }: { mode: Mode; active: boolean; onClick: () => void }) {
  const Icon = mode.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[28px] border p-5 text-left transition-all duration-300 ${
        active
          ? "border-white/20 bg-white/10 shadow-[0_24px_80px_rgba(56,189,248,0.16)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
      }`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${mode.accent} opacity-80`} />
      <div className="relative space-y-4">
        <div className="flex items-center justify-between">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 text-cyan-200">
            <Icon className="h-5 w-5" />
          </span>
          {active ? (
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold text-cyan-100">
              Active Mode
            </span>
          ) : null}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{mode.label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">{mode.blurb}</p>
        </div>
      </div>
    </button>
  );
}

export default function HomeShowcase() {
  const [activeMode, setActiveMode] = useState<Mode>(modes[0]);

  return (
    <div className="relative overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_32%),radial-gradient(circle_at_82%_18%,_rgba(132,204,22,0.16),_transparent_24%),linear-gradient(180deg,_#07111f_0%,_#091827_52%,_#050b14_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
      <div className="pointer-events-none absolute left-[-10rem] top-28 h-80 w-80 rounded-full bg-cyan-400/15 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8rem] top-60 h-72 w-72 rounded-full bg-lime-400/10 blur-3xl" />

      <section className="relative mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-slate-300 backdrop-blur">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <span>Prompt-powered website builder for agencies, stores, apps, and local brands</span>
          </div>
          <span className="rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1 font-medium text-lime-100">
            New: business-mode generation
          </span>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100">
                <Bot className="h-3.5 w-3.5" />
                LokoAI Website Studio
              </div>
              <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl lg:text-7xl">
                Build an AI website that looks commissioned, not copied.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                LokoAI turns one business prompt into a structured, conversion-aware website with visual direction,
                mobile polish, and editable sections you can actually keep.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.6 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <Link
                href="/login?next=/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#67e8f9,#84cc16)] px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:brightness-105"
              >
                Start Building
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
              >
                See Pricing
              </Link>
            </motion.div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Business-ready section logic", value: "14+" },
                { label: "Average first draft time", value: "< 3 min" },
                { label: "Reusable prompt variations", value: "Unlimited" },
              ].map((item) => (
                <div key={item.label} className="rounded-[26px] border border-white/10 bg-white/[0.03] p-5 backdrop-blur">
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-[36px] bg-[linear-gradient(135deg,rgba(34,211,238,0.18),rgba(132,204,22,0.12),transparent)] blur-2xl" />
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#08101c]/95 p-5 shadow-[0_30px_100px_rgba(4,10,18,0.75)]">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-300" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-slate-300">
                  Live generation canvas
                </span>
              </div>

              <div className="mt-5 rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-2xl bg-cyan-300/10 p-2 text-cyan-200">
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Prompt</p>
                    <p className="mt-2 text-sm leading-6 text-slate-100">{activeMode.prompt}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-4">
                  {modes.map((mode) => (
                    <ModeCard
                      key={mode.id}
                      mode={mode}
                      active={activeMode.id === mode.id}
                      onClick={() => setActiveMode(mode)}
                    />
                  ))}
                </div>

                <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeMode.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.22 }}
                    >
                      <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            Generated Direction
                          </p>
                          <BadgeCheck className="h-4 w-4 text-lime-300" />
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">
                          {activeMode.headline}
                        </h2>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {activeMode.chips.map((chip) => (
                            <span
                              key={chip}
                              className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-200"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {activeMode.metrics.map((metric) => (
                          <div key={metric.label} className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                            <p className="text-xl font-semibold text-white">{metric.value}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-400">{metric.label}</p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 rounded-[24px] border border-dashed border-cyan-300/20 bg-cyan-300/[0.05] p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-cyan-100">Structure rail</p>
                          <LineChart className="h-4 w-4 text-cyan-200" />
                        </div>
                        <div className="mt-4 space-y-3">
                          {rails.map((item, index) => (
                            <div key={item} className="flex items-center gap-3">
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/20 bg-slate-950/70 text-[11px] text-cyan-100">
                                0{index + 1}
                              </span>
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/6">
                                <div
                                  className="h-full rounded-full bg-[linear-gradient(90deg,#67e8f9,#84cc16)]"
                                  style={{ width: `${68 + index * 6}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-400">ready</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            Better than generic AI sections because the sequence has intent.
          </h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {workflow.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.08 }}
                className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950/70 text-cyan-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-slate-400">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-white">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{step.text}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-[36px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-lime-200">Prompt Library</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                Start from proven business angles instead of a blank box.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                LokoAI can generate around a business type, but it still gives you room to steer the vibe,
                sales flow, and offer stack so the result feels like your brand.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {modes.map((mode) => {
                const Icon = mode.icon;
                return (
                  <div key={mode.id} className="rounded-[28px] border border-white/10 bg-slate-950/55 p-5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.06] text-cyan-200">
                        <Icon className="h-5 w-5" />
                      </span>
                      <p className="font-semibold text-white">{mode.label}</p>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-300">{mode.prompt}</p>
                  </div>
                );
              })}
              <div className="rounded-[28px] border border-dashed border-lime-300/20 bg-lime-300/[0.05] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-lime-100">Custom steer</p>
                <p className="mt-4 text-sm leading-6 text-slate-200">
                  Add directions like &ldquo;make it more premium&rdquo;, &ldquo;use Indian festive tones&rdquo;, or
                  &ldquo;replace testimonials with booking proof&rdquo; and regenerate without losing the overall
                  structure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-5 lg:grid-cols-3">
          {proof.map((item, index) => (
            <motion.blockquote
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="rounded-[30px] border border-white/10 bg-white/[0.04] p-6"
            >
              <p className="text-base leading-8 text-slate-200">&ldquo;{item.quote}&rdquo;</p>
              <footer className="mt-6">
                <p className="font-semibold text-white">{item.name}</p>
                <p className="text-sm text-slate-400">{item.role}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 pb-18 sm:px-6 lg:px-8 lg:pb-28">
        <div className="rounded-[38px] border border-white/10 bg-[linear-gradient(135deg,rgba(103,232,249,0.12),rgba(132,204,22,0.10),rgba(255,255,255,0.05))] p-8 text-center sm:p-10 lg:p-14">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-100">Ready to build</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-white sm:text-5xl">
            Your next website does not need to look like everyone else&apos;s AI draft.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
            Start with a prompt, refine the tone, and let LokoAI shape a site that feels deliberate from the first screen.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/login?next=/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/launchpad"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-slate-950/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-950/50"
            >
              Explore Launchpad
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
