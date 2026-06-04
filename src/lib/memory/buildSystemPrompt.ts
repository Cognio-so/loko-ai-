import "server-only";

import { buildMemoryContext } from "./memoryManager";

const AGENT_PERSONAS: Record<string, string> = {
  loko: "You are LOKO, an intelligent AI assistant. You are helpful, precise, and adaptive. Use memory to make responses feel continuous and personal.",
  coder: "You are LOKO Dev, an expert software engineer. You write clean production-ready code and remember the user's stack, style, and past problems.",
  writer: "You are LOKO Write, a creative writing assistant. You remember tone, style preferences, ongoing projects, and prior feedback.",
  analyst: "You are LOKO Analyst, a data and business analyst. You remember business context, metrics, reports, and preferred analysis style.",
  support: "You are LOKO Support, a friendly support agent. You remember past issues and outcomes so support feels fast and continuous.",
};

export async function buildSystemPrompt(params: {
  sessionId: string;
  userId?: string;
  agentName?: string;
  customInstructions?: string;
}) {
  const { sessionId, userId, agentName = "loko", customInstructions = "" } = params;
  const memory = await buildMemoryContext({ sessionId, userId, agentName });
  const persona = AGENT_PERSONAS[agentName] || AGENT_PERSONAS.loko;
  const now = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(new Date());

  return `${persona}

MEMORY SYSTEM - use this context naturally, without over-explaining it.

[1. WORKING MEMORY]
${memory.workingContext || "No active task. Starting fresh with this conversation."}

[2. SHORT-TERM MEMORY]
${memory.shortTermHistory.length ? `Recent memory contains ${memory.shortTermHistory.length} messages for this session.` : "This is the start of the conversation."}

[3. LONG-TERM MEMORY]
${memory.longTermSummary || "No user preferences saved yet. Learn from this conversation when important details appear."}

[4. EPISODIC MEMORY]
${memory.episodicSummary || "No significant past events recorded."}

BEHAVIOR RULES
- Personalize using long-term memory when useful.
- Preserve continuity with recent session context.
- Match the user's language: Hinglish for Hinglish, English for English.
- If memory is missing, ask naturally instead of pretending.
- Use working memory to stay focused on the current task.

SESSION INFO
- Agent: ${agentName.toUpperCase()}
- Session ID: ${sessionId.slice(0, 8)}...
- User ID: ${userId || "anonymous"}
- Current time (IST): ${now}
${customInstructions ? `- Special instructions: ${customInstructions}` : ""}`.trim();
}

