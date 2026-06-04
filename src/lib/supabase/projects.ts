import "server-only";

import { createSupabaseServerClient } from "./server";
import { getCurrentUser } from "./server"; // Import getCurrentUser

export interface SupabaseProject {
  id: string;
  user_id: string | null; // From auth.users(id)
  title: string;
  description: string | null;
  prompt: string | null;
  generated_code: Array<{ path: string; content: string }>;
  preview_html: string | null;
  chat_messages: unknown[];
  session_key: string | null; // For anonymous session tracking
  sandbox_id?: string | null;
  created_at: string;
  updated_at: string;
}

function parseJsonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toSupabaseProject(data: Record<string, any>): SupabaseProject {
  return {
    id: data.id,
    user_id: data.user_id,
    title: data.title,
    description: data.description,
    prompt: data.prompt,
    generated_code: parseJsonArray(data.generated_code) as Array<{ path: string; content: string }>,
    preview_html: data.preview_html,
    chat_messages: parseJsonArray(data.chat_messages),
    session_key: data.session_key,
    sandbox_id: data.sandbox_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function supabaseListProjects(limit = 50, offset = 0): Promise<SupabaseProject[]> {
  const supabase = await createSupabaseServerClient();
  const currentUser = await getCurrentUser();

  if (!currentUser) return [];

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error listing projects from Supabase:", error);
    throw error;
  }

  return (data ?? []).map(toSupabaseProject);
}

export async function supabaseGetProject(id: string): Promise<SupabaseProject | null> {
  const supabase = await createSupabaseServerClient();
  const currentUser = await getCurrentUser();

  if (!currentUser) return null;

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", currentUser.id)
    .single();

  if (error) {
    console.error("Error fetching project from Supabase:", error);
    return null;
  }

  return toSupabaseProject(data);
}

export async function supabaseCreateProject(data: {
  id: string;
  user_id: string | null;
  title?: string;
  description?: string | null;
  prompt?: string | null;
  generated_code?: unknown[];
  preview_html?: string | null;
  chat_messages?: unknown[];
    session_key?: string | null;
    sandbox_id?: string | null;
}): Promise<SupabaseProject | null> {
  const supabase = await createSupabaseServerClient();
  const currentUser = await getCurrentUser();
  const userId = data.user_id ?? currentUser?.id ?? null;

  if (!userId) {
    throw new Error("Authentication required to create a project.");
  }

  const { data: createdData, error } = await supabase
    .from("projects")
    .insert({
      id: data.id,
      user_id: userId,
      title: data.title ?? "Untitled Design",
      description: data.description ?? null,
      prompt: data.prompt ?? null,
      generated_code: JSON.stringify(data.generated_code ?? []),
      preview_html: data.preview_html ?? null,
      chat_messages: JSON.stringify(data.chat_messages ?? []),
      session_key: data.session_key ?? null,
      sandbox_id: data.sandbox_id ?? null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("Error creating project in Supabase:", error);
    throw error; // Propagate error for handling in chat route
  }

  return toSupabaseProject(createdData);
}

export async function supabaseUpdateProject(
  id: string,
  updates: Partial<{
    title: string;
    description: string | null;
    prompt: string | null;
    generated_code: unknown[];
    preview_html: string | null;
    chat_messages: unknown[];
    session_key: string | null;
    sandbox_id: string | null;
  }>
): Promise<SupabaseProject | null> {
  const supabase = await createSupabaseServerClient();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Authentication required to update a project.");
  }

  const payload: Record<string, any> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.prompt !== undefined) payload.prompt = updates.prompt;
  if (updates.generated_code !== undefined) payload.generated_code = JSON.stringify(updates.generated_code);
  if (updates.preview_html !== undefined) payload.preview_html = updates.preview_html;
  if (updates.chat_messages !== undefined) payload.chat_messages = JSON.stringify(updates.chat_messages);
  if (updates.session_key !== undefined) payload.session_key = updates.session_key;
  if (updates.sandbox_id !== undefined) payload.sandbox_id = updates.sandbox_id;

  const { data, error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", id)
    .eq("user_id", currentUser.id)
    .select("*")
    .single();

  if (error) {
    console.error("Error updating project in Supabase:", error);
    throw error; // Propagate error
  }

  return toSupabaseProject(data);
}

export async function supabaseDeleteProject(id: string) {
  const supabase = await createSupabaseServerClient();
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("Authentication required to delete a project.");
  }

  const { error } = await supabase.from("projects").delete().eq("id", id).eq("user_id", currentUser.id);

  if (error) {
    console.error("Error deleting project from Supabase:", error);
    throw error;
  }
}
