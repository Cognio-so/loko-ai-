import { mkdir, readFile, stat, writeFile } from "fs/promises";
import { join, resolve } from "path";
import { type GeneratedFileType, SUPPORTED_FILE_TYPES } from "@/lib/file-generators/types";

const GENERATED_FILES_DIR = resolve(process.cwd(), "public", "generated-files");
const MAX_FILENAME_LENGTH = 96;

const MIME_TYPES: Record<GeneratedFileType, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  csv: "text/csv; charset=utf-8",
  txt: "text/plain; charset=utf-8",
  md: "text/markdown; charset=utf-8",
  json: "application/json; charset=utf-8",
};

export function sanitizeBaseFileName(value: string) {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9\s-_]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, MAX_FILENAME_LENGTH);

  return cleaned || "generated-file";
}

export function sanitizeGeneratedFileName(filename: string) {
  const basename = filename.replace(/\\/g, "/").split("/").pop() ?? "";
  const match = /^([a-z0-9][a-z0-9-_]{0,120})\.(pdf|docx|xlsx|pptx|csv|txt|md|json)$/i.exec(basename);
  if (!match) return null;
  const extension = match[2].toLowerCase() as GeneratedFileType;
  if (!SUPPORTED_FILE_TYPES.includes(extension)) return null;
  return `${match[1].toLowerCase()}.${extension}`;
}

export function getMimeType(fileType: GeneratedFileType) {
  return MIME_TYPES[fileType];
}

export async function saveGeneratedFile(params: {
  baseName: string;
  fileType: GeneratedFileType;
  data: Uint8Array | Buffer | string;
}) {
  await mkdir(GENERATED_FILES_DIR, { recursive: true });
  const safeBase = sanitizeBaseFileName(params.baseName);
  const date = new Date().toISOString().slice(0, 10);
  const unique = crypto.randomUUID().slice(0, 8);
  const fileName = `${safeBase}-${date}-${unique}.${params.fileType}`;
  const filePath = join(GENERATED_FILES_DIR, fileName);
  await writeFile(filePath, params.data);
  const fileStats = await stat(filePath);

  return {
    fileName,
    filePath,
    size: fileStats.size,
    downloadUrl: `/api/files/download/${encodeURIComponent(fileName)}`,
  };
}

export async function readGeneratedFile(filename: string) {
  const safeName = sanitizeGeneratedFileName(filename);
  if (!safeName) return null;

  const filePath = resolve(GENERATED_FILES_DIR, safeName);
  if (!filePath.startsWith(GENERATED_FILES_DIR)) return null;

  const extension = safeName.split(".").pop();
  if (!extension || !SUPPORTED_FILE_TYPES.includes(extension as GeneratedFileType)) return null;

  try {
    const data = await readFile(filePath);
    const fileStats = await stat(filePath);
    return {
      data,
      fileName: safeName,
      fileType: extension as GeneratedFileType,
      mimeType: getMimeType(extension as GeneratedFileType),
      size: fileStats.size,
    };
  } catch {
    return null;
  }
}
