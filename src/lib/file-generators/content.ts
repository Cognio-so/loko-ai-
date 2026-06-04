import { getAIResponse } from "@/lib/ai";
import {
  type FileIntent,
  type FileSection,
  type FileTable,
  type PresentationSlide,
  type SpreadsheetSheet,
  type StructuredFileContent,
} from "@/lib/file-generators/types";

type StructuredFileContentCandidate = Partial<{
  title: unknown;
  subtitle: unknown;
  summary: unknown;
  sections: unknown;
  tables: unknown;
  sheets: unknown;
  slides: unknown;
  plainText: unknown;
  theme: unknown;
}>;

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean);
}

function normalizeTable(value: unknown): FileTable | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const headers = toStringArray(record.headers);
  const rows = Array.isArray(record.rows)
    ? record.rows
        .filter((row): row is unknown[] => Array.isArray(row))
        .map((row) => row.map((cell) => String(cell ?? "")))
        .filter((row) => row.length > 0)
    : [];

  if (!headers.length || !rows.length) return null;

  return {
    title: typeof record.title === "string" && record.title.trim() ? record.title.trim() : "Table",
    headers,
    rows,
  };
}

function normalizeSection(value: unknown): FileSection | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const heading = typeof record.heading === "string" ? record.heading.trim() : "";
  if (!heading) return null;

  return {
    heading,
    paragraphs: toStringArray(record.paragraphs),
    bullets: toStringArray(record.bullets),
    table: normalizeTable(record.table) ?? undefined,
  };
}

function normalizeSheet(value: unknown): SpreadsheetSheet | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const headers = toStringArray(record.headers);
  const rows = Array.isArray(record.rows)
    ? record.rows
        .filter((row): row is unknown[] => Array.isArray(row))
        .map((row) => row.map((cell) => (typeof cell === "number" ? cell : String(cell ?? ""))))
        .filter((row) => row.length > 0)
    : [];

  if (!headers.length || !rows.length) return null;

  return {
    name: typeof record.name === "string" && record.name.trim() ? record.name.trim().slice(0, 31) : "Sheet",
    headers,
    rows,
  };
}

function normalizeSlide(value: unknown): PresentationSlide | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const title = typeof record.title === "string" ? record.title.trim() : "";
  if (!title) return null;
  const chartRecord = record.chart && typeof record.chart === "object" ? record.chart as Record<string, unknown> : null;
  const chartLabels = chartRecord ? toStringArray(chartRecord.labels) : [];
  const chartValues = chartRecord && Array.isArray(chartRecord.values)
    ? chartRecord.values
        .map((item) => (typeof item === "number" ? item : Number(item)))
        .filter((item) => Number.isFinite(item))
    : [];
  const layout = typeof record.layout === "string" && ["title", "section", "content", "two-column", "table", "chart", "image", "conclusion"].includes(record.layout)
    ? record.layout as PresentationSlide["layout"]
    : undefined;

  return {
    title,
    bullets: toStringArray(record.bullets),
    speakerNotes: typeof record.speakerNotes === "string" ? record.speakerNotes : undefined,
    visual: typeof record.visual === "string" ? record.visual.trim() : undefined,
    layout,
    table: normalizeTable(record.table) ?? undefined,
    chart: chartRecord && chartLabels.length && chartValues.length
      ? {
          title: typeof chartRecord.title === "string" && chartRecord.title.trim() ? chartRecord.title.trim() : title,
          labels: chartLabels.slice(0, 6),
          values: chartValues.slice(0, 6),
        }
      : undefined,
  };
}

function getRequestedSlideCount(prompt: string) {
  const explicit = /\b(\d{1,2})\s*[- ]?(slide|slides|page|pages)\b/i.exec(prompt);
  if (explicit) {
    const count = Number(explicit[1]);
    if (Number.isFinite(count)) return Math.min(30, Math.max(3, count));
  }
  return /\b(ppt|pptx|powerpoint|presentation|deck|slides)\b/i.test(prompt) ? 12 : undefined;
}

