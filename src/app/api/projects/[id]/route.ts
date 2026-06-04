import { NextResponse } from "next/server";
import { unauthorizedResponse } from "@/lib/api";
import { getCurrentUser } from "@/lib/supabase/server";
import {
  supabaseCreateProject,
  supabaseDeleteProject,
  supabaseGetProject,
  supabaseUpdateProject,
} from "@/lib/supabase/projects";
import { guarded, preflightResponse, readJsonBody } from "@/lib/security";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const project = await supabaseGetProject(id);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    return NextResponse.json({ project });
  } catch (err: unknown) {
    console.error("Project GET error:", err);
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 });
  }
}

async function handlePut(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    const body = await readJsonBody<{
      title?: string;
      description?: string | null;
      prompt?: string | null;
      preview_html?: string | null;
      generated_code?: unknown[];
      chat_messages?: unknown[];
      sandbox_id?: string | null;
    }>(req, 2_000_000);

    // Auto-create if it doesn't exist yet (PUT is idempotent)
    const existing = await supabaseGetProject(id);
    if (!existing) {
      await supabaseCreateProject({
        id,
        user_id: user.id,
        title: body.title ?? "Untitled Design",
        description: body.description ?? null,
        prompt: body.prompt ?? null,
        preview_html: body.preview_html ?? null,
        generated_code: Array.isArray(body.generated_code) ? body.generated_code : [],
        chat_messages: Array.isArray(body.chat_messages) ? body.chat_messages : [],
      });
    }

    const project = await supabaseUpdateProject(id, {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.prompt !== undefined && { prompt: body.prompt }),
      ...(body.preview_html !== undefined && { preview_html: body.preview_html }),
      ...(body.generated_code !== undefined && { generated_code: body.generated_code }),
      ...(body.chat_messages !== undefined && { chat_messages: body.chat_messages }),
      ...(body.sandbox_id !== undefined && { sandbox_id: body.sandbox_id }),
    });

    return NextResponse.json({ project });
  } catch (err: unknown) {
    console.error("Project PUT error:", err);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

async function handleDelete(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const { id } = await params;
    await supabaseDeleteProject(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Project DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}

export const PUT = guarded(handlePut, 30);
export const DELETE = guarded(handleDelete, 20);
export const OPTIONS = preflightResponse;
