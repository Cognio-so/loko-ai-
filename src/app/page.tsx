"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles, Check, Star, ArrowRight
} from "lucide-react";

// Custom Brand SVG Icons (Since trademark brands are removed/unsupported in some lucide-react versions)
const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" className={props.className}>
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#0A66C2" />
    <path d="M9 17V10H7v7h2zm-1-8.12c.7 0 1.12-.45 1.12-1.01-.01-.58-.42-1.01-1.1-1.01-.68 0-1.12.43-1.12 1.01 0 .56.42 1.01 1.08 1.01h.02zm9 8.12v-3.95c0-2.11-1.13-3.1-2.63-3.1-1.21 0-1.75.67-2.05 1.14h.02v-.98h-2c.03.56 0 6 0 6h2v-3.36c0-.18.01-.36.06-.49.14-.36.47-.73.99-.73.7 0 .98.53.98 1.31V17h2z" fill="white" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" className={props.className}>
    <rect x="2" y="4" width="20" height="16" rx="5" fill="#FF0000" />
    <polygon points="10 8 16 12 10 16" fill="white" />
  </svg>
);

const SlackIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" className={props.className}>
    <circle cx="9" cy="6" r="2.5" fill="#36C5F0" />
    <rect x="7.75" y="7.5" width="2.5" height="5" rx="1.25" fill="#36C5F0" />
    <circle cx="18" cy="9" r="2.5" fill="#2EB67D" />
    <rect x="11.5" y="7.75" width="5" height="2.5" rx="1.25" fill="#2EB67D" />
    <circle cx="15" cy="18" r="2.5" fill="#ECB22E" />
    <rect x="13.75" y="11.5" width="2.5" height="5" rx="1.25" fill="#ECB22E" />
    <circle cx="6" cy="15" r="2.5" fill="#E01E5A" />
    <rect x="7.5" y="13.75" width="5" height="2.5" rx="1.25" fill="#E01E5A" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

const CalendlyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" className={props.className}>
    <circle cx="12" cy="12" r="10" fill="#006BFF" />
    <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5a4.99 4.99 0 0 0 4.24-2.35l-1.74-1A3 3 0 1 1 12 9c1.1 0 2.05.6 2.5 1.5l1.74-1A4.99 4.99 0 0 0 12 7z" fill="white" />
  </svg>
);

const GmailIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" className={props.className}>
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" fill="#F2F2F2" />
    <path d="M22 6v12c0 1.1-.9 2-2 2h-3V8l5-4z" fill="#4285F4" />
    <path d="M2 6v12c0 1.1.9 2 2 2h3V8l-5-4z" fill="#EA4335" />
    <path d="M2 6l10 7 10-7V5l-10 7L2 5v1z" fill="#EA4335" />
    <path d="M12 13L2 6v2l10 7 10-7V6L12 13z" fill="#FBBC05" />
  </svg>
);

const GoogleMeetIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" className={props.className}>
    <path d="M15 8l4.5-4.5c.3-.3.8-.1.8.4v16.2c0 .5-.5.7-.8.4L15 16V8z" fill="#00A82F" />
    <rect x="2" y="4" width="13" height="16" rx="3" fill="#0084FF" />
    <path d="M2 13h13v7H5a3 3 0 0 1-3-3v-4z" fill="#00A82F" />
    <path d="M15 4v9H2V7a3 3 0 0 1 3-3h10z" fill="#FF2E2E" />
    <circle cx="8.5" cy="8.5" r="2.5" fill="white" />
  </svg>
);

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" className={props.className}>
    <circle cx="12" cy="12" r="11" fill="#25D366" />
    <path d="M12 5a7 7 0 0 0-6 10.6L5 19l3.5-.9A7 7 0 1 0 12 5zm3.7 9.8c-.2.6-1.1 1.1-1.6 1.2-.5 0-1.1.2-3.2-.7-2.7-1.1-4.4-3.8-4.5-4-.1-.2-1-1.3-1-2.5 0-1.2.6-1.8.8-2 .2-.2.5-.3.7-.3h.5c.2 0 .4-.1.6.3.2.5.8 1.9.9 2 .1.2.1.4 0 .6-.1.2-.2.3-.3.5-.1.2-.2.3-.3.5-.1.2-.3.4-.4.5-.1.1-.3.3-.1.6.2.3.9 1.5 1.9 2.4.9.9 1.7 1.2 2 1.4.3.2.4.1.6-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1s1.3.6 1.5.7c.2.1.4.2.4.3 0 .2-.1.9-.3 1.5z" fill="white" />
  </svg>
);

const NotionIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
    <path d="M3 2.687c0-.585.348-.847.886-.847.284 0 .759.108 1.265.267l14.417 4.542c.475.138.537.369.537.847v13.84c0 .585-.348.847-.886.847-.284 0-.759-.108-1.265-.267L3.537 17.375C3.062 17.237 3 17.006 3 16.528V2.687zm4.331 4.793v7.351c0 .415.207.6.621.6.241 0 .54-.085.9-.254l5.127-2.392c.083-.042.124-.123.124-.242v-5.69c0-.416-.207-.601-.621-.601-.241 0-.54.085-.9.254L7.455 8.891c-.083.042-.124.123-.124.242zm2.083-1.684l5.77-2.693c.277-.123.415-.316.415-.578a.65.65 0 0 0-.621-.6h-2c-.328 0-.655.085-.983.254l-2.58 1.204V3.687c0-.415-.207-.6-.621-.6H7.3c-.414 0-.621.185-.621.6v3.136c0 .415.207.6.621.6h.145c.343 0 .685-.085 1.026-.254l.947-.442z" />
  </svg>
);

const HubspotIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" className={props.className}>
    <circle cx="12" cy="12" r="10" fill="#FF7A59" />
    <circle cx="12" cy="12" r="3.5" fill="white" />
    <circle cx="12" cy="6.5" r="2" fill="white" />
    <circle cx="7.2" cy="14.8" r="2" fill="white" />
    <circle cx="16.8" cy="14.8" r="2" fill="white" />
    <line x1="12" y1="12" x2="12" y2="6.5" stroke="white" strokeWidth="1.5" />
    <line x1="12" y1="12" x2="7.2" y2="14.8" stroke="white" strokeWidth="1.5" />
    <line x1="12" y1="12" x2="16.8" y2="14.8" stroke="white" strokeWidth="1.5" />
  </svg>
);

const ShopifyIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" className={props.className}>
    <path d="M19.5 7h-3.2l-.8-3.2c-.2-.8-.9-1.3-1.7-1.3H10.2c-.8 0-1.5.5-1.7 1.3l-.8 3.2H4.5C3.7 7 3 7.7 3 8.5v11c0 .8.7 1.5 1.5 1.5h15c.8 0 1.5-.7 1.5-1.5v-11c0-.8-.7-1.5-1.5-1.5z" fill="#95BF47" />
    <path d="M12 9c-1.8 0-3 1.2-3 3v2c0 1.8 1.2 3 3 3s3-1.2 3-3v-2c0-1.8-1.2-3-3-3zM10.5 4l.5-2h2l.5 2h-3z" fill="white" opacity="0.3" />
    <path d="M12 11c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5z" fill="white" />
  </svg>
);

