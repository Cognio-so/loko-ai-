import { getTemplateProfile } from "@/templates";

export function resolveThemeProfile(category: string) {
  const template = getTemplateProfile(category);

  return {
    palette: template.palette,
    tone: template.tone,
    cssVars: {
      "--bg": template.palette.bg,
      "--surface": template.palette.surface,
      "--accent": template.palette.accent,
      "--accent-2": template.palette.accent2,
      "--text": template.palette.text,
      "--muted": template.palette.muted,
    },
  };
}
