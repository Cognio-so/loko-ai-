/**
 * src/lib/db.ts
 * Robust local-first JSON persistence layer.
 * Replaces native C++ SQLite bindings to ensure 100% compatibility across all Node versions.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const DATA_DIR = resolve(process.cwd(), ".data");
mkdirSync(DATA_DIR, { recursive: true });

const DB_FILE = resolve(DATA_DIR, "projects.json");

export interface Project {
  id: string;
  title: string;
  description: string | null;
  prompt: string | null;
  preview_html: string | null;
  generated_code: Array<{ path: string; content: string }>;
  chat_messages: unknown[];
  sandbox_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectRow {
  id: string;
  title: string;
  description: string | null;
  prompt: string | null;
  preview_html: string | null;
  generated_code: string;
  chat_messages: string;
  sandbox_id: string | null;
  created_at: string;
  updated_at: string;
}

function loadProjects(): Project[] {
  try {
    if (!existsSync(DB_FILE)) {
      writeFileSync(DB_FILE, "[]", "utf8");
      return [];
    }
    const content = readFileSync(DB_FILE, "utf8");
    return JSON.parse(content || "[]");
  } catch (err) {
    console.error("Error reading projects database:", err);
    return [];
  }
}

function saveProjects(projects: Project[]) {
  try {
    writeFileSync(DB_FILE, JSON.stringify(projects, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing projects database:", err);
  }
}

export function toProject(row: ProjectRow): Project {
  return {
    ...row,
    generated_code: safeParseArray(row.generated_code) as Array<{ path: string; content: string }>,
    chat_messages: safeParseArray(row.chat_messages),
  };
}

function safeParseArray(json: string | null): unknown[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

// ─── CRUD helpers ─────────────────────────────────────────────────────────────

export function dbGetAllProjects(limit = 50, offset = 0): Project[] {
  const projects = loadProjects();
  projects.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
  return projects.slice(offset, offset + limit);
}

export function dbGetProject(id: string): Project | null {
  const projects = loadProjects();
  return projects.find((p) => p.id === id) || null;
}

export function dbCreateProject(data: {
  id: string;
  title?: string;
  description?: string | null;
  prompt?: string | null;
  preview_html?: string | null;
  generated_code?: unknown[];
  chat_messages?: unknown[];
}): Project {
  const projects = loadProjects();
  const now = new Date().toISOString();

  const newProject: Project = {
    id: data.id,
    title: data.title ?? "Untitled Design",
    description: data.description ?? null,
    prompt: data.prompt ?? null,
    preview_html: data.preview_html ?? null,
    generated_code: (data.generated_code as Array<{ path: string; content: string }>) ?? [],
    chat_messages: data.chat_messages ?? [],
    sandbox_id: null,
    created_at: now,
    updated_at: now,
  };

  const existingIndex = projects.findIndex((p) => p.id === data.id);
  if (existingIndex >= 0) {
    projects[existingIndex] = newProject;
  } else {
    projects.unshift(newProject);
  }

  saveProjects(projects);
  return newProject;
}

export function dbUpdateProject(
  id: string,
  data: Partial<{
    title: string;
    description: string | null;
    prompt: string | null;
    preview_html: string | null;
    generated_code: unknown[];
    chat_messages: unknown[];
    sandbox_id: string | null;
  }>
): Project | null {
  const projects = loadProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) {
    // If not exists, create it
    return dbCreateProject({
      id,
      ...data,
    });
  }

  const existing = projects[index];
  const updated: Project = {
    ...existing,
    title: data.title !== undefined ? data.title : existing.title,
    description: data.description !== undefined ? data.description : existing.description,
    prompt: data.prompt !== undefined ? data.prompt : existing.prompt,
    preview_html: data.preview_html !== undefined ? data.preview_html : existing.preview_html,
    generated_code: data.generated_code !== undefined ? (data.generated_code as Array<{ path: string; content: string }>) : existing.generated_code,
    chat_messages: data.chat_messages !== undefined ? data.chat_messages : existing.chat_messages,
    sandbox_id: data.sandbox_id !== undefined ? data.sandbox_id : existing.sandbox_id,
    updated_at: new Date().toISOString(),
  };

  projects[index] = updated;
  saveProjects(projects);
  return updated;
}

export function dbDeleteProject(id: string): boolean {
  const projects = loadProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length !== projects.length) {
    saveProjects(filtered);
    return true;
  }
  return false;
}