const clientBrands = [
  {
    name: "Deloitte.",
    font: "font-sans font-black tracking-tight",
    color: "text-[#86BC25]",
    bg: "border-[#86BC25]/20 bg-gradient-to-br from-[#86BC25]/12 via-white to-[#86BC25]/[0.03] shadow-[0_14px_30px_rgba(134,188,37,0.10)]"
  },
  {
    name: "zomato",
    font: "font-serif italic font-extrabold",
    color: "text-[#E23744]",
    bg: "border-[#E23744]/20 bg-gradient-to-br from-[#E23744]/10 via-white to-[#E23744]/[0.03] shadow-[0_14px_30px_rgba(226,55,68,0.10)]"
  },
  {
    name: "BHASHINI",
    font: "font-sans font-bold tracking-widest",
    color: "text-[#0A2540] dark:text-[#7BA6FF]",
    bg: "border-[#0A2540]/15 bg-gradient-to-br from-[#0A2540]/10 via-white to-[#4F8BFF]/[0.05] shadow-[0_14px_30px_rgba(10,37,64,0.09)]"
  },
  {
    name: "OpenAI",
    font: "font-mono font-bold",
    color: "text-slate-700 dark:text-slate-100",
    bg: "border-slate-300/60 bg-gradient-to-br from-slate-100 via-white to-slate-50 shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
  },
  {
    name: "Google Gemini",
    font: "font-sans font-extrabold tracking-tight",
    color: "text-sky-600 dark:text-sky-300",
    bg: "border-sky-400/20 bg-gradient-to-br from-sky-500/10 via-white to-cyan-400/[0.06] shadow-[0_14px_30px_rgba(14,165,233,0.12)]"
  },
  {
    name: "Anthropic",
    font: "font-serif font-bold",
    color: "text-[#B78A54] dark:text-[#E0B883]",
    bg: "border-[#E0B883]/20 bg-gradient-to-br from-[#E0B883]/14 via-white to-[#E0B883]/[0.03] shadow-[0_14px_30px_rgba(224,184,131,0.10)]"
  },
  {
    name: "Meta Llama",
    font: "font-sans font-bold",
    color: "text-blue-600 dark:text-blue-300",
    bg: "border-blue-500/20 bg-gradient-to-br from-blue-500/10 via-white to-indigo-400/[0.05] shadow-[0_14px_30px_rgba(37,99,235,0.11)]"
  },
  {
    name: "Cohere",
    font: "font-mono font-semibold",
    color: "text-[#3B593E] dark:text-[#8AD297]",
    bg: "border-[#3B593E]/15 bg-gradient-to-br from-[#3B593E]/10 via-white to-[#6BB374]/[0.05] shadow-[0_14px_30px_rgba(59,89,62,0.10)]"
  },
  {
    name: "Vercel",
    font: "font-sans font-black tracking-tighter",
    color: "text-slate-800 dark:text-white",
    bg: "border-slate-300/60 bg-gradient-to-br from-slate-100 via-white to-slate-50 shadow-[0_14px_30px_rgba(15,23,42,0.08)]"
  },
  {
    name: "Supabase",
    font: "font-sans font-bold",
    color: "text-[#24B47E] dark:text-[#52E0A1]",
    bg: "border-[#3ECF8E]/20 bg-gradient-to-br from-[#3ECF8E]/12 via-white to-[#3ECF8E]/[0.03] shadow-[0_14px_30px_rgba(62,207,142,0.11)]"
  },
  {
    name: "Pinecone",
    font: "font-sans font-extrabold",
    color: "text-amber-600 dark:text-amber-300",
    bg: "border-amber-400/20 bg-gradient-to-br from-amber-400/12 via-white to-orange-300/[0.05] shadow-[0_14px_30px_rgba(245,158,11,0.11)]"
  },
  {
    name: "LangChain",
    font: "font-mono font-bold",
    color: "text-emerald-600 dark:text-emerald-300",
    bg: "border-emerald-400/20 bg-gradient-to-br from-emerald-400/12 via-white to-teal-300/[0.05] shadow-[0_14px_30px_rgba(16,185,129,0.11)]"
  }
];

