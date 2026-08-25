import { NextResponse } from "next/server";
import { dbCreateProject, dbGetProject, dbUpdateProject } from "@/lib/db";
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

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
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

export async function POST(req: Request) {
  const { apiKey, chatCompletionsUrl, model, freeModel } = getOpenRouterConfig();
  if (!apiKey) {
    return jsonError("OPENROUTER_API_KEY is missing in .env.", 500);
  }

  const body = (await req.json()) as ChatRequestBody;
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

  const selectedModel = model || freeModel;

  const upstream = await fetch(chatCompletionsUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:302",
      "X-Title": "LokoAI",
    },
    body: JSON.stringify({
      model: selectedModel,
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "You are LokoAI, a concise and helpful AI assistant. Use markdown when useful. For code, use fenced code blocks with language names.",
        },
        ...messagesBeforeAi.slice(-12).map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const text = await upstream.text().catch(() => "");
    return jsonError(text || "AI provider request failed.", upstream.status || 500);
  }

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
    },
  });
}
