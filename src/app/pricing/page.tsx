"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeHelp,
  Check,
  ChevronDown,
  Headphones,
  Rocket,
  ShieldCheck,
  Star,
  UserRound,
  Wrench,
  Zap,
} from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "19",
    credits: "120",
    integCredits: "3k",
    cta: "Get Starter",
    highlight: "Best for trying LokoAI",
    features: [
      "Unlimited apps and superagents",
      "Built-in integrations",
      "2-way GitHub sync",
      "Email support",
    ],
    icon: Star,
    popular: false,
  },
  {
    name: "Builder",
    price: "39",
    credits: "300",
    integCredits: "12k",
    cta: "Get Builder",
    highlight: "Best for solo founders",
    features: [
      "Unlimited apps and superagents",
      "Unlimited collaborators with shared credits",
      "Custom domain",
      "Remove LokoAI branding",
      "Built-in integrations",
      "Automations",
      "Choose your AI model",
      "In-app code editing",
    ],
    icon: Rocket,
    popular: true,
  },
  {
    name: "Pro",
    price: "79",
    credits: "650",
    integCredits: "25k",
    cta: "Get Pro",
    highlight: "Best for growing product teams",
    features: [
      "Everything in Builder",
      "Private templates",
      "Priority generations",
      "Advanced workflow automations",
      "Team sharing controls",
      "Faster support turnaround",
    ],
    icon: Zap,
    popular: false,
  },
  {
    name: "Elite",
    price: "149",
    credits: "1.5k",
    integCredits: "60k",
    cta: "Get Elite",
    highlight: "Best for agencies and scale-ups",
    features: [
      "Everything in Pro",
      "Dedicated onboarding",
      "Early feature access",
      "Premium support",
      "High-volume generation capacity",
      "Custom workspace guidance",
    ],
    icon: ShieldCheck,
    popular: false,
  },
];

const enterpriseFeatures = [
  {
    title: "Onboarding & Training",
    description:
      "Tailored onboarding plans combined with live training resources, designed to help admins and end users adopt quickly.",
    icon: Wrench,
  },
  {
    title: "Dedicated Account Team",
    description:
      "Work with a named account manager and solution engineer, providing direct guidance, escalations, and roadmap alignment.",
    icon: UserRound,
  },
  {
    title: "Priority Support, Guaranteed",
    description:
      "Get guaranteed priority assistance and defined response times from a dedicated support channel.",
    icon: Headphones,
  },
  {
    title: "Enterprise-Grade Capabilities",
    description:
      "Security, compliance, management, and monitoring features that give larger teams the control they need at scale.",
    icon: ShieldCheck,
  },
];

