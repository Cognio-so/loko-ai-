const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");

const pptx = new pptxgen();
pptx.layout = "LAYOUT_WIDE";
pptx.author = "LokoAI";
pptx.company = "LokoAI";
pptx.subject = "Investor pitch deck";
pptx.title = "LokoAI Investor Pitch Deck";
pptx.lang = "en-US";
pptx.theme = {
  headFontFace: "Aptos Display",
  bodyFontFace: "Aptos",
  lang: "en-US",
};

const W = 13.333;
const H = 7.5;
const C = {
  ink: "111827",
  muted: "4B5563",
  pale: "F7F9FC",
  panel: "FFFFFF",
  line: "D7DEE8",
  blue: "1E5BFF",
  cyan: "16B8C7",
  green: "10A37F",
  amber: "F59E0B",
  red: "E11D48",
  navy: "0B1220",
  slate: "64748B",
};

const sources = [
  "Gartner, May 2026: worldwide AI spending forecast $2.59T in 2026; AI software $453.2B in 2026 and $638.4B in 2027.",
  "Gartner, Mar 2025: worldwide GenAI spending forecast $643.9B in 2025; GenAI software $37.2B.",
  "McKinsey State of AI 2025: 88% of organizations use AI in at least one business function; 23% scaling agentic AI; 39% experimenting.",
  "Stack Overflow Developer Survey 2025: 84% use or plan to use AI tools; 46% distrust AI output accuracy; 52% report productivity lift.",
  "TechCrunch, Dec 2025: Lovable raised $330M at $6.6B valuation; surpassed $200M ARR; 25M projects in first year.",
];

const sourceLinks = [
  "https://www.gartner.com/en/newsroom/press-releases/2026-05-19-gartner-forecasts-worldwide-ai-spending-to-grow-47-percent-in-2026",
  "https://www.gartner.com/en/newsroom/press-releases/2025-03-31-gartner-forecasts-worldwide-genai-spending-to-reach-644-billion-in-2025",
  "https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai",
  "https://survey.stackoverflow.co/2025/ai",
  "https://techcrunch.com/2025/12/18/vibe-coding-startup-lovable-raises-330m-at-a-6-6b-valuation/",
];

function addFooter(slide, num, source) {
  slide.addText("LokoAI confidential", {
    x: 0.52,
    y: 7.08,
    w: 2.2,
    h: 0.18,
    fontSize: 7,
    color: C.slate,
    margin: 0,
  });
  slide.addText(String(num).padStart(2, "0"), {
    x: 12.25,
    y: 7.05,
    w: 0.7,
    h: 0.22,
    fontSize: 8,
    bold: true,
    color: C.slate,
    align: "right",
    margin: 0,
  });
  if (source) {
    slide.addText(`Source: ${source}`, {
      x: 3.0,
      y: 7.05,
      w: 6.8,
      h: 0.18,
      fontSize: 6.7,
      color: "7A8494",
      align: "center",
      margin: 0,
      fit: "shrink",
    });
  }
}

function addBrand(slide, dark = false) {
  const color = dark ? "FFFFFF" : C.ink;
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.52,
    y: 0.38,
    w: 0.22,
    h: 0.22,
    fill: { color: C.blue },
    line: { color: C.blue },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: 0.78,
    y: 0.38,
    w: 0.22,
    h: 0.22,
    fill: { color: C.cyan },
    line: { color: C.cyan },
  });
  slide.addText("LokoAI", {
    x: 1.08,
    y: 0.34,
    w: 1.2,
    h: 0.25,
    fontSize: 10,
    bold: true,
    color,
    margin: 0,
  });
}

function title(slide, text, kicker) {
  if (kicker) {
    slide.addText(kicker.toUpperCase(), {
      x: 0.72,
      y: 0.78,
      w: 2.9,
      h: 0.18,
      fontSize: 7.5,
      bold: true,
      color: C.blue,
      charSpace: 1.2,
      margin: 0,
    });
  }
  slide.addText(text, {
    x: 0.72,
    y: 1.02,
    w: 11.8,
    h: 0.58,
    fontFace: "Aptos Display",
    fontSize: 25,
    bold: true,
    color: C.ink,
    fit: "shrink",
    margin: 0,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: 0.72,
    y: 1.72,
    w: 1.25,
    h: 0,
    line: { color: C.blue, width: 2 },
  });
}

function note(slide, text) {
  slide.addNotes(text);
}

function newSlide(num, heading, kicker, source) {
  const slide = pptx.addSlide();
  slide.background = { color: C.pale };
  addBrand(slide);
  title(slide, heading, kicker);
  addFooter(slide, num, source);
  return slide;
}

function statCard(slide, x, y, w, h, value, label, color = C.blue) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: C.panel },
    line: { color: C.line, transparency: 20 },
  });
  slide.addText(value, {
    x: x + 0.22,
    y: y + 0.22,
    w: w - 0.44,
    h: 0.52,
    fontSize: 26,
    bold: true,
    color,
    fit: "shrink",
    margin: 0,
  });
  slide.addText(label, {
    x: x + 0.22,
    y: y + 0.9,
    w: w - 0.44,
    h: h - 1.0,
    fontSize: 10.5,
    color: C.muted,
    fit: "shrink",
    margin: 0,
  });
}

function bulletList(slide, items, x, y, w, h, fontSize = 13) {
  slide.addText(items.map((d) => ({ text: d, options: { bullet: { indent: 12 }, hanging: 4 } })), {
    x,
    y,
    w,
    h,
    fontSize,
    color: C.muted,
    breakLine: false,
    fit: "shrink",
    paraSpaceAfter: 8,
    margin: 0.02,
    valign: "top",
  });
}

function addTable(slide, rows, x, y, w, h, colW) {
  const table = rows.map((row, r) => row.map((text) => ({
    text,
    options: {
      bold: r === 0,
      color: r === 0 ? "FFFFFF" : C.ink,
      fill: { color: r === 0 ? C.navy : r % 2 === 0 ? "F3F6FA" : "FFFFFF" },
      margin: 0.07,
      fontSize: r === 0 ? 8.5 : 8,
      valign: "mid",
      fit: "shrink",
    },
  })));
  slide.addTable(table, {
    x, y, w, h,
    colW,
    border: { type: "solid", color: C.line, pt: 0.55 },
    margin: 0.06,
  });
}

