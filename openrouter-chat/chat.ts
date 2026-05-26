import { OpenRouter } from "@openrouter/sdk";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

// Swap this one string to change providers/models.
// Verified examples:
// - openai/gpt-chat-latest
// - ~anthropic/claude-sonnet-latest
// - baidu/cobuddy:free
const MODEL = "google/gemini-3.1-flash-lite";
const MAX_COMPLETION_TOKENS = 256;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

function readApiKeyFromEnvFile(path: string): string | undefined {
  if (!existsSync(path)) return undefined;

  const line = readFileSync(path, "utf8")
    .split(/\r?\n/)
    .find((entry) => entry.trim().startsWith("OPENROUTER_API_KEY="));

  return line
    ?.replace(/^OPENROUTER_API_KEY=/, "")
    .trim()
    .replace(/^["']|["']$/g, "");
}

function requireApiKey(): string {
  const appDir = dirname(fileURLToPath(import.meta.url));
  const apiKey =
    process.env.OPENROUTER_API_KEY ||
    readApiKeyFromEnvFile(join(appDir, ".env.local")) ||
    readApiKeyFromEnvFile(join(appDir, "..", ".env.local"));

  if (!apiKey) {
    console.error("Missing OPENROUTER_API_KEY.");
    console.error("Create a key at: https://openrouter.ai/settings/keys");
    console.error("");
    console.error("Then run one of these from this folder:");
    console.error("  macOS/Linux: OPENROUTER_API_KEY=sk-or-v1-... npx tsx chat.ts");
    console.error('  PowerShell:  $env:OPENROUTER_API_KEY="sk-or-v1-..."; npx tsx chat.ts');
    process.exit(1);
  }

  return apiKey;
}

const client = new OpenRouter({
  apiKey: requireApiKey(),
});

function printOpenRouterError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  console.error("\nOpenRouter request failed:");
  console.error(message);

  if (message.includes("User not found")) {
    console.error("");
    console.error("That usually means OPENROUTER_API_KEY is not a real active key.");
    console.error("Create/copy a key at: https://openrouter.ai/settings/keys");
    console.error("Then put it in ../.env.local as:");
    console.error("OPENROUTER_API_KEY=sk-or-v1-your-real-key");
  }
}

async function runSmokeTest() {
  const completion = await client.chat.send({
    chatRequest: {
      model: MODEL,
      maxCompletionTokens: MAX_COMPLETION_TOKENS,
      messages: [{ role: "user", content: "Say hello in one sentence." }],
    },
  });

  console.log(completion.choices[0]?.message.content);
  console.log({
    promptTokens: completion.usage?.promptTokens,
    completionTokens: completion.usage?.completionTokens,
  });
}

async function runStreamingExample() {
  const stream = await client.chat.send({
    chatRequest: {
      model: MODEL,
      maxCompletionTokens: MAX_COMPLETION_TOKENS,
      messages: [{ role: "user", content: "Explain how routers work in three sentences." }],
      stream: true,
    },
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) process.stdout.write(delta);
  }

  console.log();
}

async function streamAssistantReply(messages: ChatMessage[]): Promise<string> {
  const stream = await client.chat.send({
    chatRequest: {
      model: MODEL,
      maxCompletionTokens: MAX_COMPLETION_TOKENS,
      messages,
      stream: true,
    },
  });

  let response = "";
  process.stdout.write("Assistant: ");

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      process.stdout.write(delta);
      response += delta;
    }
  }

  console.log();
  return response;
}

async function runChatLoop() {
  const messages: ChatMessage[] = [];
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  let isClosed = false;
  rl.on("close", () => {
    isClosed = true;
  });

  console.log(`Using model: ${MODEL}`);
  console.log('Type "exit" to quit.');
  rl.setPrompt("You: ");
  rl.prompt();

  for await (const input of rl) {
    const trimmed = input.trim();

    if (trimmed.toLowerCase() === "exit") {
      break;
    }

    if (!trimmed) {
      if (!isClosed) rl.prompt();
      continue;
    }

    messages.push({ role: "user", content: trimmed });

    try {
      const response = await streamAssistantReply(messages);
      messages.push({ role: "assistant", content: response });
    } catch (error) {
      printOpenRouterError(error);
    }

    if (!isClosed) rl.prompt();
  }

  if (!isClosed) rl.close();
}

const command = process.argv[2];

try {
  if (command === "--smoke") {
    await runSmokeTest();
  } else if (command === "--stream-once") {
    await runStreamingExample();
  } else {
    await runChatLoop();
  }
} catch (error) {
  printOpenRouterError(error);
  process.exitCode = 1;
}
