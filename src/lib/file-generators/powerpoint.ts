import pptxgen from "pptxgenjs";
import { type PresentationSlide, type StructuredFileContent } from "@/lib/file-generators/types";

export async function generatePptx(content: StructuredFileContent) {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "LokoAI";
  pptx.subject = content.subtitle;
  pptx.title = content.title;

  const titleSlide = pptx.addSlide();
  titleSlide.background = { color: "F8FAFC" };
  titleSlide.addText(content.title, { x: 0.65, y: 1.5, w: 11.5, h: 0.8, fontSize: 36, bold: true, color: "0F172A" });
  titleSlide.addText(content.subtitle || content.summary, { x: 0.7, y: 2.35, w: 10.8, h: 0.5, fontSize: 16, color: "0369A1" });

  const agendaSlide = pptx.addSlide();
  agendaSlide.addText("Agenda", { x: 0.6, y: 0.55, w: 11, h: 0.5, fontSize: 28, bold: true, color: "0F172A" });
  agendaSlide.addText(content.sections.slice(0, 6).map((section) => section.heading).join("\n"), {
    x: 0.85,
    y: 1.35,
    w: 10.8,
    h: 4.6,
    fontSize: 18,
    breakLine: false,
    color: "334155",
    fit: "shrink",
  });

  const slides: PresentationSlide[] = content.slides.length
    ? content.slides
    : content.sections.map((section) => ({ title: section.heading, bullets: section.bullets }));
  for (const slideData of slides.slice(0, 8)) {
    const slide = pptx.addSlide();
    slide.addText(slideData.title, { x: 0.6, y: 0.5, w: 11.2, h: 0.5, fontSize: 26, bold: true, color: "0F172A" });
    slide.addText(slideData.bullets.slice(0, 7).map((bullet) => `• ${bullet}`).join("\n"), {
      x: 0.8,
      y: 1.25,
      w: 11,
      h: 4.8,
      fontSize: 17,
      color: "334155",
      fit: "shrink",
      breakLine: false,
    });
    if (slideData.speakerNotes) slide.addNotes(slideData.speakerNotes);
  }

  const summarySlide = pptx.addSlide();
  summarySlide.addText("Summary", { x: 0.6, y: 0.6, w: 11, h: 0.6, fontSize: 28, bold: true, color: "0F172A" });
  summarySlide.addText(content.summary, { x: 0.8, y: 1.45, w: 10.8, h: 2.6, fontSize: 18, color: "334155", fit: "shrink" });

  const data = await pptx.write({ outputType: "nodebuffer" });
  if (Buffer.isBuffer(data)) return data;
  if (typeof data === "string") return Buffer.from(data);
  if (data instanceof ArrayBuffer) return Buffer.from(data);
  if (data instanceof Uint8Array) return Buffer.from(data);
  return Buffer.from(await data.arrayBuffer());
}