const integrationTools = [
  { name: "Gmail", icon: GmailIcon, card: "border-red-200/70 bg-gradient-to-br from-red-50 via-white to-orange-50 shadow-[0_10px_24px_rgba(234,67,53,0.12)]" },
  { name: "Google Meet", icon: GoogleMeetIcon, card: "border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-sky-50 shadow-[0_10px_24px_rgba(0,168,47,0.12)]" },
  { name: "Calendly", icon: CalendlyIcon, card: "border-blue-200/70 bg-gradient-to-br from-blue-50 via-white to-cyan-50 shadow-[0_10px_24px_rgba(0,107,255,0.12)]" },
  { name: "YouTube", icon: YoutubeIcon, card: "border-rose-200/70 bg-gradient-to-br from-rose-50 via-white to-red-50 shadow-[0_10px_24px_rgba(255,0,0,0.12)]" },
  { name: "LinkedIn", icon: LinkedinIcon, card: "border-sky-200/70 bg-gradient-to-br from-sky-50 via-white to-blue-50 shadow-[0_10px_24px_rgba(10,102,194,0.12)]" },
  { name: "Twitter X", icon: TwitterIcon, card: "border-slate-200/80 bg-gradient-to-br from-slate-100 via-white to-slate-50 shadow-[0_10px_24px_rgba(15,23,42,0.10)] text-slate-900" },
  { name: "WhatsApp", icon: WhatsappIcon, card: "border-green-200/70 bg-gradient-to-br from-green-50 via-white to-emerald-50 shadow-[0_10px_24px_rgba(37,211,102,0.12)]" },
  { name: "Notion", icon: NotionIcon, card: "border-zinc-200/80 bg-gradient-to-br from-zinc-100 via-white to-zinc-50 shadow-[0_10px_24px_rgba(24,24,27,0.10)] text-zinc-900" },
  { name: "Slack", icon: SlackIcon, card: "border-fuchsia-200/60 bg-gradient-to-br from-fuchsia-50 via-white to-cyan-50 shadow-[0_10px_24px_rgba(54,197,240,0.12)]" },
  { name: "GitHub", icon: GithubIcon, card: "border-slate-200/80 bg-gradient-to-br from-slate-100 via-white to-slate-50 shadow-[0_10px_24px_rgba(15,23,42,0.10)] text-slate-900" },
  { name: "HubSpot", icon: HubspotIcon, card: "border-orange-200/70 bg-gradient-to-br from-orange-50 via-white to-amber-50 shadow-[0_10px_24px_rgba(255,122,89,0.12)]" },
  { name: "Shopify", icon: ShopifyIcon, card: "border-lime-200/70 bg-gradient-to-br from-lime-50 via-white to-green-50 shadow-[0_10px_24px_rgba(149,191,71,0.12)]" }
];

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Operations Lead @ BrightPath Agency",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80",
    review: "LokoAI helped us automate tasks we were still doing manually every day. The setup was surprisingly fast, and the agents just work without constant babysitting."
  },
  {
    name: "David Chen",
    role: "Senior AI Engineer @ Cortex Labs",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    review: "LokoAI strikes a great balance between flexibility and simplicity. Multi-model support, tool integrations, and clean execution make it easy to build serious agents without infrastructure overhead."
  },
  {
    name: "Arjun Mehta",
    role: "Lead Architect @ DataForge",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    review: "The agent orchestration and model switching are very well designed. We can route different tasks to different LLMs without rewriting logic, which is a big win."
  },
  {
    name: "Emily Watson",
    role: "Product Manager @ LaunchStack",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    review: "What impressed me most was how quickly we went from idea to a live agent. No complex workflows  - — just explain the task and deploy. It's now part of our daily operations."
  },
  {
    name: "Sofia Rodriguez",
    role: "Customer Success Manager @ Helpwise",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80",
    review: "Our support workflows are much smoother now. The chatbot handles common queries, and escalations are seamless when a human is needed."
  },
  {
    name: "Rohan Das",
    role: "Growth & Strategy @ ScaleUp Studio",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&auto=format&fit=crop&q=80",
    review: "LokoAI helped us automate lead qualification and internal reporting. What used to take hours now runs quietly in the background."
  },
  {
    name: "Jessica Taylor",
    role: "Marketing Manager @ Vantage Digital",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80",
    review: "We use LokoAI for content generation and campaign research. It saves hours every week and keeps everything in one place instead of juggling multiple tools."
  },
  {
    name: "Marcus Stone",
    role: "Founder @ NovaBridge",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&auto=format&fit=crop&q=80",
    review: "We replaced three separate AI subscriptions with LokoAI. Lower cost, better control, and far less complexity for our team."
  },
  {
    name: "Dr. Priya Nair",
    role: "Academic Researcher @ IIT Delhi",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80",
    review: "LokoAI has been extremely useful in managing academic workflows. From organizing course materials to assisting with research summaries, it has significantly reduced repetitive effort."
  }
];

