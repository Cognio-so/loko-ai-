const MODEL_LOGOS: Record<string, string> = {
  "Claude Opus 4.8 Fast": "/models/anthropic.svg",
  "Claude Opus 4.8": "/models/anthropic.svg",
  "Claude Opus 4.7 Fast": "/models/anthropic.svg",

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
    filter: "invert(55%) sepia(48%) saturate(760%) hue-rotate(329deg) brightness(92%) contrast(89%)",
    bg: "linear-gradient(135deg, rgba(217,119,87,0.16), rgba(255,244,238,0.95))",
  },
  "Claude Opus 4.8": {
    tint: "#d97757",
    filter: "invert(55%) sepia(48%) saturate(760%) hue-rotate(329deg) brightness(92%) contrast(89%)",
    bg: "linear-gradient(135deg, rgba(217,119,87,0.16), rgba(255,244,238,0.95))",
  },
  "Claude Opus 4.7 Fast": {
    tint: "#d97757",
    filter: "invert(55%) sepia(48%) saturate(760%) hue-rotate(329deg) brightness(92%) contrast(89%)",
    bg: "linear-gradient(135deg, rgba(217,119,87,0.16), rgba(255,244,238,0.95))",
  },
  "MiniMax M3": {
    tint: "#2563eb",
    filter: "invert(36%) sepia(91%) saturate(1681%) hue-rotate(208deg) brightness(96%) contrast(94%)",
    bg: "linear-gradient(135deg, rgba(37,99,235,0.14), rgba(219,234,254,0.95))",
  },
  "Mistral Medium 3.5": {
    tint: "#ff7000",
    filter: "invert(54%) sepia(95%) saturate(2904%) hue-rotate(0deg) brightness(101%) contrast(105%)",
    bg: "linear-gradient(135deg, rgba(255,112,0,0.16), rgba(255,247,237,0.95))",
  },
  "GPT OSS 120B": {
    tint: "#10a37f",
    filter: "invert(48%) sepia(84%) saturate(453%) hue-rotate(119deg) brightness(92%) contrast(92%)",
    bg: "linear-gradient(135deg, rgba(16,163,127,0.14), rgba(236,253,245,0.95))",
  },
  "GPT-4o Mini": {
    tint: "#10a37f",
    filter: "invert(48%) sepia(84%) saturate(453%) hue-rotate(119deg) brightness(92%) contrast(92%)",
    bg: "linear-gradient(135deg, rgba(16,163,127,0.14), rgba(236,253,245,0.95))",
  },
  "GPT-5 Image Mini": {
    tint: "#10a37f",
    filter: "invert(48%) sepia(84%) saturate(453%) hue-rotate(119deg) brightness(92%) contrast(92%)",
    bg: "linear-gradient(135deg, rgba(16,163,127,0.14), rgba(236,253,245,0.95))",
  },
  "Llama 3.3 70B": {
    tint: "#0866ff",
    filter: "invert(34%) sepia(99%) saturate(3319%) hue-rotate(212deg) brightness(101%) contrast(101%)",
    bg: "linear-gradient(135deg, rgba(8,102,255,0.14), rgba(239,246,255,0.96))",
  },
  "Hermes 3 405B": {
    tint: "#0866ff",
    filter: "invert(34%) sepia(99%) saturate(3319%) hue-rotate(212deg) brightness(101%) contrast(101%)",
    bg: "linear-gradient(135deg, rgba(8,102,255,0.14), rgba(239,246,255,0.96))",
  },
  "Gemini 2.5 Flash": {
    tint: "#8e75ff",
    filter: "invert(55%) sepia(69%) saturate(2864%) hue-rotate(218deg) brightness(104%) contrast(101%)",
    bg: "linear-gradient(135deg, rgba(142,117,255,0.15), rgba(236,244,255,0.96))",
  },
  "Gemini 2.5 Flash Image": {
    tint: "#8e75ff",
    filter: "invert(55%) sepia(69%) saturate(2864%) hue-rotate(218deg) brightness(104%) contrast(101%)",
    bg: "linear-gradient(135deg, rgba(142,117,255,0.15), rgba(236,244,255,0.96))",
  },
  "Gemma 4 26B": {
    tint: "#4285f4",
    filter: "invert(47%) sepia(80%) saturate(2128%) hue-rotate(199deg) brightness(101%) contrast(92%)",
    bg: "linear-gradient(135deg, rgba(66,133,244,0.14), rgba(241,245,249,0.96))",
  },
  "Qwen 3 Coder": {
    tint: "#615ced",
    filter: "invert(43%) sepia(92%) saturate(2200%) hue-rotate(225deg) brightness(96%) contrast(92%)",
    bg: "linear-gradient(135deg, rgba(97,92,237,0.15), rgba(238,242,255,0.96))",
  },
  "DeepSeek V4 Pro": {
    tint: "#4d6bfe",
    filter: "invert(39%) sepia(87%) saturate(2364%) hue-rotate(220deg) brightness(102%) contrast(99%)",
    bg: "linear-gradient(135deg, rgba(77,107,254,0.14), rgba(239,246,255,0.96))",
  },
  "Kimi K2.6": {
    tint: "#0ea5e9",
    filter: "invert(52%) sepia(89%) saturate(1102%) hue-rotate(166deg) brightness(95%) contrast(92%)",
    bg: "linear-gradient(135deg, rgba(14,165,233,0.14), rgba(240,249,255,0.96))",
  },
  "Dolphin Mistral 24B Venice": {
    tint: "#ff7000",
    filter: "invert(54%) sepia(95%) saturate(2904%) hue-rotate(0deg) brightness(101%) contrast(105%)",
    bg: "linear-gradient(135deg, rgba(255,112,0,0.16), rgba(255,247,237,0.95))",
  },
  "Trinity Large Thinking": {
    tint: "#14b8a6",
    filter: "invert(55%) sepia(93%) saturate(522%) hue-rotate(127deg) brightness(91%) contrast(92%)",
    bg: "linear-gradient(135deg, rgba(20,184,166,0.14), rgba(240,253,250,0.96))",
  },
  "GLM 4.5 Air": {
    tint: "#2563eb",
    filter: "invert(36%) sepia(91%) saturate(1681%) hue-rotate(208deg) brightness(96%) contrast(94%)",
    bg: "linear-gradient(135deg, rgba(37,99,235,0.14), rgba(239,246,255,0.96))",
  },
  "FLUX.2 Pro": {
    tint: "#7c3aed",
    filter: "invert(37%) sepia(78%) saturate(2874%) hue-rotate(247deg) brightness(93%) contrast(93%)",
    bg: "linear-gradient(135deg, rgba(124,58,237,0.14), rgba(245,243,255,0.96))",
  },
  "FLUX.2 Flex": {
    tint: "#7c3aed",
    filter: "invert(37%) sepia(78%) saturate(2874%) hue-rotate(247deg) brightness(93%) contrast(93%)",
    bg: "linear-gradient(135deg, rgba(124,58,237,0.14), rgba(245,243,255,0.96))",
  },
  "FLUX.2 Klein 4B": {
    tint: "#7c3aed",
    filter: "invert(37%) sepia(78%) saturate(2874%) hue-rotate(247deg) brightness(93%) contrast(93%)",
    bg: "linear-gradient(135deg, rgba(124,58,237,0.14), rgba(245,243,255,0.96))",
  },
};

export default MODEL_LOGOS;

export function getModelLogo(modelName: string) {
  return MODEL_LOGOS[modelName] ?? null;
}

export function getModelLogoTheme(modelName: string) {
  return MODEL_LOGO_THEMES[modelName] ?? {
    tint: "#0ea5e9",
    filter: "invert(52%) sepia(89%) saturate(1102%) hue-rotate(166deg) brightness(95%) contrast(92%)",
    bg: "linear-gradient(135deg, rgba(14,165,233,0.12), rgba(240,249,255,0.95))",
  };
}
