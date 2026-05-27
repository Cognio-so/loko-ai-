"use client";

import { integrations } from "@/data/integrations";
import type { Integration } from "@/data/integrations";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Plug,
  Sparkles
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    "Productivity",
    "Communication",
    "Storage",
    "CRM",
    "Social",
    "Development",
    "Analytics",
    "Finance",
    "AI",
  ];

  const filteredIntegrations = integrations.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         i.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || i.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900 transition-colors duration-500 dark:bg-[#050505] dark:text-white">
      <main className="p-6 transition-all duration-300 md:p-12 lg:p-16">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12 flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-bold uppercase tracking-widest mb-4 border border-sky-500/20"
            >
              <Plug className="w-3 h-3" />
              Connect & Automate
            </motion.div>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-6xl">
              Integrations <span className="brand-text-gradient">Catalog</span>
            </h1>
            <p className="mb-10 max-w-2xl text-base leading-relaxed text-slate-500 dark:text-gray-400">
              Discover pre-built integrations that let you connect to APIs, services, and tools to extend your app&apos;s capabilities.
            </p>

            <div className="relative w-full max-w-xl group">
              <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                <input 
                  type="text" 
                  aria-label="Search integrations"
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-white/10 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Horizontal Category Filters */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
            {categories.map(cat => (
              <button 
                type="button"
                aria-pressed={activeCategory === cat}
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`min-h-9 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f6f7f9] dark:focus-visible:ring-offset-[#050505] ${
                  activeCategory === cat 
                  ? "bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/20" 
                  : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 hover:border-sky-500/50 hover:text-sky-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="mb-8 rounded-[2rem] border border-white bg-white/80 p-6 shadow-xl shadow-slate-200/50 backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:shadow-black/20">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Connectors</h2>
            <p className="text-sm text-slate-500 dark:text-gray-400">Quick OAuth connections to popular services, supported by LokoAI.</p>
          </div>

          {/* Grid Section */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {filteredIntegrations.map((item, index) => (
                <IntegrationCard key={item.name} item={item} index={index} />
              ))}
            </AnimatePresence>
          </div>

          {filteredIntegrations.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No integrations found</h3>
              <p className="text-sm text-slate-500 dark:text-gray-400">Try adjusting your filters.</p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

function IntegrationCard({ item, index }: { item: Integration; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.02, duration: 0.3 }}
      whileHover={{ y: -5 }}
      className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-2xl hover:shadow-sky-500/10 dark:border-white/10 dark:bg-[#0d0d0d] dark:hover:border-sky-500/30"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full opacity-10 blur-3xl transition-opacity duration-300 group-hover:opacity-20"
        style={{ backgroundColor: item.color }}
      />
      <div className="mb-5 flex items-start justify-between">
        <div
          className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-lg shadow-slate-200/70 dark:border-white/10 dark:bg-white/95 dark:shadow-black/20"
          style={{ boxShadow: `0 18px 35px ${item.color}18` }}
        >
          <IntegrationLogo item={item} />
        </div>
        <span
          className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-wider"
          style={{ borderColor: `${item.color}33`, color: item.color }}
        >
          <Sparkles className="h-3 w-3" />
          Ready
        </span>
      </div>
      
      <div className="flex-1">
        <h3 className="mb-2 text-base font-bold text-slate-900 transition-colors group-hover:text-sky-500 dark:text-white">
          {item.name}
        </h3>
        <p className="mb-6 min-h-10 text-xs leading-relaxed text-slate-500 dark:text-gray-400">
          {item.description}
        </p>
      </div>
      
      <div className="mt-auto">
        <button 
          type="button"
          aria-label={`How to use ${item.name}`}
          className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-[11px] font-bold text-slate-700 transition-all hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:bg-white/5 dark:focus-visible:ring-offset-[#0d0d0d]"
        >
          How to use
        </button>
      </div>
    </motion.div>
  );
}

function IntegrationLogo({ item }: { item: Integration }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-extrabold uppercase"
        style={{ backgroundColor: `${item.color}16`, color: item.color }}
      >
        {item.name
          .split(" ")
          .slice(0, 2)
          .map((part) => part[0])
          .join("")}
      </span>
    );
  }

  return (
    <Image
      src={`https://cdn.simpleicons.org/${item.logoSlug}`}
      alt={item.name}
      width={34}
      height={34}
      className="object-contain"
      unoptimized
      onError={() => setHasError(true)}
    />
  );
}