const pricingPlans = [
  {
    name: "Starter",
    monthlyPrice: 9,
    yearlyPrice: 7,
    highlight: "Best for trying LokoAI",
    credits: "120 Monthly credits /mo",
    integCredits: "3k Integration credits /mo",
    features: [
      "Unlimited apps and superagents",
      "Built-in integrations",
      "2-way GitHub sync",
      "Email support",
    ],
    popular: false,
    cta: "Get Starter"
  },
  {
    name: "Builder",
    monthlyPrice: 29,
    yearlyPrice: 24,
    highlight: "Best for solo founders",
    credits: "300 Monthly credits /mo",
    integCredits: "12k Integration credits /mo",
    features: [
      "Unlimited apps and superagents",
      "Unlimited collaborators with shared credits",
      "Custom domain & Remove branding",
      "Automations & In-app code editing",
      "Choose your favorite AI model",
    ],
    popular: true,
    cta: "Get Builder"
  },
  {
    name: "Pro",
    monthlyPrice: 59,
    yearlyPrice: 49,
    highlight: "Best for growing product teams",
    credits: "650 Monthly credits /mo",
    integCredits: "25k Integration credits /mo",
    features: [
      "Everything in Builder",
      "Private templates",
      "Priority generations",
      "Advanced workflow automations",
      "Team sharing controls",
      "Faster support turnaround",
    ],
    popular: false,
    cta: "Get Pro"
  },
  {
    name: "Elite",
    monthlyPrice: 99,
    yearlyPrice: 82,
    highlight: "Best for agencies and scale-ups",
    credits: "1.5k Monthly credits /mo",
    integCredits: "60k Integration credits /mo",
    features: [
      "Everything in Pro",
      "Dedicated onboarding",
      "Early feature access",
      "Premium support",
      "High-volume generation capacity",
      "Custom workspace guidance",
    ],
    popular: false,
    cta: "Get Elite"
  }
];

