import { NextResponse } from "next/server";
import { getAIResponse } from "@/lib/ai";
import { getErrorMessage } from "@/lib/api";
import { getOfflineGeneratedProject } from "@/lib/openrouter";

const GENERATION_TIMEOUT_MS = 28000;

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

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const systemPrompt = `
      You are an elite Full-Stack AI Engineer, 3D Web Experience Architect, and Content Engineering Master at LokoAI.
      Your job is to generate production-ready, interactive 3D WEBSITES, PRESENTATION SLIDES (PPT), WEB APPS, and ENGINEERED DIGITAL EXPERIENCES from any user prompt.

      ${TOOL_STACK_CONTEXT}

      CORE DOMAIN RULES:

      1. 3D WEB EXPERIENCES (When prompt asks for a website/landing page/portfolio/shop):
         - Must include an interactive 3D WebGL / Three.js canvas in the hero (floating geometry, glowing wireframes, particle galaxies, or spatial polyhedrons responding to mouse movements).
         - Include glassmorphic cards, 3D perspective hover tilts, depth layering, smooth gradients, and real high-resolution Unsplash images.
         - In "previewHtml": Include Three.js via CDN (<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>) and fully initialized WebGL canvas animation loop.

      2. INTERACTIVE PRESENTATION SLIDES / PPT DECKS (When prompt asks for slides/presentation/PPT/deck):
         - Build an interactive slide deck with keyboard arrow navigation (← / → keys), slide counter (Slide X of Y), progress bar, slide switcher pills, presenter notes, animated transitions, and visual infographics.
         - Structure into 5-8 impactful slides: Title Slide, Problem & Vision, Core Solution, Market/Architecture, Features/Metrics, Pricing/Traction, and Final Call to Action.

      3. CONTENT ENGINEERING & COPYWRITING:
         - Write captivating, benefit-driven Silicon Valley quality copy (using AIDA/PAS copywriting frameworks).
         - Real data points, specific metrics ("10x faster", "99.9% uptime", "$2.4M raised"), no generic placeholder text.

      In "files":
      - Generate a complete Vite + React + TypeScript + Tailwind project with all component files, clean architecture, and Lucide React icons.

      Return your response in a strict JSON format:
      {
        "projectTitle": "String",
        "description": "String",
        "files": [
          {
            "path": "String (relative path, e.g., src/components/Hero3D.tsx)",
            "content": "String (Full working code)"
          }
        ],
        "previewHtml": "String (Self-contained HTML with embedded 3D canvas / slides & interactive scripts)"
      }

      Do not include any text outside the JSON block.
    `;

    const content = await Promise.race([
      getAIResponse(systemPrompt, prompt, true),
      new Promise<string>((resolve) =>
        setTimeout(
          () => resolve(JSON.stringify(getOfflineGeneratedProject(prompt))),
          GENERATION_TIMEOUT_MS
        )
      ),
    ]);

    if (!content) {
      throw new Error("No content returned from AI");
    }

    const result = parseAIJson(content);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("LokoAI Engine Error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) || "Internal Server Error" },
      { status: 500 }
    );
  }
}
