import { normalizeOpenRouterModelId } from "@/lib/openrouterModelAliases";

export const MODEL_CATEGORIES = ["Chat Models", "Coding Models", "Search Models", "Image Models"] as const;

export type ModelCategory = (typeof MODEL_CATEGORIES)[number];

export type OpenRouterProvider =
  | "Anthropic"
  | "Moonshot AI"
  | "OpenAI"
  | "Meta"
  | "Qwen"
  | "Nous Research"
  | "Arcee AI"
  | "Cognitive Computations"
  | "Google"
  | "Z AI"
  | "DeepSeek"
  | "MiniMax"
  | "Mistral AI"
  | "Black Forest Labs";

export type OpenRouterModelOption = {
  id: string;
  name: string;
  provider: OpenRouterProvider;
  type: "Chat" | "Coding" | "Search" | "Image" | "Reasoning";
  categories: ModelCategory[];
  free?: boolean;
};

export const OPENROUTER_MODEL_OPTIONS: OpenRouterModelOption[] = [
  {
    id: "moonshotai/kimi-k2.6:free",
    name: "Kimi K2.6",
    provider: "Moonshot AI",
    type: "Chat",
    categories: ["Chat Models", "Search Models", "Coding Models"],
    free: true,
  },
  {
    id: "anthropic/claude-opus-4.8-fast",
    name: "Claude Opus 4.8 Fast",
    provider: "Anthropic",
    type: "Reasoning",
    categories: ["Chat Models", "Coding Models", "Search Models"],
  },
  {
    id: "anthropic/claude-opus-4.8",
    name: "Claude Opus 4.8",
    provider: "Anthropic",
    type: "Reasoning",
    categories: ["Chat Models", "Coding Models", "Search Models"],
  },
  {
    id: "minimax/minimax-m3",
    name: "MiniMax M3",
    provider: "MiniMax",
    type: "Chat",
    categories: ["Chat Models", "Coding Models"],
  },
  {
    id: "anthropic/claude-opus-4.7-fast",
    name: "Claude Opus 4.7 Fast",
    provider: "Anthropic",
    type: "Reasoning",
    categories: ["Chat Models", "Coding Models", "Search Models"],
  },
  {
    id: "mistralai/mistral-medium-3-5",
    name: "Mistral Medium 3.5",
    provider: "Mistral AI",
    type: "Chat",
    categories: ["Chat Models", "Coding Models", "Search Models"],
  },
  {
    id: "openai/gpt-oss-120b:free",
    name: "GPT OSS 120B",
    provider: "OpenAI",
    type: "Chat",
    categories: ["Chat Models", "Coding Models"],
    free: true,
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    type: "Chat",
    categories: ["Chat Models", "Search Models", "Coding Models"],
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B",
    provider: "Meta",
    type: "Chat",
    categories: ["Chat Models"],
    free: true,
  },
  {
    id: "qwen/qwen3-coder:free",
    name: "Qwen 3 Coder",
    provider: "Qwen",
    type: "Coding",
    categories: ["Coding Models"],
    free: true,
  },
  {
    id: "z-ai/glm-4.5-air:free",
    name: "GLM 4.5 Air",
    provider: "Z AI",
    type: "Reasoning",
    categories: ["Chat Models", "Coding Models", "Search Models"],
    free: true,
  },
  {
    id: "nousresearch/hermes-3-llama-3.1-405b:free",
    name: "Hermes 3 405B",
    provider: "Nous Research",
    type: "Chat",
    categories: ["Chat Models"],
    free: true,
  },
  {
    id: "arcee-ai/trinity-large-thinking",
    name: "Trinity Large Thinking",
    provider: "Arcee AI",
    type: "Reasoning",
    categories: ["Chat Models", "Search Models"],
  },
  {
    id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    name: "Dolphin Mistral 24B Venice",
    provider: "Cognitive Computations",
    type: "Chat",
    categories: ["Chat Models"],
    free: true,
  },
  {
    id: "google/gemma-4-26b-a4b-it:free",
    name: "Gemma 4 26B",
    provider: "Google",
    type: "Chat",
    categories: ["Chat Models", "Search Models"],
    free: true,
  },
  {
    id: "deepseek/deepseek-v4-pro",
    name: "DeepSeek V4 Pro",
    provider: "DeepSeek",
    type: "Reasoning",
    categories: ["Chat Models", "Coding Models", "Search Models"],
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Loko AI 2.5 Flash",
    provider: "Google",
    type: "Chat",
    categories: ["Chat Models", "Search Models"],
  },
  {
    id: "google/gemini-2.5-flash-image",
    name: "Loko AI 2.5 Flash Image",
    provider: "Google",
    type: "Image",
    categories: ["Image Models"],
  },
  {
    id: "openai/gpt-5-image-mini",
    name: "GPT-5 Image Mini",
    provider: "OpenAI",
    type: "Image",
    categories: ["Image Models"],
  },
  {
    id: "black-forest-labs/flux.2-pro",
    name: "FLUX.2 Pro",
    provider: "Black Forest Labs",
    type: "Image",
    categories: ["Image Models"],
  },
  {
    id: "black-forest-labs/flux.2-flex",
    name: "FLUX.2 Flex",
    provider: "Black Forest Labs",
    type: "Image",
    categories: ["Image Models"],
  },
  {
    id: "black-forest-labs/flux.2-klein-4b",
    name: "FLUX.2 Klein 4B",
    provider: "Black Forest Labs",
    type: "Image",
    categories: ["Image Models"],
  },
];

export const DEFAULT_SELECTED_OPENROUTER_MODEL = "moonshotai/kimi-k2.6:free";
export const SELECTED_MODEL_STORAGE_KEY = "lokoai:selected-openrouter-model";

export function getOpenRouterModelById(id: string | null | undefined) {
  if (!id) return null;
  const normalizedId = normalizeOpenRouterModelId(id);
  return OPENROUTER_MODEL_OPTIONS.find((model) => model.id === normalizedId) ?? null;
}

export function isSupportedOpenRouterModel(id: string | null | undefined) {
  return Boolean(getOpenRouterModelById(id));
}
