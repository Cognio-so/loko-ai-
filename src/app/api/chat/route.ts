import { NextResponse } from "next/server";
import {
  isMissingProjectsTableError,
  supabaseCreateProject,
  supabaseGetProject,
  supabaseUpdateProject,
} from "@/lib/supabase/projects";
import { processUploadedChatFile, type ProcessedChatFile, type UploadedChatFile } from "@/lib/file-analysis";
import { createFileMessage, createGeneratedFileFromPrompt, getFileIntent } from "@/lib/file-generators";
import { LOKO_AI_CORE_STANDARD } from "@/lib/lokoAiStandards";
import { getOpenRouterModelById } from "@/lib/openrouterModels";
import { getOpenRouterConfig } from "@/lib/openrouterConfig";
import { normalizeOpenRouterModelId } from "@/lib/openrouterModelAliases";
import { checkAgentSpecialization, getAgentSystemPrompt } from "@/lib/agentSpecialization";
import { buildSystemPrompt } from "@/lib/memory/buildSystemPrompt";
import { EpisodicMemory, LongTermMemory, ShortTermMemory, WorkingMemory } from "@/lib/memory/memoryManager";
import { getCurrentUser } from "@/lib/supabase/server";
import { guarded, preflightResponse, readJsonBody, validatePrompt } from "@/lib/security";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

type ChatRequestBody = {
  chatId?: string;
  sessionId?: string;
  userId?: string;
  message?: string;
  messages?: ChatMessage[];
  selectedModel?: string;
  responseMode?: "build" | "code" | "details";
  attachment?: UploadedChatFile | null;
  agent?: string;
  agentName?: string;
  savePreference?: {
    key?: string;
    value?: unknown;
    category?: string;
  };
  recordEpisode?: {
    eventType?: string;
    description?: string;
    outcome?: string;
    importance?: number;
    metadata?: Record<string, unknown>;
  };
};

type OpenRouterMessageContent =
  | string
  | Array<
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } }
    >;

type OpenRouterTool =
  | {
      type: "openrouter:web_search";
      parameters: {
        engine: "auto";
        max_results: number;
        max_total_results: number;
        search_context_size: "low" | "medium" | "high";
      };
    }
  | {
      type: "openrouter:image_generation";
      parameters: {
        model?: string;
        quality: "low" | "medium" | "high";
        aspect_ratio: "16:9" | "1:1" | "4:3";
        output_format: "png";
      };
    };

const CURRENT_FACT_PATTERN =
  /\b(search|latest|today|news|current|web|internet|google|find|lookup|price|pricing|weather|score|match|final|winner|won|result|live|update|updates|changelog|breaking|stock|crypto|rate|ipl|cricket|election|website|company|startup|software|tool|ai tool|github|repo|repository|api|docs|documentation|tutorial|official|openai|cursor|openclaw|v0|bolt|lovable|gemini|claude|perplexity|supabase|firebase|openrouter|vercel|tavily|serper|firecrawl|crawl4ai|jina|kal|aaj|aj|abhi|haal|mausam|mousam|jiti|jeeti|jita|jeeta|kon|kaun|konsi|konsa|kisne|kab)\b|https?:\/\/[^\s]+/i;

const WEBSITE_PATTERN =
  /\b(website|design|ui|ux|app|landing|dashboard|code|component|page|frontend|html|css|react|next|desktop)\b/i;

const BUILD_REQUEST_PATTERN =
  /\b(create|build|make|design|generate|develop|craft|banake do|bna ke do|bana ke do|banao|bnao|bna|bana)\b.{0,80}\b(website|web app|landing page|webpage|web page|page|dashboard|app|desktop app|ui|ux|component|saas|frontend|react app|next app|portfolio)\b|\b(website|landing page|web app|webpage|web page|dashboard|desktop app|saas page|frontend ui|react app|next app)\b/i;

const CODE_PATTERN =
  /\b(code|coding|program|function|component|debug|bug|fix|error|typescript|javascript|react|next|node|api|route|css|html|database|sql|python|java|php|build|compile)\b/i;

const REASONING_PATTERN =
  /\b(reason|reasoning|think|analyze|analyse|logic|strategy|plan|compare|decide|explain why|deep|complex|architecture|system design)\b/i;

const IMAGE_PATTERN =
  /\b(image|photo|picture|poster|banner|thumbnail|logo|illustration|avatar|wallpaper|visual|generate image|create image|image bana|photo bana|tasveer|taseer|chitra|चित्र|तस्वीर)\b/i;

const VIDEO_PATTERN =
  /\b(video|clip|movie|animation|animate|animated|reel|short video|text to video|image to video|generate video|create video|video bana|video banao|video bna|video bnao|screen recording|screenrecording|camera movement|camera movements|cinematic shot|cinematic video|motion graphics|timelapse|time-lapse|fps|frame by frame)\b/i;

const PROMPT_REQUEST_PATTERN =
  /\b(prompt|prompty|prompti|copywriting|client prompt|image prompt|give.*prompt|write.*prompt|prompt bana|prompt do|prompt de|prompt likh|prompt send|safe page|likh ke|likhkar|client.*mang)\b/i;

const ANSWER_ONLY_REQUEST_PATTERN =
  /\b(sawal|question|answer|jawab|batao|batana|kaise|kya|kyu|why|how|explain|samjhao|guide|suggest|idea|prompt|prompty|prompti|prompt likh|prompt de|prompt send|send karo|likh ke|likhkar|safe page|copy do|details?|search|find|lookup)\b/i;