const faqs = [
  {
    question: "What is LokoAI?",
    answer: [
      "LokoAI is an AI-powered platform that helps you build custom software applications without traditional coding.",
      "It turns natural language prompts into functional product experiences so founders, operators, and teams can move from idea to launch much faster.",
    ],
  },
  {
    question: "What is included in the free experience?",
    answer: [
      "You can explore the platform, test generation flows, and understand how LokoAI structures apps before committing to a paid plan.",
      "Paid plans unlock higher monthly credits, deeper integrations, and stronger collaboration and deployment capabilities.",
    ],
  },
  {
    question: "What are integration credits?",
    answer: [
      "Integration credits are used when your app connects to external tools and services such as email, analytics, storage, CRM, and automation providers.",
      "The number of integration credits in your plan helps determine how much connected workflow volume you can run each month.",
    ],
  },
  {
    question: "What types of applications can I build with LokoAI?",
    answer: [
      "You can build SaaS products, internal tools, dashboards, booking flows, portals, team workspaces, automations, and MVPs.",
      "LokoAI works especially well for founders and teams that want to validate ideas quickly and ship usable software with less engineering overhead.",
    ],
  },
  {
    question: "Who owns the applications created with LokoAI?",
    answer: [
      "Your project structure, brand direction, and business workflows remain yours.",
      "LokoAI is the creation platform, while the output is designed to support your ownership and real business use.",
    ],
  },
  {
    question: "What happens if I reach my plan limits?",
    answer: [
      "If you reach your monthly usage limits, you can upgrade to a higher plan for more credits and capacity.",
      "This keeps your app-building workflow smooth without blocking growth as your product usage increases.",
    ],
  },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="min-h-screen bg-[#fcfcfd] px-4 py-10 text-slate-950 dark:bg-[#050505] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="pointer-events-none absolute left-1/2 top-32 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-200/40 dark:bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-10 top-[22rem] h-64 w-64 rounded-full bg-cyan-100/60 dark:bg-cyan-500/10 blur-3xl" />
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-sky-500">
            Flexible Pricing
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white md:text-5xl">
            Plans that feel easy to start and strong enough to scale
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-gray-400">
            Clear monthly pricing for creators, builders, and teams who want to launch faster with LokoAI.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4 }}
              className={`group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border bg-white/95 dark:bg-[#0d0d0d] shadow-[0_14px_36px_rgba(148,163,184,0.14)] transition-all duration-300 ${
                plan.popular
                  ? "border-sky-300 dark:border-sky-500/50 shadow-[0_18px_45px_rgba(14,165,233,0.16)]"
                  : "border-slate-200/80 dark:border-white/10 hover:border-sky-200 dark:hover:border-sky-500/30 hover:shadow-[0_18px_45px_rgba(56,189,248,0.1)]"
              }`}
            >
              <div className="pointer-events-none absolute inset-x-6 top-0 h-20 rounded-b-[1.5rem] bg-gradient-to-b from-sky-100/70 dark:from-sky-500/10 to-transparent opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
              {plan.popular && (
                <div className="absolute inset-x-0 top-0 bg-gradient-to-r from-sky-400 to-cyan-300 py-1.5 text-center text-[10px] font-bold uppercase tracking-[0.24em] text-slate-950">
                  Most Popular
                </div>
              )}

              <div className={`flex h-full flex-col p-5 ${plan.popular ? "pt-11" : ""}`}>
                <div className="mb-4">
                  <div
                    className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl border ${
                      plan.popular
                        ? "border-sky-200 bg-sky-50 dark:border-sky-500/20 dark:bg-sky-500/10 text-sky-500 shadow-[0_12px_30px_rgba(56,189,248,0.18)]"
                        : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5 text-slate-500 group-hover:border-sky-200 group-hover:bg-sky-50 group-hover:text-sky-500 dark:group-hover:bg-sky-500/10"
                    }`}
                  >
                    <plan.icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">{plan.name}</h2>
                  <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">{plan.highlight}</p>
                </div>

                <div className="border-y border-slate-200/80 dark:border-white/10 py-4">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">${plan.price}</span>
                    <span className="pb-0.5 text-sm text-slate-400">/mo</span>
                  </div>
                  <div className="mt-3 rounded-xl border border-slate-200 dark:border-white/5 bg-gradient-to-br from-slate-50 to-sky-50/80 dark:from-white/5 dark:to-white/[0.02] p-3 shadow-inner shadow-white dark:shadow-none">
                    <p className="text-xs font-semibold text-slate-900 dark:text-gray-200">
                      {plan.credits} Monthly credits <span className="text-slate-400">/mo</span>
                    </p>
                    <p className="mt-2 text-xs font-semibold text-slate-900 dark:text-gray-200">
                      {plan.integCredits} Integration credits <span className="text-slate-400">/mo</span>
                    </p>
                  </div>
                </div>

                <button
                  className={`mt-5 rounded-xl py-2.5 text-sm font-semibold transition ${
                    plan.popular
                      ? "bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-200 dark:shadow-none hover:from-sky-600 hover:to-cyan-500"
                      : "border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 text-slate-900 dark:text-white hover:border-sky-300 dark:hover:border-sky-500/30 hover:bg-sky-50 dark:hover:bg-sky-500/10 hover:text-sky-600 dark:hover:text-sky-300"
                  }`}
                >
                  {plan.cta}
                </button>

                <div className="mt-5 border-t border-slate-200/80 dark:border-white/10 pt-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-gray-500">Highlights</p>
                  <div className="space-y-2.5">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                          <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <span className="text-xs leading-5 text-slate-700 dark:text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <section className="mt-18 space-y-6">
          <div className="grid gap-8 overflow-hidden relative rounded-[2rem] border border-sky-100 dark:border-white/10 bg-white dark:bg-[#0d0d0d] p-8 shadow-[0_24px_60px_rgba(56,189,248,0.12)] lg:grid-cols-[1.05fr_1.45fr] lg:p-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-sky-100/70 dark:from-sky-500/5 to-transparent" />
            <div className="flex flex-col justify-between relative z-10">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-500">Enterprise</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">LokoAI for Enterprise</h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-slate-600 dark:text-gray-400">
                  Empower larger organizations to build solutions that fit their teams perfectly, safely, and at scale.
                </p>
              </div>
              <button className="mt-8 w-fit rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-200 dark:shadow-none transition hover:from-sky-600 hover:to-cyan-500">
                Contact Us
              </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 relative z-10">
              {enterpriseFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="rounded-2xl border border-sky-100 dark:border-white/10 bg-gradient-to-br from-white to-sky-50/80 dark:from-white/5 dark:to-white/[0.02] p-5 shadow-[0_12px_30px_rgba(148,163,184,0.08)] dark:shadow-none"
                >
                  <feature.icon className="h-5 w-5 text-sky-500" />
                  <h3 className="mt-4 text-base font-semibold text-slate-950 dark:text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-[1.75rem] border border-sky-100 dark:border-white/10 bg-gradient-to-r from-white via-sky-50 to-cyan-100 dark:from-white/5 dark:via-sky-900/10 dark:to-cyan-900/10 px-6 py-5 shadow-[0_18px_45px_rgba(56,189,248,0.12)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white dark:bg-white/5 text-sky-500 shadow-[0_12px_30px_rgba(56,189,248,0.14)] dark:shadow-none">
                <BadgeHelp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold tracking-tight text-slate-950 dark:text-white sm:text-xl">
                  Student or teacher? Get up to 50% off Starter or Builder plan
                </p>
                <p className="mt-1 text-sm text-slate-600 dark:text-gray-400">
                  Verify your academic email to unlock discounted pricing.
                </p>
              </div>
            </div>
            <button className="flex h-12 w-12 items-center justify-center self-end rounded-full bg-sky-500 text-white shadow-lg shadow-sky-200 dark:shadow-none transition hover:bg-sky-600 sm:self-auto">
              <ArrowRight className="h-6 w-6" />
            </button>
          </div>
        </section>

        <section className="mx-auto mt-18 max-w-6xl">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-sky-500">Support</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Frequently Asked Questions</h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-white/10 rounded-[2rem] border border-sky-100 dark:border-white/10 bg-white dark:bg-[#0d0d0d] px-6 shadow-[0_18px_50px_rgba(56,189,248,0.08)] dark:shadow-none">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;

              return (
                <div key={faq.question} className="py-5">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="flex w-full items-center justify-between gap-4 text-left"
                  >
                    <span className="text-lg font-medium text-slate-950 dark:text-white sm:text-xl">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 text-sky-500 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="mt-4 max-w-5xl space-y-3 pr-2 text-sm leading-7 text-slate-600 dark:text-gray-400">
                      {faq.answer.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
