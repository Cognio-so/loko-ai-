import { generateStructuredFileContent } from "@/lib/file-generators/content";
import { detectFileIntent } from "@/lib/file-generators/detector";
import { generateDocx } from "@/lib/file-generators/docx";
import { generateXlsx } from "@/lib/file-generators/excel";
import { generatePdf } from "@/lib/file-generators/pdf";
import { generatePptx } from "@/lib/file-generators/powerpoint";
import { generateCsv, generateJson, generateMd, generateTxt } from "@/lib/file-generators/text";
import { type GeneratedFileType, type StoredGeneratedFile, type StructuredFileContent } from "@/lib/file-generators/types";
import { saveGeneratedFile } from "@/lib/storage/generated-files";
import { supabaseCreatePresentation } from "@/lib/supabase/presentations";

async function renderFile(fileType: GeneratedFileType, content: StructuredFileContent) {
  switch (fileType) {
    case "pdf":
      return generatePdf(content);
    case "docx":
      return generateDocx(content);
    case "xlsx":
      return generateXlsx(content);
    case "pptx":
      return generatePptx(content);
    case "csv":
      return generateCsv(content);
    case "txt":
      return generateTxt(content);
    case "md":
      return generateMd(content);
    case "json":
      return generateJson(content);
  }
}

export function getFileIntent(prompt: string) {
  return detectFileIntent(prompt);
}

export async function createGeneratedFileFromPrompt(prompt: string): Promise<StoredGeneratedFile | null> {
  const intent = detectFileIntent(prompt);
  if (!intent.isFileRequest || !intent.fileType) return null;

  const content = await generateStructuredFileContent(prompt, intent);
  const data = await renderFile(intent.fileType, content);
  const stored = await saveGeneratedFile({
    baseName: content.title || intent.category,
    fileType: intent.fileType,
    data,
  });
  const presentation = intent.fileType === "pptx"
    ? await supabaseCreatePresentation({
        title: content.title,
        prompt,
        file_name: stored.fileName,
        file_url: stored.downloadUrl,
        file_size: stored.size,
        slide_count: content.metadata.slideCount ?? content.slides.length,
        theme: content.metadata.theme ?? "light",
      }).catch((error) => {
        console.warn("Presentation history save failed:", error);
        return null;
      })
    : null;

  return {
    success: true,
    fileType: intent.fileType,
    fileName: stored.fileName,
    downloadUrl: stored.downloadUrl,
    title: content.title,
    size: stored.size,
    presentationId: presentation?.id,
  };
}

export function createFileMessage(file: StoredGeneratedFile) {
  return [
    `Done. I created **${file.title}** as a ${file.fileType.toUpperCase()} file.`,
    "",
    `<loko-file>${JSON.stringify(file)}</loko-file>`,
  ].join("\n");
}
