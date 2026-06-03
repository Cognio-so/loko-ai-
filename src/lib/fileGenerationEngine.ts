import fs from "fs";
import path from "path";
import { sanitizeProjectTitle } from "@/lib/api";

export type GeneratedProjectFile = {
  path: string;
  content: string;
};

export type GeneratedProjectPayload = {
  projectTitle?: string;
  description?: string;
  files?: GeneratedProjectFile[];
  previewHtml?: string;
};

export type WorkspaceWriteResult = {
  workspaceRoot: string;
  projectDir: string;
  relativeProjectDir: string;
  writtenFiles: string[];
};

const WORKSPACE_DIR = "workspace";

function assertSafeRelativePath(filePath: string) {
  const normalized = filePath.replace(/\\/g, "/").trim();

  if (!normalized || normalized.startsWith("/") || normalized.includes("\0")) {
    throw new Error(`Unsafe generated file path: ${filePath}`);
  }

  const parts = normalized.split("/");
  if (parts.some((part) => part === ".." || part === "." || !part)) {
    throw new Error(`Unsafe generated file path: ${filePath}`);
  }

  return normalized;
}

export function normalizeGeneratedFiles(value: unknown): GeneratedProjectFile[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is GeneratedProjectFile => {
      return (
        !!item &&
        typeof item === "object" &&
        typeof (item as GeneratedProjectFile).path === "string" &&
        typeof (item as GeneratedProjectFile).content === "string"
      );
    })
    .map((file) => ({
      path: assertSafeRelativePath(file.path),
      content: file.content,
    }));
}

export function writeGeneratedProjectToWorkspace(
  payload: GeneratedProjectPayload,
  options?: { projectId?: string }
): WorkspaceWriteResult {
  const files = normalizeGeneratedFiles(payload.files);
  if (!files.length) {
    throw new Error("No generated files were provided.");
  }

  const workspaceRoot = path.join(process.cwd(), WORKSPACE_DIR);
  const safeTitle = sanitizeProjectTitle(payload.projectTitle || "generated-app");
  const projectName = options?.projectId ? `${safeTitle}-${options.projectId}` : safeTitle;
  const projectDir = path.join(workspaceRoot, projectName);
  const resolvedProjectDir = path.resolve(projectDir);
  const resolvedWorkspaceRoot = path.resolve(workspaceRoot);

  if (!resolvedProjectDir.startsWith(resolvedWorkspaceRoot)) {
    throw new Error("Generated project path escaped the workspace directory.");
  }

  fs.mkdirSync(resolvedProjectDir, { recursive: true });

  const writtenFiles: string[] = [];
  for (const file of files) {
    const safePath = assertSafeRelativePath(file.path);
    const destination = path.resolve(resolvedProjectDir, safePath);

    if (!destination.startsWith(resolvedProjectDir)) {
      throw new Error(`Generated file escaped the project directory: ${file.path}`);
    }

    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, file.content, "utf8");
    writtenFiles.push(safePath);
  }

  if (payload.previewHtml) {
    const previewPath = path.join(resolvedProjectDir, "preview.html");
    fs.writeFileSync(previewPath, payload.previewHtml, "utf8");
    writtenFiles.push("preview.html");
  }

  return {
    workspaceRoot: resolvedWorkspaceRoot,
    projectDir: resolvedProjectDir,
    relativeProjectDir: path.relative(process.cwd(), resolvedProjectDir),
    writtenFiles,
  };
}
