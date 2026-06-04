import pptxgen from "pptxgenjs";
import { type FileTable, type PresentationSlide, type StructuredFileContent } from "@/lib/file-generators/types";

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

type Theme = {
  bg: string;
  panel: string;
  text: string;
  muted: string;
  accent: string;
  accent2: string;
  line: string;
};

const THEMES: Record<"light" | "dark", Theme> = {
  light: {
    bg: "F8FAFC",
    panel: "FFFFFF",
    text: "0F172A",
    muted: "475569",
    accent: "2563EB",
    accent2: "F97316",
    line: "CBD5E1",
  },
  dark: {
    bg: "07111F",
    panel: "0F1B2D",
    text: "F8FAFC",
    muted: "CBD5E1",
    accent: "38BDF8",
    accent2: "FB923C",
    line: "334155",
  },
};

function addBrand(slide: pptxgen.Slide, theme: Theme, index: number) {
  slide.addShape(pptxgen.ShapeType.rect, {
    x: 0.45,
    y: 0.35,
    w: 0.32,
    h: 0.32,
    rectRadius: 0.06,
    fill: { color: theme.accent },
    line: { color: theme.accent },
  });
  slide.addText("LokoAI", {
    x: 0.86,
    y: 0.31,
    w: 1.2,
    h: 0.28,
    fontFace: "Aptos",
    fontSize: 9,
    bold: true,
    color: theme.muted,
    margin: 0,
  });
  slide.addText(String(index).padStart(2, "0"), {
    x: 12.35,
    y: 6.95,
    w: 0.45,
    h: 0.18,
    fontFace: "Aptos",
    fontSize: 8,
    color: theme.muted,
    align: "right",
    margin: 0,
  });
}

function addTitle(slide: pptxgen.Slide, title: string, theme: Theme, y = 0.72) {
  slide.addText(title, {
    x: 0.7,
    y,
    w: 11.7,
    h: 0.72,
    fontFace: "Aptos Display",
    fontSize: 27,
    bold: true,
    color: theme.text,
    fit: "shrink",
    margin: 0,
    breakLine: false,
  });
  slide.addShape(pptxgen.ShapeType.line, {
    x: 0.7,
    y: y + 0.82,
    w: 1.35,
    h: 0,
    line: { color: theme.accent, width: 2.2 },
  });
}

function addBullets(slide: pptxgen.Slide, bullets: string[], theme: Theme, x: number, y: number, w: number, h: number, size = 16) {
  const lines = bullets.slice(0, 6).map((bullet) => `- ${bullet}`).join("\n");
  slide.addText(lines || "- Key point\n- Supporting insight\n- Next action", {
    x,
    y,
    w,
    h,
    fontFace: "Aptos",
    fontSize: size,
    color: theme.muted,
    breakLine: false,
    fit: "shrink",
    valign: "top",
    paraSpaceAfterPt: 8,
    margin: 0.02,
  });
}

function addVisualPanel(slide: pptxgen.Slide, theme: Theme, label: string) {
  slide.addShape(pptxgen.ShapeType.roundRect, {
    x: 8.05,
    y: 1.62,
    w: 4.35,
    h: 4.75,
    rectRadius: 0.14,
    fill: { color: theme.panel },
    line: { color: theme.line, transparency: 20 },
    shadow: { type: "outer", color: "0F172A", opacity: 0.12, blur: 1, angle: 45, distance: 1 },
  });
  slide.addShape(pptxgen.ShapeType.rect, {
    x: 8.38,
    y: 2.02,
    w: 3.7,
    h: 2.15,
    fill: { color: theme.accent, transparency: 86 },
    line: { color: theme.accent, transparency: 35 },
  });
  slide.addText(label || "Visual concept", {
    x: 8.42,
    y: 4.48,
    w: 3.55,
    h: 0.85,
    fontFace: "Aptos",
    fontSize: 14,
    bold: true,
    color: theme.text,
    fit: "shrink",
    margin: 0.04,
  });
  slide.addText("Image-ready placeholder", {
    x: 8.42,
    y: 5.42,
    w: 3.55,
    h: 0.25,
    fontFace: "Aptos",
    fontSize: 9,
    color: theme.muted,
    margin: 0,
  });
}

