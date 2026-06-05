import { NextResponse } from "next/server";
import { getAIResponse } from "@/lib/ai";
import { getErrorMessage } from "@/lib/api";
import { LOKO_AI_CORE_STANDARD } from "@/lib/lokoAiStandards";
import { getOfflineGeneratedProject } from "@/lib/openrouter";
import { detectPromptMode } from "@/lib/promptRouter";
import { writeGeneratedProjectToWorkspace } from "@/lib/fileGenerationEngine";
import { buildIntentInstructions } from "@/lib/generationIntent";
import { isPremiumSaasCodebasePrompt } from "@/lib/premiumSaasProject";
import { guarded, preflightResponse, readJsonBody, validatePrompt } from "@/lib/security";

const GENERATION_TIMEOUT_MS = 28000;

const PREMIUM_UI_DESIGN_STANDARD = `
PREMIUM UI/UX DESIGN STANDARD

You are an elite senior UI/UX designer, product designer, frontend architect, and full-stack engineer.
Your output must feel comparable to modern products from OpenAI, Apple, Linear, Notion, Stripe, Vercel, Claude, Loko AI, Perplexity, Airbnb, Framer, and Raycast.

Before generating files, silently plan:
- UI/UX strategy
- Component hierarchy
- Color system
- Spacing system
- Typography system
- Responsive behavior
- Visual hierarchy
- Interaction states

For any website, landing page, dashboard, SaaS app, AI app, admin panel, mobile app UI, portfolio, or business website:
- Never create basic layouts, beginner UI, raw Bootstrap-like pages, or boring templates
- Never create generic hero sections, placeholder cards, fake charts, empty sections, repeated layouts, weak spacing, tiny CTAs, random lorem ipsum, or default Tailwind demo pages
- Always create modern premium design, professional spacing, strong visual hierarchy, beautiful typography, consistent color, modern cards, clean icons, polished buttons, production shadows, premium gradients, smooth animations, and accessible responsive components
- Prefer refined startup-quality interfaces that look like a funded company hired a professional design team

Landing pages must include, when relevant:
- A wow-factor hero with a massive headline, strong subheadline, premium CTA, trust indicators, and a visual centerpiece
- Category-specific product or service mockup, not a generic dashboard unless the prompt is actually SaaS/dashboard
- Social proof, customer logos or trust badges, features, benefits, workflow/use cases, testimonials, pricing or packages, FAQ, CTA, and professional footer
- Believable content that matches the requested business, product, audience, and industry

Dashboards must include, when relevant:
- Modern sidebar
- Top navigation
- Stats cards
- Analytics charts
- Activity feed
- Settings/account surfaces
- Dark mode support
- Responsive layout

Code quality:
- Production-ready code
- Reusable architecture
- Accessible components
- Beautiful loading/empty/error states
- No placeholder design
- No ugly default styling
- No broken visual assets
- No generic filler copy
- Before returning JSON, self-review the result. If it would not impress a paying startup founder, redesign it silently and return the improved version
`;

