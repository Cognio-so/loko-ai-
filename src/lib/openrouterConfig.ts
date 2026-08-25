import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

const DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_CHAT_MODEL = "minimax/minimax-m2.7:free";
const DEFAULT_GENERATE_MODEL = "z-ai/glm-5.2:free";
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

export function getOpenRouterApiKey(): string {
  try {
    const envPath = resolve(process.cwd(), ".env");
    if (existsSync(envPath)) {
      const content = readFileSync(envPath, "utf8");
      const match = content.match(/^(?:export\s+)?OPENROUTER_API_KEY\s*=\s*(.+)$/m);
      if (match && match[1]) {
        return match[1].trim().replace(/^["']|["']$/g, "");
      }
    }
  } catch {}
  return process.env.OPENROUTER_API_KEY?.trim() || "";
}

export function getOpenRouterConfig() {
  const configuredBaseUrl =
    process.env.OPENROUTER_BASE_URL?.trim() || process.env.OPENROUTER_API_URL?.trim();
  const configuredModel = process.env.OPENROUTER_MODEL?.trim();
  const configuredGenerateModel = process.env.OPENROUTER_GENERATE_MODEL?.trim();
  
  const mistakenBaseUrl =
    !configuredBaseUrl && configuredModel && isHttpUrl(configuredModel) ? configuredModel : undefined;

  const apiBaseUrl = normalizeBaseUrl(
    configuredBaseUrl || mistakenBaseUrl || DEFAULT_OPENROUTER_BASE_URL
  );
  
  const model =
    configuredModel && !isHttpUrl(configuredModel) ? configuredModel : DEFAULT_CHAT_MODEL;

  const generateModel =
    configuredGenerateModel && !isHttpUrl(configuredGenerateModel) ? configuredGenerateModel : DEFAULT_GENERATE_MODEL;

  return {
    apiKey: getOpenRouterApiKey(),
    apiBaseUrl,
    chatCompletionsUrl: `${apiBaseUrl}${CHAT_COMPLETIONS_SUFFIX}`,
    model,
    generateModel,
    freeModel: model,
  };
}
