export type PromptMode = "chat" | "builder";

const BUILDER_PATTERN =
  /\b(create|build|make|generate|develop|design|clone|deploy|website|web\s*site|web\s*app|app|dashboard|landing\s*page|frontend|component|ui|ux|saas|ecommerce|portfolio|admin\s*panel|crm|cms|page)\b/i;

const CHAT_PATTERN =
  /\b(what|why|how|explain|describe|compare|tell me|question|tutorial|learn|meaning|definition|debug help)\b/i;

export type PromptRoute = {
  mode: PromptMode;
  confidence: number;
  reason: string;
};

export function detectPromptMode(prompt: string): PromptRoute {
  const normalized = prompt.trim();

  if (!normalized) {
    return {
      mode: "chat",
      confidence: 0,
      reason: "Empty prompt defaults to chat mode.",
    };
  }

  if (BUILDER_PATTERN.test(normalized)) {
    return {
      mode: "builder",
      confidence: 0.88,
      reason: "Builder keyword detected.",
    };
  }

  if (CHAT_PATTERN.test(normalized)) {
    return {
      mode: "chat",
      confidence: 0.78,
      reason: "Question or explanation intent detected.",
    };
  }

  return {
    mode: "chat",
    confidence: 0.55,
    reason: "No builder intent detected.",
  };
}

export function isBuilderPrompt(prompt: string) {
  return detectPromptMode(prompt).mode === "builder";
}