function barChart(slide, data, x, y, w, h, opts = {}) {
  const max = opts.max || Math.max(...data.map((d) => d.value));
  const labelW = opts.labelW || 2.45;
  const barW = w - labelW - 0.75;
  const gap = h / data.length;
  data.forEach((d, i) => {
    const yy = y + i * gap + 0.08;
    slide.addText(d.label, {
      x,
      y: yy,
      w: labelW,
      h: 0.28,
      fontSize: opts.fontSize || 8.5,
      bold: d.bold,
      color: C.muted,
      margin: 0,
      fit: "shrink",
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: x + labelW,
      y: yy + 0.05,
      w: barW,
      h: 0.19,
      fill: { color: "E7ECF3" },
      line: { color: "E7ECF3" },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: x + labelW,
      y: yy + 0.05,
      w: Math.max(0.08, (d.value / max) * barW),
      h: 0.19,
      fill: { color: d.color || C.blue },
      line: { color: d.color || C.blue },
    });
    slide.addText(d.suffix ? `${d.value}${d.suffix}` : String(d.value), {
      x: x + labelW + barW + 0.1,
      y: yy,
      w: 0.75,
      h: 0.22,
      fontSize: 8,
      bold: true,
      color: C.ink,
      margin: 0,
    });
  });
}

function miniColumnChart(slide, data, x, y, w, h, max, color = C.blue) {
  const gap = w / data.length;
  data.forEach((d, i) => {
    const bh = (d.value / max) * h;
    const bx = x + i * gap + 0.1;
    slide.addShape(pptx.ShapeType.rect, {
      x: bx,
      y: y + h - bh,
      w: gap - 0.2,
      h: bh,
      fill: { color: d.color || color },
      line: { color: d.color || color },
    });
    slide.addText(d.label, { x: bx - 0.05, y: y + h + 0.1, w: gap, h: 0.18, fontSize: 7, color: C.muted, align: "center", margin: 0 });
    slide.addText(d.display || `${d.value}`, { x: bx - 0.05, y: y + h - bh - 0.28, w: gap, h: 0.18, fontSize: 7, bold: true, color: C.ink, align: "center", margin: 0 });
  });
}

function sectionBox(slide, x, y, w, h, heading, body, color = C.blue) {
  slide.addShape(pptx.ShapeType.rect, {
    x, y, w, h,
    fill: { color: C.panel },
    line: { color: C.line, transparency: 20 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x,
    y,
    w: 0.08,
    h,
    fill: { color },
    line: { color },
  });
  slide.addText(heading, {
    x: x + 0.25,
    y: y + 0.18,
    w: w - 0.4,
    h: 0.28,
    fontSize: 11.5,
    bold: true,
    color: C.ink,
    margin: 0,
  });
  slide.addText(body, {
    x: x + 0.25,
    y: y + 0.58,
    w: w - 0.4,
    h: h - 0.7,
    fontSize: 8.7,
    color: C.muted,
    fit: "shrink",
    margin: 0,
    breakLine: false,
  });
}

function axisLabel(slide, text, x, y, w) {
  slide.addText(text, { x, y, w, h: 0.18, fontSize: 7, color: C.slate, align: "center", margin: 0 });
}

function cover() {
  const slide = pptx.addSlide();
  slide.background = { color: C.navy };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: W, h: H, fill: { color: C.navy }, line: { color: C.navy } });
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 4.6, h: H, fill: { color: "101B31" }, line: { color: "101B31" } });
  slide.addShape(pptx.ShapeType.arc, { x: 7.8, y: -1.0, w: 5.8, h: 5.8, adjustPoint: 0.26, line: { color: C.blue, width: 2, transparency: 15 } });
  slide.addShape(pptx.ShapeType.arc, { x: 8.55, y: -0.25, w: 4.3, h: 4.3, adjustPoint: 0.25, line: { color: C.cyan, width: 1.4, transparency: 20 } });
  addBrand(slide, true);
  slide.addText("Investor Pitch Deck", { x: 0.72, y: 1.38, w: 3, h: 0.22, fontSize: 9, bold: true, color: "8EA3C7", margin: 0 });
  slide.addText("LokoAI", { x: 0.72, y: 1.9, w: 5.4, h: 0.82, fontSize: 42, bold: true, color: "FFFFFF", margin: 0 });
  slide.addText("AI operating system for building, shipping, and governing software from natural language.", {
    x: 0.78,
    y: 2.95,
    w: 6.4,
    h: 0.68,
    fontSize: 17,
    color: "C9D5EA",
    fit: "shrink",
    margin: 0,
  });
  statCard(slide, 0.78, 4.5, 2.3, 1.22, "$2.59T", "Gartner forecast for worldwide AI spending in 2026", C.cyan);
  statCard(slide, 3.32, 4.5, 2.3, 1.22, "88%", "Organizations using AI in at least one business function", C.green);
  statCard(slide, 5.86, 4.5, 2.3, 1.22, "84%", "Developers using or planning to use AI tools", C.amber);
  slide.addText("June 2026 | Confidential", { x: 0.78, y: 6.78, w: 3.2, h: 0.22, fontSize: 9, color: "90A0BD", margin: 0 });
  addFooter(slide, 1, "Gartner, McKinsey, Stack Overflow");
  note(slide, "Open by framing LokoAI as a focused infrastructure and workflow company, not another generic chatbot. The headline is that AI spend and adoption are now massive, but enterprises and creators still need a trusted way to turn prompts into production-grade software outcomes.");
}

cover();

{
  const slide = newSlide(2, "Investment thesis: the AI software factory will be rebuilt around agents", "Executive narrative", "Gartner, McKinsey, Stack Overflow, TechCrunch");
  statCard(slide, 0.82, 2.0, 2.55, 1.45, "$453B", "AI software spending forecast in 2026", C.blue);
  statCard(slide, 3.65, 2.0, 2.55, 1.45, "62%", "Organizations scaling or experimenting with agents", C.cyan);
  statCard(slide, 6.48, 2.0, 2.55, 1.45, "46%", "Developers distrust AI output accuracy", C.red);
  statCard(slide, 9.31, 2.0, 2.55, 1.45, "$200M+", "ARR reported by Lovable after rapid category expansion", C.green);
  sectionBox(slide, 0.82, 4.25, 3.75, 1.35, "Why now", "AI adoption has crossed the mainstream threshold; the bottleneck has moved from model access to workflow reliability, governance, and deployment.", C.blue);
  sectionBox(slide, 4.82, 4.25, 3.75, 1.35, "Why LokoAI", "A prompt-to-product workspace that combines agentic generation, code execution, memory, review, and launch workflows in one accountable system.", C.cyan);
  sectionBox(slide, 8.82, 4.25, 3.75, 1.35, "Why venture-scale", "Vibe coding, AI app builders, and agent workspaces are compressing software labor across founders, agencies, SMBs, and enterprise innovation teams.", C.green);
  note(slide, "Use this slide to establish the overall investment logic. The market has scale, the pain is acute, and recent competitor growth validates demand. LokoAI's wedge is reliability and production readiness for teams that need more than a demo.");
}

