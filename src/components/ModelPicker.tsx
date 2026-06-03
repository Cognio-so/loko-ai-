"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import {
  DEFAULT_SELECTED_OPENROUTER_MODEL,
  OPENROUTER_MODEL_OPTIONS,
  SELECTED_MODEL_STORAGE_KEY,
  getOpenRouterModelById,
  type OpenRouterModelOption,
} from "@/lib/openrouterModels";
import { getModelLogo, getModelLogoTheme } from "@/config/modelLogos";

type ModelPickerProps = {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
};

type FilterKey = "All" | "Chat" | "Coding" | "Reasoning" | "Search" | "Image" | "Free" | "Paid";

const FILTERS: FilterKey[] = ["All", "Chat", "Coding", "Reasoning", "Search", "Image", "Free", "Paid"];

function ModelLogo({ model, size = "md" }: { model: OpenRouterModelOption; size?: "sm" | "md" }) {
  const src = getModelLogo(model.name);
  const logoTheme = getModelLogoTheme(model.name);
  const shellSize = size === "sm" ? "h-8 w-8 sm:h-9 sm:w-9" : "h-9 w-9";
  const imageSize = size === "sm" ? "h-5 w-5 sm:h-6 sm:w-6" : "h-6 w-6";
  const initials = model.name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span
      className={`flex ${shellSize} shrink-0 items-center justify-center rounded-full border border-white/70 shadow-[0_8px_24px_rgba(15,23,42,0.10)] ring-1 backdrop-blur-xl transition duration-300 group-hover:scale-105 group-hover:shadow-[0_12px_32px_rgba(14,165,233,0.18)]`}
      style={{ background: logoTheme.bg, color: logoTheme.tint, ["--tw-ring-color" as string]: `${logoTheme.tint}33` }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`${model.name} logo`} className={`${imageSize} object-contain`} style={{ filter: logoTheme.filter }} />
      ) : (
        <span className="text-[10px] font-black tracking-tight text-sky-600">{initials}</span>
      )}
    </span>
  );
}

function matchesFilter(model: OpenRouterModelOption, filter: FilterKey) {
  if (filter === "All") return true;
  if (filter === "Free") return Boolean(model.free);
  if (filter === "Paid") return !model.free;
  if (filter === "Coding") return model.categories.includes("Coding Models") || model.type === "Coding";
  if (filter === "Search") return model.categories.includes("Search Models") || model.type === "Search";
  if (filter === "Chat") return model.categories.includes("Chat Models") || model.type === "Chat";
  if (filter === "Image") return model.categories.includes("Image Models") || model.type === "Image";
  return model.type === filter;
}

function ModelGridCard({
  model,
  isSelected,
  onSelect,
}: {
  model: OpenRouterModelOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group flex min-h-14 w-full items-center gap-3 rounded-[18px] border px-4 py-3 text-left transition duration-300 ${
        isSelected
          ? "border-sky-500 bg-sky-50 shadow-[0_12px_34px_rgba(14,165,233,0.20)]"
          : "border-slate-200 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-[0_14px_32px_rgba(15,23,42,0.10)]"
      }`}
    >
      <ModelLogo model={model} />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 break-words text-[15px] font-medium leading-tight text-slate-900">{model.name}</p>
      </div>
      {isSelected && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white">
          <Check className="h-3.5 w-3.5" />
        </span>
      )}
    </button>
  );
}

export function ModelPicker({ selectedModelId, onModelChange }: ModelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("All");

  const selectedModel = getOpenRouterModelById(selectedModelId) ?? getOpenRouterModelById(DEFAULT_SELECTED_OPENROUTER_MODEL)!;

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const filteredModels = useMemo(() => {
    const term = query.trim().toLowerCase();

    return OPENROUTER_MODEL_OPTIONS.filter((model) => {
      const matchesSearch =
        !term ||
        [model.name, model.provider, model.type, model.id]
          .some((value) => value.toLowerCase().includes(term));

      return matchesSearch && matchesFilter(model, filter);
    });
  }, [filter, query]);

  function selectModel(modelId: string) {
    onModelChange(modelId);
    window.localStorage.setItem(SELECTED_MODEL_STORAGE_KEY, modelId);
    setIsOpen(false);
    setQuery("");
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group inline-flex h-10 max-w-[210px] items-center gap-2 rounded-full border border-slate-200 bg-white py-0.5 pl-1.5 pr-2.5 text-[13px] font-medium text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.08)] transition hover:border-sky-200 hover:bg-sky-50 hover:text-slate-950"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <ModelLogo model={selectedModel} size="sm" />
        <span className="hidden truncate sm:inline">{selectedModel.name}</span>
        <span className="inline truncate sm:hidden">Model</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/35 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="flex max-h-[calc(100dvh-2rem)] w-full max-w-[1080px] animate-in fade-in-0 zoom-in-95 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.28)] duration-200 sm:max-h-[calc(100dvh-3rem)]"
            role="dialog"
            aria-modal="true"
            aria-label="Select model"
          >
            <div className="sticky top-0 z-10 shrink-0 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-6">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-[28px]">Select Model</h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close model picker"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex h-11 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 shadow-[inset_0_1px_2px_rgba(15,23,42,0.02)]">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search models..."
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  autoFocus
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {FILTERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                      filter === item
                        ? "bg-[#2f63bf] text-white shadow-sm"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="scrollbar-soft min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
              {filteredModels.length ? (
                <div className="grid grid-cols-1 gap-3 pb-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredModels.map((model) => (
                    <ModelGridCard
                      key={model.id}
                      model={model}
                      isSelected={selectedModel.id === model.id}
                      onSelect={() => selectModel(model.id)}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex h-full min-h-52 items-center justify-center rounded-[22px] border border-dashed border-slate-200 text-sm text-slate-500">
                  No models found for this search.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
