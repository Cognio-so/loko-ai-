import { getAssistant } from "@/app/collection/collection-data";

// Specialization patterns for each agent type
const AGENT_PATTERNS: Record<string, { keywords: RegExp; restrictions: RegExp }> = {
  "frontend-design": {
    keywords: /ui|ux|frontend|react|next|tailwind|component|layout|landing|dashboard|responsive|animation|shadcn/i,
    restrictions: /backend only|database only|seo only|sales outreach|legal|medical/i,
  },
  "fullstack-builder": {
    keywords: /build|app|api|backend|frontend|database|auth|full.?stack|node|express|prisma|supabase|realtime|dashboard/i,
    restrictions: /image prompt|thumbnail|seo only|viral hook|creator voice/i,
  },
  "gpt-image": {
    keywords: /image|prompt|poster|thumbnail|camera|lighting|cinematic|visual|composition|mood|texture/i,
    restrictions: /backend|database|api|code implementation|seo strategy/i,
  },
  "deep-research": {
    keywords: /research|market|competitor|compare|analysis|report|industry|opportunity|findings/i,
    restrictions: /code implementation|actual image generation|database setup/i,
  },
  "hook-generator": {
    keywords: /hook|headline|reel|ad copy|caption|ctr|viral|attention|curiosity|engagement/i,
    restrictions: /backend|database|api|architecture|code implementation/i,
  },
  "social-media-os": {
    keywords: /social|content|reel|caption|growth|niche|audience|retention|instagram|youtube|tiktok|strategy/i,
    restrictions: /backend|database|api|code implementation/i,
  },
  "thumbnail-strategist": {
    keywords: /thumbnail|youtube|ctr|click|visual hierarchy|emotion|composition|title|video topic/i,
    restrictions: /backend|database|api|code implementation/i,
  },
  "design-auditor": {
    keywords: /audit|ui|ux|design|spacing|typography|accessibility|responsive|hierarchy|layout|usability/i,
    restrictions: /backend|database|api|seo strategy|sales outreach/i,
  },
  "voice-builder": {
    keywords: /voice|tone|brand|creator|writing style|personality|communication|audience|identity/i,
    restrictions: /backend|database|api|code implementation/i,
  },
  "loko-ai": {
    keywords: /.*/i,
    restrictions: /^$/i,
  },
  "brief-buddy": {
    keywords: /prompt|task|brief|instruction|note|writing/i,
    restrictions: /code|coding|develop|build|seo|sales|ui review|design|image|video/i,
  },
  "daily-druid": {
    keywords: /.*/i, // unrestricted
    restrictions: /^$/i, // no restrictions
  },
  "stacksmith-pro": {
    keywords: /nextjs|react|node|typescript|api|database|backend|full.?stack|architecture/i,
    restrictions: /ui design|ux|seo|sales|image|video|frontend only|css only/i,
  },
  "prospect-pilot": {
    keywords: /lead|outreach|cold email|sales|qualification/i,
    restrictions: /code|coding|ui design|seo|image|product development|legal/i,
  },
  "pixel-planner": {
    keywords: /ui|ux|design|layout|wireframe|landing|website|visual/i,
    restrictions: /code|backend|coding|seo|full stack|database|sales/i,
  },
  "lens-prompt-lab": {
    keywords: /image prompt|video prompt|camera|midjourney|flux|prompting/i,
    restrictions: /code|backend|seo|sales|actual image generation/i,
  },
  "tosh-companion": {
    keywords: /draft|creative|brainstorm|idea|support/i,
    restrictions: /code|legal|medical|financial advice/i,
  },
  "interface-inspector": {
    keywords: /screenshot|ui audit|review|ux|accessibility|conversion/i,
    restrictions: /code implementation|backend|seo|sales/i,
  },
  "commerce-studio": {
    keywords: /ecommerce|product|ad|marketing|store|shop/i,
    restrictions: /code|backend|seo|legal|compliance/i,
  },
  "search-signal": {
    keywords: /seo|keyword|content|topic|meta|search/i,
    restrictions: /code|ui design|paid ads|sales outreach/i,
  },
};

const GREETING_PATTERN =
  /^\s*(hi|hello|hey|hii|helo|namaste|salam|assalam|kaise ho|kese ho|kya haal|good morning|good afternoon|good evening)\s*[!.?]*\s*$/i;

export function checkAgentSpecialization(agentSlug: string, userMessage: string): { isAllowed: boolean; reason?: string } {
  const agent = getAssistant(agentSlug);
  if (!agent) return { isAllowed: true }; // fallback: allow if agent not found

  if (GREETING_PATTERN.test(userMessage)) {
    return { isAllowed: true };
  }

  // LokoAI Assistant has no restrictions
  if (agentSlug === "daily-druid" || agentSlug === "loko-ai") {
    return { isAllowed: true };
  }

  // Check if request violates restrictions
  const restrictionPattern = AGENT_PATTERNS[agentSlug]?.restrictions;
  if (restrictionPattern && restrictionPattern.test(userMessage)) {
    return {
      isAllowed: false,
      reason: `This request is outside my specialization. I focus on: ${agent.specializations.join(", ")}. Please use a more suitable LokoAI agent for this task.`,
    };
  }

  const keywordPattern = AGENT_PATTERNS[agentSlug]?.keywords;
  if (keywordPattern && !keywordPattern.test(userMessage)) {
    return {
      isAllowed: false,
      reason: `This request is outside my specialization. I focus on: ${agent.specializations.join(", ")}. Please use a more suitable LokoAI agent for this task.`,
    };
  }

  return { isAllowed: true };
}

export function getAgentSystemPrompt(agentSlug: string): string {
  const agent = getAssistant(agentSlug);
  if (!agent) return "";

  const specList = agent.specializations.join(", ");

  if (agent.skillPrompt) {
    return `${agent.skillPrompt}

You are ${agent.name}. ${agent.description}

Your specializations: ${specList}

Stay within this skill unless the user is only greeting you or asking a harmless clarification. If the request falls outside your specialization, politely suggest a better LokoAI agent.`;
  }
  
  return `You are ${agent.name}. ${agent.description}

Your specializations: ${specList}

Focus ONLY on these areas. If a request falls outside your specialization, politely decline and suggest they use another LokoAI agent that specializes in that area.

Always maintain your role and provide expert-level assistance within your domain.`;
}
