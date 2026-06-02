import { type StructuredFileContent } from "@/lib/file-generators/types";

function escapeCsvCell(value: string | number) {
  const text = String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function generateCsv(content: StructuredFileContent) {
  const sheet = content.sheets[0] ?? {
    headers: content.tables[0]?.headers ?? ["Section", "Detail"],
    rows: content.tables[0]?.rows ?? content.sections.map((section) => [section.heading, section.paragraphs.join(" ")]),
  };
  const lines = [sheet.headers.map(escapeCsvCell).join(","), ...sheet.rows.map((row) => row.map(escapeCsvCell).join(","))];
  return Buffer.from(lines.join("\r\n"), "utf-8");
}

export function generateTxt(content: StructuredFileContent) {
  return Buffer.from(content.plainText, "utf-8");
}

export function generateMd(content: StructuredFileContent) {
  const lines = [`# ${content.title}`, "", `## ${content.subtitle}`, "", content.summary, ""];
  for (const section of content.sections) {
    lines.push(`## ${section.heading}`, "");
    section.paragraphs.forEach((paragraph) => lines.push(paragraph, ""));
    section.bullets.forEach((bullet) => lines.push(`- ${bullet}`));
    lines.push("");
  }
  return Buffer.from(lines.join("\n"), "utf-8");
}

export function generateJson(content: StructuredFileContent) {
  return Buffer.from(JSON.stringify(content, null, 2), "utf-8");
}
