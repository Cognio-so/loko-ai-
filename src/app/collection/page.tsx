import Link from "next/link";
import {
  CalendarDays,
  Layers3,
  MessageCircle,
} from "lucide-react";
import { CollectionAgentLogo } from "@/components/CollectionAgentLogo";
import { assistants } from "./collection-data";

export default function CollectionPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8fbff] text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_84%_12%,rgba(124,58,237,0.10),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(236,72,153,0.08),transparent_34%),linear-gradient(180deg,#ffffff_0%,#f8fbff_48%,#eef6ff_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-25" />
      <div className="pointer-events-none absolute inset-0 loko-particle-field" />

      <section className="relative mx-auto max-w-[1500px] px-3 py-5 sm:px-5 lg:px-7">
        <div className="mb-4 flex items-center justify-start">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/85 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-xl">
            <Layers3 className="h-3.5 w-3.5 text-sky-500" />
            {assistants.length} premium agent systems
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {assistants.map((assistant) => (
            <Link
              key={assistant.name}
              href={`/collection/${assistant.slug}`}
              className="group relative flex min-h-[238px] flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur-2xl transition duration-300 hover:-translate-y-1.5 hover:border-sky-200 hover:bg-white"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-sky-50/65 via-white to-slate-50/85 opacity-70 transition duration-300 group-hover:opacity-100" />
              <div className="absolute inset-0 rounded-3xl bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.16)_45%,transparent_58%)] opacity-0 transition duration-700 group-hover:translate-x-8 group-hover:opacity-100" />
              <div className="absolute inset-x-0 top-0 h-px bg-sky-200/80" />

              <div>
                <div className="relative mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="transition duration-300 group-hover:scale-105">
                      <CollectionAgentLogo assistant={assistant} />
                    </div>
                    <div>
                      <span className="mb-1.5 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] text-slate-500">
                        AI Skill
                      </span>
                      <h2 className="line-clamp-1 text-base font-black leading-snug text-slate-900 transition duration-300 group-hover:text-sky-700">
                        {assistant.name}
                      </h2>
                    </div>
                  </div>
                </div>
                <p className="relative line-clamp-3 text-sm leading-6 text-slate-600">{assistant.description}</p>
              </div>

              <div className="relative mt-5">
                <div className="mb-3 flex items-center justify-between gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <CalendarDays className="h-3.5 w-3.5 text-sky-500" />
                    {assistant.date}
                  </span>
                  <span className="max-w-[132px] truncate rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-bold text-slate-600">
                    {assistant.model}
                  </span>
                </div>
                <span
                  className="relative flex h-10 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-sky-500 text-sm font-black text-white shadow-[0_10px_26px_rgba(14,165,233,0.20)] transition duration-300 hover:bg-sky-600 group-hover:shadow-[0_14px_34px_rgba(14,165,233,0.24)]"
                >
                  <span className="absolute inset-0 translate-x-[-110%] bg-gradient-to-r from-transparent via-white/25 to-transparent transition duration-700 group-hover:translate-x-[110%]" />
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
