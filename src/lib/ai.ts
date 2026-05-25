import { getGeminiResponse } from "@/lib/gemini";
import { getOpenRouterResponse } from "@/lib/openrouter";
import { getOpenRouterAgentResponse } from "@/lib/openrouterAgent";

type AIProvider = "gemini" | "openrouter" | "openrouter_agent" | "google";
const AI_PROVIDER_TIMEOUT_MS = 90000;

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(
      () => reject(new Error(`${label} timed out after ${AI_PROVIDER_TIMEOUT_MS / 1000}s`)),
      AI_PROVIDER_TIMEOUT_MS
    );

    promise
      .then(resolve, reject)
      .finally(() => clearTimeout(timeoutId));
  });
}

function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER?.toLowerCase();

  if (provider === "gemini" || provider === "openrouter" || provider === "openrouter_agent" || provider === "google") {
    return provider;
  }

  // Prefer direct OpenRouter chat completions for website generation. The agent SDK
  // can be selected explicitly with AI_PROVIDER=openrouter_agent.
  if (process.env.OPENROUTER_API_KEY) {
    return "openrouter";
  }

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY) {
    return "gemini";
  }

  return "openrouter";
}

export async function getAIResponse(
  systemPrompt: string,
  userPrompt: string,
  isJson: boolean = false,
  useFreeModel: boolean = false
) {
  const provider = getAIProvider();

  if (provider === "openrouter_agent") {
    try {
      return await withTimeout(
        getOpenRouterAgentResponse(systemPrompt, userPrompt, isJson, useFreeModel),
        "OpenRouter agent"
      );
    } catch {
      return withTimeout(
        getOpenRouterResponse(systemPrompt, userPrompt, isJson, useFreeModel),
        "OpenRouter fallback"
      );
    }
  }

  if (provider === "openrouter") {
    return withTimeout(
      getOpenRouterResponse(systemPrompt, userPrompt, isJson, useFreeModel),
      "OpenRouter"
    );
  }

  try {
    return await withTimeout(
      getGeminiResponse(systemPrompt, userPrompt, isJson),
      "Gemini"
    );
  } catch (error) {
    if (isJson) {
      return withTimeout(
        getOpenRouterResponse(systemPrompt, userPrompt, isJson, useFreeModel),
        "OpenRouter fallback"
      );
    }

    throw error;
  }
}