function normalizeTable(table: FileTable | undefined, fallbackTitle: string): FileTable {
  if (table?.headers.length && table.rows.length) return table;
  return {
    title: fallbackTitle,
    headers: ["Area", "Signal", "Priority"],
    rows: [
      ["Strategy", "Clear audience and goal", "High"],
      ["Execution", "Modern structure and visuals", "High"],
      ["Follow-up", "Measure impact", "Medium"],
    ],
  };
}

function addTableSlide(slide: pptxgen.Slide, data: PresentationSlide, theme: Theme) {
  addTitle(slide, data.title, theme);
  const table = normalizeTable(data.table, data.title);
  slide.addText(table.title, {
    x: 0.75,
    y: 1.68,
    w: 11.7,
    h: 0.3,
    fontFace: "Aptos",
    fontSize: 14,
    bold: true,
    color: theme.text,
    margin: 0,
  });
  slide.addTable([table.headers, ...table.rows.slice(0, 6)], {
    x: 0.75,
    y: 2.12,
    w: 11.85,
    h: 3.75,
    border: { color: theme.line, pt: 0.7 },
    fill: { color: theme.panel },
    color: theme.text,
    fontFace: "Aptos",
    fontSize: 12,
    margin: 0.08,
    valign: "mid",
    fit: "shrink",
    autoFit: true,
    rowH: 0.48,
  });
}

function addChartSlide(slide: pptxgen.Slide, data: PresentationSlide, theme: Theme) {
  addTitle(slide, data.title, theme);
  const chart = data.chart ?? {
    title: "Impact snapshot",
    labels: ["Awareness", "Adoption", "Efficiency", "Quality"],
    values: [70, 82, 88, 76],
  };
  slide.addText(chart.title, {
    x: 0.8,
    y: 1.65,
    w: 4.8,
    h: 0.3,
    fontFace: "Aptos",
    fontSize: 14,
    bold: true,
    color: theme.text,
    margin: 0,
  });
  const max = Math.max(...chart.values, 1);
  chart.labels.slice(0, 6).forEach((label, index) => {
    const value = chart.values[index] ?? 0;
    const y = 2.15 + index * 0.55;
    slide.addText(label, { x: 0.82, y, w: 2.3, h: 0.22, fontSize: 10, color: theme.muted, margin: 0 });
    slide.addShape(pptxgen.ShapeType.rect, {
      x: 3.2,
      y: y + 0.03,
      w: 7.4,
      h: 0.22,
      fill: { color: theme.line, transparency: 62 },
      line: { color: theme.line, transparency: 100 },
    });
    slide.addShape(pptxgen.ShapeType.rect, {
      x: 3.2,
      y: y + 0.03,
      w: Math.max(0.2, (value / max) * 7.4),
      h: 0.22,
      fill: { color: index % 2 ? theme.accent2 : theme.accent },
      line: { color: index % 2 ? theme.accent2 : theme.accent },
    });
    slide.addText(String(value), { x: 10.85, y, w: 0.55, h: 0.22, fontSize: 10, bold: true, color: theme.text, margin: 0 });
  });
  addBullets(slide, data.bullets, theme, 0.85, 5.68, 10.7, 0.78, 11);
}

function addContentSlide(slide: pptxgen.Slide, data: PresentationSlide, theme: Theme) {
  addTitle(slide, data.title, theme);
  const isTwoColumn = data.layout === "two-column" || data.layout === "image";
  addBullets(slide, data.bullets, theme, 0.82, 1.75, isTwoColumn ? 6.55 : 11.15, 4.75);
  if (isTwoColumn) addVisualPanel(slide, theme, data.visual || data.title);
}

