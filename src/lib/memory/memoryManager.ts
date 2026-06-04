import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerConfig } from "@/lib/supabase/config";

export interface MemoryMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface MemoryContext {
  workingContext: string;
  shortTermHistory: MemoryMessage[];
  longTermSummary: string;
  episodicSummary: string;
}

type WorkingMemoryRow = {
  current_task: string | null;
  steps: unknown;
};

let serviceClient: SupabaseClient | null = null;

function getMemoryClient() {
  const { url, configured } = getSupabaseServerConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!configured || !serviceRoleKey) {
    return null;
  }

  serviceClient ??= createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return serviceClient;
}

function logMemoryError(scope: string, error: unknown) {
  if (!error) return;
  console.warn(`[LokoMemory:${scope}]`, error);
}

export const WorkingMemory = {
  async set(sessionId: string, task: string, context: object = {}, userId?: string, agentName = "loko") {
    const supabase = getMemoryClient();
    if (!supabase) return;

    const { error } = await supabase.from("working_memory").upsert(
      {
        session_id: sessionId,
        user_id: userId,
        current_task: task,
        agent_name: agentName,
        context,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id" }
    );

    logMemoryError("WorkingMemory.set", error);
  },

  async addStep(sessionId: string, step: string) {
    const supabase = getMemoryClient();
    if (!supabase) return;

    const { data, error } = await supabase
      .from("working_memory")
      .select("steps")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (error) {
      logMemoryError("WorkingMemory.addStep.read", error);
      return;
    }

    const steps = Array.isArray(data?.steps) ? data.steps : [];
    const { error: updateError } = await supabase
      .from("working_memory")
      .update({ steps: [...steps, step], updated_at: new Date().toISOString() })
      .eq("session_id", sessionId);

    logMemoryError("WorkingMemory.addStep.write", updateError);
  },

  async get(sessionId: string): Promise<WorkingMemoryRow | null> {
    const supabase = getMemoryClient();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("working_memory")
      .select("current_task, steps")
      .eq("session_id", sessionId)
      .maybeSingle();

    logMemoryError("WorkingMemory.get", error);
    return (data as WorkingMemoryRow | null) ?? null;
  },

  async clear(sessionId: string) {
    const supabase = getMemoryClient();
    if (!supabase) return;

    const { error } = await supabase.from("working_memory").delete().eq("session_id", sessionId);
    logMemoryError("WorkingMemory.clear", error);
  },
};

export const ShortTermMemory = {
  async addMessage(sessionId: string, role: MemoryMessage["role"], content: string, agentName = "loko", userId?: string) {
    const supabase = getMemoryClient();
    if (!supabase || !content.trim()) return;

    const { error } = await supabase.from("short_term_memory").insert({
      session_id: sessionId,
      user_id: userId,
      role,
      content,
      agent_name: agentName,
    });

    logMemoryError("ShortTermMemory.addMessage", error);
  },

  async getHistory(sessionId: string, limit = 20): Promise<MemoryMessage[]> {
    const supabase = getMemoryClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("short_term_memory")
      .select("role, content")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })
      .limit(limit);

    logMemoryError("ShortTermMemory.getHistory", error);
    return (data ?? []).filter((item): item is MemoryMessage => {
      return (
        item &&
        typeof item.content === "string" &&
        (item.role === "user" || item.role === "assistant" || item.role === "system")
      );
    });
  },

  async clear(sessionId: string) {
    const supabase = getMemoryClient();
    if (!supabase) return;

    const { error } = await supabase.from("short_term_memory").delete().eq("session_id", sessionId);
    logMemoryError("ShortTermMemory.clear", error);
  },
};

