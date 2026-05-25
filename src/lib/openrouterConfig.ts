const DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_OPENROUTER_MODEL = "openrouter/auto";
const DEFAULT_FREE_MODEL = "openai/gpt-oss-20b:free";
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

export function getOpenRouterConfig() {
  const configuredBaseUrl =
    process.env.OPENROUTER_BASE_URL?.trim() || process.env.OPENROUTER_API_URL?.trim();
  const configuredModel = process.env.OPENROUTER_MODEL?.trim();
  
  const mistakenBaseUrl =
    !configuredBaseUrl && configuredModel && isHttpUrl(configuredModel) ? configuredModel : undefined;

  const apiBaseUrl = normalizeBaseUrl(
    configuredBaseUrl || mistakenBaseUrl || DEFAULT_OPENROUTER_BASE_URL
  );
  
  const model =
    configuredModel && !isHttpUrl(configuredModel) ? configuredModel : DEFAULT_OPENROUTER_MODEL;

  // If useFreeModel flag is used, it will use the same model as configured in OPENROUTER_MODEL
  // or the default free model if OPENROUTER_MODEL is not set.
  const freeModel = model !== DEFAULT_OPENROUTER_MODEL ? model : DEFAULT_FREE_MODEL;

  return {
    apiBaseUrl,
    chatCompletionsUrl: `${apiBaseUrl}${CHAT_COMPLETIONS_SUFFIX}`,
    model,
    freeModel,
  };
}
