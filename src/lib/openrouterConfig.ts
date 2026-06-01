const DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_OPENROUTER_MODEL = "moonshotai/kimi-k2.6:free";
const DEFAULT_FREE_MODEL = "openai/gpt-oss-120b:free";
const DEFAULT_OPENROUTER_MODELS = [
  "moonshotai/kimi-k2.6:free",
  "openai/gpt-oss-120b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-coder:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "arcee-ai/trinity-large-thinking",
  "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
];
const DEFAULT_WEBSITE_MODELS = [
  "moonshotai/kimi-k2.6:free",
  "openai/gpt-oss-120b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "google/gemini-3.5-flash",
];
const DEFAULT_CODER_MODELS = [
  "qwen/qwen3-coder:free",
  "moonshotai/kimi-k2.6:free",
  "openai/gpt-oss-120b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];
const DEFAULT_IMAGE_MODELS = [
  "google/gemini-2.5-flash-image",
  "openai/gpt-5-image-mini",
  "black-forest-labs/flux.2-pro",
  "black-forest-labs/flux.2-flex",
  "google/gemini-2.5-flash-image-preview",
];
const DEFAULT_SEARCH_MODELS = [
  "openai/gpt-4o-mini-search-preview",
  "moonshotai/kimi-k2.6:free",
  "openai/gpt-oss-120b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];
const DEFAULT_FAST_MODEL = "qwen/qwen3-coder:free";
const DEFAULT_SMART_MODEL = "moonshotai/kimi-k2.6:free";
const DEFAULT_REASONING_MODEL = "arcee-ai/trinity-large-thinking";
const DEFAULT_BIG_CONTEXT_MODEL = "nousresearch/hermes-3-llama-3.1-405b:free";
const CHAT_COMPLETIONS_SUFFIX = "/chat/completions";

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");

  if (trimmed.endsWith(CHAT_COMPLETIONS_SUFFIX)) {
    return trimmed.slice(0, -CHAT_COMPLETIONS_SUFFIX.length);
  }

  return trimmed;
}

function isHttpUrl(value: string) {
  return /^https?:\/\//i.test(value.trim());
}

function parseModelList(value: string | undefined, fallback: string[]) {
  const models = value
    ?.split(/[,\n]/)
    .map((model) => model.trim())
    .filter(Boolean)
    .filter((model) => !isHttpUrl(model));

  return models?.length ? models : fallback;
}

function uniqueModels(models: string[]) {
  return Array.from(new Set(models));
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (!value) return fallback;
  return /^(1|true|yes|on|enabled)$/i.test(value.trim());
}

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseImageSize(value: string | undefined) {
  const size = value?.trim() || "1024x1024";
  const match = size.match(/^(\d{2,5})x(\d{2,5})$/);
  if (!match) return { width: 1024, height: 1024, aspectRatio: "1:1" as const };

  const width = Number(match[1]);
  const height = Number(match[2]);
  const aspectRatio =
    width === height ? "1:1" : width > height ? "16:9" : "4:3";

  return { width, height, aspectRatio: aspectRatio as "16:9" | "1:1" | "4:3" };
}

export function getOpenRouterConfig() {
  const configuredBaseUrl =
    process.env.OPENROUTER_BASE_URL?.trim() || process.env.OPENROUTER_API_URL?.trim();
  const configuredModel = process.env.OPENROUTER_MODEL?.trim();
  
  const mistakenBaseUrl =
    !configuredBaseUrl && configuredModel && isHttpUrl(configuredModel) ? configuredModel : undefined;

  const apiBaseUrl = normalizeBaseUrl(
    configuredBaseUrl || mistakenBaseUrl || DEFAULT_OPENROUTER_BASE_URL
  );
  
  const configuredModels = parseModelList(process.env.OPENROUTER_MODELS, DEFAULT_OPENROUTER_MODELS);
  const model =
    configuredModel && !isHttpUrl(configuredModel) ? configuredModel : configuredModels[0] ?? DEFAULT_OPENROUTER_MODEL;

  // If useFreeModel flag is used, it will use the same model as configured in OPENROUTER_MODEL
  // or the default free model if OPENROUTER_MODEL is not set.
  const freeModel = model !== DEFAULT_OPENROUTER_MODEL ? model : DEFAULT_FREE_MODEL;
  const fallbackModels = uniqueModels([model, ...configuredModels]);
  const websiteModels = uniqueModels(
    parseModelList(process.env.OPENROUTER_WEBSITE_MODELS, DEFAULT_WEBSITE_MODELS)
  );
  const coderModels = uniqueModels(
    parseModelList(process.env.OPENROUTER_CODER_MODELS, DEFAULT_CODER_MODELS)
  );
  const imageModels = uniqueModels(
    parseModelList(process.env.OPENROUTER_IMAGE_MODELS, DEFAULT_IMAGE_MODELS)
  );
  const searchModels = uniqueModels(
    parseModelList(process.env.OPENROUTER_SEARCH_MODELS, DEFAULT_SEARCH_MODELS)
  );
  const fastModel = process.env.FAST_MODEL?.trim() || DEFAULT_FAST_MODEL;
  const smartModel = process.env.SMART_MODEL?.trim() || DEFAULT_SMART_MODEL;
  const reasoningModel = process.env.REASONING_MODEL?.trim() || DEFAULT_REASONING_MODEL;
  const bigContextModel = process.env.BIG_CONTEXT_MODEL?.trim() || DEFAULT_BIG_CONTEXT_MODEL;
  const imageSize = parseImageSize(process.env.IMAGE_SIZE);

  return {
    apiBaseUrl,
    chatCompletionsUrl: `${apiBaseUrl}${CHAT_COMPLETIONS_SUFFIX}`,
    model,
    freeModel,
    fallbackModels,
    websiteModels,
    coderModels,
    imageModels,
    searchModels,
    fastModel,
    smartModel,
    reasoningModel,
    bigContextModel,
    enableModelFallback: parseBoolean(process.env.ENABLE_MODEL_FALLBACK, true),
    enableAutoRetry: parseBoolean(process.env.ENABLE_AUTO_RETRY, true),
    enableSmartRouting: parseBoolean(process.env.ENABLE_SMART_ROUTING, true),
    enableStreaming: parseBoolean(process.env.ENABLE_STREAMING, true),
    enableWebSearch: parseBoolean(process.env.ENABLE_WEB_SEARCH, true),
    enableDeepSearch: parseBoolean(process.env.ENABLE_DEEP_SEARCH, true),
    enableCitations: parseBoolean(process.env.ENABLE_CITATIONS, true),
    chatTemperature: parseNumber(process.env.CHAT_TEMPERATURE, 0.7),
    coderTemperature: parseNumber(process.env.CODER_TEMPERATURE, 0.2),
    searchTemperature: parseNumber(process.env.SEARCH_TEMPERATURE, 0.3),
    maxOutputTokens: parseNumber(process.env.MAX_OUTPUT_TOKENS, 8192),
    maxContextTokens: parseNumber(process.env.MAX_CONTEXT_TOKENS, 128000),
    imageQuality: process.env.IMAGE_QUALITY?.trim() || "hd",
    imageStyle: process.env.IMAGE_STYLE?.trim() || "auto",
    imageSize,
  };
}
