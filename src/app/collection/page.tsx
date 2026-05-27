import Link from "next/link";
import {
  CalendarDays,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { assistants } from "./collection-data";

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
            <Link
              key={assistant.name}
              href={`/collection/${assistant.slug}`}
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
                <span
                  className={`flex h-10 items-center justify-center gap-2 rounded-lg bg-gradient-to-r ${assistant.accent} text-sm font-semibold text-white shadow-sm transition group-hover:shadow-md`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Start Chat
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
