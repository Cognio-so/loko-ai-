"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, ChevronRight, Search, Sparkles, Star, X } from "lucide-react";
import {
  DEFAULT_SELECTED_OPENROUTER_MODEL,
  OPENROUTER_MODEL_OPTIONS,
  SELECTED_MODEL_STORAGE_KEY,
  getOpenRouterModelById,
  type ModelCategory,
  type OpenRouterModelOption,
  type OpenRouterProvider,
} from "@/lib/openrouterModels";

type ModelPickerProps = {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
};

const FAVORITES_STORAGE_KEY = "lokoai:favorite-openrouter-models";
const RECENT_STORAGE_KEY = "lokoai:recent-openrouter-models";
const INITIAL_VISIBLE_MODELS = 6;

const DISPLAY_CATEGORIES: Array<{ key: ModelCategory; label: string }> = [
  { key: "Chat Models", label: "💬 Chat Models" },
  { key: "Coding Models", label: "💻 Coding Models" },
  { key: "Search Models", label: "🔍 Search Models" },
  { key: "Image Models", label: "🎨 Image Models" },
];

function readStoredIds(key: string) {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function ProviderLogo({ provider }: { provider: OpenRouterProvider }) {
  const common = "h-6 w-6";

  if (provider === "OpenAI") {
    return (
      <svg viewBox="0 0 24 24" className={common} aria-label="OpenAI logo">
        <circle cx="12" cy="12" r="11" fill="#111827" />
        <path d="M12 5.1 17 8v5.8l-5 2.9-5-2.9V8l5-2.9Zm0 2.4L9.1 9.2v3.4l2.9 1.7 2.9-1.7V9.2L12 7.5Z" fill="#fff" />
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
        <path d="M3.1 14.1C4 9.4 6.3 5.8 9.2 5.8c1.9 0 3.3 1.5 4.2 3.1 1-1.6 2.3-3.1 4.2-3.1 2.9 0 4.9 3.8 5.2 8.1.2 2.8-.9 5-3 5-1.9 0-3.3-1.6-5.6-5.3l-.8-1.3-.8 1.3C10.3 17.3 8.9 19 7 19c-2.2 0-3.6-2.1-2.9-4.9Zm2.2.4c-.4 1.9.2 3 1.5 3 1 0 2-.9 4-4.1l1.4-2.2c-.8-1.4-1.7-2.9-3-2.9-1.7 0-3.2 2.6-3.9 6.2Zm9.5-3.3 1.4 2.2c2 3.2 3 4.1 4 4.1 1.2 0 1.7-1.2 1.5-3.2-.3-3.3-1.6-6-3.4-6-1.3 0-2.2 1.5-3.5 3.9Z" fill="#1877F2" />
      </svg>
    );
  }

  if (provider === "Black Forest Labs") {
    return <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-black text-[10px] font-black text-white">B</span>;
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
    <span className={`flex h-6 w-6 items-center justify-center rounded-lg text-[11px] font-black shadow-sm ${colors[provider]}`} aria-label={`${provider} logo`}>
      {label[provider]}
    </span>
  );
}

function ModelCard({
  model,
  isFavorite,
  isSelected,
  onFavoriteToggle,
  onSelect,
}: {
  model: OpenRouterModelOption;
  isFavorite: boolean;
  isSelected: boolean;
  onFavoriteToggle: () => void;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition duration-200 ${
        isSelected
          ? "border-sky-300 bg-sky-50/90 shadow-[0_12px_34px_rgba(14,165,233,0.24)] ring-1 ring-sky-200"
          : "border-slate-200/80 bg-white/78 shadow-sm hover:border-sky-200 hover:bg-white hover:shadow-md"
      }`}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white shadow-sm">
        <ProviderLogo provider={model.provider} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-bold text-slate-950">{model.name}</p>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wide ${model.free ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
            {model.free ? "Free" : "Paid"}
          </span>
        </div>
        <p className="truncate text-xs font-medium text-slate-500">{model.provider}</p>
        <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{model.type} Model</p>
      </div>
      <span
        onClick={(event) => {
          event.stopPropagation();
          onFavoriteToggle();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            onFavoriteToggle();
          }
        }}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition ${
          isFavorite ? "bg-amber-50 text-amber-500" : "text-slate-300 hover:bg-slate-100 hover:text-amber-500"
        }`}
        aria-label={isFavorite ? `Unpin ${model.name}` : `Pin ${model.name}`}
      >
        <Star className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
      </span>
      {isSelected && (
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white shadow-[0_0_22px_rgba(14,165,233,0.5)]">
          <Check className="h-4 w-4" />
        </span>
      )}
    </button>
  );
}

function uniqueModels(ids: string[]) {
  const models = ids
    .map((id) => getOpenRouterModelById(id))
    .filter((model): model is OpenRouterModelOption => Boolean(model));
  return Array.from(new Map(models.map((model) => [model.id, model])).values());
}

