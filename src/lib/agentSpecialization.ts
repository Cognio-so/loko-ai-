import { getAssistant } from "@/app/collection/collection-data";

// Specialization patterns for each agent type
const AGENT_PATTERNS: Record<string, { keywords: RegExp; restrictions: RegExp }> = {
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

export function checkAgentSpecialization(agentSlug: string, userMessage: string): { isAllowed: boolean; reason?: string } {
  const agent = getAssistant(agentSlug);
  if (!agent) return { isAllowed: true }; // fallback: allow if agent not found

  // LokoAI Assistant (formerly Daily Druid) has no restrictions
  if (agentSlug === "daily-druid") {
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
  
  return `You are ${agent.name}. ${agent.description}

Your specializations: ${specList}

Focus ONLY on these areas. If a request falls outside your specialization, politely decline and suggest they use another LokoAI agent that specializes in that area.

Always maintain your role and provide expert-level assistance within your domain.`;
}
