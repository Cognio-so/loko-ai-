import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { type StructuredFileContent } from "@/lib/file-generators/types";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const BODY_SIZE = 11;
const LINE_HEIGHT = 16;

function wrapText(text: string, maxChars = 88) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

export async function generatePdf(content: StructuredFileContent) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function ensureSpace(required = LINE_HEIGHT) {
    if (y - required > MARGIN) return;
    page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  }

  function drawLine(text: string, size = BODY_SIZE, isBold = false, color = rgb(0.15, 0.2, 0.3)) {
    ensureSpace(size + 8);
    page.drawText(text, {
      x: MARGIN,
      y,
      size,
      font: isBold ? bold : regular,
      color,
    });
    y -= size + 8;
  }

  drawLine(content.title, 24, true, rgb(0.02, 0.1, 0.22));
  drawLine(content.subtitle, 13, false, rgb(0.1, 0.45, 0.75));
  y -= 8;
  wrapText(content.summary).forEach((line) => drawLine(line));
  y -= 8;

  for (const section of content.sections) {
    drawLine(section.heading, 15, true, rgb(0.03, 0.25, 0.45));
    for (const paragraph of section.paragraphs) {
      wrapText(paragraph).forEach((line) => drawLine(line));
      y -= 3;
    }
    for (const bullet of section.bullets) {
      wrapText(`• ${bullet}`, 84).forEach((line) => drawLine(line));
    }
    const table = section.table;
    if (table) {
      y -= 6;
      drawLine(table.title, 12, true);
      drawLine(table.headers.join(" | "), 10, true, rgb(0.08, 0.32, 0.55));
      for (const row of table.rows.slice(0, 12)) {
        wrapText(row.join(" | "), 92).forEach((line) => drawLine(line, 9));
      }
    }
    y -= 12;
  }

  return Buffer.from(await pdf.save());
}
