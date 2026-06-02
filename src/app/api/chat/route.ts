import { NextResponse } from "next/server";
import { dbCreateProject, dbGetProject, dbUpdateProject } from "@/lib/db";
import { createFileMessage, createGeneratedFileFromPrompt, getFileIntent } from "@/lib/file-generators";
import { getOpenRouterConfig } from "@/lib/openrouterConfig";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

type ChatRequestBody = {
  chatId?: string;
  message?: string;
  messages?: ChatMessage[];
};

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
  /\b(search|latest|today|news|current|web|internet|google|find|lookup|price|weather|score|match|final|winner|won|result|live|update|breaking|stock|crypto|rate|ipl|cricket|election|kal|aaj|aj|abhi|haal|mausam|mousam|jiti|jeeti|jita|jeeta|kon|kaun|konsi|konsa|kisne|kab)\b/i;

const WEBSITE_PATTERN =
  /\b(website|design|ui|ux|app|landing|dashboard|code|component|page|frontend|html|css|react|next|desktop)\b/i;

const CODE_PATTERN =
  /\b(code|coding|program|function|component|debug|bug|fix|error|typescript|javascript|react|next|node|api|route|css|html|database|sql|python|java|php|build|compile)\b/i;

const REASONING_PATTERN =
  /\b(reason|reasoning|think|analyze|analyse|logic|strategy|plan|compare|decide|explain why|deep|complex|architecture|system design)\b/i;

const IMAGE_PATTERN =
  /\b(image|photo|picture|poster|banner|thumbnail|logo|illustration|avatar|wallpaper|visual|generate image|create image|image bana|photo bana|tasveer|taseer|chitra|चित्र|तस्वीर)\b/i;

const PROMPT_REQUEST_PATTERN =
  /\b(prompt|copywriting|client prompt|image prompt|give.*prompt|write.*prompt|prompt bana|prompt do|prompt de|client.*mang)\b/i;

const IMAGE_CAPABLE_MODELS = [
  "google/gemini-2.5-flash-image",
  "google/gemini-2.5-flash-image-preview",
  "openai/gpt-5-image-mini",
  "black-forest-labs/flux.2-pro",
  "black-forest-labs/flux.2-flex",
];

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
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

function selectModelsForPrompt(
  prompt: string,
  config: ReturnType<typeof getOpenRouterConfig>
) {
  if (!config.enableSmartRouting) return config.fallbackModels;
  if (isSearchPrompt(prompt)) return config.searchModels;
  if (isImagePrompt(prompt)) return [...IMAGE_CAPABLE_MODELS, ...config.imageModels];
  if (CODE_PATTERN.test(prompt)) return config.coderModels;
  if (REASONING_PATTERN.test(prompt)) return [config.reasoningModel, config.smartModel, ...config.fallbackModels];
  if (WEBSITE_PATTERN.test(prompt)) return config.websiteModels;
  return config.fallbackModels;
}

function isSearchPrompt(prompt: string) {
  return CURRENT_FACT_PATTERN.test(prompt);
}

function isImagePrompt(prompt: string) {
  return IMAGE_PATTERN.test(prompt);
}

function isWebsitePrompt(prompt: string) {
  return WEBSITE_PATTERN.test(prompt);
}