{
  const slide = newSlide(3, "Problem statement: AI can draft code, but teams still cannot trust the path to production", "Problem", "Stack Overflow Developer Survey 2025; Gartner");
  sectionBox(slide, 0.82, 2.05, 3.8, 1.35, "Fragmented workflow", "Prompting, coding, previewing, testing, file generation, deployment, and support are split across disconnected tools.", C.blue);
  sectionBox(slide, 4.88, 2.05, 3.8, 1.35, "Low trust", "Stack Overflow found more developers distrust AI output accuracy than trust it, creating review drag and adoption hesitation.", C.red);
  sectionBox(slide, 8.94, 2.05, 3.8, 1.35, "Pilot purgatory", "McKinsey reports broad adoption but only about one-third of companies have begun to scale AI programs.", C.amber);
  bulletList(slide, [
    "Non-technical builders get prototypes but struggle with auth, data, payments, security, and maintainability.",
    "Technical teams gain speed in small tasks but lose time debugging opaque agent decisions.",
    "Enterprises need compliance, observability, and governance before agent-generated work can scale.",
    "Current builders optimize for first draft speed; customers increasingly need launch-ready systems."
  ], 1.0, 4.15, 10.9, 1.42, 12.5);
  note(slide, "The problem is not that AI cannot generate. The problem is that AI generation is often unaccountable. Position LokoAI as solving the gap between first draft and production confidence.");
}

{
  const slide = newSlide(4, "Market opportunity: AI software and application development platforms are expanding rapidly", "Market", "Gartner AI Spending Forecast, May 2026");
  miniColumnChart(slide, [
    { label: "2025", value: 282.9, display: "$283B" },
    { label: "2026", value: 453.2, display: "$453B", color: C.cyan },
    { label: "2027", value: 638.4, display: "$638B", color: C.green },
  ], 0.92, 2.35, 4.3, 2.75, 700, C.blue);
  slide.addText("AI software spending forecast", { x: 1.05, y: 1.95, w: 3.5, h: 0.25, fontSize: 11, bold: true, color: C.ink, margin: 0 });
  barChart(slide, [
    { label: "AI Infrastructure", value: 1431.5, suffix: "B", color: C.navy },
    { label: "AI Services", value: 585.5, suffix: "B", color: C.blue },
    { label: "AI Software", value: 453.2, suffix: "B", color: C.cyan, bold: true },
    { label: "AI Cybersecurity", value: 51.3, suffix: "B", color: C.amber },
    { label: "AI Models", value: 32.6, suffix: "B", color: C.green },
    { label: "AI App Dev Platforms", value: 8.4, suffix: "B", color: C.red },
  ], 6.0, 2.05, 6.0, 3.2, { max: 1500, labelW: 2.1, fontSize: 8 });
  sectionBox(slide, 0.95, 5.75, 11.6, 0.7, "LokoAI market entry", "Wedge into AI application development platforms; expand into AI software workflow, governance, deployment, and managed agent services.", C.blue);
  note(slide, "Walk investors through the hierarchy. Infrastructure is huge, but application-layer software is where workflows and margins sit. LokoAI starts in the app-development wedge and expands into the broader AI software stack.");
}

{
  const slide = newSlide(5, "Industry research: adoption is widespread, but scaled agent impact is still early", "Industry research", "McKinsey State of AI 2025; Stack Overflow 2025");
  statCard(slide, 0.85, 2.05, 2.55, 1.32, "88%", "Organizations regularly using AI in at least one business function", C.blue);
  statCard(slide, 3.72, 2.05, 2.55, 1.32, "23%", "Organizations scaling agentic AI somewhere in the enterprise", C.cyan);
  statCard(slide, 6.59, 2.05, 2.55, 1.32, "39%", "Organizations experimenting with AI agents", C.amber);
  statCard(slide, 9.46, 2.05, 2.55, 1.32, "52%", "Developers reporting AI or agents improved productivity", C.green);
  slide.addText("Adoption curve implication", { x: 0.9, y: 4.25, w: 3.2, h: 0.25, fontSize: 12, bold: true, color: C.ink, margin: 0 });
  barChart(slide, [
    { label: "Use AI in any function", value: 88, suffix: "%", color: C.blue },
    { label: "Experimenting with agents", value: 39, suffix: "%", color: C.amber },
    { label: "Scaling agents", value: 23, suffix: "%", color: C.cyan },
    { label: "Developer productivity lift", value: 52, suffix: "%", color: C.green },
    { label: "Distrust AI accuracy", value: 46, suffix: "%", color: C.red },
  ], 4.1, 4.1, 7.8, 1.6, { max: 100, labelW: 2.4 });
  note(slide, "This slide shows why a trust-centered platform can win. The market is past awareness but not yet past operational maturity. LokoAI should sell outcomes around governance, memory, repeatability, and measurable delivery.");
}

{
  const slide = newSlide(6, "Competitor analysis: crowded first-draft market, white space in governed production workflows", "Competition", "Public competitor pricing and TechCrunch reporting");
  addTable(slide, [
    ["Company", "Primary wedge", "Strength", "Gap LokoAI targets"],
    ["Lovable", "Prompt-to-app builder", "Fast full-stack prototyping and viral adoption", "Governance, review depth, enterprise operating model"],
    ["Bolt.new", "Browser-based app generation", "Rapid web app scaffolding", "Persistent memory, production controls, business workflows"],
    ["v0", "UI generation / React", "High-quality frontend components", "End-to-end product delivery beyond UI"],
    ["Replit Agent", "Cloud IDE + agent", "Executable projects and hosting", "Non-technical UX, team governance, artifact generation"],
    ["Cursor", "AI IDE", "Developer-native productivity", "Founder/ops personas and no-code launch path"],
    ["Devin-style agents", "Autonomous SWE tasks", "Deep software task execution", "Accessible SMB/product-team packaging"],
  ], 0.78, 2.05, 11.85, 3.9, [1.35, 2.0, 2.75, 5.1]);
  slide.addText("Positioning: LokoAI combines app-builder speed, IDE accountability, and enterprise workflow governance.", {
    x: 1.0,
    y: 6.25,
    w: 11.1,
    h: 0.32,
    fontSize: 13,
    bold: true,
    color: C.ink,
    align: "center",
    margin: 0,
  });
  note(slide, "Do not claim competitors are weak. The category is clearly validated. LokoAI should compete where first-draft tools hit limits: traceability, evaluation, memory, secure deployment, and business-ready artifacts.");
}

