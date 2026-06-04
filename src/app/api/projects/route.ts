import { NextResponse } from "next/server";
import { unauthorizedResponse } from "@/lib/api";
import { getCurrentUser } from "@/lib/supabase/server";
import { supabaseCreateProject, supabaseListProjects } from "@/lib/supabase/projects";
import { guarded, preflightResponse, readJsonBody } from "@/lib/security";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "50", 10), 200);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);

    const projects = await supabaseListProjects(limit, offset);
    return NextResponse.json({ projects });
  } catch (err: unknown) {
    console.error("Projects GET error:", err);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

async function handlePost(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const body = await readJsonBody<{
      title?: string;
      description?: string | null;
      prompt?: string | null;
      preview_html?: string | null;
      generated_code?: unknown[];
      chat_messages?: unknown[];
    }>(req);

    const project = await supabaseCreateProject({
      id: crypto.randomUUID(),
      user_id: user.id,
      title: body.title || "Untitled Design",
      description: body.description ?? null,
      prompt: body.prompt ?? null,
      preview_html: body.preview_html ?? null,
      generated_code: Array.isArray(body.generated_code) ? body.generated_code : [],
      chat_messages: Array.isArray(body.chat_messages) ? body.chat_messages : [],
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: unknown) {
    console.error("Projects POST error:", err);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

export const POST = guarded(handlePost, 20);
export const OPTIONS = preflightResponse;
