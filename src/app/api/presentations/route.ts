import { NextResponse } from "next/server";
import { createGeneratedFileFromPrompt } from "@/lib/file-generators";
import {
  getPresentationsSetupErrorMessage,
  isMissingPresentationsTableError,
  supabaseListPresentations,
} from "@/lib/supabase/presentations";
import { getCurrentUser } from "@/lib/supabase/server";
import { getErrorMessage, unauthorizedResponse } from "@/lib/api";
import { guarded, preflightResponse, readJsonBody } from "@/lib/security";

async function handleGet() {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();

  try {
    const presentations = await supabaseListPresentations(80);
    return NextResponse.json({ presentations });
  } catch (error) {
    if (isMissingPresentationsTableError(error)) {
      return NextResponse.json({ presentations: [], warning: getPresentationsSetupErrorMessage() });
    }
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

async function handlePost(req: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorizedResponse();

  const body = await readJsonBody<{
    prompt?: string;
    topic?: string;
    slideCount?: number;
    theme?: "light" | "dark";
  }>(req);
  const topic = (body.prompt || body.topic || "").trim();
  if (!topic) {
    return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
  }

  const slideCount = Math.min(30, Math.max(3, Number(body.slideCount || 12)));
  const themeInstruction = body.theme ? ` Use a ${body.theme} professional template.` : "";
  const prompt = `${topic} Create a ${slideCount}-slide PowerPoint PPTX presentation with professional structure, slide titles, slide content, charts, tables, image placeholders, conclusion, and downloadable file.${themeInstruction}`;
  const generatedFile = await createGeneratedFileFromPrompt(prompt);

  if (!generatedFile || generatedFile.fileType !== "pptx") {
    return NextResponse.json({ error: "Failed to generate PPTX presentation." }, { status: 500 });
  }

  return NextResponse.json({ file: generatedFile });
}

export const GET = guarded(handleGet, 60);
export const POST = guarded(handlePost, 10);
export const OPTIONS = preflightResponse;