const TOOL_STACK_CONTEXT = `
FULL AI TOOL LANGUAGE + STACK CONTEXT

Use modern AI web development stack standards commonly used by tools like Lovable, Bolt.new, v0, Cursor, Windsurf, Replit AI, OpenHands, Cline, and Base44.

Commonly used languages:
- JavaScript
- TypeScript

Frontend technologies:
- React
- Next.js
- Vite
- HTML5
- CSS3
- SCSS
- Tailwind CSS

Backend technologies:
- Node.js
- Express.js
- Next.js API Routes
- Supabase
- PostgreSQL
- Firebase

UI libraries and interaction tools:
- shadcn/ui
- Framer Motion
- Lucide React
- React Hook Form
- Zod validation

Preferred development style:
- Use TypeScript whenever possible
- Build scalable React applications
- Follow component-based architecture
- Use Tailwind CSS for styling when generating framework apps
- Use reusable UI components
- Keep a clean file structure
- Maintain production-ready code quality
- Avoid duplicated logic and placeholder sections

      UI/UX standards:
      - The design should feel modern, premium, responsive, smooth, visually polished, startup-quality, futuristic, clean, and elegant
      - Use gradients, glassmorphism, hover effects, animations, micro interactions, responsive layouts, and dark mode support when they improve the result
      - Think like a senior Silicon Valley engineer and premium SaaS designer before generating code
      - Match the quality bar of Lovable, v0, Linear, Stripe, Raycast, Notion, and Framer websites: clean spacing, tasteful color, crisp typography, realistic product UI, and purposeful sections
      - For website and landing page requests, create an actual website experience, not an image board, prompt note board, debug panel, or generic dark placeholder screen
      - Avoid huge empty black hero blocks, repeated template copy, raw "design direction" labels, broken visual placeholders, and vague "future of..." messaging
      - Prefer polished light-mode SaaS/product pages unless the prompt explicitly requests dark, cyberpunk, gaming, or cinematic style

Performance, accessibility, and SEO standards:
- Optimize for fast loading, responsive rendering, Lighthouse quality, SEO, accessibility, and mobile-first design
- Use semantic HTML, keyboard-accessible controls, proper contrast, metadata, and Open Graph tags where relevant
- Lazy load or dynamically import heavier UI only when it meaningfully helps

Specialized contexts:
- SaaS websites should include hero, dashboard preview, pricing, features, testimonials, CTA, dark mode, responsive design, and smooth animations when appropriate
- 3D/futuristic websites may use Three.js, React Three Fiber, WebGL, GSAP, and Framer Motion for immersive motion and cinematic interactive experiences
- Dashboards should include sidebar, top navigation, charts, tables, analytics cards, search, filters, settings, notifications, and responsive layouts when the prompt asks for an app or admin panel
- Forms must include validation, error states, success states, loading states, accessibility, and responsive inputs

Tool-specific expectations:
- Lovable style: clean reusable architecture, visual consistency, Supabase-friendly patterns when needed
- Bolt.new style: fully working files with proper imports and dependencies, simple production-ready setup
- v0 style: premium frontend UI quality with modern React patterns and clean Tailwind styling
- Cursor/Windsurf style: senior engineer pair-programming quality with scalable architecture and low unnecessary complexity
- Base44 style: prompt-based full app generation with minimal manual coding and JavaScript ecosystem compatibility
`;

function parseAIJson(content: string) {
  const trimmed = content
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");

    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }

    throw new Error("AI response was not valid JSON.");
  }
}

type ExistingGeneratedProject = {
  id?: string;
  title?: string;
  description?: string | null;
  prompt?: string | null;
  preview_html?: string | null;
  generated_code?: Array<{ path?: string; content?: string }>;
};

function buildGenerationUserPrompt(prompt: string, existingProject?: ExistingGeneratedProject | null) {
  if (!existingProject) return prompt;

  const files = Array.isArray(existingProject.generated_code)
    ? existingProject.generated_code
        .filter((file) => typeof file?.path === "string" && typeof file?.content === "string")
        .slice(0, 12)
        .map((file) => ({
          path: file.path,
          content: String(file.content).slice(0, 45_000),
        }))
    : [];

  return `
EDIT EXISTING PROJECT. Do not create a new unrelated project.

User change request:
${prompt}

Current project metadata:
${JSON.stringify(
  {
    id: existingProject.id,
    title: existingProject.title,
    description: existingProject.description,
    originalPrompt: existingProject.prompt,
  },
  null,
  2
)}

Current preview HTML:
${String(existingProject.preview_html ?? "").slice(0, 60_000)}

Current files:
${JSON.stringify(files, null, 2)}

Return the same project after applying the requested change. Preserve the existing design direction and only change what the user asked for unless the change requires a small supporting adjustment.
`.trim();
}

