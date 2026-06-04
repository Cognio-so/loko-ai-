import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { getCurrentUser } from '@/lib/supabase/server';
import { getErrorMessage, sanitizeProjectTitle, unauthorizedResponse } from '@/lib/api';
import {
  getProjectsSetupErrorMessage,
  isMissingProjectsTableError,
  supabaseCreateProject,
} from '@/lib/supabase/projects';
import { guarded, preflightResponse, readJsonBody } from '@/lib/security';

async function handlePost(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorizedResponse();

    const { files, projectTitle, description, previewHtml } = await readJsonBody<{
      files?: Array<{ path: string; content: string }>;
      projectTitle?: string;
      description?: string;
      previewHtml?: string;
    }>(req);

    if (!files || !Array.isArray(files)) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const safeTitle = sanitizeProjectTitle(projectTitle || 'untitled-app');
    const baseDir = path.join(process.cwd(), 'generated', user.id, safeTitle);

    // Create the base directory if it doesn't exist
    await fs.mkdir(baseDir, { recursive: true });

    // Write each file
    for (const file of files) {
      if (
        !file ||
        typeof file !== "object" ||
        typeof file.path !== "string" ||
        typeof file.content !== "string"
      ) {
        return NextResponse.json({ error: "Invalid generated file payload" }, { status: 400 });
      }

      const safeRelativePath = file.path.replace(/\\/g, "/");
      if (
        safeRelativePath.startsWith("/") ||
        safeRelativePath.split("/").some((part: string) => part === ".." || part === "." || !part)
      ) {
        return NextResponse.json({ error: `Unsafe file path: ${file.path}` }, { status: 400 });
      }

      const filePath = path.resolve(baseDir, safeRelativePath);
      if (!filePath.startsWith(path.resolve(baseDir))) {
        return NextResponse.json({ error: `Unsafe file path: ${file.path}` }, { status: 400 });
      }

      const fileDir = path.dirname(filePath);

      // Ensure directory exists for the file
      await fs.mkdir(fileDir, { recursive: true });

      // Write the content
      await fs.writeFile(filePath, file.content, 'utf8');
    }

    try {
      await supabaseCreateProject({
        id: crypto.randomUUID(),
        user_id: user.id,
        title: projectTitle || 'Untitled App',
        description: description || null,
        generated_code: files,
        preview_html: previewHtml || null,
      });
    } catch (error) {
      if (!isMissingProjectsTableError(error)) {
        throw error;
      }
      console.warn(getProjectsSetupErrorMessage());
    }

    return NextResponse.json({ 
      success: true, 
      message: `Saved ${files.length} files to your LokoAI workspace` 
    });

  } catch (error: unknown) {
    console.error('LokoAI File Save Error:', error);
    if (isMissingProjectsTableError(error)) {
      return NextResponse.json({ error: getProjectsSetupErrorMessage() }, { status: 503 });
    }
    return NextResponse.json({ error: getErrorMessage(error) || 'Failed to save files' }, { status: 500 });
  }
}

export const POST = guarded(handlePost, 20);
export const OPTIONS = preflightResponse;
