# LOKO AI Memory System

This project now supports four memory types for chat personalization:

- Working memory: current task state per session
- Short-term memory: recent conversation history
- Long-term memory: durable user preferences
- Episodic memory: important past events

## Supabase Setup

1. Open Supabase Dashboard.
2. Go to SQL Editor.
3. Paste and run [supabase/memory_schema.sql](supabase/memory_schema.sql).

## Required Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENROUTER_API_KEY=your_openrouter_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Files

- [src/lib/memory/memoryManager.ts](src/lib/memory/memoryManager.ts): read/write helpers for all memory tables
- [src/lib/memory/buildSystemPrompt.ts](src/lib/memory/buildSystemPrompt.ts): memory-aware system prompt builder
- [src/app/api/chat/route.ts](src/app/api/chat/route.ts): existing chat route integrated with memory
- [supabase/memory_schema.sql](supabase/memory_schema.sql): Supabase table setup

## API Usage

The existing `/api/chat` endpoint continues to support current fields such as `chatId`, `message`, `messages`, `selectedModel`, `attachment`, and `agent`.

It also accepts:

```ts
{
  sessionId?: string;
  userId?: string;
  agentName?: "loko" | "coder" | "writer" | "analyst" | "support";
  savePreference?: { key: string; value: unknown; category?: string };
  recordEpisode?: { eventType: string; description: string; outcome?: string; importance?: number };
}
```

Memory is optional at runtime. If Supabase memory tables or `SUPABASE_SERVICE_ROLE_KEY` are missing, chat still works and memory writes are skipped with server warnings.