const WORKFLOW_PATTERN =
  /\b(create|build|generate|explain|design).{0,40}\b(workflow|process flow|sop|step by step|business workflow|ai workflow|automation workflow|system architecture|user journey|customer flow|app workflow|website workflow)\b|\b(workflow|process flow|sop|step by step|system architecture|user journey|customer flow)\b/i;

const IMAGE_CAPABLE_MODELS = [
  "google/gemini-2.5-flash-image",
  "openai/gpt-5-image-mini",
  "black-forest-labs/flux.2-pro",
  "black-forest-labs/flux.2-flex",
  "black-forest-labs/flux.2-klein-4b",
];

const VIDEO_GENERATION_MODEL = "x-ai/grok-imagine-video";
const VIDEO_GENERATION_URL = "https://openrouter.ai/api/v1/videos";
const MAX_GROK_VIDEO_SECONDS = 15;

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function persistProjectUpdate(
  chatId: string,
  updates: Parameters<typeof supabaseUpdateProject>[1]
) {
  try {
    await supabaseUpdateProject(chatId, updates);
  } catch (error) {
    if (isMissingProjectsTableError(error)) {
      console.warn("Skipping chat persistence because public.projects is missing.");
      return;
    }
    throw error;
  }
}

async function persistProjectCreate(data: Parameters<typeof supabaseCreateProject>[0]) {
  try {
    await supabaseCreateProject(data);
  } catch (error) {
    if (isMissingProjectsTableError(error)) {
      console.warn("Skipping chat persistence because public.projects is missing.");
      return;
    }
    throw error;
  }
}

function getProviderErrorMessage(text: string, status: number) {
  if (!text.trim()) return "AI provider request failed.";

  try {
    const data = JSON.parse(text) as {
      error?: {
        message?: string;
        metadata?: {
          retry_after_seconds?: number;
          provider_name?: string;
        };
      };
    };
    const message = data.error?.message;
    const retryAfter = data.error?.metadata?.retry_after_seconds;
    const provider = data.error?.metadata?.provider_name;
    const retryText =
      typeof retryAfter === "number" && retryAfter > 0
        ? ` Retry in about ${Math.ceil(retryAfter)} seconds.`
        : "";
    const providerText = provider ? ` (${provider})` : "";

    return message ? `${message}${providerText}.${retryText}` : text;
  } catch {
    return status === 429
      ? `${text} Retry shortly, or switch to another available OpenRouter model.`
      : text;
  }
}

function normalizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ChatMessage => {
    return (
      item &&
      typeof item === "object" &&
      "role" in item &&
      "content" in item &&
      (item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string"
    );
  });
}

function normalizeMemoryAgent(body: ChatRequestBody) {
  const value = typeof body.agentName === "string" && body.agentName.trim()
    ? body.agentName.trim()
    : typeof body.agent === "string" && body.agent.trim()
      ? body.agent.trim()
      : "loko";
  return value.replace(/^gemini$/i, "loko");
}

function normalizeRequestUserId(body: ChatRequestBody, currentUserId?: string | null) {
  if (typeof body.userId === "string" && body.userId.trim()) {
    return body.userId.trim();
  }
  return currentUserId ?? undefined;
}

function memoryMessagesToChatMessages(messages: Awaited<ReturnType<typeof ShortTermMemory.getHistory>>): ChatMessage[] {
  const now = new Date().toISOString();
  return messages
    .filter((message): message is { role: ChatRole; content: string } => message.role === "user" || message.role === "assistant")
    .map((message) => ({
      id: crypto.randomUUID(),
      role: message.role,
      content: message.content,
      createdAt: now,
    }));
}

function shouldRecordEpisode(userText: string, assistantText: string) {
  return /\b(remember|preference|decided|problem|error|success|completed|failed|important|fix|fixed|deploy|build|video|project|memory|history)\b/i.test(
    `${userText}\n${assistantText}`
  );
}

async function rememberAssistantMessage(params: {
  sessionId: string;
  userId?: string;
  agentName: string;
  userText: string;
  assistantText: string;
  step: string;
}) {
  await Promise.all([
    ShortTermMemory.addMessage(params.sessionId, "assistant", params.assistantText, params.agentName, params.userId),
    WorkingMemory.addStep(params.sessionId, params.step),
  ]);

  if (params.userId && shouldRecordEpisode(params.userText, params.assistantText)) {
    await EpisodicMemory.record({
      userId: params.userId,
      sessionId: params.sessionId,
      eventType: "conversation_highlight",
      description: params.userText.slice(0, 240),
      outcome: params.assistantText.slice(0, 240),
      importance: 6,
      agentName: params.agentName,
      metadata: { source: "chat_route" },
    });
  }
}

function selectModelsForPrompt(
  prompt: string,
  config: ReturnType<typeof getOpenRouterConfig>,
  answerOnly = false
) {
  if (!config.enableSmartRouting) return config.fallbackModels;
  if (isSearchPrompt(prompt)) return config.searchModels;
  if (answerOnly) return config.fallbackModels;
  if (isImagePrompt(prompt)) {
    return Array.from(new Set(["google/gemini-2.5-flash-image", ...config.imageModels, ...IMAGE_CAPABLE_MODELS]));
  }
  if (isWorkflowPrompt(prompt)) return [config.reasoningModel, config.smartModel, ...config.fallbackModels];
  if (CODE_PATTERN.test(prompt)) return config.coderModels;
  if (REASONING_PATTERN.test(prompt)) return [config.reasoningModel, config.smartModel, ...config.fallbackModels];
  if (WEBSITE_PATTERN.test(prompt)) return config.websiteModels;
  return config.fallbackModels;
}