export default function Home() {
  const [isYearly, setIsYearly] = useState(false);
  const router = useRouter();
  const goToLogin = () => router.push("/dashboard");

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="absolute inset-0 bg-grid-pattern opacity-80 pointer-events-none" />
      <div className="absolute left-[-4.5rem] top-24 h-[220px] w-[220px] rounded-full bg-sky-400/10 blur-[90px] pointer-events-none sm:top-1/4 sm:-left-20 sm:h-[450px] sm:w-[450px] sm:blur-[140px]" />
      <div className="absolute right-[-4.5rem] top-40 h-[220px] w-[220px] rounded-full bg-cyan-400/10 blur-[90px] pointer-events-none sm:top-1/3 sm:-right-20 sm:h-[450px] sm:w-[450px] sm:blur-[140px]" />
      <div className="absolute bottom-12 left-1/2 h-[240px] w-[240px] -translate-x-1/2 rounded-full bg-sky-300/5 blur-[100px] pointer-events-none sm:bottom-1/4 sm:left-1/3 sm:h-[500px] sm:w-[500px] sm:translate-x-0 sm:blur-[160px]" />
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-5xl mx-auto">
          <div className="mb-6 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-400 sm:mb-8">
            <Sparkles className="h-3.5 w-3.5 text-sky-500" />
            Build AI apps, superagents and workflows in minutes
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-950 dark:text-white sm:text-6xl lg:text-7xl">
            Build Faster with <span className="text-sky-500">LokoAI</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-600 dark:text-gray-400 sm:text-lg">
            Create production-ready AI apps, automate workflows, and orchestrate multiple models without dealing with infrastructure complexity.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button onClick={goToLogin} className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-500/10 transition-all active:scale-95 group hover:bg-sky-600">
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition-all hover:border-sky-300 hover:text-sky-600 dark:border-white/10 dark:bg-white/5 dark:text-white">
              Book Demo
            </button>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-5 text-xs font-semibold text-slate-500 dark:text-gray-400">
            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-500" /> Multi-model routing</span>
            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-500" /> Pay-as-you-go</span>
            <span className="flex items-center gap-2"><Check className="w-4 h-4 text-sky-500" /> Cancel Anytime</span>
          </div>
        </motion.div>
      </section>
      <section className="relative z-10 overflow-hidden border-y border-slate-100 bg-slate-50/50 py-10 dark:border-white/5 dark:bg-slate-950/20 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-sky-600 dark:text-sky-400">
            Our Trusted Customers
          </p>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-white/10 hidden md:block" />
        </div>
        <div className="relative w-full flex overflow-hidden">
          <div className="flex gap-4 animate-marquee py-2 whitespace-nowrap will-change-transform">
            {clientBrands.map((brand, idx) => (
              <div key={`b1-${idx}`} className={`pointer-events-none inline-flex h-[64px] min-w-[160px] items-center justify-center rounded-[18px] border px-5 py-4 backdrop-blur-sm select-none sm:h-[74px] sm:min-w-[210px] sm:rounded-[22px] sm:px-8 sm:py-5 ${brand.bg}`}>
                <span className={`${brand.font} ${brand.color} text-base sm:text-lg md:text-xl`}>{brand.name}</span>
              </div>
            ))}
            {clientBrands.map((brand, idx) => (
              <div key={`b2-${idx}`} className={`pointer-events-none inline-flex h-[64px] min-w-[160px] items-center justify-center rounded-[18px] border px-5 py-4 backdrop-blur-sm select-none sm:h-[74px] sm:min-w-[210px] sm:rounded-[22px] sm:px-8 sm:py-5 ${brand.bg}`}>
                <span className={`${brand.font} ${brand.color} text-base sm:text-lg md:text-xl`}>{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="relative z-10 mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold uppercase tracking-widest">
              SMART INTEGRATIONS
            </div>
            <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              All Your Tools.<br />
              <span className="text-sky-500">One Smart Platform.</span>
            </h2>
            <p className="text-base sm:text-lg leading-relaxed text-slate-600 dark:text-gray-400">
              Connect your favorite apps with Loko AI and automate your workflow effortlessly. Sync data, streamline tasks, and work faster without switching tabs.
            </p>
            <button onClick={goToLogin} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky-500 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-sky-500/10 transition-all active:scale-95 group hover:bg-sky-600 sm:w-auto sm:px-7">
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
          <div className="grid grid-cols-2 gap-3 md:hidden">
            {integrationTools.map((tool) => (
              <div key={tool.name} className={`flex min-h-24 flex-col items-center justify-center gap-2 rounded-3xl border p-4 text-center backdrop-blur-sm ${tool.card}`}>
                <tool.icon className="h-8 w-8" />
                <span className="text-xs font-bold text-slate-700">{tool.name}</span>
              </div>
            ))}
          </div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative hidden h-[480px] overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900/50 md:block">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 mb-4">
              <div className="flex gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-red-400 shadow-sm" />
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 shadow-sm" />
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-sm" />
              </div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">
                LokoAI Integrations Mockup
              </div>
              <div className="w-12 h-2" />
            </div>
            <div className="grid grid-cols-4 gap-4 h-[380px] overflow-hidden relative justify-items-center px-2">
              <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-slate-50 dark:from-[#0d1527] to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-slate-50 dark:from-[#0d1527] to-transparent z-10 pointer-events-none" />
              <div className="flex flex-col gap-4 animate-marquee-vertical-up will-change-transform">
                {integrationTools.slice(0, 3).map((tool, idx) => (
                  <div key={`c1-${idx}`} className={`pointer-events-none flex h-16 w-16 flex-shrink-0 select-none items-center justify-center rounded-2xl border backdrop-blur-sm ${tool.card}`}>
                    <tool.icon className="w-9 h-9" />
                  </div>
                ))}
                {integrationTools.slice(0, 3).map((tool, idx) => (
                  <div key={`c1-dup-${idx}`} className={`pointer-events-none flex h-16 w-16 flex-shrink-0 select-none items-center justify-center rounded-2xl border backdrop-blur-sm ${tool.card}`}>
                    <tool.icon className="w-9 h-9" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4 animate-marquee-vertical-down will-change-transform">
                {integrationTools.slice(3, 6).map((tool, idx) => (
                  <div key={`c2-${idx}`} className={`pointer-events-none flex h-16 w-16 flex-shrink-0 select-none items-center justify-center rounded-2xl border backdrop-blur-sm ${tool.card}`}>
                    <tool.icon className="w-9 h-9" />
                  </div>
                ))}
                {integrationTools.slice(3, 6).map((tool, idx) => (
                  <div key={`c2-dup-${idx}`} className={`pointer-events-none flex h-16 w-16 flex-shrink-0 select-none items-center justify-center rounded-2xl border backdrop-blur-sm ${tool.card}`}>
                    <tool.icon className="w-9 h-9" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4 animate-marquee-vertical-up will-change-transform">
                {integrationTools.slice(6, 9).map((tool, idx) => (
                  <div key={`c3-${idx}`} className={`pointer-events-none flex h-16 w-16 flex-shrink-0 select-none items-center justify-center rounded-2xl border backdrop-blur-sm ${tool.card}`}>
                    <tool.icon className="w-9 h-9" />
                  </div>
                ))}
                {integrationTools.slice(6, 9).map((tool, idx) => (
                  <div key={`c3-dup-${idx}`} className={`pointer-events-none flex h-16 w-16 flex-shrink-0 select-none items-center justify-center rounded-2xl border backdrop-blur-sm ${tool.card}`}>
                    <tool.icon className="w-9 h-9" />
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-4 animate-marquee-vertical-down will-change-transform">
                {integrationTools.slice(9, 12).map((tool, idx) => (
                  <div key={`c4-${idx}`} className={`pointer-events-none flex h-16 w-16 flex-shrink-0 select-none items-center justify-center rounded-2xl border backdrop-blur-sm ${tool.card}`}>
                    <tool.icon className="w-9 h-9" />
                  </div>
                ))}
                {integrationTools.slice(9, 12).map((tool, idx) => (
                  <div key={`c4-dup-${idx}`} className={`pointer-events-none flex h-16 w-16 flex-shrink-0 select-none items-center justify-center rounded-2xl border backdrop-blur-sm ${tool.card}`}>
                    <tool.icon className="w-9 h-9" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      <section className="relative z-10 mx-auto max-w-7xl border-t border-slate-100 px-4 py-16 dark:border-white/5 sm:px-6 sm:py-24 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            What Our Users Say
          </h2>
          <p className="mx-auto max-w-2xl text-slate-500 dark:text-gray-400 text-base sm:text-lg">
            Teams and builders across 3 continents trust LokoAI to power their AI workflows.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.05 }} whileHover={{ y: -4 }} className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 rounded-3xl p-6 shadow-md hover:shadow-xl dark:hover:border-sky-500/20 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200 dark:border-white/10 shadow-sm flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-950 dark:text-white text-sm">{t.name}</h4>
                    <p className="text-[11px] font-semibold text-slate-500 dark:text-gray-400">{t.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 dark:text-gray-300 text-sm leading-relaxed">
                  &ldquo;{t.review}&rdquo;
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
      <section className="relative z-10 mx-auto max-w-7xl border-t border-slate-100 px-4 py-16 dark:border-white/5 sm:px-6 sm:py-24 lg:px-8">
        <div className="mb-12 text-center sm:mb-16">
          <h2 className="mb-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Simple Pricing for Powerful AI
          </h2>
          <p className="mx-auto max-w-2xl text-slate-500 dark:text-gray-400 text-base sm:text-lg mb-8">
            Scale your AI workflow with flexible plans built for creators, teams, and growing businesses.
          </p>
          <div className="inline-flex max-w-full items-center gap-1 border border-slate-200 bg-slate-100 p-1 shadow-sm dark:border-white/10 dark:bg-white/5">
            <button onClick={() => setIsYearly(false)} className={`rounded-full px-5 py-2 text-xs font-bold transition-all cursor-pointer ${!isYearly ? "bg-white dark:bg-white/10 text-slate-950 dark:text-white shadow-sm" : "text-slate-500"}`}>
              Monthly
            </button>
            <button onClick={() => setIsYearly(true)} className={`rounded-full px-5 py-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${isYearly ? "bg-sky-500 text-white shadow-sm" : "text-slate-500"}`}>
              Yearly
              <span className="bg-white/20 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {pricingPlans.map((plan, idx) => {
            const finalPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.08 }} whileHover={{ y: -4 }} className={`flex flex-col overflow-hidden rounded-3xl border bg-white dark:bg-slate-900 shadow-[0_8px_30px_rgba(0,0,0,0.02)] transition-all duration-300 relative ${plan.popular ? "border-[#0ea5ff] shadow-[0_20px_50px_rgba(14,165,255,0.08)] ring-1 ring-[#0ea5ff]/10" : "border-slate-200/80 dark:border-white/5"}`}>
                {plan.popular && (
                  <div className="absolute inset-x-0 top-0 bg-[#0ea5ff] py-2 text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-white">
                    MOST POPULAR
                  </div>
                )}
                <div className={`p-6 flex flex-col justify-between h-full ${plan.popular ? "pt-12" : "pt-8"}`}>
                  <div>
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{plan.name}</h3>
                      <p className="mt-1 text-xs text-slate-500 dark:text-gray-400 font-semibold">{plan.highlight}</p>
                    </div>
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-4xl font-extrabold text-slate-950 dark:text-white">${finalPrice}</span>
                        <span className="text-xs text-slate-400 dark:text-gray-500">/mo</span>
                      </div>
                      <div className="rounded-2xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50 py-3.5 px-4 text-left shadow-sm">
                        <p className="text-xs font-bold text-slate-800 dark:text-gray-200">{plan.credits}</p>
                        <p className="text-xs font-bold text-slate-800 dark:text-gray-200 mt-1">{plan.integCredits}</p>
                      </div>
                    </div>
                    <div className="space-y-3.5 mb-8">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-gray-500">Highlights</p>
                      {plan.features.map((feature, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-3">
                          <div className="h-4.5 w-4.5 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-500/20">
                            <Check className="h-2.5 w-2.5 text-emerald-500" />
                          </div>
                          <span className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={goToLogin} className={`w-full rounded-2xl py-3.5 text-xs font-extrabold transition-all cursor-pointer ${plan.popular ? "bg-[#0ea5ff] text-white shadow-md shadow-[#0ea5ff]/20 hover:opacity-90 active:scale-95" : "border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 active:scale-95"}`}>
                    {plan.cta}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