{
  const slide = newSlide(7, "Product overview: one workspace that converts intent into deployable software and business artifacts", "Product", "LokoAI product hypothesis based on current application capabilities");
  sectionBox(slide, 0.85, 2.0, 2.85, 1.35, "Prompt canvas", "Natural-language creation with project memory, templates, model routing, and reusable generation standards.", C.blue);
  sectionBox(slide, 4.0, 2.0, 2.85, 1.35, "Builder workspace", "Generates apps, components, docs, spreadsheets, PDFs, and presentations with preview and file management.", C.cyan);
  sectionBox(slide, 7.15, 2.0, 2.85, 1.35, "Execution layer", "Sandboxed terminal, code review, deploy workflows, integrations, and live project history.", C.green);
  sectionBox(slide, 10.3, 2.0, 2.85, 1.35, "Governance", "Audit logs, memory controls, policy prompts, team permissions, and output verification.", C.amber);
  slide.addShape(pptx.ShapeType.line, { x: 1.65, y: 4.55, w: 9.8, h: 0, line: { color: C.line, width: 2 } });
  ["Idea", "Generate", "Preview", "Verify", "Launch", "Improve"].forEach((step, i) => {
    const x = 1.0 + i * 2.05;
    slide.addShape(pptx.ShapeType.ellipse, { x, y: 4.3, w: 0.5, h: 0.5, fill: { color: i === 0 ? C.blue : i === 5 ? C.green : "FFFFFF" }, line: { color: i === 0 ? C.blue : C.line } });
    slide.addText(step, { x: x - 0.35, y: 4.95, w: 1.2, h: 0.18, fontSize: 8.5, bold: true, color: C.ink, align: "center", margin: 0 });
  });
  note(slide, "Explain the product in terms of a customer journey. LokoAI is not just a chat interface; it is a workspace where ideas become executable, inspectable, shareable, and improvable products.");
}

{
  const slide = newSlide(8, "AI technology stack: model-flexible, memory-aware, execution-ready architecture", "Technology stack", "Architecture based on current AI platform patterns");
  const layers = [
    ["User experience", "Chat, canvas, dashboard, file explorer, preview, account and project workspaces", C.blue],
    ["Agent orchestration", "Prompt router, specialist agents, planning loops, tool calls, structured output generation", C.cyan],
    ["Model gateway", "OpenAI, Anthropic, Gemini, Meta, Mistral, Qwen, DeepSeek and other routed providers", C.green],
    ["Memory and context", "Project memory, generation history, local standards, files, Supabase project records", C.amber],
    ["Execution and delivery", "Sandbox, terminal, code generation, file generators, deployment hooks, downloadable artifacts", C.red],
  ];
  layers.forEach((d, i) => sectionBox(slide, 1.0, 2.0 + i * 0.78, 11.25, 0.58, d[0], d[1], d[2]));
  slide.addText("Differentiator: an auditable workflow graph around every generated artifact.", {
    x: 1.05,
    y: 6.25,
    w: 11.0,
    h: 0.28,
    fontSize: 13,
    bold: true,
    color: C.ink,
    align: "center",
    margin: 0,
  });
  note(slide, "Investors will want to know whether LokoAI is model-dependent. This architecture keeps the company model-flexible while building defensibility in orchestration, memory, context, workflows, and customer-specific usage data.");
}

{
  const slide = newSlide(9, "Business model: land with self-serve builders, expand into teams and governed enterprise workspaces", "Business model", "Company model assumptions");
  sectionBox(slide, 0.85, 2.02, 3.65, 1.35, "Self-serve SaaS", "Monthly subscriptions for founders, creators, indie hackers, and agencies. Fast onboarding; usage-based limits.", C.blue);
  sectionBox(slide, 4.85, 2.02, 3.65, 1.35, "Team workspace", "Per-seat plans for product, marketing, ops, and engineering teams that need shared projects and review workflows.", C.cyan);
  sectionBox(slide, 8.85, 2.02, 3.65, 1.35, "Enterprise platform", "Annual contracts with SSO, compliance controls, model policy, private deployments, and support SLAs.", C.green);
  addTable(slide, [
    ["Motion", "Buyer", "Sales cycle", "Gross margin", "Expansion lever"],
    ["Self-serve", "Founder / creator", "Instant", "75-85%", "Credits, templates, hosting"],
    ["Team", "Agency / startup", "2-4 weeks", "80-88%", "Seats, projects, collaboration"],
    ["Enterprise", "Innovation / IT", "2-4 months", "85-90%", "Security, governance, private models"],
  ], 1.05, 4.1, 11.0, 1.7, [1.8, 2.1, 1.6, 1.5, 4.0]);
  note(slide, "Keep this simple: three tiers, each with a clear buyer and expansion path. The early wedge is self-serve adoption; the long-term revenue pool is teams and enterprise governance.");
}

{
  const slide = newSlide(10, "Revenue streams: subscriptions anchor the model; usage and services accelerate expansion", "Revenue streams", "Company model assumptions");
  const streams = [
    { label: "Subscriptions", value: 58, color: C.blue },
    { label: "Usage credits", value: 20, color: C.cyan },
    { label: "Enterprise add-ons", value: 12, color: C.green },
    { label: "Marketplace rev-share", value: 6, color: C.amber },
    { label: "Services / onboarding", value: 4, color: C.red },
  ];
  barChart(slide, streams.map((s) => ({ ...s, suffix: "%" })), 1.0, 2.1, 6.0, 2.8, { max: 60, labelW: 2.0 });
  sectionBox(slide, 7.6, 2.1, 4.6, 0.78, "High-quality recurring base", "Subscriptions create predictable ARR and customer commitment.", C.blue);
  sectionBox(slide, 7.6, 3.15, 4.6, 0.78, "Usage aligns with value", "Credits monetize model calls, sandboxes, deployments, and artifact generation.", C.cyan);
  sectionBox(slide, 7.6, 4.2, 4.6, 0.78, "Enterprise expands ARPA", "Governance, private models, compliance exports, and support raise contract value.", C.green);
  sectionBox(slide, 7.6, 5.25, 4.6, 0.78, "Ecosystem optionality", "Templates, agents, plugins, and implementation partners can become marketplace revenue.", C.amber);
  note(slide, "This mix should be presented as the target revenue composition by year three. It balances simplicity with upside: subscription for predictability, credits for heavy users, enterprise add-ons for larger accounts.");
}