function isSearchPrompt(prompt: string) {
  return CURRENT_FACT_PATTERN.test(prompt);
}

function isVerifiedResearchPrompt(prompt: string) {
  return (
    isSearchPrompt(prompt) ||
    /\b(website|company|startup|software|app|tool|ai tool|github|repo|repository|api|pricing|docs|documentation|tutorial|official|integrations?|changelog)\b|https?:\/\/[^\s]+/i.test(prompt)
  );
}

function isImagePrompt(prompt: string) {
  return IMAGE_PATTERN.test(prompt);
}

function isVideoPrompt(prompt: string) {
  return VIDEO_PATTERN.test(prompt);
}

function isWebsitePrompt(prompt: string) {
  return WEBSITE_PATTERN.test(prompt);
}

function isBuildRequestPrompt(prompt: string) {
  return BUILD_REQUEST_PATTERN.test(prompt) && !isAnswerOnlyRequestPrompt(prompt) && !isExplicitFileDownloadPrompt(prompt);
}

function isExplicitFileDownloadPrompt(prompt: string) {
  return /\b(download|export|file mein|file me|as pdf|as docx|as xlsx|as pptx|excel file|word file|pdf file|download karke do|download kar ke do|as a file)\b/i.test(
    prompt
  );
}

function isWorkflowPrompt(prompt: string) {
  return WORKFLOW_PATTERN.test(prompt);
}

function isPromptRequest(prompt: string) {
  return PROMPT_REQUEST_PATTERN.test(prompt);
}

function isAnswerOnlyRequestPrompt(prompt: string) {
  return ANSWER_ONLY_REQUEST_PATTERN.test(prompt);
}

function getCurrentDateForPrompt() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getOpenRouterTools(
  userText: string,
  config: ReturnType<typeof getOpenRouterConfig>,
  answerOnly = false
): OpenRouterTool[] | undefined {
  const tools: OpenRouterTool[] = [];

  if (config.enableWebSearch && isSearchPrompt(userText)) {
    tools.push({
      type: "openrouter:web_search",
      parameters: {
        engine: "auto",
        max_results: config.enableDeepSearch ? 8 : 5,
        max_total_results: config.enableDeepSearch ? 16 : 10,
        search_context_size: config.enableDeepSearch ? "high" : "medium",
      },
    });
  }

  if (!answerOnly && isImagePrompt(userText) && !isVideoPrompt(userText)) {
    const imageModel = process.env.OPENROUTER_IMAGE_GENERATION_MODEL?.trim();
    const normalizedImageModel = imageModel ? normalizeOpenRouterModelId(imageModel) : "";
    tools.push({
      type: "openrouter:image_generation",
      parameters: {
        ...(normalizedImageModel ? { model: normalizedImageModel } : {}),
        quality: config.imageQuality === "hd" ? "high" : "medium",
        aspect_ratio: config.imageSize.aspectRatio,
        output_format: "png",
      },
    });
  }

  return tools.length ? tools : undefined;
}

function enhanceImagePrompt(userText: string) {
  const cleaned = userText.trim().replace(/\s+/g, " ");
  return `${cleaned}. Create a complete high-quality AI image, photorealistic or cinematic style, ultra HD 4K, highly detailed, visually attractive modern artwork, professional composition, realistic lighting, rich environment, strong camera angle, detailed textures, realistic shadows, depth of field, refined color grading, sharp focus, no text, no watermark, no ASCII art, no code, no sketch placeholder.`;
}

function enhanceWebsitePrompt(userText: string) {
  const cleaned = userText.trim().replace(/\s+/g, " ");
  return `${cleaned}

${LOKO_AI_CORE_STANDARD}

Generate a premium, production-quality UI comparable to OpenAI, Apple, Linear, Notion, Stripe, Vercel, Claude, Loko AI, Perplexity, Airbnb, Framer, Raycast, and Lovable/v0 quality.

Before writing code, first provide a concise but complete UI/UX plan:
- Layout strategy
- Component hierarchy
- Color system
- Spacing system
- Typography system
- Responsive strategy
- Visual design direction

Then provide the final code. If you provide code, provide one complete self-contained HTML document in a fenced html code block so the preview renders beautifully immediately.

Hard requirements:
- Never output bare/default browser HTML with blue links, bullet nav, Times New Roman, broken image tags, black placeholder blobs, or unstyled forms.
- Never create basic layouts, beginner-level UI, raw Bootstrap-like pages, boring templates, debug boards, image concept boards for website requests, or generic placeholder copy.
- Use inline CSS with a reset, modern system font stack, responsive layout, polished spacing, strong hierarchy, button states, card grids, tasteful gradients, premium shadows, loading states, and mobile breakpoints.
- Include real sections appropriate to the request: navigation, hero, social proof, product/dashboard preview, features, benefits, pricing or metrics when relevant, testimonials, FAQ, CTA, and footer.
- For dashboard/admin/app UI requests, include modern sidebar, top navigation, stats cards, analytics charts, activity feed, settings/account surfaces, dark mode support, and responsive behavior when relevant.
- Use CSS gradients, CSS shapes, inline SVG/data URI placeholders, or styled UI mockups instead of external image URLs that may break.
- Keep text readable, professional, and aligned. No overlapping content. No giant decorative cards around the whole page.
- Make the first viewport look like a funded startup product, not a wireframe.`;
}

function getTemperatureForPrompt(userText: string, config: ReturnType<typeof getOpenRouterConfig>) {
  if (isSearchPrompt(userText)) return config.searchTemperature;
  if (CODE_PATTERN.test(userText)) return config.coderTemperature;
  return config.chatTemperature;
}