function fallbackContent(prompt: string, intent: FileIntent): StructuredFileContent {
  const title = intent.category === "general" ? "Generated File" : `${intent.category.replace(/\b\w/g, (c) => c.toUpperCase())}`;
  const generatedAt = new Date().toISOString();
  const slideCount = getRequestedSlideCount(prompt);
  const table: FileTable = {
    title: "Action Plan",
    headers: ["Area", "Recommendation", "Priority"],
    rows: [
      ["Overview", "Clarify the objective and audience.", "High"],
      ["Execution", "Break work into measurable milestones.", "High"],
      ["Review", "Track outcomes and improve the plan.", "Medium"],
    ],
  };

  return {
    title,
    subtitle: "Generated by LokoAI",
    summary: `Professional ${intent.category} created from: ${prompt}`,
    sections: [
      {
        heading: "Executive Summary",
        paragraphs: [`This file summarizes the requested ${intent.category} in a polished, practical format.`],
        bullets: ["Clear structure", "Professional formatting", "Ready to edit or share"],
      },
      {
        heading: "Key Details",
        paragraphs: ["Use this draft as a strong starting point and customize details for your exact audience."],
        bullets: ["Audience-focused content", "Actionable next steps", "Concise language"],
        table,
      },
    ],
    tables: [table],
    sheets: [
      {
        name: "Overview",
        headers: table.headers,
        rows: table.rows,
      },
    ],
    slides: [
      { title, layout: "title", bullets: ["Generated by LokoAI", "Professional structure", "Ready for review"] },
      { title: "Agenda", layout: "section", bullets: ["Overview", "Key details", "Next steps"] },
      { title: "Key Ideas", layout: "content", bullets: ["Clear structure", "Useful examples", "Audience-focused detail"] },
      { title: "Data Snapshot", layout: "chart", bullets: ["Compare key signals", "Highlight the strongest trend"], chart: { title: "Impact", labels: ["Adoption", "Quality", "Speed"], values: [82, 76, 88] } },
      { title: "Action Table", layout: "table", bullets: ["Prioritize high-value work"], table },
      { title: "Conclusion", layout: "conclusion", bullets: ["Review the draft", "Customize details", "Share with stakeholders"] },
    ],
    plainText: `${title}\n\n${prompt}\n\nGenerated by LokoAI.`,
    metadata: {
      requestedBy: prompt,
      generatedAt,
      category: intent.category,
      slideCount,
      theme: /\b(dark|black|night)\b/i.test(prompt) ? "dark" : "light",
    },
  };
}

function normalizeContent(candidate: StructuredFileContentCandidate, prompt: string, intent: FileIntent): StructuredFileContent {
  const fallback = fallbackContent(prompt, intent);
  const sections = Array.isArray(candidate.sections)
    ? candidate.sections.map(normalizeSection).filter((item): item is FileSection => Boolean(item))
    : [];
  const tables = Array.isArray(candidate.tables)
    ? candidate.tables.map(normalizeTable).filter((item): item is FileTable => Boolean(item))
    : [];
  const sheets = Array.isArray(candidate.sheets)
    ? candidate.sheets.map(normalizeSheet).filter((item): item is SpreadsheetSheet => Boolean(item))
    : [];
  const slides = Array.isArray(candidate.slides)
    ? candidate.slides.map(normalizeSlide).filter((item): item is PresentationSlide => Boolean(item))
    : [];

  return {
    title: typeof candidate.title === "string" && candidate.title.trim() ? candidate.title.trim() : fallback.title,
    subtitle: typeof candidate.subtitle === "string" && candidate.subtitle.trim() ? candidate.subtitle.trim() : fallback.subtitle,
    summary: typeof candidate.summary === "string" && candidate.summary.trim() ? candidate.summary.trim() : fallback.summary,
    sections: sections.length ? sections : fallback.sections,
    tables: tables.length ? tables : fallback.tables,
    sheets: sheets.length ? sheets : fallback.sheets,
    slides: slides.length ? slides : fallback.slides,
    plainText: typeof candidate.plainText === "string" && candidate.plainText.trim() ? candidate.plainText.trim() : fallback.plainText,
    metadata: {
      ...fallback.metadata,
      theme: candidate.theme === "dark" || /\b(dark|black|night)\b/i.test(prompt) ? "dark" : "light",
    },
  };
}

export async function generateStructuredFileContent(prompt: string, intent: FileIntent): Promise<StructuredFileContent> {
  const requestedSlideCount = getRequestedSlideCount(prompt);
  const presentationInstruction = intent.fileType === "pptx"
    ? `For PPTX presentations, create exactly ${requestedSlideCount ?? 12} slides in the slides array. Include:
- a title slide
- agenda/context slide
- professional content slides with concise bullets
- one table slide
- one chart slide with numeric values
- one image/visual concept slide
- a strong conclusion slide
Use layouts from: title, section, content, two-column, table, chart, image, conclusion. Add speakerNotes for every slide.`
    : "";

  const systemPrompt = `You create professional business file content. Return only valid JSON. No markdown fences.
Schema:
{
  "title": "string",
  "subtitle": "string",
  "summary": "string",
  "sections": [{"heading":"string","paragraphs":["string"],"bullets":["string"],"table":{"title":"string","headers":["string"],"rows":[["string"]]}}],
  "tables": [{"title":"string","headers":["string"],"rows":[["string"]]}],
  "sheets": [{"name":"string","headers":["string"],"rows":[["string or number"]]}],
  "slides": [{"title":"string","layout":"title|section|content|two-column|table|chart|image|conclusion","bullets":["string"],"speakerNotes":"string","visual":"string","table":{"title":"string","headers":["string"],"rows":[["string"]]},"chart":{"title":"string","labels":["string"],"values":[number]}}],
  "plainText": "string",
  "theme": "light|dark"
}
Create content suitable for ${intent.fileType?.toUpperCase()} files. For reports, business plans, marketing reports, resumes, and invoices, include realistic headings, useful tables, and actionable detail.
${presentationInstruction}`;

  try {
    const raw = await getAIResponse(systemPrompt, prompt, true);
    const parsed = JSON.parse(raw) as StructuredFileContentCandidate;
    return normalizeContent(parsed, prompt, intent);
  } catch (error) {
    console.warn("AI file content generation failed; using fallback content.", error);
    return fallbackContent(prompt, intent);
  }
}