{
  const slide = newSlide(11, "Pricing plans: simple entry, strong upgrade path, enterprise-ready economics", "Pricing", "Public AI app-builder category pricing used as benchmark");
  addTable(slide, [
    ["Plan", "Target user", "Monthly price", "Included value", "Upgrade trigger"],
    ["Free", "Explorers", "$0", "Limited projects, community templates, basic model credits", "Project cap / watermark removal"],
    ["Creator", "Founders", "$25", "More credits, app export, premium templates, file generation", "Frequent builds / custom domains"],
    ["Pro", "Power users", "$49", "Advanced models, memory, terminal, code review, deployment", "Collaboration and governance"],
    ["Team", "Agencies", "$29/seat + usage", "Shared projects, roles, approvals, version history", "More seats and client workspaces"],
    ["Enterprise", "IT / innovation", "Custom ACV", "SSO, audit logs, private models, SLA, security review", "Org-wide workflow automation"],
  ], 0.75, 2.0, 11.9, 3.45, [1.15, 1.8, 1.45, 4.15, 3.35]);
  statCard(slide, 1.0, 5.7, 2.6, 0.78, "$25", "Market-compatible creator entry point", C.blue);
  statCard(slide, 4.0, 5.7, 2.6, 0.78, "80%+", "Target mature gross margin", C.green);
  statCard(slide, 7.0, 5.7, 2.6, 0.78, "$18k+", "Target initial enterprise ACV", C.cyan);
  statCard(slide, 10.0, 5.7, 2.6, 0.78, "NRR >115%", "Year-3 expansion target", C.amber);
  note(slide, "Pricing is intentionally familiar to buyers in the category, while creating enterprise upside. Emphasize that usage limits protect margin while the product still feels accessible to creators.");
}

{
  const slide = newSlide(12, "Customer personas: four segments with urgent, measurable jobs to be done", "Personas", "Company segmentation assumptions");
  sectionBox(slide, 0.85, 2.0, 2.85, 2.1, "Solo founder", "Needs MVPs, landing pages, pitch collateral, analytics, and launch support without hiring a full team. Buys Creator or Pro.", C.blue);
  sectionBox(slide, 4.0, 2.0, 2.85, 2.1, "Agency operator", "Needs to deliver client prototypes, branded artifacts, and repeatable builds faster with margin control. Buys Team.", C.cyan);
  sectionBox(slide, 7.15, 2.0, 2.85, 2.1, "Product team", "Needs experiments, internal tools, dashboards, and design-to-code workflows with developer oversight. Buys Team or Enterprise.", C.green);
  sectionBox(slide, 10.3, 2.0, 2.85, 2.1, "Enterprise innovation", "Needs governed AI builders for business units, with IT controls, auditability, SSO, and vendor oversight. Buys Enterprise.", C.amber);
  addTable(slide, [
    ["Persona", "Core pain", "Success metric", "Primary wedge"],
    ["Founder", "Speed to MVP", "Launch in days", "Prompt-to-app + pitch assets"],
    ["Agency", "Delivery margin", "Hours saved per client", "Reusable templates"],
    ["Product", "Experiment velocity", "Validated prototypes/month", "Team workspace"],
    ["Enterprise", "AI governance", "Policy-compliant workflows", "Audit + controls"],
  ], 1.0, 4.75, 11.0, 1.45, [1.4, 3.2, 2.5, 3.9]);
  note(slide, "The personas show that LokoAI has a broad market but can still focus. Start with founders and agencies because they buy quickly, then use proof points to move upmarket.");
}

{
  const slide = newSlide(13, "Go-to-market strategy: product-led growth with enterprise pull-through", "GTM", "Company go-to-market assumptions");
  const items = [
    ["1", "Seed the builder community", "Templates, public builds, founder challenges, and launch contests create organic demand.", C.blue],
    ["2", "Convert high-intent users", "In-product limits, premium models, export, deploy, and collaboration triggers move free users to paid.", C.cyan],
    ["3", "Package repeatable verticals", "Agency kits, SaaS starter kits, internal-tool kits, and presentation/document workflows improve conversion.", C.green],
    ["4", "Land teams", "Shared workspaces, role-based review, project history, and billing consolidation create team adoption.", C.amber],
    ["5", "Expand enterprise", "Security, compliance, model controls, audit trails, and private deployment support drive annual contracts.", C.red],
  ];
  items.forEach((d, i) => {
    const x = 0.95 + i * 2.45;
    slide.addShape(pptx.ShapeType.ellipse, { x, y: 2.2, w: 0.55, h: 0.55, fill: { color: d[3] }, line: { color: d[3] } });
    slide.addText(d[0], { x, y: 2.34, w: 0.55, h: 0.15, fontSize: 8, bold: true, color: "FFFFFF", align: "center", margin: 0 });
    slide.addShape(pptx.ShapeType.line, { x: x + 0.55, y: 2.47, w: i === 4 ? 0 : 1.85, h: 0, line: { color: C.line, width: 1.5 } });
    slide.addText(d[1], { x: x - 0.25, y: 3.05, w: 1.85, h: 0.35, fontSize: 10.5, bold: true, color: C.ink, align: "center", margin: 0, fit: "shrink" });
    slide.addText(d[2], { x: x - 0.32, y: 3.68, w: 2.0, h: 1.05, fontSize: 8.2, color: C.muted, align: "center", margin: 0, fit: "shrink" });
  });
  sectionBox(slide, 1.0, 5.65, 11.0, 0.65, "Operating cadence", "Weekly shipped templates, monthly product-led campaigns, quarterly vertical launches, and founder/customer proof packs for enterprise sales.", C.blue);
  note(slide, "Investors will care whether acquisition is efficient. Anchor the GTM in product-led community and templates, then show how the product naturally creates team and enterprise conversations.");
}