function getResponseLanguageInstruction(userText: string) {
  const hasDevanagari = /[\u0900-\u097F]/.test(userText);
  const hinglishPattern =
    /\b(kya|kyu|kyun|kaise|kese|karo|karna|banao|bana|chahiye|mujhe|mere|mera|meri|nahi|nhi|hai|hain|tha|hoga|wala|wali|sab|jese|jaise|bolte|likhte|mat|sirf)\b/i;

  if (hasDevanagari) {
    return "Response language: Hindi, because the latest user message uses Devanagari. Do not force Hindi for future English messages.";
  }

  if (hinglishPattern.test(userText)) {
    return "Response language: Hinglish, because the latest user message uses Hinglish. Keep technical terms in English. Do not use Devanagari unless the user writes Devanagari.";
  }

  return "Response language: English. The latest user message is English, so reply fully in English. Ignore older Hindi/Hinglish assistant messages when choosing language. Do not translate headings, labels, plans, or website copy into Hindi unless the user explicitly asks for Hindi.";
}

function buildOpenRouterPayload(
  model: string,
  messagesBeforeAi: ChatMessage[],
  userText: string,
  config: ReturnType<typeof getOpenRouterConfig>,
  processedFile?: ProcessedChatFile | null,
  agentSlug?: string,
  memorySystemPrompt?: string,
  answerOnly = false
) {
  const searchInstruction = isVerifiedResearchPrompt(userText)
    ? ` For current facts, websites, companies, AI tools, startups, software, apps, GitHub repositories, APIs, pricing, documentation, tutorials, changelogs, and URLs: ${config.enableWebSearch ? "use web search before answering and prefer official sources first" : "web search is disabled, so do not invent live facts, URLs, pricing, repositories, docs, or changelogs"}. ${config.enableCitations ? "Cite sources with markdown links." : ""} Never hallucinate URLs. If sources do not confirm a claim, label it unverified. When relevant, structure the answer with Name, Official URL, Description, Features, Pricing, Docs, GitHub, Integrations, Latest Info, Best Use Cases, and Notes.`
    : "";
  const promptInstruction = isPromptRequest(userText)
    ? " If the user asks for a prompt, provide ONLY a clean copy-ready prompt plus short helpful notes if needed. Do not create a webpage, do not provide HTML, do not provide CSS/JS/React code, and do not wrap it as a preview."
    : "";
  const answerOnlyInstruction = answerOnly
    ? " IMPORTANT OUTPUT MODE: Answer-only/details mode. The user is asking for information, search results, an explanation, or a copy-ready prompt. Do NOT generate code. Do NOT output fenced code blocks. Do NOT output HTML/CSS/JS/React. Do NOT create a self-contained HTML page. Do NOT mention preview. Do NOT produce a downloadable file. Give concise useful details in normal chat text only."
    : "";
  const imageInstruction = !answerOnly && isImagePrompt(userText) && !isVideoPrompt(userText)
    ? " If the user asks to create an image, you must generate a real image. Never answer with ASCII art, code, a code block, a text sketch, or a copy-paste placeholder. Use the image generation tool and return the generated image in markdown image format."
    : "";
  const websiteInstruction = !answerOnly && isWebsitePrompt(userText)
    ? " If the user asks for a website, page, app UI, dashboard, landing page, or HTML/CSS/React frontend, act as an elite senior UI/UX designer, product designer, frontend architect, and full-stack engineer. First provide a concise UI/UX plan, component hierarchy, color system, spacing system, typography strategy, responsive strategy, and visual design direction. Then produce visually polished, complete, responsive UI code. Prefer a single self-contained HTML document in a fenced ```html code block when the chat preview will render it. The preview must never look like raw default HTML, beginner UI, boring templates, debug boards, generic placeholder screens, or image concept boards for website requests. Use modern typography, polished spacing, realistic sections, premium cards, tasteful gradients, accessible contrast, smooth interactions, production shadows, and responsive breakpoints."
    : "";
  const workflowInstruction = isWorkflowPrompt(userText)
    ? ` If the user asks for any workflow, SOP, process flow, step-by-step explanation, user journey, customer flow, system architecture, business workflow, AI workflow, automation workflow, app workflow, or website workflow, NEVER provide a short answer. Automatically create a complete professional workflow document similar to a consultant, business analyst, system architect, and project manager.

Use this exact structure with clean markdown headings, arrows, tables where useful, and detailed explanations:

# PROJECT OVERVIEW
Explain the workflow, purpose, goals, expected outcome, target users, benefits, and business/system context.

# WORKFLOW SUMMARY
Give a concise overview of the entire process before detailed steps.

# STEP-BY-STEP WORKFLOW
For every step, include:
- Objective
- Why this step exists
- Inputs
- Actions
- Outputs
- Success Criteria
Continue until the workflow is fully complete. Never skip steps.

# VISUAL FLOW DIAGRAM
Use arrow flow format with branching when needed:
START
↓
User Action
↓
System Process
↓
Validation
↓
Decision
├─ If approved → Next Process
└─ If rejected → Correction / Retry
↓
Output
↓
END

# USER JOURNEY
Show exactly:
User Opens System
↓
User Performs Action
↓
System Response
↓
User Decision
↓
Final Result

# SYSTEM WORKFLOW
Explain:
- Frontend Process
- Backend Process
- Database Process
- API Process
- AI Process, if applicable

# AUTOMATION OPPORTUNITIES
Suggest tasks that can be automated, AI integrations, time-saving improvements, and cost-saving improvements.

# REQUIRED TOOLS
List software, APIs, platforms, services, and integrations.

# RISKS & SOLUTIONS
For every relevant risk, include Possible Problem, Reason, Solution, and Prevention Method.

# BEST PRACTICES
Provide professional recommendations for efficiency, speed, scalability, reliability, and user experience.

# FINAL EXECUTION PLAN
Create a numbered roadmap from start to finish.

If an uploaded file is present, analyze the uploaded file first and base the workflow on that file content.`
    : "";
  const tools = getOpenRouterTools(userText, config, answerOnly);
  const languageInstruction = getResponseLanguageInstruction(userText);
  const agentInstruction = agentSlug ? `\n\n${getAgentSystemPrompt(agentSlug)}` : "";
  const memoryInstruction = memorySystemPrompt
    ? `\n\n${memorySystemPrompt}\n\nUse the memory context naturally. Do not mention memory tables or internal storage unless the user asks.`
    : "";
  const preparedMessages = messagesBeforeAi.slice(-12).map((message, index, items) => {
    const isLatestUser = index === items.length - 1 && message.role === "user";
    let content: OpenRouterMessageContent = message.content;

    if (isLatestUser) {
      const fileInstruction = processedFile
        ? `\n\nUploaded file:\n${processedFile.fileSummary}\n\nExtracted file content:\n${processedFile.extractedText}\n\nAnswer based on the uploaded file. If extraction is incomplete, clearly mention the limitation.`
        : "";
      const text = `${message.content}${fileInstruction}`;
      content = !answerOnly && isImagePrompt(userText) && !isVideoPrompt(userText)
        ? enhanceImagePrompt(text)
        : isWebsitePrompt(userText) && !answerOnly
          ? enhanceWebsitePrompt(text)
          : text;

      if (processedFile?.imageDataUrl) {
        content = [
          { type: "text", text: content },
          { type: "image_url", image_url: { url: processedFile.imageDataUrl } },
        ];
      }
    }

    return { role: message.role, content };
  });

  return {
    model,
    stream: config.enableStreaming,
    temperature: getTemperatureForPrompt(userText, config),
    max_tokens: config.maxOutputTokens,
    ...(tools ? { tools } : {}),
    messages: [
      {
        role: "system",
        content:
          `${LOKO_AI_CORE_STANDARD}

You are LokoAI, a helpful AI assistant and premium product UI builder. Today's date is ${getCurrentDateForPrompt()} (Asia/Kolkata). ${languageInstruction} Choose response language from the latest user message only, not from older chat history. Do not switch languages unless the latest user message explicitly asks for a different language or translation. Answer directly and accurately. If you do not know or cannot verify something, say that clearly instead of inventing facts. Use markdown when useful. For code, use fenced code blocks with language names.${agentInstruction}${memoryInstruction}${searchInstruction}${answerOnlyInstruction}${promptInstruction}${imageInstruction}${websiteInstruction}${workflowInstruction}`,
      },
      ...preparedMessages,
    ],
  };
}

