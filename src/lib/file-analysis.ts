import ExcelJS from "exceljs";
import JSZip from "jszip";

export type UploadedChatFile = {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

export type ProcessedChatFile = {
  fileSummary: string;
  extractedText: string;
  imageDataUrl?: string;
};

const MAX_EXTRACTED_CHARS = 24000;

function extensionFromName(name: string) {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

function dataUrlToBuffer(dataUrl: string) {
  const base64 = dataUrl.split(",")[1] ?? "";
  return Buffer.from(base64, "base64");
}

function cleanText(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_EXTRACTED_CHARS);
}

async function extractOfficeText(buffer: Buffer, extension: string) {
  const zip = await JSZip.loadAsync(buffer);
  const xmlPaths = Object.keys(zip.files).filter((path) => {
    if (extension === "docx") return path.startsWith("word/") && path.endsWith(".xml");
    if (extension === "pptx") return path.startsWith("ppt/slides/") && path.endsWith(".xml");
    return false;
  });

  const chunks: string[] = [];
  for (const path of xmlPaths.slice(0, 40)) {
    const file = zip.files[path];
    if (!file) continue;
    chunks.push(await file.async("text"));
  }

  return cleanText(chunks.join(" "));
}

async function extractZipInspection(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const entries = Object.values(zip.files).filter((file) => !file.dir);
  const list = entries.slice(0, 80).map((file) => `- ${file.name}`).join("\n");
  const textSamples: string[] = [];

  for (const file of entries.slice(0, 12)) {
    if (!/\.(txt|md|csv|json|html|css|js|ts|tsx|jsx)$/i.test(file.name)) continue;
    const text = await file.async("text");
    textSamples.push(`\n--- ${file.name} ---\n${text.slice(0, 2500)}`);
  }

  return cleanText(`ZIP contents:\n${list}\n\nReadable samples:\n${textSamples.join("\n")}`);
}

async function extractExcelText(buffer: Buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const chunks: string[] = [];

  workbook.worksheets.forEach((sheet) => {
    chunks.push(`Sheet: ${sheet.name}`);
    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 80) return;
      const values = row.values;
      const cells = Array.isArray(values) ? values.slice(1).map((cell) => String(cell ?? "")) : [];
      chunks.push(cells.join(" | "));
    });
  });

  return cleanText(chunks.join("\n"));
}

function extractPdfText(buffer: Buffer) {
  const raw = buffer.toString("latin1");
  const strings = Array.from(raw.matchAll(/\(([^()]{2,})\)/g))
    .map((match) => match[1])
    .filter((value) => /[a-zA-Z0-9]/.test(value))
    .join(" ");

  return cleanText(strings || "PDF text could not be extracted fully. Ask the model to reason from visible text if an image/PDF preview is available.");
}

export async function processUploadedChatFile(file: UploadedChatFile): Promise<ProcessedChatFile> {
  const extension = extensionFromName(file.name);
  const buffer = dataUrlToBuffer(file.dataUrl);
  const isImage = /^image\/(png|jpe?g|webp)$/i.test(file.type) || ["png", "jpg", "jpeg", "webp"].includes(extension);

  if (isImage) {
    return {
      fileSummary: `${file.name} (${file.type || "image"}, ${file.size} bytes)`,
      extractedText: "Image uploaded. Use vision to inspect the image, read visible text, and answer the user.",
      imageDataUrl: file.dataUrl,
    };
  }

  let extractedText = "";
  if (["txt", "csv", "json", "md"].includes(extension) || /^text\//i.test(file.type)) {
    extractedText = cleanText(buffer.toString("utf8"));
  } else if (extension === "xlsx") {
    extractedText = await extractExcelText(buffer);
  } else if (extension === "docx") {
    extractedText = await extractOfficeText(buffer, "docx");
  } else if (extension === "pptx") {
    extractedText = await extractOfficeText(buffer, "pptx");
  } else if (extension === "zip") {
    extractedText = await extractZipInspection(buffer);
  } else if (extension === "pdf" || file.type === "application/pdf") {
    extractedText = extractPdfText(buffer);
  } else {
    extractedText = cleanText(buffer.toString("utf8"));
  }

  return {
    fileSummary: `${file.name} (${file.type || extension || "file"}, ${file.size} bytes)`,
    extractedText: extractedText || "No readable text could be extracted from this file.",
  };
}