{
  const slide = newSlide(14, "Marketing funnel: convert prompt curiosity into retained build velocity", "Marketing funnel", "Company funnel assumptions");
  const funnel = [
    ["Audience", "Creator, founder, agency, product communities", 8.8, C.blue],
    ["Activation", "First generated app or artifact in under 10 minutes", 7.2, C.cyan],
    ["Conversion", "Upgrade for credits, export, deploy, team sharing", 5.5, C.green],
    ["Expansion", "Seats, workspaces, governance, enterprise support", 3.7, C.amber],
    ["Advocacy", "Public builds, templates, partner marketplace", 2.3, C.red],
  ];
  funnel.forEach((d, i) => {
    const w = d[2];
    const x = 6.65 - w / 2;
    const y = 2.05 + i * 0.72;
    slide.addShape(pptx.ShapeType.trapezoid, { x, y, w, h: 0.55, fill: { color: d[3], transparency: 4 }, line: { color: d[3] } });
    slide.addText(d[0], { x: x + 0.15, y: y + 0.15, w: 1.4, h: 0.14, fontSize: 8, bold: true, color: "FFFFFF", margin: 0 });
    slide.addText(d[1], { x: x + 1.6, y: y + 0.13, w: w - 1.9, h: 0.18, fontSize: 7.8, color: "FFFFFF", margin: 0, fit: "shrink" });
  });
  addTable(slide, [
    ["Metric", "Yr 1 target", "Yr 2 target", "Yr 3 target"],
    ["Website-to-signup", "6%", "8%", "10%"],
    ["Activation rate", "45%", "55%", "62%"],
    ["Free-to-paid", "5%", "7%", "9%"],
    ["Logo retention", "72%", "80%", "86%"],
  ], 1.35, 5.85, 10.6, 1.15, [3.0, 2.1, 2.1, 2.1]);
  note(slide, "Use the funnel to describe operating discipline. LokoAI should manage activation and retention as core growth metrics, because builders only pay when generation turns into useful shipped work.");
}

{
  const slide = newSlide(15, "Financial projections: path to $12.4M ARR by year three", "Financial projections", "Management assumptions; category pricing benchmarks");
  miniColumnChart(slide, [
    { label: "Y1", value: 1.2, display: "$1.2M", color: C.blue },
    { label: "Y2", value: 4.8, display: "$4.8M", color: C.cyan },
    { label: "Y3", value: 12.4, display: "$12.4M", color: C.green },
  ], 0.95, 2.15, 3.7, 2.6, 14, C.blue);
  addTable(slide, [
    ["Metric", "Year 1", "Year 2", "Year 3"],
    ["Paid customers", "2,100", "8,000", "18,000"],
    ["Team / enterprise logos", "25", "115", "340"],
    ["ARR", "$1.2M", "$4.8M", "$12.4M"],
    ["Gross margin", "72%", "79%", "84%"],
    ["Net revenue retention", "98%", "108%", "118%"],
    ["EBITDA margin", "-55%", "-28%", "-6%"],
  ], 5.25, 2.0, 7.35, 3.3, [2.45, 1.85, 1.85, 1.85]);
  sectionBox(slide, 1.0, 5.75, 11.35, 0.62, "Model logic", "Revenue scales through creator subscriptions first, then higher-ARPA team workspaces and enterprise governance contracts.", C.green);
  note(slide, "Clarify that these are planning assumptions, not historicals. The model is intentionally realistic for a seed-stage company: strong ARR growth, improving margins, and delayed profitability as product and GTM investment continue.");
}

{
  const slide = newSlide(16, "Unit economics: usage-aware pricing protects margin while retaining product-led growth", "Financial model", "Management assumptions");
  statCard(slide, 0.88, 2.0, 2.45, 1.25, "$42", "Blended monthly ARPA target by year three", C.blue);
  statCard(slide, 3.62, 2.0, 2.45, 1.25, "84%", "Target gross margin after model routing optimization", C.green);
  statCard(slide, 6.36, 2.0, 2.45, 1.25, "<6 mo", "Self-serve CAC payback target", C.cyan);
  statCard(slide, 9.1, 2.0, 2.45, 1.25, "118%", "Net revenue retention target", C.amber);
  addTable(slide, [
    ["Lever", "How LokoAI improves economics", "Impact"],
    ["Model routing", "Route simple tasks to lower-cost models; reserve frontier models for high-value work.", "Lower COGS"],
    ["Usage credits", "Convert heavy compute into paid consumption instead of unlimited subscription leakage.", "Margin control"],
    ["Templates", "Reusable workflows reduce generation loops and shorten time to value.", "Higher activation"],
    ["Teams", "Collaboration, review, and governance increase seats and retention.", "Expansion"],
  ], 1.0, 4.1, 11.0, 1.75, [1.65, 7.3, 2.05]);
  note(slide, "This is the investor diligence slide for margins. The key point is that AI infrastructure costs are real, so LokoAI must use model routing, usage metering, templates, and team expansion to keep healthy software economics.");
}

{
  const slide = newSlide(17, "SWOT analysis: strong timing and product breadth, with execution risk to manage", "SWOT", "Strategic analysis");
  sectionBox(slide, 0.85, 2.0, 5.65, 1.35, "Strengths", "Broad AI builder workspace; model-flexible architecture; artifact generation beyond code; strong brand fit for creators and founders.", C.green);
  sectionBox(slide, 6.85, 2.0, 5.65, 1.35, "Weaknesses", "Early brand awareness; needs proof of reliability; model cost exposure; enterprise security features require continued investment.", C.amber);
  sectionBox(slide, 0.85, 4.05, 5.65, 1.35, "Opportunities", "AI app-builder demand, SMB automation, agency delivery acceleration, enterprise innovation teams, marketplace templates and agents.", C.blue);
  sectionBox(slide, 6.85, 4.05, 5.65, 1.35, "Threats", "Fast-moving incumbents, model provider bundling, open-source agents, data/security incidents, customer fatigue from low-quality AI tools.", C.red);
  note(slide, "Be balanced here. A credible SWOT acknowledges that the category is competitive and fast-moving. The plan is to win by narrowing the launch wedge and building trust as the core product value.");
}