function extractImageMarkdown(value: unknown) {
  const urls: string[] = [];

  function visit(item: unknown) {
    if (!item || typeof item !== "object") return;
    if (Array.isArray(item)) {
      item.forEach(visit);
      return;
    }

    const record = item as Record<string, unknown>;
    const directUrl = record.url || record.imageUrl;
    if (typeof directUrl === "string") urls.push(directUrl);

    const imageUrl = record.image_url;
    if (imageUrl && typeof imageUrl === "object") {
      const nestedUrl = (imageUrl as Record<string, unknown>).url;
      if (typeof nestedUrl === "string") urls.push(nestedUrl);
    }

    const images = record.images;
    if (Array.isArray(images)) images.forEach(visit);
  }

  visit(value);

  return Array.from(new Set(urls))
    .map((url, index) => `![Generated image ${index + 1}](${url})`)
    .join("\n\n");
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function enhanceVideoPrompt(userText: string, processedFile?: ProcessedChatFile | null) {
  const fileContext = processedFile
    ? `\n\nUse this uploaded file context when relevant:\n${processedFile.fileSummary}\n${processedFile.extractedText.slice(0, 3000)}`
    : "";

  return `${userText.trim().replace(/\s+/g, " ")}${fileContext}

Create a polished professional AI video with cinematic composition, smooth motion, realistic lighting, clean subject framing, detailed environment, no watermark, no distorted text, and no broken artifacts. Use the maximum supported duration for this model.`;
}

function extractVideoUrl(value: unknown): string | null {
  const urls: string[] = [];

  function visit(item: unknown) {
    if (!item) return;
    if (typeof item === "string") {
      if (/^https?:\/\/.+\.(mp4|webm|mov)(\?|$)/i.test(item) || /^https?:\/\/.+/i.test(item)) {
        urls.push(item);
      }
      return;
    }
    if (Array.isArray(item)) {
      item.forEach(visit);
      return;
    }
    if (typeof item !== "object") return;

    const record = item as Record<string, unknown>;
    const candidates = [
      record.url,
      record.video_url,
      record.videoUrl,
      record.download_url,
      record.downloadUrl,
    ];
    candidates.forEach(visit);
    visit(record.output);
    visit(record.outputs);
    visit(record.data);
    visit(record.video);
    visit(record.videos);
  }

  visit(value);
  return Array.from(new Set(urls))[0] ?? null;
}

function extractVideoGenerationId(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const data = record.data && typeof record.data === "object" ? (record.data as Record<string, unknown>) : null;
  const id = record.id ?? record.generation_id ?? record.generationId ?? data?.id;
  return typeof id === "string" && id.trim() ? id : null;
}

function formatLimitAwareError(errorText: string, status: number, model: string) {
  const providerMessage = getProviderErrorMessage(errorText, status);
  if (status === 402 || status === 429 || /limit|quota|credit|rate/i.test(providerMessage)) {
    return `${model} ki limit/credits abhi khatam ya rate-limited lag rahi hai: ${providerMessage} Main baaki normal chat/image/file work ko block nahi karunga. Thodi der baad retry karein ya doosra available model use karein.`;
  }

  return providerMessage;
}

async function requestOpenRouterVideo(
  apiKey: string,
  userText: string,
  processedFile?: ProcessedChatFile | null
): Promise<{ content: string; model: string } | { error: string; status: number }> {
  let lastStatus = 500;
  let lastErrorText = "";

  try {
    const createResponse = await fetch(VIDEO_GENERATION_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:302",
        "X-Title": "LokoAI",
      },
      body: JSON.stringify({
        model: VIDEO_GENERATION_MODEL,
        prompt: enhanceVideoPrompt(userText, processedFile),
        duration: MAX_GROK_VIDEO_SECONDS,
        resolution: "720p",
        aspect_ratio: "16:9",
        ...(processedFile?.imageDataUrl ? { image_url: processedFile.imageDataUrl } : {}),
      }),
    });

    if (!createResponse.ok) {
      lastStatus = createResponse.status || 500;
      lastErrorText = await createResponse.text().catch(() => "");
      return {
        error: formatLimitAwareError(lastErrorText, lastStatus, VIDEO_GENERATION_MODEL),
        status: lastStatus,
      };
    }

    let videoData = (await createResponse.json()) as unknown;
    let videoUrl = extractVideoUrl(videoData);
    const generationId = extractVideoGenerationId(videoData);

    for (let attempt = 0; !videoUrl && generationId && attempt < 8; attempt += 1) {
      await delay(5000);
      const statusResponse = await fetch(`${VIDEO_GENERATION_URL}/${encodeURIComponent(generationId)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:302",
          "X-Title": "LokoAI",
        },
      });

      if (!statusResponse.ok) {
        lastStatus = statusResponse.status || 500;
        lastErrorText = await statusResponse.text().catch(() => "");
        if (lastStatus === 402 || lastStatus === 429) {
          return {
            error: formatLimitAwareError(lastErrorText, lastStatus, VIDEO_GENERATION_MODEL),
            status: lastStatus,
          };
        }
        break;
      }

      videoData = (await statusResponse.json()) as unknown;
      videoUrl = extractVideoUrl(videoData);
    }

    if (videoUrl) {
      return {
        model: VIDEO_GENERATION_MODEL,
        content: `Video ready ho gaya.\n\n[Download / watch video](${videoUrl})\n\nModel: ${VIDEO_GENERATION_MODEL}\nDuration requested: ${MAX_GROK_VIDEO_SECONDS}s (maximum supported).`,
      };
    }

    if (generationId) {
      return {
        model: VIDEO_GENERATION_MODEL,
        content: `Video generation start ho gayi hai, lekin abhi processing complete nahi hui.\n\nGeneration ID: \`${generationId}\`\nModel: ${VIDEO_GENERATION_MODEL}\nDuration requested: ${MAX_GROK_VIDEO_SECONDS}s\n\nThodi der baad same prompt retry karein. Agar model limit/credits khatam honge to clear error dikhega aur baaki tools/chats block nahi honge.`,
      };
    }

    return {
      error: "Video generation response mein video URL ya generation ID nahi mila. Please prompt thoda specific karke retry karein.",
      status: 502,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Video generation failed.",
      status: 502,
    };
  }
}

