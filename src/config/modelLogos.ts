const MODEL_LOGOS: Record<string, string> = {
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

export default MODEL_LOGOS;

export function getModelLogo(modelName: string) {
  return MODEL_LOGOS[modelName] ?? null;
}
