import { colors, type CategoryColorName } from "@/design-system/colors";

export type TemplateKind =
  | "saas"
  | "ai-startup"
  | "agency"
  | "consulting"
  | "real-estate"
  | "portfolio"
  | "ecommerce"
  | "restaurant"
  | "landing-page";

export type TemplateProfile = {
  kind: TemplateKind;
  palette: typeof colors.category[CategoryColorName];
  structure: string[];
  tone: string;
  proofLogos: string[];
};

export const templateProfiles: Record<TemplateKind, TemplateProfile> = {
  saas: {
    kind: "saas",
    palette: colors.category.saas,
    structure: ["Hero", "Product Preview", "Features", "Integrations", "Pricing", "FAQ", "CTA"],
    tone: "Crisp product-led SaaS with strong dashboard preview and conversion flow.",
    proofLogos: ["Linear", "Vercel", "Stripe", "Raycast"],
  },
  "ai-startup": {
    kind: "ai-startup",
    palette: colors.category.aiStartup,
    structure: ["Hero", "AI Workflow", "Model Routing", "Use Cases", "Security", "CTA"],
    tone: "AI-native startup with intelligent workflow, clear trust cues, and futuristic polish.",
    proofLogos: ["OpenAI", "Claude", "Perplexity", "Cursor"],
  },
  agency: {
    kind: "agency",
    palette: colors.category.agency,
    structure: ["Hero", "Work", "Services", "Process", "Testimonials", "CTA"],
    tone: "Creative studio with bold case-study rhythm and memorable visual direction.",
    proofLogos: ["Framer", "Notion", "Figma", "Webflow"],
  },
  consulting: {
    kind: "consulting",
    palette: colors.category.consulting,
    structure: ["Hero", "Services", "Outcomes", "Method", "Clients", "Contact"],
    tone: "Trust-led consulting page with executive clarity and strong outcome framing.",
    proofLogos: ["Deloitte", "BCG", "Stripe", "Vercel"],
  },
  "real-estate": {
    kind: "real-estate",
    palette: colors.category.realEstate,
    structure: ["Hero", "Search", "Listings", "Neighborhoods", "Agents", "Contact"],
    tone: "Premium property presentation with trust, location detail, and elegant listing cards.",
    proofLogos: ["Compass", "Zillow", "Airbnb", "Realtor"],
  },
  portfolio: {
    kind: "portfolio",
    palette: colors.category.portfolio,
    structure: ["Hero", "Selected Work", "Services", "About", "Testimonials", "Contact"],
    tone: "Distinctive personal/studio portfolio with strong craft and case-study hierarchy.",
    proofLogos: ["Awwwards", "Dribbble", "Behance", "Framer"],
  },
  ecommerce: {
    kind: "ecommerce",
    palette: colors.category.ecommerce,
    structure: ["Hero", "Collections", "Products", "Reviews", "Guarantee", "CTA"],
    tone: "Editorial commerce with premium merchandising, urgency, and buyer confidence.",
    proofLogos: ["Shopify", "Klaviyo", "Stripe", "Afterpay"],
  },
  restaurant: {
    kind: "restaurant",
    palette: colors.category.restaurant,
    structure: ["Hero", "Menu", "Story", "Reviews", "Reservations", "Footer"],
    tone: "Warm hospitality with appetite-led visuals, menu storytelling, and reservation conversion.",
    proofLogos: ["Michelin Guide", "Google 4.9", "Local Roasters", "OpenTable"],
  },
  "landing-page": {
    kind: "landing-page",
    palette: colors.category.saas,
    structure: ["Hero", "Benefits", "Proof", "Features", "Pricing", "FAQ", "CTA"],
    tone: "High-converting landing page with strong first viewport and polished proof sections.",
    proofLogos: ["Vercel", "Stripe", "Linear", "Framer"],
  },
};

export function getTemplateProfile(category: string): TemplateProfile {
  if (category === "restaurant") return templateProfiles.restaurant;
  if (category === "ecommerce") return templateProfiles.ecommerce;
  if (category === "portfolio") return templateProfiles.portfolio;
  if (category === "real_estate") return templateProfiles["real-estate"];
  if (category === "business") return templateProfiles.consulting;
  if (category === "startup") return templateProfiles["ai-startup"];
  if (category === "saas" || category === "dashboard") return templateProfiles.saas;
  return templateProfiles["landing-page"];
}
