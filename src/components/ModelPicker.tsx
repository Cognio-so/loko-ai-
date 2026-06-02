"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import {
  DEFAULT_SELECTED_OPENROUTER_MODEL,
  OPENROUTER_MODEL_OPTIONS,
  SELECTED_MODEL_STORAGE_KEY,
  getOpenRouterModelById,
  type OpenRouterModelOption,
  type OpenRouterProvider,
} from "@/lib/openrouterModels";

type ModelPickerProps = {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
};

type FilterKey = "All" | "Chat" | "Coding" | "Reasoning" | "Search" | "Image" | "Free" | "Paid";

const FILTERS: FilterKey[] = ["All", "Chat", "Coding", "Reasoning", "Search", "Image", "Free", "Paid"];

const PROVIDER_LOGO_MAP: Record<OpenRouterProvider, string> = {
  "Moonshot AI": "/provider-logos/moonshot.svg",
  OpenAI: "/provider-logos/openai.svg",
  Meta: "/provider-logos/meta.svg",
  Qwen: "/provider-logos/qwen.svg",
  "Nous Research": "/provider-logos/nous.svg",
  "Arcee AI": "/provider-logos/arcee.svg",
  "Cognitive Computations": "/provider-logos/cognitive.svg",
  Google: "/provider-logos/google-gemini.svg",
  "Black Forest Labs": "/provider-logos/bfl.svg",
};

function ProviderLogo({ provider }: { provider: OpenRouterProvider }) {
  const src = PROVIDER_LOGO_MAP[provider];

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={`${provider} logo`} className="h-5 w-5 object-contain" />
    </span>
  );
}

function matchesFilter(model: OpenRouterModelOption, filter: FilterKey) {
  if (filter === "All") return true;
  if (filter === "Free") return Boolean(model.free);
  if (filter === "Paid") return !model.free;
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
      className={`flex h-14 w-full items-center gap-3 rounded-[18px] border px-4 text-left transition ${
        isSelected
          ? "border-sky-500 bg-sky-50 shadow-[0_10px_28px_rgba(14,165,233,0.16)]"
          : "border-slate-200 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.05)] hover:border-slate-300 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
      }`}
    >
      <ProviderLogo provider={model.provider} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium text-slate-900">{model.name}</p>
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
        className="inline-flex h-9 max-w-[210px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-slate-950"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <ProviderLogo provider={selectedModel.provider} />
        <span className="hidden truncate sm:inline">{selectedModel.name}</span>
        <span className="inline truncate sm:hidden">Model</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="flex max-h-[84vh] w-[95vw] max-w-[980px] animate-in fade-in-0 zoom-in-95 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.28)] duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Select model"
          >
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-[30px] font-semibold tracking-tight text-slate-950">Select Model</h2>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close model picker"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex h-12 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 shadow-[inset_0_1px_2px_rgba(15,23,42,0.02)]">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search models..."
                  className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  autoFocus
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {FILTERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFilter(item)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
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

            <div className="scrollbar-soft min-h-0 flex-1 overflow-y-auto px-6 py-5">
              {filteredModels.length ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
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