export function ModelPicker({ selectedModelId, onModelChange }: ModelPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<ModelCategory, boolean>>({
    "Chat Models": true,
    "Coding Models": false,
    "Search Models": false,
    "Image Models": false,
  });

  const selectedModel = getOpenRouterModelById(selectedModelId) ?? getOpenRouterModelById(DEFAULT_SELECTED_OPENROUTER_MODEL)!;

  useEffect(() => {
    setFavoriteIds(readStoredIds(FAVORITES_STORAGE_KEY));
    setRecentIds(readStoredIds(RECENT_STORAGE_KEY));
  }, []);

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
    if (!term) return OPENROUTER_MODEL_OPTIONS;

    return OPENROUTER_MODEL_OPTIONS.filter((model) => {
      return [model.name, model.provider, model.type, model.id].some((value) => value.toLowerCase().includes(term));
    });
  }, [query]);

  const favoriteModels = useMemo(() => uniqueModels(favoriteIds).filter((model) => filteredModels.some((item) => item.id === model.id)), [favoriteIds, filteredModels]);
  const recentModels = useMemo(
    () => uniqueModels(recentIds).filter((model) => filteredModels.some((item) => item.id === model.id) && !favoriteIds.includes(model.id)).slice(0, 4),
    [favoriteIds, filteredModels, recentIds]
  );

  function persistRecent(modelId: string) {
    const nextIds = [modelId, ...recentIds.filter((id) => id !== modelId)].slice(0, 6);
    setRecentIds(nextIds);
    window.localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(nextIds));
  }

  function selectModel(modelId: string) {
    onModelChange(modelId);
    window.localStorage.setItem(SELECTED_MODEL_STORAGE_KEY, modelId);
    persistRecent(modelId);
    setIsOpen(false);
    setQuery("");
  }

  function toggleFavorite(modelId: string) {
    const nextIds = favoriteIds.includes(modelId)
      ? favoriteIds.filter((id) => id !== modelId)
      : [modelId, ...favoriteIds].slice(0, 8);

    setFavoriteIds(nextIds);
    window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(nextIds));
  }

  function renderModelList(models: OpenRouterModelOption[]) {
    return (
      <div className="space-y-2">
        {models.map((model) => (
          <ModelCard
            key={model.id}
            model={model}
            isFavorite={favoriteIds.includes(model.id)}
            isSelected={selectedModel.id === model.id}
            onFavoriteToggle={() => toggleFavorite(model.id)}
            onSelect={() => selectModel(model.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex h-9 max-w-[210px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-slate-950"
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/10 px-3 py-5 backdrop-blur-sm sm:items-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="flex max-h-[75vh] w-[95vw] max-w-[420px] animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-3 flex-col overflow-hidden rounded-[20px] border border-white/60 bg-white/82 shadow-[0_30px_90px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/70 backdrop-blur-2xl duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Choose AI model"
          >
            <div className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/86 p-4 backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-base font-black text-slate-950">Choose model</p>
                    <p className="truncate text-xs font-medium text-slate-500">OpenRouter model for this chat</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label="Close model picker"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white/76 px-3 shadow-inner">
                <Search className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search models..."
                  className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                  autoFocus
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 pt-3">
              {!query.trim() && favoriteModels.length > 0 && (
                <section className="mb-3">
                  <div className="sticky top-0 z-10 mb-2 rounded-xl bg-white/88 px-2 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 backdrop-blur">
                    ⭐ Favorites
                  </div>
                  {renderModelList(favoriteModels)}
                </section>
              )}

              {!query.trim() && recentModels.length > 0 && (
                <section className="mb-3">
                  <div className="sticky top-0 z-10 mb-2 rounded-xl bg-white/88 px-2 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 backdrop-blur">
                    Recently Used
                  </div>
                  {renderModelList(recentModels)}
                </section>
              )}

              {DISPLAY_CATEGORIES.map((category) => {
                const models = filteredModels.filter((model) => model.categories.includes(category.key));
                if (!models.length) return null;

                const expanded = query.trim() ? true : expandedCategories[category.key];
                const visibleModels = expanded ? models : models.slice(0, INITIAL_VISIBLE_MODELS);
                const hiddenCount = models.length - visibleModels.length;

                return (
                  <section key={category.key} className="mb-3 last:mb-0">
                    <button
                      type="button"
                      onClick={() => setExpandedCategories((current) => ({ ...current, [category.key]: !current[category.key] }))}
                      className="sticky top-0 z-10 mb-2 flex w-full items-center justify-between rounded-xl bg-white/88 px-2 py-2 text-left text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 backdrop-blur transition hover:bg-white"
                    >
                      <span>{category.label}</span>
                      {!query.trim() && (
                        <span className="flex items-center gap-1 text-slate-400">
                          {models.length}
                          <ChevronRight className={`h-3.5 w-3.5 transition ${expanded ? "rotate-90" : ""}`} />
                        </span>
                      )}
                    </button>
                    {renderModelList(visibleModels)}
                    {hiddenCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpandedCategories((current) => ({ ...current, [category.key]: true }))}
                        className="mt-2 w-full rounded-2xl border border-dashed border-slate-200 bg-white/65 px-3 py-2 text-xs font-bold text-sky-600 transition hover:border-sky-200 hover:bg-sky-50"
                      >
                        Show {hiddenCount} more
                      </button>
                    )}
                  </section>
                );
              })}

              {!filteredModels.length && (
                <div className="px-4 py-10 text-center">
                  <p className="text-sm font-bold text-slate-700">No models found</p>
                  <p className="mt-1 text-xs text-slate-400">Try model name, provider, or category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
