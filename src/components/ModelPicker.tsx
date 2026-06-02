"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search, Sparkles } from "lucide-react";
import {
  DEFAULT_SELECTED_OPENROUTER_MODEL,
  MODEL_CATEGORIES,
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

function ProviderLogo({ provider }: { provider: OpenRouterProvider }) {
  const common = "h-5 w-5";

  if (provider === "OpenAI") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-label="OpenAI logo">
        <circle cx="12" cy="12" r="10" fill="#0f172a" />
        <path d="M12 5.4 16.8 8v5.5L12 16.2 7.2 13.5V8L12 5.4Zm0 2.2L9.2 9.1v3.3l2.8 1.6 2.8-1.6V9.1L12 7.6Z" fill="#fff" />
      </svg>
    );
  }

  if (provider === "Google") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-label="Google logo">
        <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z" />
        <path fill="#34A853" d="M12 22c2.7 0 5-0.9 6.6-2.5l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.7-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
        <path fill="#FBBC05" d="M6.4 13.8a6 6 0 0 1 0-3.6V7.6H3.1a10 10 0 0 0 0 8.8l3.3-2.6Z" />
        <path fill="#EA4335" d="M12 6.1c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2 10 10 0 0 0 3.1 7.6l3.3 2.6C7.2 7.8 9.4 6.1 12 6.1Z" />
      </svg>
    );
  }

  if (provider === "Meta") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-label="Meta logo">
        <path d="M3.5 14.2C4.4 9.7 6.6 6 9.3 6c1.8 0 3.1 1.4 4.1 3 1-1.6 2.2-3 4-3 2.8 0 4.8 3.8 5.1 8 .2 2.6-.8 4.8-2.8 4.8-1.8 0-3.2-1.6-5.4-5.1l-.9-1.4-.9 1.4c-2.2 3.5-3.6 5.1-5.4 5.1-2.1 0-3.1-2.1-2.6-4.6Z" fill="#1877F2" />
      </svg>
    );
  }

  if (provider === "Black Forest Labs") {
    return <span className="flex h-5 w-5 items-center justify-center rounded-md bg-black text-[9px] font-black text-white">B</span>;
  }

  const label: Record<OpenRouterProvider, string> = {
    "Moonshot AI": "M",
    OpenAI: "O",
    Meta: "∞",
    Qwen: "Q",
    "Nous Research": "N",
    "Arcee AI": "A",
    "Cognitive Computations": "C",
    Google: "G",
    "Black Forest Labs": "B",
  };

  const colors: Record<OpenRouterProvider, string> = {
    "Moonshot AI": "bg-slate-950 text-white",
    OpenAI: "bg-slate-950 text-white",
    Meta: "bg-blue-600 text-white",
    Qwen: "bg-indigo-600 text-white",
    "Nous Research": "bg-violet-600 text-white",
    "Arcee AI": "bg-cyan-600 text-white",
    "Cognitive Computations": "bg-rose-600 text-white",
    Google: "bg-white text-blue-600",
    "Black Forest Labs": "bg-black text-white",
  };

  return (
    <span className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black ${colors[provider]}`} aria-label={`${provider} logo`}>
      {label[provider]}
    </span>
  );
}

function ModelRow({
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
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
        isSelected ? "bg-sky-50 text-slate-950 ring-1 ring-sky-100" : "hover:bg-slate-50"
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <ProviderLogo provider={model.provider} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-950">{model.name}</p>
          {model.free && <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-600">Free</span>}
        </div>
        <p className="truncate text-xs text-slate-500">{model.provider}</p>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{model.type}</p>
      </div>
      {isSelected && <Check className="h-4 w-4 shrink-0 text-sky-500" />}
    </button>
  );
}

export function ModelPicker({ selectedModelId, onModelChange }: ModelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedModel = getOpenRouterModelById(selectedModelId) ?? getOpenRouterModelById(DEFAULT_SELECTED_OPENROUTER_MODEL)!;

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const filteredModels = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return OPENROUTER_MODEL_OPTIONS;

    return OPENROUTER_MODEL_OPTIONS.filter((model) => {
      return [model.name, model.provider, model.type, model.id].some((value) => value.toLowerCase().includes(term));
    });
  }, [query]);

  function selectModel(modelId: string) {
    onModelChange(modelId);
    window.localStorage.setItem(SELECTED_MODEL_STORAGE_KEY, modelId);
    setIsOpen(false);
    setQuery("");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex h-9 max-w-[220px] items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-slate-950"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <ProviderLogo provider={selectedModel.provider} />
        <span className="hidden truncate sm:inline">{selectedModel.name}</span>
        <span className="inline truncate sm:hidden">Model</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] ring-1 ring-slate-100">
          <div className="border-b border-slate-100 p-3">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-sky-500">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">Choose model</p>
                <p className="text-xs text-slate-500">OpenRouter models for this chat</p>
              </div>
            </div>
            <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search models..."
                className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="max-h-[430px] overflow-y-auto p-2">
            {MODEL_CATEGORIES.map((category) => {
              const models = filteredModels.filter((model) => model.categories.includes(category));
              if (!models.length) return null;

              return (
                <div key={category} className="mb-3 last:mb-0">
                  <p className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{category}</p>
                  <div className="space-y-1">
                    {models.map((model) => (
                      <ModelRow
                        key={`${category}-${model.id}`}
                        model={model}
                        isSelected={selectedModel.id === model.id}
                        onSelect={() => selectModel(model.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {!filteredModels.length && (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-medium text-slate-700">No models found</p>
                <p className="mt-1 text-xs text-slate-400">Try searching provider or model name.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