{
  const slide = newSlide(18, "Risk assessment: focus capital on the risks that determine enterprise trust", "Risk assessment", "Strategic risk analysis");
  addTable(slide, [
    ["Risk", "Probability", "Impact", "Mitigation"],
    ["Model output errors", "High", "High", "Evals, human review, citations, versioning, rollback"],
    ["Model cost inflation", "Medium", "High", "Routing, caching, credits, provider diversification"],
    ["Security / data leakage", "Medium", "High", "SOC2 roadmap, SSO, encryption, policy controls"],
    ["Competitor compression", "High", "Medium", "Vertical templates, governance, integrations, community"],
    ["Enterprise sales delays", "Medium", "Medium", "PLG proof, design partners, clear ROI calculators"],
    ["Regulatory uncertainty", "Medium", "Medium", "Audit logs, regional data controls, compliance reporting"],
  ], 0.8, 2.02, 11.85, 3.42, [2.45, 1.35, 1.15, 6.9]);
  barChart(slide, [
    { label: "Reliability", value: 95, suffix: "", color: C.red },
    { label: "Security", value: 90, suffix: "", color: C.amber },
    { label: "Cost control", value: 82, suffix: "", color: C.cyan },
    { label: "Differentiation", value: 78, suffix: "", color: C.blue },
  ], 2.25, 5.85, 8.5, 0.9, { max: 100, labelW: 1.7 });
  note(slide, "Present risks as managed priorities, not surprises. Reliability, security, and cost control should be framed as product requirements that become competitive advantages when executed well.");
}

{
  const slide = newSlide(19, "Product roadmap: from creator-grade builder to governed AI delivery platform", "Roadmap", "Management roadmap assumptions");
  const roadmap = [
    ["Q3 2026", "Creator launch", "Polish prompt-to-app, file generation, project memory, templates, and export flows.", C.blue],
    ["Q4 2026", "Team workspace", "Shared projects, roles, approvals, activity history, usage billing, and client workspaces.", C.cyan],
    ["H1 2027", "Production controls", "Evals, code review, deployment automation, rollback, monitoring, and security posture.", C.green],
    ["H2 2027", "Enterprise package", "SSO, audit logs, private model policy, compliance exports, procurement readiness.", C.amber],
    ["2028", "Marketplace and agents", "Third-party templates, agent marketplace, vertical packages, partner services ecosystem.", C.red],
  ];
  roadmap.forEach((d, i) => {
    const x = 0.8 + i * 2.52;
    slide.addShape(pptx.ShapeType.line, { x: x + 0.35, y: 2.95, w: i === 4 ? 0 : 2.0, h: 0, line: { color: C.line, width: 2 } });
    slide.addShape(pptx.ShapeType.ellipse, { x, y: 2.65, w: 0.65, h: 0.65, fill: { color: d[3] }, line: { color: d[3] } });
    slide.addText(d[0], { x: x - 0.25, y: 3.55, w: 1.15, h: 0.2, fontSize: 8, bold: true, color: C.ink, align: "center", margin: 0 });
    slide.addText(d[1], { x: x - 0.45, y: 4.0, w: 1.55, h: 0.28, fontSize: 10, bold: true, color: C.ink, align: "center", margin: 0, fit: "shrink" });
    slide.addText(d[2], { x: x - 0.65, y: 4.55, w: 1.95, h: 1.02, fontSize: 7.7, color: C.muted, align: "center", margin: 0, fit: "shrink" });
  });
  note(slide, "This roadmap shows a credible sequencing from near-term self-serve polish to team and enterprise capabilities. It also tells investors how the requested funding turns into product milestones.");
}

{
  const slide = newSlide(20, "Team structure: lean expert pods aligned to product, trust, and growth", "Team", "Hiring plan assumptions");
  addTable(slide, [
    ["Function", "Seed-stage roles", "Hiring priority", "Strategic outcome"],
    ["Product & design", "Head of Product, UX designer, growth PM", "High", "Activation and retention"],
    ["AI engineering", "Agent engineer, model routing engineer, eval engineer", "High", "Reliability and defensibility"],
    ["Platform engineering", "Full-stack, infra, security engineer", "High", "Scalable production workflows"],
    ["GTM", "Founder-led sales, growth marketer, community lead", "Medium", "PLG and design partners"],
    ["Customer success", "Solutions lead, support specialist", "Medium", "Expansion and enterprise readiness"],
    ["Ops & finance", "Fractional finance, legal, security advisors", "Medium", "Fundraising and compliance"],
  ], 0.8, 2.02, 11.85, 3.55, [2.2, 4.0, 1.55, 4.1]);
  sectionBox(slide, 1.0, 6.0, 11.1, 0.58, "Hiring principle", "Build a small senior team that can ship product, prove reliability, and close design partners before scaling headcount.", C.blue);
  note(slide, "Keep the team slide practical. Investors want to see that funding will not be spread thinly. The first hires should map directly to product velocity, trust, and revenue.");
}

{
  const slide = newSlide(21, "Funding requirements: raising $3.5M seed to reach team-scale traction", "Funding", "Management fundraising assumptions");
  statCard(slide, 0.9, 2.05, 2.55, 1.3, "$3.5M", "Seed round target", C.blue);
  statCard(slide, 3.75, 2.05, 2.55, 1.3, "24 mo", "Runway target", C.cyan);
  statCard(slide, 6.6, 2.05, 2.55, 1.3, "$1.2M", "Year-1 ARR target", C.green);
  statCard(slide, 9.45, 2.05, 2.55, 1.3, "25+", "Team / enterprise design partners", C.amber);
  bulletList(slide, [
    "Primary objective: ship creator and team-grade workspace, then prove repeatable paid conversion.",
    "Secondary objective: launch enterprise trust package with auditability, SSO, evals, and compliance roadmap.",
    "Milestone objective: demonstrate strong activation, improving gross margin, and early team expansion.",
    "Next financing trigger: $4M+ ARR run-rate, 100+ team accounts, and clear enterprise pipeline."
  ], 1.1, 4.35, 10.8, 1.35, 12.5);
  note(slide, "Use this as the ask slide. The numbers are designed to support a 24-month runway and show what milestones investors should expect before the next round.");
}

