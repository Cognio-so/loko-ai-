import { type FileIntent, type GeneratedFileType, SUPPORTED_FILE_TYPES } from "@/lib/file-generators/types";

const EXPLICIT_FILE_ACTION_PATTERN =
  /\b(download|export|save as|save into|give me (a|an)? file|file mein|file me|document mein|document me|pdf mein|pdf me|word file|excel file|ppt file|pptx file|csv file|json file|txt file|docx file|xlsx file|download karke do|download kar ke do|download do|as a file|as pdf|as docx|as xlsx|as pptx|as csv|as json|as txt)\b/i;

const WEBSITE_OR_APP_REQUEST_PATTERN =
  /\b(website|webpage|web page|landing page|landing|page|ui|ux|frontend|dashboard|app|desktop app|saas|component|react app|next app|html|css)\b/i;

const TYPE_PATTERNS: Array<{ type: GeneratedFileType; pattern: RegExp; category?: string }> = [
  { type: "pdf", pattern: /\b(pdf|pdf report|report pdf)\b/i },
  { type: "docx", pattern: /\b(word|docx|document|editable document|ms word)\b/i },
  { type: "xlsx", pattern: /\b(excel|xlsx|spreadsheet|sheet|sales sheet|workbook)\b/i },
  { type: "pptx", pattern: /\b(powerpoint|ppt|pptx|presentation|slides|deck)\b/i },
  { type: "csv", pattern: /\b(csv|comma separated)\b/i },
  { type: "json", pattern: /\b(json)\b/i },
  { type: "md", pattern: /\b(markdown|md)\b/i },
  { type: "txt", pattern: /\b(text file|txt|plain text)\b/i },
];

const CATEGORY_PATTERNS: Array<{ category: string; pattern: RegExp; defaultType: GeneratedFileType }> = [
  { category: "resume", pattern: /\b(resume|cv|curriculum vitae)\b/i, defaultType: "docx" },
  { category: "invoice", pattern: /\b(invoice|bill|billing)\b/i, defaultType: "pdf" },
  { category: "business plan", pattern: /\b(business plan|startup plan|business proposal)\b/i, defaultType: "pdf" },
  { category: "marketing report", pattern: /\b(marketing report|campaign report|market report)\b/i, defaultType: "pdf" },
  { category: "financial sheet", pattern: /\b(finance|financial|budget|sales|revenue|expense)\b/i, defaultType: "xlsx" },
  { category: "presentation", pattern: /\b(presentation|slides|deck|pitch deck)\b/i, defaultType: "pptx" },
  { category: "report", pattern: /\b(report|analysis|summary|research)\b/i, defaultType: "pdf" },
  { category: "document", pattern: /\b(document|proposal|letter|brief)\b/i, defaultType: "docx" },
];

export function detectFileIntent(prompt: string): FileIntent {
  const normalized = prompt.trim();
  if (!normalized || !EXPLICIT_FILE_ACTION_PATTERN.test(normalized)) {
    return { isFileRequest: false, fileType: null, category: "general" };
  }

  if (WEBSITE_OR_APP_REQUEST_PATTERN.test(normalized)) {
    return { isFileRequest: false, fileType: null, category: "general" };
  }

  const explicitType = TYPE_PATTERNS.find((item) => item.pattern.test(normalized));
  const categoryMatch = CATEGORY_PATTERNS.find((item) => item.pattern.test(normalized));
  const fileType = explicitType?.type ?? categoryMatch?.defaultType ?? null;

  if (!fileType || !SUPPORTED_FILE_TYPES.includes(fileType)) {
    return { isFileRequest: false, fileType: null, category: categoryMatch?.category ?? "general" };
  }

  return {
    isFileRequest: true,
    fileType,
    category: categoryMatch?.category ?? explicitType?.category ?? "professional file",
  };
}
