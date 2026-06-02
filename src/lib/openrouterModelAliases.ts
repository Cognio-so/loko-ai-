const MODEL_ID_ALIASES: Record<string, string> = {
  "black-forest-labs/flux-pro": "black-forest-labs/flux.2-pro",
  "black-forest-labs/flux-1-dev": "black-forest-labs/flux.2-flex",
  "black-forest-labs/flux-schnell": "google/gemini-2.5-flash-image",
  "google/gemini-2.5-flash-image-preview": "google/gemini-2.5-flash-image",
  "google/gemini-3.5-flash": "google/gemini-2.5-flash",
  "openai/dall-e-3": "openai/gpt-5-image-mini",
};

export function normalizeOpenRouterModelId(model: string) {
  const trimmed = model.trim();
  return MODEL_ID_ALIASES[trimmed] ?? trimmed;
}
