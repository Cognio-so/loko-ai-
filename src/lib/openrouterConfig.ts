const DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-oss-120b:free";
const DEFAULT_FREE_MODEL = "openai/gpt-oss-120b:free";
const DEFAULT_OPENROUTER_MODELS = [
  "openai/gpt-oss-120b:free",
  "moonshotai/kimi-k2.6:free",
  "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-coder:free",
];
const DEFAULT_WEBSITE_MODELS = [
  "google/gemini-3.5-flash",
  "moonshotai/kimi-k2.6:free",
  "qwen/qwen3-coder:free",
  "openai/gpt-oss-120b:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
];
const DEFAULT_IMAGE_MODELS = [
  "google/gemini-2.5-flash-image",
  "google/gemini-2.5-flash-image-preview",
  "openai/gpt-5-image-mini",
  "black-forest-labs/flux.2-pro",
  "black-forest-labs/flux.2-flex",
  "google/gemini-3.5-flash",
];
const DEFAULT_SEARCH_MODELS = [
  "openai/gpt-4o-mini-search-preview",
  "openai/gpt-oss-120b:free",
  "moonshotai/kimi-k2.6:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];
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
  const imageModels = uniqueModels(
    parseModelList(process.env.OPENROUTER_IMAGE_MODELS, DEFAULT_IMAGE_MODELS)
  );
  const searchModels = uniqueModels(
    parseModelList(process.env.OPENROUTER_SEARCH_MODELS, DEFAULT_SEARCH_MODELS)
  );

  return {
    apiBaseUrl,
    chatCompletionsUrl: `${apiBaseUrl}${CHAT_COMPLETIONS_SUFFIX}`,
    model,
    freeModel,
    fallbackModels,
    websiteModels,
    imageModels,
    searchModels,
  };
}
