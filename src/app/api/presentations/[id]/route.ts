import { NextResponse } from "next/server";
import { getErrorMessage, unauthorizedResponse } from "@/lib/api";
import { supabaseDeletePresentation, supabaseUpdatePresentation } from "@/lib/supabase/presentations";
import { getCurrentUser } from "@/lib/supabase/server";
import { guarded, preflightResponse, readJsonBody } from "@/lib/security";

type PresentationRouteContext = {
  params: Promise<{ id: string }>;
};

async function handlePatch(req: Request, context: PresentationRouteContext) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();

  const { id } = await context.params;
  const body = await readJsonBody<{ title?: string; is_shared?: boolean }>(req);
  const updates: { title?: string; is_shared?: boolean } = {};

  if (typeof body.title === "string") {
    const title = body.title.trim();
    if (!title) return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
    updates.title = title.slice(0, 140);
  }
  if (typeof body.is_shared === "boolean") updates.is_shared = body.is_shared;
  if (!Object.keys(updates).length) return NextResponse.json({ error: "No updates provided." }, { status: 400 });

  try {
    const presentation = await supabaseUpdatePresentation(id, updates);
    return NextResponse.json({ presentation });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

async function handleDelete(_req: Request, context: PresentationRouteContext) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();

  const { id } = await context.params;
  try {
    await supabaseDeletePresentation(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export const PATCH = guarded(handlePatch, 30);
export const DELETE = guarded(handleDelete, 30);
export const OPTIONS = preflightResponse;