export const LongTermMemory = {
  async save(userId: string, key: string, value: unknown, category = "preference", agentName = "loko") {
    const supabase = getMemoryClient();
    if (!supabase || !userId || !key) return;

    const { error } = await supabase.from("long_term_memory").upsert(
      {
        user_id: userId,
        key,
        value,
        category,
        agent_name: agentName,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,key,agent_name" }
    );

    logMemoryError("LongTermMemory.save", error);
  },

  async get(userId: string, key: string, agentName = "loko") {
    const supabase = getMemoryClient();
    if (!supabase || !userId || !key) return null;

    const { data, error } = await supabase
      .from("long_term_memory")
      .select("value")
      .eq("user_id", userId)
      .eq("key", key)
      .eq("agent_name", agentName)
      .maybeSingle();

    logMemoryError("LongTermMemory.get", error);
    return data?.value ?? null;
  },

  async getAll(userId: string, agentName = "loko") {
    const supabase = getMemoryClient();
    if (!supabase || !userId) return [];

    const { data, error } = await supabase
      .from("long_term_memory")
      .select("key, value, category")
      .eq("user_id", userId)
      .eq("agent_name", agentName)
      .order("updated_at", { ascending: false });

    logMemoryError("LongTermMemory.getAll", error);
    return data ?? [];
  },

  async getSummaryText(userId: string, agentName = "loko") {
    const all = await this.getAll(userId, agentName);
    if (!all.length) return "No user preferences saved yet.";
    return all.map((item) => `- ${item.key}: ${JSON.stringify(item.value)}`).join("\n");
  },
};

export const EpisodicMemory = {
  async record(params: {
    userId?: string;
    sessionId?: string;
    eventType: string;
    description: string;
    outcome?: string;
    importance?: number;
    agentName?: string;
    metadata?: object;
  }) {
    const supabase = getMemoryClient();
    if (!supabase || !params.description.trim()) return;

    const { error } = await supabase.from("episodic_memory").insert({
      user_id: params.userId,
      session_id: params.sessionId,
      event_type: params.eventType,
      description: params.description,
      outcome: params.outcome,
      importance: params.importance ?? 5,
      agent_name: params.agentName ?? "loko",
      metadata: params.metadata ?? {},
    });

    logMemoryError("EpisodicMemory.record", error);
  },

  async getRecent(userId: string, limit = 5, agentName = "loko") {
    const supabase = getMemoryClient();
    if (!supabase || !userId) return [];

    const { data, error } = await supabase
      .from("episodic_memory")
      .select("*")
      .eq("user_id", userId)
      .eq("agent_name", agentName)
      .order("created_at", { ascending: false })
      .limit(limit);

    logMemoryError("EpisodicMemory.getRecent", error);
    return data ?? [];
  },

  async getImportant(userId: string, minImportance = 7, agentName = "loko") {
    const supabase = getMemoryClient();
    if (!supabase || !userId) return [];

    const { data, error } = await supabase
      .from("episodic_memory")
      .select("*")
      .eq("user_id", userId)
      .eq("agent_name", agentName)
      .gte("importance", minImportance)
      .order("importance", { ascending: false })
      .limit(10);

    logMemoryError("EpisodicMemory.getImportant", error);
    return data ?? [];
  },

  async getSummaryText(userId: string, agentName = "loko") {
    const episodes = await this.getRecent(userId, 5, agentName);
    if (!episodes.length) return "No significant past events recorded.";
    return episodes
      .map((episode) => {
        const outcome = typeof episode.outcome === "string" && episode.outcome ? ` -> ${episode.outcome}` : "";
        return `- [${episode.event_type}] ${episode.description}${outcome}`;
      })
      .join("\n");
  },
};

export async function buildMemoryContext(params: {
  sessionId: string;
  userId?: string;
  agentName?: string;
}): Promise<MemoryContext> {
  const { sessionId, userId, agentName = "loko" } = params;

  const [working, shortTermHistory, longTermSummary, episodicSummary] = await Promise.all([
    WorkingMemory.get(sessionId),
    ShortTermMemory.getHistory(sessionId, 20),
    userId ? LongTermMemory.getSummaryText(userId, agentName) : Promise.resolve(""),
    userId ? EpisodicMemory.getSummaryText(userId, agentName) : Promise.resolve(""),
  ]);

  const steps = Array.isArray(working?.steps) ? JSON.stringify(working.steps) : "[]";

  return {
    workingContext: working?.current_task ? `Current task: ${working.current_task}\nSteps done: ${steps}` : "",
    shortTermHistory,
    longTermSummary,
    episodicSummary,
  };
}
