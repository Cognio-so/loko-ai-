export type GenerationSurface = "website" | "webapp" | "image" | "text";

export type GenerationIntent = {
  surface: GenerationSurface;
  category:
    | "ecommerce"
    | "saas"
    | "portfolio"
    | "restaurant"
    | "education"
    | "real_estate"
    | "startup"
    | "dashboard"
    | "blog"
    | "social"
    | "business"
    | "image"
    | "text"
    | "general";
  title: string;
  summary: string;
  styleDirection: string;
  sectionLabels: string[];
  palette: {
    bg: string;
    surface: string;
    accent: string;
    accent2: string;
    text: string;
    muted: string;
  };
};

function toTitleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function cleanPrompt(prompt: string) {
  return prompt
    .replace(/build mode:\s*(app|landing|dashboard)\.?/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromPrompt(prompt: string) {
  const cleaned = cleanPrompt(prompt)
    .replace(/[^a-z0-9\s&-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "Premium AI Creation";
  return toTitleCase(cleaned.split(" ").slice(0, 5).join(" "));
}

export function detectGenerationIntent(prompt: string): GenerationIntent {
  const normalized = cleanPrompt(prompt);
  const lower = normalized.toLowerCase();

  const base = {
    title: titleFromPrompt(prompt),
    summary: normalized || "A premium AI-generated digital experience.",
  };

  if (/(logo|poster|banner|thumbnail|flyer|cover art|album art|illustration|image|graphic)/.test(lower)) {
    return {
      ...base,
      surface: "image",
      category: "image",
      styleDirection: "Bold art direction, strong composition, premium presentation, and a share-ready visual asset board.",
      sectionLabels: ["Concept", "Main Art", "Variations", "Prompt Notes"],
      palette: {
        bg: "#07111f",
        surface: "#101c31",
        accent: "#62e6ff",
        accent2: "#9dff7a",
        text: "#f8fbff",
        muted: "#9db0c9",
      },
    };
  }

  if (/(article|blog|essay|copy|sales letter|brochure|case study|documentation|text page)/.test(lower)) {
    return {
      ...base,
      surface: "text",
      category: "text",
      styleDirection: "Editorial storytelling, readable type hierarchy, premium copy blocks, and strong callout moments.",
      sectionLabels: ["Header", "Lead", "Body", "Callout"],
      palette: {
        bg: "#fcfaf6",
        surface: "#fffdf9",
        accent: "#8b5cf6",
        accent2: "#14b8a6",
        text: "#1f2937",
        muted: "#6b7280",
      },
    };
  }

  if (/(dashboard|admin|portal|crm|cms|workspace|panel)/.test(lower)) {
    return {
      ...base,
      surface: "webapp",
      category: "dashboard",
      styleDirection: "Operational clarity, rich metrics, modular cards, side navigation, and polished productivity UX.",
      sectionLabels: ["Sidebar", "Topbar", "Metrics", "Activity"],
      palette: {
        bg: "#0a0f1c",
        surface: "#141c2e",
        accent: "#7c8cff",
        accent2: "#4ade80",
        text: "#eef3ff",
        muted: "#8fa0bf",
      },
    };
  }

  if (/(blog|article|news|magazine|publication|reading|post)/.test(lower)) {
    return {
      ...base,
      surface: "website",
      category: "blog",
      styleDirection: "Editorial reading-first layout with article hierarchy, category navigation, and a calmer content-driven presentation.",
      sectionLabels: ["Featured Story", "Categories", "Latest Articles", "Reading View"],
      palette: {
        bg: "#fcfbf8",
        surface: "#ffffff",
        accent: "#1d4ed8",
        accent2: "#0f766e",
        text: "#1f2937",
        muted: "#6b7280",
      },
    };
  }

  if (/(social app|social network|community app|feed|profile|messaging|chat app)/.test(lower)) {
    return {
      ...base,
      surface: "webapp",
      category: "social",
      styleDirection: "Feed-first product UI with profile surfaces, interaction states, and modern messaging/community patterns.",
      sectionLabels: ["Feed", "Profile", "Messages", "Community"],
      palette: {
        bg: "#0b1020",
        surface: "#151c32",
        accent: "#7c8cff",
        accent2: "#f472b6",
        text: "#f8fbff",
        muted: "#9aa8c7",
      },
    };
  }

  if (/(business site|company|corporate|services|consulting|team|contact form|local business)/.test(lower)) {
    return {
      ...base,
      surface: "website",
      category: "business",
      styleDirection: "Trust-led company website design with services, team credibility, and clean contact conversion flow.",
      sectionLabels: ["Services", "Why Us", "Team", "Contact"],
      palette: {
        bg: "#f5f7fb",
        surface: "#ffffff",
        accent: "#2563eb",
        accent2: "#14b8a6",
        text: "#1e293b",
        muted: "#64748b",
      },
    };
  }

  if (/(e-?commerce|fashion store|shop|store|product grid|cart|shopping)/.test(lower)) {
    return {
      ...base,
      surface: "website",
      category: "ecommerce",
      styleDirection: "Editorial commerce, stronger merchandising, rich product cards, premium retail hierarchy, and conversion details.",
      sectionLabels: ["Promo Bar", "Collections", "Products", "Reviews"],
      palette: {
        bg: "#091221",
        surface: "#10203a",
        accent: "#f5c86b",
        accent2: "#ffffff",
        text: "#f8fbff",
        muted: "#b6c3d9",
      },
    };
  }

  if (/(restaurant|food|menu|chef|delivery|reservation|cafe|coffee)/.test(lower)) {
    return {
      ...base,
      surface: "website",
      category: "restaurant",
      styleDirection: "Warm hospitality design, appetite-led visuals, cozy depth, and reservation-friendly information hierarchy.",
      sectionLabels: ["Hero", "Menu", "Chef Story", "Booking"],
      palette: {
        bg: "#20110b",
        surface: "#342018",
        accent: "#ff9d3d",
        accent2: "#ffe4c2",
        text: "#fff7ee",
        muted: "#d4bfa7",
      },
    };
  }

  if (/(portfolio|agency|studio|creative|brand|branding)/.test(lower)) {
    return {
      ...base,
      surface: "website",
      category: "portfolio",
      styleDirection: "Creative confidence, distinctive section rhythm, case-study emphasis, and bold presentation over generic SaaS structure.",
      sectionLabels: ["Hero", "Work", "Services", "Team"],
      palette: {
        bg: "#0a0614",
        surface: "#171029",
        accent: "#ff5fcf",
        accent2: "#8b5cf6",
        text: "#f6f3ff",
        muted: "#b6abd8",
      },
    };
  }

  if (/(course|education|learning|academy|student|instructor)/.test(lower)) {
    return {
      ...base,
      surface: "website",
      category: "education",
      styleDirection: "Structured learning product design with strong browse paths, helpful stats, and aspirational educational branding.",
      sectionLabels: ["Hero", "Courses", "Instructors", "Pricing"],
      palette: {
        bg: "#eef4ff",
        surface: "#ffffff",
        accent: "#14b8a6",
        accent2: "#8b5cf6",
        text: "#1c2540",
        muted: "#64748b",
      },
    };
  }

  if (/(real estate|property|listing|apartment|villa|mortgage|realtor)/.test(lower)) {
    return {
      ...base,
      surface: "website",
      category: "real_estate",
      styleDirection: "Trust-heavy property presentation, premium listing cards, map-aware layout, and upscale market positioning.",
      sectionLabels: ["Search", "Featured Listings", "Neighborhoods", "Agents"],
      palette: {
        bg: "#edf2f7",
        surface: "#ffffff",
        accent: "#5b6fb3",
        accent2: "#2db57c",
        text: "#24324a",
        muted: "#6b7280",
      },
    };
  }

  if (/(mobile app|startup|waitlist|beta|app store|download)/.test(lower)) {
    return {
      ...base,
      surface: "website",
      category: "startup",
      styleDirection: "Launch energy, sharper value framing, app-centric visuals, and premium modern startup pacing.",
      sectionLabels: ["Hero", "Benefits", "Onboarding", "Testimonials"],
      palette: {
        bg: "#06111f",
        surface: "#0f1f35",
        accent: "#25b4ff",
        accent2: "#b7ff4a",
        text: "#f4fbff",
        muted: "#a8bbd1",
      },
    };
  }

  return {
    ...base,
    surface: "website",
    category: "saas",
    styleDirection: "Premium product-led website with stronger differentiation, modern section flow, and less template-like repetition.",
    sectionLabels: ["Hero", "Features", "Proof", "CTA"],
    palette: {
      bg: "#081121",
      surface: "#121c31",
      accent: "#7c8cff",
      accent2: "#62e6ff",
      text: "#f8fbff",
      muted: "#9db0c9",
    },
  };
}

export function buildIntentInstructions(prompt: string) {
  const intent = detectGenerationIntent(prompt);

  if (intent.surface === "image") {
    return `This is an IMAGE-CENTRIC request. Do NOT turn it into a generic SaaS landing page.
- Build a premium creative asset showcase around the requested image/art concept
- Render a strong hero art piece using inline SVG or styled HTML illustration
- Include asset title, tagline, prompt notes, and 2-3 visual variations
- The preview should feel like an image studio / campaign board, not a standard business homepage`;
  }

  if (intent.surface === "text") {
    return `This is a TEXT / CONTENT-CENTRIC request. Do NOT default to product marketing blocks.
- Build a polished editorial or copy-led experience
- Prioritize readability, section hierarchy, pull-quotes, lists, and clear CTAs
- The preview should feel like a premium article, brochure, or conversion page depending on the prompt`;
  }

  if (intent.surface === "webapp") {
    return `This is a WEB APP / DASHBOARD request.
- Build an application-style interface, not just a marketing landing page
- Include side navigation, operational cards, filters, activity, and realistic product UI patterns
- The preview should show the main app screen or dashboard canvas`;
  }

  return `This is a WEBSITE request in the "${intent.category}" category.
- Follow the category's natural structure instead of forcing the same SaaS section order
- Use category-appropriate content, labels, modules, and visual direction
- Avoid generic "future of..." headlines and placeholder product copy`;
}