function isPromptRequest(prompt: string) {
  return PROMPT_REQUEST_PATTERN.test(prompt);
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
  config: ReturnType<typeof getOpenRouterConfig>
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

  if (isImagePrompt(userText)) {
    const imageModel = process.env.OPENROUTER_IMAGE_GENERATION_MODEL?.trim();
    tools.push({
      type: "openrouter:image_generation",
      parameters: {
        ...(imageModel ? { model: imageModel } : {}),
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

Generate a premium, production-quality UI. If you provide code, provide one complete self-contained HTML document in a fenced html code block so the preview renders beautifully immediately.

Hard requirements:
- Never output bare/default browser HTML with blue links, bullet nav, Times New Roman, broken image tags, black placeholder blobs, or unstyled forms.
- Use inline CSS with a reset, modern system font stack, responsive layout, polished spacing, strong hierarchy, button states, card grids, and mobile breakpoints.
- Include real sections appropriate to the request: navigation, hero, product/dashboard preview, features, pricing or metrics when relevant, testimonials/social proof, CTA, and footer.
- Use CSS gradients, CSS shapes, inline SVG/data URI placeholders, or styled UI mockups instead of external image URLs that may break.
- Keep text readable, professional, and aligned. No overlapping content. No giant decorative cards around the whole page.
- Make the first viewport look like a finished app/site, not a wireframe.`;
}

function getTemperatureForPrompt(userText: string, config: ReturnType<typeof getOpenRouterConfig>) {
  if (isSearchPrompt(userText)) return config.searchTemperature;
  if (CODE_PATTERN.test(userText)) return config.coderTemperature;
  return config.chatTemperature;
}

function buildOpenRouterPayload(
  model: string,
  messagesBeforeAi: ChatMessage[],
  userText: string,
  config: ReturnType<typeof getOpenRouterConfig>
) {
  const searchInstruction = isSearchPrompt(userText)
    ? ` For current, latest, sports, news, price, weather, or web-search questions: ${config.enableWebSearch ? "use web search before answering" : "web search is disabled, so do not invent live facts"}. ${config.enableCitations ? "Cite sources with markdown links." : ""} If search is unavailable or sources do not confirm the answer, say you could not verify it instead of guessing.`
    : "";
  const promptInstruction = isPromptRequest(userText)
    ? " If the user asks for a prompt, provide a clean copy-ready prompt in the user's language and include useful details without asking unnecessary follow-up questions."
    : "";
  const imageInstruction = isImagePrompt(userText)
    ? " If the user asks to create an image, you must generate a real image. Never answer with ASCII art, code, a code block, a text sketch, or a copy-paste placeholder. Use the image generation tool and return the generated image in markdown image format."
    : "";
  const websiteInstruction = isWebsitePrompt(userText)
    ? " If the user asks for a website, page, app UI, dashboard, landing page, or HTML/CSS/React frontend, act as a senior product designer and frontend engineer. Produce visually polished, complete, responsive UI code. Prefer a single self-contained HTML document in a fenced ```html code block when the chat preview will render it. The preview must never look like raw default HTML: no blue underlined nav links, bullet lists as navigation, Times New Roman defaults, broken images, empty placeholders, or black blob icons. Use inline CSS, modern typography, gradients sparingly, realistic sections, polished components, accessible contrast, and responsive breakpoints."
    : "";
  const tools = getOpenRouterTools(userText, config);
  const preparedMessages = messagesBeforeAi.slice(-12).map((message, index, items) => ({
    role: message.role,
    content:
      isImagePrompt(userText) && index === items.length - 1 && message.role === "user"
        ? enhanceImagePrompt(message.content)
        : isWebsitePrompt(userText) && index === items.length - 1 && message.role === "user"
          ? enhanceWebsitePrompt(message.content)
        : message.content,
  }));

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
          `You are LokoAI, a helpful AI assistant and premium product UI builder. Today's date is ${getCurrentDateForPrompt()} (Asia/Kolkata). Reply in the same language the user uses. Do not switch languages unless the user explicitly asks for a different language or translation. Answer directly and accurately. If you do not know or cannot verify something, say that clearly instead of inventing facts. Use markdown when useful. For code, use fenced code blocks with language names.${searchInstruction}${promptInstruction}${imageInstruction}${websiteInstruction}`,
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
  config: ReturnType<typeof getOpenRouterConfig>
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
        body: JSON.stringify(buildOpenRouterPayload(model, messagesBeforeAi, userText, config)),
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

export async function POST(req: Request) {
  let body: ChatRequestBody;
  try {
    body = (await req.json()) as ChatRequestBody;
  } catch {
    return jsonError("Invalid JSON request body.");
  }

  const userText = body.message?.trim();
  if (!userText) {
    return jsonError("Message is required.");
  }

  const now = new Date().toISOString();
  const userMessage: ChatMessage = {
    id: crypto.randomUUID(),
    role: "user",
    content: userText,
    createdAt: now,
  };

  const existingProject = body.chatId ? dbGetProject(body.chatId) : null;
  const previousMessages = existingProject
    ? normalizeMessages(existingProject.chat_messages)
    : normalizeMessages(body.messages);

  const chatId = existingProject?.id ?? crypto.randomUUID();
  const title = existingProject?.title ?? (userText.slice(0, 64) || "New chat");
  const messagesBeforeAi = [...previousMessages, userMessage];

  if (existingProject) {
    dbUpdateProject(chatId, {
      title,
      prompt: userText,
      chat_messages: messagesBeforeAi,
    });
  } else {
    dbCreateProject({
      id: chatId,
      title,
      prompt: userText,
      chat_messages: messagesBeforeAi,
    });
  }

  const fileIntent = getFileIntent(userText);
  if (fileIntent.isFileRequest) {
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

      dbUpdateProject(chatId, {
        chat_messages: [...messagesBeforeAi, assistantMessage],
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

  const config = getOpenRouterConfig();
  const selectedModels = Array.from(new Set(selectModelsForPrompt(userText, config)));

  if (isImagePrompt(userText)) {
    const imageResult = await requestOpenRouterImage(
      config.chatCompletionsUrl,
      apiKey,
      selectedModels,
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

    dbUpdateProject(chatId, {
      chat_messages: [...messagesBeforeAi, assistantMessage],
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
    config
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

        dbUpdateProject(chatId, {
          chat_messages: [...messagesBeforeAi, assistantMessage],
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
