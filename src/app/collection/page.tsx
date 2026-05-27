import Link from "next/link";
import {
  Bot,
  BrainCircuit,
  CalendarDays,
  Camera,
  Code2,
  MessageCircle,
  Palette,
  SearchCheck,
  ShoppingBag,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";

const assistants = [
  {
    name: "Brief Buddy",
    description: "Turns rough ideas into clear prompts, task notes, and ready-to-send instructions.",
    date: "23/12/2025",
    model: "Gemini 2.5 Flash",
    accent: "from-sky-500 to-cyan-400",
    logoText: "BB",
    icon: Bot,
  },
  {
    name: "Daily Druid",
    description: "A calm workflow helper for quick planning, reminders, and everyday decisions.",
    date: "30/12/2025",
    model: "GLM 4.7",
    accent: "from-emerald-500 to-teal-400",
    logoText: "DD",
    icon: WandSparkles,
  },
  {
    name: "Stacksmith Pro",
    description: "Plans production-ready Next.js, React, and Node.js builds from a single product idea.",
    date: "13/02/2026",
    model: "Gemini 3 Flash Preview",
    accent: "from-indigo-500 to-sky-500",
    logoText: "SP",
    icon: Code2,
  },
  {
    name: "Prospect Pilot",
    description: "Finds lead angles, outreach hooks, and quick qualification notes for sales work.",
    date: "17/02/2026",
    model: "Gemini 3 Flash Preview",
    accent: "from-rose-500 to-orange-400",
    logoText: "PP",
    icon: Target,
  },
  {
    name: "Pixel Planner",
    description: "Shapes website sections, visual direction, and layout ideas for polished web pages.",
    date: "13/01/2026",
    model: "Kimi K2.5",
    accent: "from-fuchsia-500 to-violet-500",
    logoText: "PX",
    icon: Palette,
  },
  {
    name: "Lens Prompt Lab",
    description: "Creates cleaner image and video prompts with camera angles, style notes, and negatives.",
    date: "29/01/2026",
    model: "Gemini 3 Flash Preview",
    accent: "from-amber-500 to-yellow-400",
    logoText: "LP",
    icon: Camera,
  },
  {
    name: "Tosh Companion",
    description: "A personal assistant for quick drafts, simple research, and daily creative support.",
    date: "16/01/2026",
    model: "Kimi K2.5",
    accent: "from-cyan-500 to-blue-500",
    logoText: "TC",
    icon: Sparkles,
  },
  {
    name: "Interface Inspector",
    description: "Reviews screenshots and UI flows to spot confusing layouts, copy, and interaction gaps.",
    date: "14/01/2026",
    model: "GPT 5 nano",
    accent: "from-slate-700 to-slate-500",
    logoText: "II",
    icon: BrainCircuit,
  },
  {
    name: "Commerce Studio",
    description: "Generates product ad concepts, creative directions, and asset ideas for ecommerce campaigns.",
    date: "14/01/2026",
    model: "Gemini 3 Flash Preview",
    accent: "from-lime-500 to-emerald-500",
    logoText: "CS",
    icon: ShoppingBag,
  },
  {
    name: "Search Signal",
    description: "Drafts SEO briefs, keyword clusters, and page outlines with a sharper content angle.",
    date: "19/12/2025",
    model: "Gemini 2.5 Flash",
    accent: "from-blue-500 to-indigo-500",
    logoText: "SS",
    icon: SearchCheck,
  },
];

export default function CollectionPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-white">
      <section className="border-b border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-sky-500">Collections</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">My AI Workbench</h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                10 assigned • 5 collected • 0 created
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              <Sparkles className="h-4 w-4" />
              New assistant
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {assistants.map((assistant) => (
            <article
              key={assistant.name}
              className="group flex min-h-[236px] flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-lg dark:border-white/10 dark:bg-slate-900 dark:hover:border-sky-400/40"
            >
              <div>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${assistant.accent} p-[2px] shadow-lg shadow-slate-200/70 transition group-hover:scale-105 dark:shadow-black/30`}
                    >
                      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[14px] bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
                        <div className={`absolute inset-0 bg-gradient-to-br ${assistant.accent} opacity-15`} />
                        <div className="absolute -right-3 -top-3 h-8 w-8 rounded-full bg-white/60 blur-sm dark:bg-white/20" />
                        <assistant.icon className="relative h-6 w-6" />
                      </div>
                      <span
                        className={`absolute -bottom-1.5 -right-1.5 rounded-md bg-gradient-to-br ${assistant.accent} px-1.5 py-0.5 text-[9px] font-black leading-none tracking-wide text-white shadow-sm ring-2 ring-white dark:ring-slate-900`}
                      >
                        {assistant.logoText}
                      </span>
                    </div>
                    <h2 className="text-base font-bold leading-snug text-slate-950 dark:text-white">
                      {assistant.name}
                    </h2>
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{assistant.description}</p>
              </div>

              <div className="mt-6">
                <div className="mb-4 flex items-center justify-between gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <CalendarDays className="h-4 w-4 text-sky-500" />
                    {assistant.date}
                  </span>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-200">
                    {assistant.model}
                  </span>
                </div>
                <Link
                  href="/dashboard"
                  className={`flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r ${assistant.accent} text-sm font-semibold text-white shadow-sm transition group-hover:shadow-md`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Start Chat
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