async function requestOpenRouterImage(
  chatCompletionsUrl: string,
  apiKey: string,
  models: string[],
  messagesBeforeAi: ChatMessage[],
  userText: string,
  config: ReturnType<typeof getOpenRouterConfig>
): Promise<{ content: string; model: string } | { error: string; status: number }> {
  let lastErrorText = "";
  let lastStatus = 500;

  for (const model of models) {
    for (const modalities of [["image", "text"], ["image"]] as string[][]) {
      try {
      const response = await fetch(chatCompletionsUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:302",
          "X-Title": "LokoAI",
        },
        body: JSON.stringify({
          model,
          modalities,
          temperature: config.chatTemperature,
          max_tokens: config.maxOutputTokens,
          messages: [
            {
              role: "system",
              content:
                "You are an advanced AI image generation assistant. Generate the final image directly. Never return ASCII art, code blocks, text sketches, or placeholders.",
            },
            {
              role: "user",
              content: enhanceImagePrompt(userText),
            },
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        lastStatus = response.status || 500;
        lastErrorText = await response.text().catch(() => "");
        if (lastStatus === 401) break;
        continue;
      }

      const data = (await response.json()) as {
        choices?: Array<{
          message?: {
            content?: string;
            images?: unknown[];
          };
        }>;
      };
      const message = data.choices?.[0]?.message;
      const imageMarkdown = extractImageMarkdown(message);
      const textContent = message?.content?.trim() || "";
      const content = [
        imageMarkdown,
        textContent && !/```|copy-paste|ascii|can't generate|cannot generate|sorry/i.test(textContent)
          ? textContent
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      if (imageMarkdown) {
        return {
          content,
          model,
        };
      }

      lastStatus = 502;
      lastErrorText = "Image generation returned no image.";
      } catch (error) {
        lastErrorText = error instanceof Error ? error.message : "AI image generation failed.";
        lastStatus = 502;
      }
    }
  }

  return {
    error: getProviderErrorMessage(lastErrorText, lastStatus),
    status: lastStatus,
  };
}

async function requestOpenRouterStream(
  chatCompletionsUrl: string,
  apiKey: string,
  models: string[],
  messagesBeforeAi: ChatMessage[],
  userText: string,
  config: ReturnType<typeof getOpenRouterConfig>,
  processedFile?: ProcessedChatFile | null,
  agentSlug?: string,
  memorySystemPrompt?: string,
  answerOnly = false
): Promise<
  | { upstream: Response; model: string }
  | { error: string; status: number }
> {
  let lastErrorText = "";
  let lastStatus = 500;

  for (const model of models) {
    let upstream: Response;
    try {
      upstream = await fetch(chatCompletionsUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:302",
          "X-Title": "LokoAI",
        },
        body: JSON.stringify(buildOpenRouterPayload(model, messagesBeforeAi, userText, config, processedFile, agentSlug, memorySystemPrompt, answerOnly)),
      });
    } catch (error) {
      lastErrorText = error instanceof Error ? error.message : "AI provider request failed.";
      lastStatus = 502;
      continue;
    }

    if (upstream.ok && upstream.body) {
      return { upstream, model };
    }

    lastStatus = upstream.status || 500;
    lastErrorText = await upstream.text().catch(() => "");

    if (lastStatus === 401 || !config.enableAutoRetry) {
      break;
    }

    console.warn(`OpenRouter chat model failed, trying next fallback: ${model}`, lastErrorText);
  }

  return {
    error: getProviderErrorMessage(lastErrorText, lastStatus),
    status: lastStatus,
  };
}

async function handlePost(req: Request) {
  let body: ChatRequestBody;
  try {
    body = await readJsonBody<ChatRequestBody>(req);
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Invalid JSON request body.");
  }

  const userText = typeof body.message === "string" ? body.message.trim() : "";
  const currentUser = await getCurrentUser();
  const requestUserId = normalizeRequestUserId(body, currentUser?.id);
  const userId = requestUserId ?? null;
  const agentName = normalizeMemoryAgent(body);

  if (!userText && (body.savePreference || body.recordEpisode)) {
    const sessionId = typeof body.sessionId === "string" && body.sessionId.trim()
      ? body.sessionId.trim()
      : body.chatId || crypto.randomUUID();

    if (body.savePreference?.key && requestUserId) {
      await LongTermMemory.save(
        requestUserId,
        body.savePreference.key,
        body.savePreference.value ?? null,
        body.savePreference.category ?? "preference",
        agentName
      );
    }

    if (body.recordEpisode?.eventType && body.recordEpisode?.description && requestUserId) {
      await EpisodicMemory.record({
        userId: requestUserId,
        sessionId,
        eventType: body.recordEpisode.eventType,
        description: body.recordEpisode.description,
        outcome: body.recordEpisode.outcome,
        importance: body.recordEpisode.importance ?? 7,
        agentName,
        metadata: body.recordEpisode.metadata ?? {},
      });
    }

    return NextResponse.json({ ok: true, sessionId, agentName });
  }

  const promptError = validatePrompt(userText, 20_000);
  if (promptError) {
    return jsonError(promptError);
  }

  // Check agent specialization
  if (body.agent) {
    const specializationCheck = checkAgentSpecialization(body.agent, userText);
    if (!specializationCheck.isAllowed) {
      return jsonError(specializationCheck.reason || "This request is outside my specialization.", 400);
    }
  }

  let processedFile: ProcessedChatFile | null = null;
  if (body.attachment) {
    try {
      processedFile = await processUploadedChatFile(body.attachment);
    } catch (error) {
      console.error("Uploaded file processing failed:", error);
      return jsonError("Uploaded file could not be processed. Please try a different file.", 400);
    }
  }

  const now = new Date().toISOString();
  const userMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content: userText,
    createdAt: now,
  };

  let existingProject = null;
  try {
    existingProject = body.chatId ? await supabaseGetProject(body.chatId) : null;
  } catch (error) {
    if (!isMissingProjectsTableError(error)) {
      throw error;
    }
    console.warn("Skipping project lookup because public.projects is missing.");
  }
  const previousMessages = existingProject
    ? normalizeMessages(existingProject.chat_messages)
    : normalizeMessages(body.messages);

  const chatId = existingProject?.id ?? crypto.randomUUID();
  const sessionId = typeof body.sessionId === "string" && body.sessionId.trim()
    ? body.sessionId.trim()
    : chatId;
  const title = existingProject?.title ?? (userText.slice(0, 64) || "New chat");

  if (body.savePreference?.key && requestUserId) {
    await LongTermMemory.save(
      requestUserId,
      body.savePreference.key,
      body.savePreference.value ?? null,
      body.savePreference.category ?? "preference",
      agentName
    );
  }

  if (body.recordEpisode?.eventType && body.recordEpisode?.description && requestUserId) {
    await EpisodicMemory.record({
      userId: requestUserId,
      sessionId,
      eventType: body.recordEpisode.eventType,
      description: body.recordEpisode.description,
      outcome: body.recordEpisode.outcome,
      importance: body.recordEpisode.importance ?? 7,
      agentName,
      metadata: body.recordEpisode.metadata ?? {},
    });
  }

  const rememberedMessages = previousMessages.length
    ? []
    : memoryMessagesToChatMessages(await ShortTermMemory.getHistory(sessionId, 20));
  const messagesBeforeAi = [...rememberedMessages, ...previousMessages, userMessage];
  const memorySystemPrompt = await buildSystemPrompt({
    sessionId,
    userId: requestUserId,
    agentName,
  });

  await Promise.all([
    ShortTermMemory.addMessage(sessionId, "user", userText, agentName, requestUserId),
    WorkingMemory.set(
      sessionId,
      userText,
      {
        chatId,
        selectedModel: body.selectedModel,
        agent: body.agent,
        hasAttachment: Boolean(body.attachment),
      },
      requestUserId,
      agentName
    ),
  ]);

  if (existingProject) {
    await persistProjectUpdate(chatId, {
      title,
      prompt: userText,
      chat_messages: messagesBeforeAi,
    });
  } else {
    await persistProjectCreate({
      id: chatId,
      user_id: userId,
      title,
      prompt: userText,
      chat_messages: messagesBeforeAi,
    });
  }

  const config = getOpenRouterConfig();
  const answerOnly = body.responseMode === "details" || isAnswerOnlyRequestPrompt(userText);
  const fileIntent = getFileIntent(userText);
  if (!answerOnly && fileIntent.isFileRequest && !isWebsitePrompt(userText) && !isBuildRequestPrompt(userText)) {
    try {
      const generatedFile = await createGeneratedFileFromPrompt(userText);
      if (!generatedFile) {
        return jsonError("I could not detect a supported file type. Try asking for PDF, DOCX, XLSX, PPTX, CSV, TXT, MD, or JSON.");
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: createFileMessage(generatedFile),
        createdAt: new Date().toISOString(),
      };

      await persistProjectUpdate(chatId, {
        chat_messages: [...messagesBeforeAi, assistantMessage],
      });

      await rememberAssistantMessage({
        sessionId,
        userId: requestUserId,
        agentName,
        userText,
        assistantText: assistantMessage.content,
        step: `Created downloadable file: ${generatedFile.fileName}`,
      });

      return new Response(assistantMessage.content, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          "X-Chat-Id": chatId,
          "X-Generated-File": generatedFile.fileName,
        },
      });
    } catch (error) {
      console.error("File generation failed:", error);
      return jsonError(
        error instanceof Error ? `File generation failed: ${error.message}` : "File generation failed.",
        500
      );
    }
  }

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    return jsonError("OPENROUTER_API_KEY is missing in .env.local.", 500);
  }

  const requestedModel = getOpenRouterModelById(body.selectedModel);
  const selectedModels = Array.from(
    new Set([...(requestedModel ? [requestedModel.id] : []), ...selectModelsForPrompt(userText, config, answerOnly)])
  );

  if (!answerOnly && isVideoPrompt(userText)) {
    const videoResult = await requestOpenRouterVideo(apiKey, userText, processedFile);

    if ("error" in videoResult) {
      return jsonError(videoResult.error, videoResult.status);
    }

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: videoResult.content,
      createdAt: new Date().toISOString(),
    };

    await persistProjectUpdate(chatId, {
      chat_messages: [...messagesBeforeAi, assistantMessage],
    });

    await rememberAssistantMessage({
      sessionId,
      userId: requestUserId,
      agentName,
      userText,
      assistantText: assistantMessage.content,
      step: `Generated video with ${videoResult.model}`,
    });

    return new Response(videoResult.content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Chat-Id": chatId,
        "X-AI-Model": videoResult.model,
      },
    });
  }

  if (!answerOnly && isImagePrompt(userText)) {
    const imageModels = Array.from(new Set(["google/gemini-2.5-flash-image", ...config.imageModels, ...IMAGE_CAPABLE_MODELS]));
    const imageResult = await requestOpenRouterImage(
      config.chatCompletionsUrl,
      apiKey,
      imageModels,
      messagesBeforeAi,
      userText,
      config
    );

    if ("error" in imageResult) {
      return jsonError(imageResult.error, imageResult.status);
    }

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: imageResult.content,
      createdAt: new Date().toISOString(),
    };

    await persistProjectUpdate(chatId, {
      chat_messages: [...messagesBeforeAi, assistantMessage],
    });

    await rememberAssistantMessage({
      sessionId,
      userId: requestUserId,
      agentName,
      userText,
      assistantText: assistantMessage.content,
      step: `Generated image with ${imageResult.model}`,
    });

    return new Response(imageResult.content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Chat-Id": chatId,
        "X-AI-Model": imageResult.model,
      },
    });
  }

  const streamResult = await requestOpenRouterStream(
    config.chatCompletionsUrl,
    apiKey,
    selectedModels,
    messagesBeforeAi,
    userText,
    config,
    processedFile,
    body.agent,
    memorySystemPrompt,
    answerOnly
  );

  if ("error" in streamResult) {
    return jsonError(streamResult.error, streamResult.status);
  }

  const { upstream, model: selectedModel } = streamResult;

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let assistantText = "";

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith("data:")) continue;

            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const token = parsed.choices?.[0]?.delta?.content ?? "";
              if (!token) continue;

              assistantText += token;
              controller.enqueue(encoder.encode(token));
            } catch {
              // Ignore malformed stream fragments from upstream.
            }
          }
        }
      } catch (error) {
        console.error("Chat stream error:", error);
        controller.error(error);
        return;
      } finally {
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: assistantText || "I could not generate a response. Please try again.",
          createdAt: new Date().toISOString(),
        };

        await persistProjectUpdate(chatId, {
          chat_messages: [...messagesBeforeAi, assistantMessage],
        });

        await rememberAssistantMessage({
          sessionId,
          userId: requestUserId,
          agentName,
          userText,
          assistantText: assistantMessage.content,
          step: `Completed chat response with ${selectedModel}`,
        });

        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Chat-Id": chatId,
      "X-AI-Model": selectedModel,
    },
  });
}

export const POST = guarded(handlePost, 10);
export const OPTIONS = preflightResponse;
