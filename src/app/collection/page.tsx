import Link from "next/link";
import {
  CalendarDays,
  Layers3,
  MessageCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import { assistants } from "./collection-data";

export default function CollectionPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8fbff] text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_84%_12%,rgba(124,58,237,0.10),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(236,72,153,0.08),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f8fbff_48%,#eef6ff_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-25" />
      <div className="pointer-events-none absolute inset-0 loko-particle-field" />

      <section className="relative border-b border-slate-200/80 bg-white/70 backdrop-blur-2xl">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-sky-600 shadow-[0_14px_35px_rgba(14,165,233,0.12)]">
                <Zap className="h-3.5 w-3.5" />
                Collections
              </div>
              <h1 className="mt-4 max-w-3xl bg-gradient-to-r from-slate-950 via-sky-700 to-cyan-500 bg-clip-text text-4xl font-black tracking-tight text-transparent drop-shadow-[0_18px_45px_rgba(14,165,233,0.14)] sm:text-5xl">
                Loko AI Operating System
              </h1>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
                Launch specialized AI agents for design, engineering, research, content, growth, and workflow execution.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="group relative inline-flex w-fit items-center gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white/85 px-4 py-2.5 text-sm font-bold text-slate-800 shadow-[0_16px_50px_rgba(14,165,233,0.14)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white"
            >
              <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition duration-700 group-hover:translate-x-[120%]" />
              <Sparkles className="h-4 w-4" />
              <span className="relative">New assistant</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-xl">
            <Layers3 className="h-3.5 w-3.5 text-sky-500" />
            {assistants.length} premium agent systems
          </div>
          <div className="h-px min-w-36 flex-1 bg-gradient-to-r from-sky-200 via-fuchsia-200/70 to-transparent" />
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {assistants.map((assistant) => (
            <Link
              key={assistant.name}
              href={`/collection/${assistant.slug}`}
              className="group relative flex min-h-[286px] flex-col justify-between overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/82 p-5 shadow-[0_22px_80px_rgba(15,23,42,0.10)] backdrop-blur-2xl transition duration-500 hover:-translate-y-2 hover:scale-[1.015] hover:border-sky-200 hover:bg-white"
            >
              <div className={`absolute -right-16 -top-16 h-44 w-44 rounded-full bg-gradient-to-br ${assistant.accent} opacity-20 blur-3xl transition duration-500 group-hover:opacity-35`} />
              <div className={`absolute -bottom-20 left-8 h-36 w-36 rounded-full bg-gradient-to-br ${assistant.accent} opacity-10 blur-3xl transition duration-500 group-hover:opacity-25`} />
              <div className="absolute inset-0 rounded-[28px] bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.08)_45%,transparent_58%)] opacity-0 transition duration-700 group-hover:translate-x-8 group-hover:opacity-100" />
              <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${assistant.accent} opacity-60`} />

              <div>
                <div className="relative mb-6 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br ${assistant.accent} p-[1px] shadow-[0_18px_55px_rgba(0,0,0,0.45)] transition duration-500 group-hover:scale-110 group-hover:rotate-2`}
                    >
                      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[22px] bg-white text-slate-950">
                        <div className={`absolute inset-0 bg-gradient-to-br ${assistant.accent} opacity-24`} />
                        <div className="absolute -right-5 -top-5 h-12 w-12 rounded-full bg-white/35 blur-md" />
                        <div className="absolute inset-0 loko-icon-pulse opacity-70" />
                        <assistant.icon className="relative h-7 w-7 drop-shadow-[0_0_18px_rgba(14,165,233,0.22)]" />
                      </div>
                      <span
                        className={`absolute -bottom-1.5 -right-1.5 rounded-xl bg-gradient-to-br ${assistant.accent} px-2 py-1 text-[9px] font-black leading-none tracking-wide text-white shadow-[0_0_24px_rgba(14,165,233,0.16)] ring-2 ring-white`}
                      >
                        {assistant.logoText}
                      </span>
                    </div>
                    <div>
                      <span className="mb-2 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">
                        AI Skill
                      </span>
                      <h2 className="text-lg font-black leading-snug text-slate-900 transition duration-300 group-hover:text-sky-700">
                        {assistant.name}
                      </h2>
                    </div>
                  </div>
                </div>
                <p className="relative text-sm leading-6 text-slate-600">{assistant.description}</p>
              </div>

              <div className="relative mt-7">
                <div className="mb-4 flex items-center justify-between gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <CalendarDays className="h-4 w-4 text-sky-500" />
                    {assistant.date}
                  </span>
                  <span className="max-w-[150px] truncate rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-bold text-slate-600">
                    {assistant.model}
                  </span>
                </div>
                <span
                  className={`relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r ${assistant.accent} text-sm font-black text-white shadow-[0_10px_30px_rgba(168,85,247,0.26)] transition duration-300 group-hover:shadow-[0_18px_42px_rgba(34,211,238,0.22)]`}
                >
                  <span className="absolute inset-0 translate-x-[-110%] bg-gradient-to-r from-transparent via-white/30 to-transparent transition duration-700 group-hover:translate-x-[110%]" />
                  <MessageCircle className="h-4 w-4" />
                  <span className="relative">Start Chat</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
