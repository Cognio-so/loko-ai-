import type { LucideIcon } from "lucide-react";
import {
  Bot,
  BrainCircuit,
  Camera,
  Code2,
  Palette,
  SearchCheck,
  ShoppingBag,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";

export type CollectionAssistant = {
  slug: string;
  name: string;
  description: string;
  date: string;
  model: string;
  accent: string;
  logoText: string;
  icon: LucideIcon;
  welcome: string;
};

export const assistants: CollectionAssistant[] = [
  {
    slug: "brief-buddy",
    name: "Brief Buddy",
    description: "Turns rough ideas into clear prompts, task notes, and ready-to-send instructions.",
    date: "23/12/2025",
    model: "Gemini 2.5 Flash",
    accent: "from-sky-500 to-cyan-400",
    logoText: "BB",
    icon: Bot,
    welcome: "Send me a rough idea and I will turn it into a clean brief, prompt, or task note.",
  },
  {
    slug: "daily-druid",
    name: "Daily Druid",
    description: "A calm workflow helper for quick planning, reminders, and everyday decisions.",
    date: "30/12/2025",
    model: "GLM 4.7",
    accent: "from-emerald-500 to-teal-400",
    logoText: "DD",
    icon: WandSparkles,
    welcome: "Tell me what you need to organize today and I will help you make a simple plan.",
  },
  {
    slug: "stacksmith-pro",
    name: "Stacksmith Pro",
    description: "Plans production-ready Next.js, React, and Node.js builds from a single product idea.",
    date: "13/02/2026",
    model: "Gemini 3 Flash Preview",
    accent: "from-indigo-500 to-sky-500",
    logoText: "SP",
    icon: Code2,
    welcome: "Describe the product you want to build and I will shape the stack, pages, and core flow.",
  },
  {
    slug: "prospect-pilot",
    name: "Prospect Pilot",
    description: "Finds lead angles, outreach hooks, and quick qualification notes for sales work.",
    date: "17/02/2026",
    model: "Gemini 3 Flash Preview",
    accent: "from-rose-500 to-orange-400",
    logoText: "PP",
    icon: Target,
    welcome: "Share your target customer and I will draft outreach angles and lead qualification notes.",
  },
  {
    slug: "pixel-planner",
    name: "Pixel Planner",
    description: "Shapes website sections, visual direction, and layout ideas for polished web pages.",
    date: "13/01/2026",
    model: "Kimi K2.5",
    accent: "from-fuchsia-500 to-violet-500",
    logoText: "PX",
    icon: Palette,
    welcome: "Tell me the page or product style and I will plan sections, layout, and visual direction.",
  },
  {
    slug: "lens-prompt-lab",
    name: "Lens Prompt Lab",
    description: "Creates cleaner image and video prompts with camera angles, style notes, and negatives.",
    date: "29/01/2026",
    model: "Gemini 3 Flash Preview",
    accent: "from-amber-500 to-yellow-400",
    logoText: "LP",
    icon: Camera,
    welcome: "Give me the image or video idea and I will create a strong prompt with camera and style details.",
  },
  {
    slug: "tosh-companion",
    name: "Tosh Companion",
    description: "A personal assistant for quick drafts, simple research, and daily creative support.",
    date: "16/01/2026",
    model: "Kimi K2.5",
    accent: "from-cyan-500 to-blue-500",
    logoText: "TC",
    icon: Sparkles,
    welcome: "I can help with drafts, quick answers, and creative support. What should we work on?",
  },
  {
    slug: "interface-inspector",
    name: "Interface Inspector",
    description: "Reviews screenshots and UI flows to spot confusing layouts, copy, and interaction gaps.",
    date: "14/01/2026",
    model: "GPT 5 nano",
    accent: "from-slate-700 to-slate-500",
    logoText: "II",
    icon: BrainCircuit,
    welcome: "Send a UI issue or describe a screen and I will point out improvements clearly.",
  },
  {
    slug: "commerce-studio",
    name: "Commerce Studio",
    description: "Generates product ad concepts, creative directions, and asset ideas for ecommerce campaigns.",
    date: "14/01/2026",
    model: "Gemini 3 Flash Preview",
    accent: "from-lime-500 to-emerald-500",
    logoText: "CS",
    icon: ShoppingBag,
    welcome: "Share your product and audience and I will create ecommerce ad concepts and asset ideas.",
  },
  {
    slug: "search-signal",
    name: "Search Signal",
    description: "Drafts SEO briefs, keyword clusters, and page outlines with a sharper content angle.",
    date: "19/12/2025",
    model: "Gemini 2.5 Flash",
    accent: "from-blue-500 to-indigo-500",
    logoText: "SS",
    icon: SearchCheck,
    welcome: "Tell me the topic or URL goal and I will draft an SEO brief with keywords and outline.",
  },
];

export function getAssistant(slug: string) {
  return assistants.find((assistant) => assistant.slug === slug);
}
