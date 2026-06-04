const MODEL_LOGOS: Record<string, string> = {
  "Claude Opus 4.8 Fast": "/models/claude.png",
  "Claude Opus 4.8": "/models/claude.png",
  "Claude Opus 4.7 Fast": "/models/claude.png",

  "MiniMax M3": "/models/minimax.svg",

  "Mistral Medium 3.5": "/models/mistral.svg",

  "GPT OSS 120B": "/models/openai.svg",
  "GPT-4o Mini": "/models/openai.svg",
  "GPT-5 Image Mini": "/models/openai.svg",

  "Gemini 2.5 Flash": "/models/gemini.svg",
  "Gemini 2.5 Flash Image": "/models/gemini.svg",
  "Gemma 4 26B": "/models/gemma.svg",

  "Llama 3.3 70B": "/models/meta.svg",
  "Qwen 3 Coder": "/models/qwen.svg",
  "DeepSeek V4 Pro": "/models/deepseek.svg",
  "Kimi K2.6": "/models/kimi.svg",
  "Dolphin Mistral 24B Venice": "/models/mistral.svg",

  "FLUX.2 Pro": "/models/flux.svg",
  "FLUX.2 Flex": "/models/flux.svg",
  "FLUX.2 Klein 4B": "/models/flux.svg",

  "GLM 4.5 Air": "/models/zhipu.svg",
  "Trinity Large Thinking": "/models/trinity.svg",
  "Hermes 3 405B": "/models/meta.svg",
};

const MODEL_LOGO_THEMES: Record<string, { tint: string; filter: string; bg: string }> = {
  "Claude Opus 4.8 Fast": {
    tint: "#d97757",
    filter: "none",
    bg: "#ffffff",
  },
  "Claude Opus 4.8": {
    tint: "#d97757",
    filter: "none",
    bg: "#ffffff",
  },
  "Claude Opus 4.7 Fast": {
    tint: "#d97757",
    filter: "none",
    bg: "#ffffff",
  },
  "MiniMax M3": {
    tint: "#2563eb",
    filter: "none",
    bg: "#ffffff",
  },
  "Mistral Medium 3.5": {
    tint: "#ff7000",
    filter: "none",
    bg: "#ffffff",
  },
  "GPT OSS 120B": {
    tint: "#10a37f",
    filter: "none",
    bg: "#ffffff",
  },
  "GPT-4o Mini": {
    tint: "#10a37f",
    filter: "none",
    bg: "#ffffff",
  },
  "GPT-5 Image Mini": {
    tint: "#10a37f",
    filter: "none",
    bg: "#ffffff",
  },
  "Llama 3.3 70B": {
    tint: "#0866ff",
    filter: "none",
    bg: "#ffffff",
  },
  "Hermes 3 405B": {
    tint: "#0866ff",
    filter: "none",
    bg: "#ffffff",
  },
  "Gemini 2.5 Flash": {
    tint: "#8e75ff",
    filter: "none",
    bg: "#ffffff",
  },
  "Gemini 2.5 Flash Image": {
    tint: "#8e75ff",
    filter: "none",
    bg: "#ffffff",
  },
  "Gemma 4 26B": {
    tint: "#4285f4",
    filter: "none",
    bg: "#ffffff",
  },
  "Qwen 3 Coder": {
    tint: "#615ced",
    filter: "none",
    bg: "#ffffff",
  },
  "DeepSeek V4 Pro": {
    tint: "#4d6bfe",
    filter: "none",
    bg: "#ffffff",
  },
  "Kimi K2.6": {
    tint: "#111827",
    filter: "none",
    bg: "#ffffff",
  },
  "Dolphin Mistral 24B Venice": {
    tint: "#ff7000",
    filter: "none",
    bg: "#ffffff",
  },
  "Trinity Large Thinking": {
    tint: "#14b8a6",
    filter: "none",
    bg: "#ffffff",
  },
  "GLM 4.5 Air": {
    tint: "#2563eb",
    filter: "none",
    bg: "#ffffff",
  },
  "FLUX.2 Pro": {
    tint: "#111827",
    filter: "none",
    bg: "#ffffff",
  },
  "FLUX.2 Flex": {
    tint: "#111827",
    filter: "none",
    bg: "#ffffff",
  },
  "FLUX.2 Klein 4B": {
    tint: "#111827",
    filter: "none",
    bg: "#ffffff",
  },
};

export default MODEL_LOGOS;

export function getModelLogo(modelName: string) {
  return MODEL_LOGOS[modelName] ?? null;
}

export function getModelLogoTheme(modelName: string) {
  return MODEL_LOGO_THEMES[modelName] ?? {
    tint: "#0ea5e9",
    filter: "none",
    bg: "#ffffff",
  };
}
