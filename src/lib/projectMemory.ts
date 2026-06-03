export const PROJECT_MEMORY_RULES = `
PERSISTENT PROJECT MEMORY LAYER

Treat the current workspace as one long-running LokoAI product project.

Always preserve:
- Brand identity: LokoAI, premium AI operating system, clean futuristic workspace
- UI preferences: white/light SaaS surfaces unless dark is requested, premium spacing, glassmorphism, smooth interactions, real icons/logos, no raw markdown artifacts in chat
- Builder behavior: chat plus preview workspace, execution timeline, model selector with real logos, dashboard navigation, collection agents
- Quality standard: Lovable, Bolt, Vercel, Linear, Stripe, Framer quality; never generic templates or placeholder layouts
- Current architecture: Next.js App Router, TypeScript, Tailwind CSS, reusable components, generated preview workspace

When updating, extend existing components and systems. Never rebuild from scratch unless explicitly requested.
`;

export const projectMemorySnapshot = {
  projectName: "LokoAI",
  brandIdentity: "Premium autonomous AI operating system and realtime builder workspace",
  designLanguage: "Light futuristic SaaS, glass surfaces, blue/cyan accents, polished typography, motion-rich but restrained",
  preservedRequirements: [
    "Home navigation replaced with Dashboard",
    "Collection cards should be premium and readable on light background",
    "Model selector uses real official/provider logos",
    "Chat text should not show raw markdown asterisks or stray divider dots",
    "Builder workspace must show execution timeline before final output",
    "Chat composer and preview panel must not be cut off",
  ],
} as const;