{
  const slide = newSlide(22, "Investment use of funds: concentrate spend on product trust and repeatable growth", "Use of funds", "Management allocation assumptions");
  const data = [
    { label: "Product & engineering", value: 48, color: C.blue },
    { label: "AI infrastructure", value: 18, color: C.cyan },
    { label: "GTM & community", value: 16, color: C.green },
    { label: "Security/compliance", value: 10, color: C.amber },
    { label: "Ops reserve", value: 8, color: C.red },
  ];
  barChart(slide, data.map((d) => ({ ...d, suffix: "%" })), 0.95, 2.15, 6.1, 2.7, { max: 50, labelW: 2.15 });
  addTable(slide, [
    ["Category", "Allocation", "Key outputs"],
    ["Product & engineering", "48%", "Builder workspace, team collaboration, evals, deployment workflows"],
    ["AI infrastructure", "18%", "Model credits, routing, caching, sandbox execution, observability"],
    ["GTM & community", "16%", "Templates, launches, content, founder programs, design partners"],
    ["Security/compliance", "10%", "SSO, audit logs, SOC2 readiness, policy controls"],
    ["Ops reserve", "8%", "Legal, finance, customer support, contingency"],
  ], 7.35, 2.05, 5.15, 3.35, [1.8, 1.0, 3.35]);
  note(slide, "Emphasize disciplined allocation. The largest spend goes to product and engineering because reliability is the moat; GTM spend supports community and design partners without overbuilding sales too early.");
}

{
  const slide = newSlide(23, "Future vision: LokoAI becomes the trusted AI delivery layer for software and digital work", "Future vision", "Strategic vision");
  sectionBox(slide, 0.88, 2.0, 3.75, 1.4, "From prompts to products", "Every user can describe a business need and receive a working, reviewable, deployable software artifact.", C.blue);
  sectionBox(slide, 4.88, 2.0, 3.75, 1.4, "From projects to systems", "LokoAI memories, templates, and agents compound into persistent organizational capability.", C.cyan);
  sectionBox(slide, 8.88, 2.0, 3.75, 1.4, "From workspace to ecosystem", "A marketplace of agents, integrations, templates, and experts makes LokoAI the operating layer for AI work.", C.green);
  slide.addText("Long-term platform options", { x: 1.0, y: 4.35, w: 3.2, h: 0.24, fontSize: 12, bold: true, color: C.ink, margin: 0 });
  bulletList(slide, [
    "Verticalized agents for SaaS, ecommerce, internal operations, customer support, and data workflows.",
    "Enterprise control plane for model policy, workflow approvals, data boundaries, and generated-code governance.",
    "Partner marketplace for templates, verified agents, implementation services, and domain integrations.",
    "AI-native delivery analytics: measure time-to-launch, rework, model cost, conversion, and ROI by project."
  ], 1.1, 4.8, 10.8, 1.25, 12);
  note(slide, "This slide is the ambition. LokoAI can become more than a builder if it owns the workflow layer, the governance graph, and the marketplace around AI-generated digital work.");
}

{
  const slide = newSlide(24, "Conclusion: LokoAI is positioned to turn AI creation into trusted software delivery", "Conclusion", "All sources listed in appendix");
  slide.addText("The investment case", { x: 0.95, y: 2.05, w: 3.1, h: 0.28, fontSize: 13, bold: true, color: C.ink, margin: 0 });
  bulletList(slide, [
    "Massive market: AI spending and AI software budgets are expanding into the trillions and hundreds of billions respectively.",
    "Validated demand: AI app builders and coding agents have shown exceptional customer and investor pull.",
    "Unresolved pain: trust, production readiness, governance, and workflow integration remain open problems.",
    "Clear wedge: launch with creators and agencies, expand into teams, then enterprise governed workspaces.",
    "Compelling ask: $3.5M seed to fund 24 months and reach measurable ARR, retention, and enterprise-readiness milestones."
  ], 1.0, 2.55, 7.05, 3.1, 13.2);
  slide.addShape(pptx.ShapeType.rect, { x: 8.75, y: 2.15, w: 3.35, h: 3.35, fill: { color: C.navy }, line: { color: C.navy } });
  slide.addText("Build faster.\nTrust deeper.\nShip smarter.", {
    x: 9.05,
    y: 2.9,
    w: 2.75,
    h: 1.25,
    fontSize: 25,
    bold: true,
    color: "FFFFFF",
    align: "center",
    valign: "mid",
    margin: 0,
    fit: "shrink",
    breakLine: false,
  });
  slide.addText("LokoAI", { x: 9.72, y: 4.8, w: 1.45, h: 0.24, fontSize: 12, bold: true, color: "9CC3FF", align: "center", margin: 0 });
  note(slide, "Close with confidence and restraint. The final message is that LokoAI sits at the convergence of massive AI budgets, validated app-builder demand, and a still-unsolved trust gap.");
}

{
  const slide = newSlide(25, "Selected sources and modeling assumptions", "Appendix", "Public sources; internal assumptions");
  addTable(slide, [
    ["Source", "Data used in deck"],
    ["Gartner AI Spending Forecast, May 2026", "$2.59T worldwide AI spending in 2026; AI software $453.2B in 2026 and $638.4B in 2027."],
    ["Gartner GenAI Spending Forecast, Mar 2025", "$643.9B GenAI spending forecast in 2025; hardware-heavy spending context."],
    ["McKinsey State of AI 2025", "88% AI use in at least one business function; 23% scaling agentic AI; 39% experimenting with agents."],
    ["Stack Overflow Developer Survey 2025", "84% use or plan to use AI tools; 46% distrust output accuracy; 52% productivity effect."],
    ["TechCrunch Lovable funding report, Dec 2025", "$330M raise at $6.6B valuation; $200M+ ARR; 25M projects in first year."],
    ["Management assumptions", "Pricing, ARR, unit economics, roadmap, customer segmentation, funding allocation, and hiring plan."],
  ], 0.78, 1.95, 11.85, 3.35, [3.3, 8.55]);
  sourceLinks.forEach((link, i) => {
    slide.addText(link, {
      x: 0.9,
      y: 5.55 + i * 0.24,
      w: 11.2,
      h: 0.16,
      fontSize: 6.5,
      color: C.blue,
      hyperlink: { url: link },
      margin: 0,
      fit: "shrink",
    });
  });
  note(slide, "Use this appendix if asked about data. Make clear which numbers are sourced and which are management planning assumptions. The financial model is directional and should be updated with actual LokoAI operating data.");
}

async function main() {
  const outDir = path.join(process.cwd(), "public", "generated-files");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "lokoai-investor-pitch-deck-2026.pptx");
  await pptx.writeFile({ fileName: outPath });
  console.log(outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