async function handlePost(req: Request) {
  try {
    const { prompt: rawPrompt, existingProject } = await readJsonBody<{
      prompt?: string;
      existingProject?: ExistingGeneratedProject | null;
    }>(req, 2_000_000);
    const prompt = typeof rawPrompt === "string" ? rawPrompt.trim() : "";
    const isEditingExistingProject = Boolean(existingProject?.preview_html || existingProject?.generated_code?.length);

    const promptError = validatePrompt(prompt, 20_000);
    if (promptError) {
      return NextResponse.json({ error: promptError }, { status: 400 });
    }

    const promptRoute = detectPromptMode(prompt);
    const intentInstructions = buildIntentInstructions(prompt);
    const generationPrompt = buildGenerationUserPrompt(prompt, existingProject);
    const wantsViteReactStack = /vite|react\s*\+\s*typescript|tailwind|framer motion/i.test(prompt);
    const wantsLargeSaasCodebase = isPremiumSaasCodebasePrompt(prompt);
    const systemPrompt = `
      You are an advanced AI Website Builder and AI IDE similar to Lovable, V0, and Bolt.
      Your job is to generate and edit complete modern websites and web applications from user prompts.

      ${LOKO_AI_CORE_STANDARD}

      CURRENT MODE: ${promptRoute.mode.toUpperCase()}
      ROUTER REASON: ${promptRoute.reason}
      EXISTING PROJECT EDIT MODE: ${isEditingExistingProject ? "YES" : "NO"}
      REQUESTED STACK: ${wantsViteReactStack ? "React + TypeScript + Vite + Tailwind CSS + Framer Motion" : "Use the best stack requested by the user; default to React + TypeScript when unspecified"}
      LARGE SAAS CODEBASE MODE: ${wantsLargeSaasCodebase ? "YES" : "NO"}

      ${PREMIUM_UI_DESIGN_STANDARD}

      INTENT-SPECIFIC DESIGN DIRECTION:
      ${intentInstructions}

      ${TOOL_STACK_CONTEXT}

      IMPORTANT:
      - Always generate full working code
      - Obey the user's requested framework and tooling. If the user asks for Vite, generate a Vite project, not Next.js
      - Do not keep everything inside App.tsx
      - Split pages, sections, components, hooks, utilities, data, services, assets, layouts, providers, and styles into separate files
      - If LARGE SAAS CODEBASE MODE is YES, generate at least 50 files and include production configuration files
      - If EXISTING PROJECT EDIT MODE is YES, update the existing project instead of creating a new page or separate code answer
      - If editing, preserve the existing layout, copy, routes, filenames, and visual language unless the user explicitly asks to change them
      - If editing, return every changed file as a full file and include unchanged core files needed to run the project
      - If editing, return an updated previewHtml that visibly reflects the user's change
      - Always create modern responsive UI
      - Always use production-ready structure
      - Always generate preview-ready applications
      - Always create and update files automatically

      Technology rules:
      - If the user asks for React + TypeScript + Vite, include package.json, index.html, vite.config.ts, tsconfig files, Tailwind config, PostCSS config, src/main.tsx, and a routed src/App.tsx
      - If the user asks for Next.js, use Next.js App Router
      - Use Tailwind CSS for styling unless the user asks otherwise
      - Use Framer Motion for animation when requested
      - Use SVG/TSX components for generated logos, product illustrations, icons, and dashboard mockups

      Frontend Rules:
      - Use functional React components
      - Use TypeScript in all files
      - Use Tailwind CSS only for styling
      - Create responsive layouts
      - Use modern SaaS UI design (glassmorphism, gradients, premium effects)
      - Use Lucide React for icons
      - Maintain clean folder structure

      Return your response in a strict JSON format:
      {
        "projectTitle": "String",
        "description": "String",
        "files": [
          {
            "path": "String (relative path, e.g., components/Header.tsx)",
            "content": "String (Full code)"
          }
        ],
        "previewHtml": "String (Self-contained HTML/CSS/JS for live preview)"
      }

      Do not include any text outside the JSON block.
    `;

    const content = await Promise.race([
      getAIResponse(systemPrompt, generationPrompt, true),
      new Promise<string>((resolve) =>
        setTimeout(
          () => resolve(JSON.stringify(isEditingExistingProject ? {
            projectTitle: existingProject?.title || "Updated Project",
            description: existingProject?.description || "Updated existing project",
            files: existingProject?.generated_code ?? [],
            previewHtml: existingProject?.preview_html ?? "",
          } : getOfflineGeneratedProject(prompt))),
          GENERATION_TIMEOUT_MS
        )
      ),
    ]);

    if (!content) {
      throw new Error("No content returned from AI");
    }

    const result = parseAIJson(content);
    let workspaceWrite = null;

    if (promptRoute.mode === "builder" && Array.isArray(result.files) && !isEditingExistingProject) {
      workspaceWrite = writeGeneratedProjectToWorkspace(result, {
        projectId: crypto.randomUUID().slice(0, 8),
      });
    }

    return NextResponse.json({
      ...result,
      isEdit: isEditingExistingProject,
      mode: promptRoute.mode,
      routeReason: promptRoute.reason,
      workspace: workspaceWrite
        ? {
            path: workspaceWrite.relativeProjectDir,
            files: workspaceWrite.writtenFiles,
          }
        : null,
    });
  } catch (error: unknown) {
    console.error("LokoAI Engine Error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) || "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const POST = guarded(handlePost, 12);
export const OPTIONS = preflightResponse;