function addCover(slide: pptxgen.Slide, content: StructuredFileContent, theme: Theme) {
  slide.addShape(pptxgen.ShapeType.rect, {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: SLIDE_H,
    fill: { color: theme.accent, transparency: 92 },
    line: { color: theme.accent, transparency: 100 },
  });
  slide.addShape(pptxgen.ShapeType.rect, {
    x: 0,
    y: 6.52,
    w: SLIDE_W,
    h: 0.98,
    fill: { color: theme.accent },
    line: { color: theme.accent },
  });
  slide.addText(content.title, {
    x: 0.72,
    y: 1.65,
    w: 11.45,
    h: 1.35,
    fontFace: "Aptos Display",
    fontSize: 38,
    bold: true,
    color: theme.text,
    fit: "shrink",
    margin: 0,
  });
  slide.addText(content.subtitle || content.summary, {
    x: 0.78,
    y: 3.2,
    w: 9.95,
    h: 0.65,
    fontFace: "Aptos",
    fontSize: 16,
    color: theme.muted,
    fit: "shrink",
    margin: 0,
  });
  slide.addText("AI-generated presentation", {
    x: 0.8,
    y: 6.82,
    w: 4.5,
    h: 0.25,
    fontFace: "Aptos",
    fontSize: 11,
    bold: true,
    color: "FFFFFF",
    margin: 0,
  });
}

function addConclusion(slide: pptxgen.Slide, data: PresentationSlide, content: StructuredFileContent, theme: Theme) {
  addTitle(slide, data.title || "Conclusion", theme, 0.82);
  addBullets(slide, data.bullets.length ? data.bullets : [content.summary], theme, 0.9, 1.95, 7.2, 3.4, 18);
  slide.addShape(pptxgen.ShapeType.roundRect, {
    x: 8.6,
    y: 1.86,
    w: 3.55,
    h: 3.55,
    rectRadius: 0.18,
    fill: { color: theme.accent, transparency: 12 },
    line: { color: theme.accent, transparency: 20 },
  });
  slide.addText("Next step", {
    x: 9.02,
    y: 2.65,
    w: 2.7,
    h: 0.34,
    fontSize: 15,
    color: "FFFFFF",
    bold: true,
    align: "center",
    margin: 0,
  });
  slide.addText("Review, customize, and present with confidence.", {
    x: 9.02,
    y: 3.13,
    w: 2.7,
    h: 0.9,
    fontSize: 18,
    color: "FFFFFF",
    bold: true,
    align: "center",
    fit: "shrink",
    margin: 0.04,
  });
}

function buildSlideList(content: StructuredFileContent) {
  const target = content.metadata.slideCount ?? 12;
  const source = content.slides.length ? content.slides : content.sections.map((section) => ({
    title: section.heading,
    bullets: section.bullets.length ? section.bullets : section.paragraphs,
    table: section.table,
  }));
  const slides = [...source];
  while (slides.length < target) {
    slides.push({
      title: slides.length === target - 1 ? "Conclusion" : `Key Insight ${slides.length + 1}`,
      layout: slides.length === target - 1 ? "conclusion" : "content",
      bullets: ["Audience-focused insight", "Practical example", "Actionable takeaway"],
    });
  }
  return slides.slice(0, target).map((slide, index) => ({
    ...slide,
    layout: index === 0 ? "title" : index === target - 1 ? "conclusion" : slide.layout ?? "content",
  }));
}

export async function generatePptx(content: StructuredFileContent) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "LokoAI";
  pptx.company = "LokoAI";
  pptx.subject = content.subtitle;
  pptx.title = content.title;
  pptx.lang = "en-US";
  pptx.theme = {
    headFontFace: "Aptos Display",
    bodyFontFace: "Aptos",
    lang: "en-US",
  };

  const theme = THEMES[content.metadata.theme ?? "light"];
  const slides = buildSlideList(content);

  slides.forEach((slideData, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: theme.bg };
    slide.color = theme.text;

    if (slideData.layout === "title") {
      addCover(slide, content, theme);
    } else if (slideData.layout === "table") {
      addTableSlide(slide, slideData, theme);
    } else if (slideData.layout === "chart") {
      addChartSlide(slide, slideData, theme);
    } else if (slideData.layout === "conclusion") {
      addConclusion(slide, slideData, content, theme);
    } else {
      addContentSlide(slide, slideData, theme);
    }

    addBrand(slide, theme, index + 1);
    if (slideData.speakerNotes) slide.addNotes(slideData.speakerNotes);
  });

  const data = await pptx.write({ outputType: "nodebuffer" });
  if (Buffer.isBuffer(data)) return data;
  if (typeof data === "string") return Buffer.from(data);
  if (data instanceof ArrayBuffer) return Buffer.from(data);
  if (data instanceof Uint8Array) return Buffer.from(data);
  return Buffer.from(await data.arrayBuffer());
}
