"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ExternalLink,
  Link2,
  MapPin,
  Search,
} from "lucide-react";
import { partners } from "@/data/partners";
import type { Partner } from "@/data/partners";

export default function PartnersPage() {
  const [query, setQuery] = useState("");

  const filteredPartners = partners.filter((partner) => {
    const haystack = [
      partner.name,
      partner.location,
      partner.description,
      partner.languages.join(" "),
      partner.tags.join(" "),
      partner.website ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#fcfcfd] dark:bg-[#050505] px-4 py-16 text-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="pointer-events-none absolute left-10 top-24 h-72 w-72 rounded-full bg-sky-100/70 dark:bg-sky-500/10 blur-3xl" />
        <div className="pointer-events-none absolute right-20 top-44 h-80 w-80 rounded-full bg-cyan-100/70 dark:bg-cyan-500/10 blur-3xl" />

        <div className="mb-12">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-sky-500">Partner Network</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white md:text-6xl">
            Hire a LokoAI partner
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 dark:text-gray-400">
            Find builders, consultants, AI experts, and integration specialists who can turn your idea into a polished
            product faster.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button className="w-fit rounded-xl bg-slate-950 dark:bg-sky-500 px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(15,23,42,0.18)] dark:shadow-none transition hover:bg-slate-900 dark:hover:bg-sky-600">
              Apply to become a partner
            </button>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search partners, tags, languages..."
                className="w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0d0d0d] py-3 pl-11 pr-4 text-sm text-slate-900 dark:text-white shadow-[0_14px_35px_rgba(148,163,184,0.12)] dark:shadow-none outline-none transition focus:border-sky-300 focus:ring-4 focus:ring-sky-100 dark:focus:ring-sky-500/10"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPartners.map((partner, index) => (
            <motion.article
              key={`${partner.name}-${partner.location}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              whileHover={{ y: -4 }}
              className="overflow-hidden rounded-[1.35rem] border border-sky-100 dark:border-white/10 bg-white dark:bg-[#0d0d0d] shadow-[0_16px_40px_rgba(56,189,248,0.08)] dark:shadow-none transition-all duration-300 hover:border-sky-200 dark:hover:border-sky-500/30 hover:shadow-[0_20px_50px_rgba(56,189,248,0.14)]"
            >
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <PartnerAvatar partner={partner} />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold text-slate-950 dark:text-white">{partner.name}</h2>
                    <div className="mt-1 flex items-center gap-1 text-sm text-slate-500 dark:text-gray-400">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">{partner.location}</span>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                      {partner.website && (
                        <Link
                          href={partner.website}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 transition hover:text-sky-700 dark:hover:text-sky-300"
                        >
                          {formatWebsiteLabel(partner.website)}
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      {partner.linkedin && (
                        <Link
                          href={partner.linkedin}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 transition hover:text-sky-700 dark:hover:text-sky-300"
                        >
                          LinkedIn
                          <Link2 className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {partner.tags.slice(0, 4).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-700 dark:text-gray-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {partner.tags.length > 4 && (
                    <span className="rounded-full border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-700 dark:text-gray-300">
                      +{partner.tags.length - 4}
                    </span>
                  )}
                </div>

                <p className="mt-4 line-clamp-3 min-h-[4.75rem] text-sm leading-7 text-slate-600 dark:text-gray-400">
                  {partner.description}
                </p>

                <p className="mt-4 text-sm text-slate-700 dark:text-gray-300">
                  <span className="font-medium">Languages:</span> {partner.languages.join(", ") || "English"}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] px-5 py-4">
                <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-gray-400">
                  {partner.startingFrom && (
                    <span className="inline-flex items-center gap-2">
                      <span className="text-slate-400">$</span>
                      From {partner.startingFrom}
                    </span>
                  )}
                  {partner.hourlyRate && (
                    <span className="inline-flex items-center gap-2">
                      <span className="text-slate-400">◔</span>
                      {partner.hourlyRate}
                    </span>
                  )}
                </div>

                <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-sm font-semibold text-slate-900 dark:text-white transition hover:border-sky-300 dark:hover:border-sky-500/30 hover:bg-sky-50 dark:hover:bg-white/10 hover:text-sky-600">
                  Contact
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
}

function PartnerAvatar({ partner }: { partner: Partner }) {
  const imageUrl = getPartnerImage(partner.name);

  if (imageUrl) {
    return (
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 shadow-[0_12px_30px_rgba(56,189,248,0.12)]">
        <Image src={imageUrl} alt={partner.name} fill sizes="64px" className="object-cover" />
      </div>
    );
  }

  const initials = partner.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const palette = getAvatarPalette(partner.name);

  return (
    <div
      className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 shadow-[0_12px_30px_rgba(56,189,248,0.12)]"
      style={{ background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})` }}
    >
      <div className="absolute -right-2 top-0 h-8 w-8 rounded-full bg-white/35 blur-xl" />
      <div className="absolute bottom-0 left-0 h-8 w-8 rounded-full bg-white/20 blur-lg" />
      <div className="relative flex h-full w-full items-center justify-center text-xl font-bold text-white">
        {initials}
      </div>
    </div>
  );
}

function getPartnerImage(name: string) {
  const lowerName = name.toLowerCase();
  const seed = name.split("").reduce((total, char) => total + char.charCodeAt(0), 0);

  // Female Pool
  const femaleImages = [
    "/partners/female-1.png",
    "/partners/female-2.png",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
  ];

  // Male Pool
  const maleImages = [
    "/partners/male-1.png",
    "/partners/male-2.png",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150",
  ];

  // Mixed/Generic Pool
  const genericImages = [
    "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&q=80&w=150&h=150",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150&h=150",
  ];

  // Girls
  const girlNames = ["megan", "mayan", "ariam", "sofia", "anna", "maria", "lucy", "emma"];
  if (girlNames.some((n) => lowerName.includes(n))) {
    return femaleImages[seed % femaleImages.length];
  }

  // Boys
  const boyNames = [
    "mohammad",
    "elian",
    "stanley",
    "vasilis",
    "ran",
    "daniel",
    "sushanth",
    "lucas",
    "paul",
    "steven",
    "john",
    "david",
    "alex",
    "chris",
    "mark",
    "stan",
    "ariam", // sometimes masculine
  ];
  if (boyNames.some((n) => lowerName.includes(n))) {
    return maleImages[seed % maleImages.length];
  }

  // Fallback to generic pool for agencies or unrecognized names
  return genericImages[seed % genericImages.length];
}

function getAvatarPalette(value: string) {
  const palettes = [
    ["#38bdf8", "#0ea5e9"],
    ["#60a5fa", "#2563eb"],
    ["#22c55e", "#14b8a6"],
    ["#f59e0b", "#fb7185"],
    ["#8b5cf6", "#6366f1"],
    ["#0f172a", "#334155"],
  ];

  const seed = value.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return palettes[seed % palettes.length];
}

function formatWebsiteLabel(url: string) {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}
