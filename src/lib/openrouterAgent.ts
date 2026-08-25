import { OpenRouter } from "@openrouter/sdk";
import { callModel, tool } from "@openrouter/agent";
import { z } from "zod";
import { getOpenRouterConfig } from "@/lib/openrouterConfig";

function stripJsonFences(text: string) {
  return text
    .replace(/```json\s*/i, "```")
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();
}

const validateJsonTool = tool({
  name: "validate_json",
  description: "Validate that a string is strict JSON and return an error if not.",
  inputSchema: z.object({ text: z.string() }),
  outputSchema: z.object({ ok: z.boolean(), error: z.string().optional() }),
  execute: async ({ text }) => {
    try {
      JSON.parse(text);
      return { ok: true };
    } catch (error: unknown) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});

export async function getOpenRouterAgentResponse(
  systemPrompt: string,
  userPrompt: string,
  isJson: boolean = false,
  useFreeModel: boolean = false
) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const { apiBaseUrl, model, generateModel } = getOpenRouterConfig();
  const selectedModel = isJson ? generateModel : model;

  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY in environment variables.");
  }

  const client = new OpenRouter({ apiKey, serverURL: apiBaseUrl });

  const input = [
    "SYSTEM:",
    systemPrompt,
    "",
    "USER:",
    userPrompt,
    "",
    isJson
      ? "Return ONLY strict JSON (no markdown). If unsure, call validate_json on your draft and then fix it."
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const result = callModel(client, {
    model: selectedModel,
    input,
    tools: isJson ? ([validateJsonTool] as const) : ([] as const),
  });

  let text = await result.getText();

  if (isJson) {
    text = stripJsonFences(text);
  }

  return text;
}
