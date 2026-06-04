import "server-only";

import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";

export type SupabasePresentation = {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  file_name: string;
  file_url: string;
  file_size: number;
  slide_count: number;
  theme: "light" | "dark";
  is_shared: boolean;
  created_at: string;
  updated_at: string;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

export function isMissingPresentationsTableError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as SupabaseErrorLike;
  const text = [maybeError.message, maybeError.details, maybeError.hint].filter(Boolean).join(" ");
  return maybeError.code === "PGRST205" || maybeError.code === "42P01" || /public\.presentations|relation .*presentations.* does not exist|schema cache/i.test(text);
}

export function getPresentationsSetupErrorMessage() {
  return "Supabase table `public.presentations` is missing. Run the latest Supabase migration, then retry.";
}

function toPresentation(data: Record<string, any>): SupabasePresentation {
  return {
    id: data.id,
    user_id: data.user_id,
    title: data.title,
    prompt: data.prompt,
    file_name: data.file_name,
    file_url: data.file_url,
    file_size: Number(data.file_size ?? 0),
    slide_count: Number(data.slide_count ?? 0),
    theme: data.theme === "dark" ? "dark" : "light",
    is_shared: Boolean(data.is_shared),
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function supabaseCreatePresentation(data: {
  title: string;
  prompt: string;
  file_name: string;
  file_url: string;
  file_size: number;
  slide_count: number;
  theme: "light" | "dark";
}) {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: created, error } = await supabase
    .from("presentations")
    .insert({
      user_id: user.id,
      title: data.title,
      prompt: data.prompt,
      file_name: data.file_name,
      file_url: data.file_url,
      file_size: data.file_size,
      slide_count: data.slide_count,
      theme: data.theme,
    })
    .select("*")
    .single();

  if (error) {
    if (isMissingPresentationsTableError(error)) {
      console.warn(getPresentationsSetupErrorMessage());
      return null;
    }
    throw error;
  }

  return toPresentation(created);
}

export async function supabaseListPresentations(limit = 50) {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("presentations")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) {
    if (isMissingPresentationsTableError(error)) {
      console.warn(getPresentationsSetupErrorMessage());
      return [];
    }
    throw error;
  }

  return (data ?? []).map(toPresentation);
}

export async function supabaseUpdatePresentation(id: string, updates: Partial<Pick<SupabasePresentation, "title" | "is_shared">>) {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required.");

  const { data, error } = await supabase
    .from("presentations")
    .update(updates)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) throw error;
  return toPresentation(data);
}

export async function supabaseDeletePresentation(id: string) {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();
  if (!user) throw new Error("Authentication required.");

  const { error } = await supabase
    .from("presentations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}
