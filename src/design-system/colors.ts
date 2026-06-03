export const colors = {
  brand: {
    ink: "#08111f",
    sky: "#0ea5e9",
    blue: "#2563eb",
    cyan: "#06b6d4",
    mint: "#10b981",
  },
  neutral: {
    0: "#ffffff",
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    500: "#64748b",
    700: "#334155",
    900: "#0f172a",
    950: "#020617",
  },
  category: {
    saas: { bg: "#f7f9fc", surface: "#ffffff", accent: "#2563eb", accent2: "#06b6d4", text: "#0f172a", muted: "#64748b" },
    aiStartup: { bg: "#f5f8ff", surface: "#ffffff", accent: "#635bff", accent2: "#00c2ff", text: "#0b1020", muted: "#64748b" },
    agency: { bg: "#f8f5ff", surface: "#ffffff", accent: "#8b5cf6", accent2: "#ec4899", text: "#151225", muted: "#71657f" },
    consulting: { bg: "#f7faf9", surface: "#ffffff", accent: "#0f766e", accent2: "#2563eb", text: "#10201c", muted: "#60736d" },
    realEstate: { bg: "#f4f7fb", surface: "#ffffff", accent: "#5067a8", accent2: "#20a26b", text: "#1f2a3d", muted: "#64748b" },
    portfolio: { bg: "#fbf7ff", surface: "#ffffff", accent: "#a855f7", accent2: "#f43f5e", text: "#171124", muted: "#746980" },
    ecommerce: { bg: "#fffaf2", surface: "#ffffff", accent: "#b7791f", accent2: "#0f766e", text: "#21170e", muted: "#756452" },
    restaurant: { bg: "#fff8ef", surface: "#fffaf2", accent: "#b7652d", accent2: "#1f6f5b", text: "#24150f", muted: "#7c6658" },
  },
} as const;

export type CategoryColorName = keyof typeof colors.category;
