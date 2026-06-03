import { getTemplateProfile } from "@/templates";

export function resolveLayoutPlan(category: string) {
  const template = getTemplateProfile(category);

  return {
    templateKind: template.kind,
    structure: template.structure,
    firstViewport: ["Navigation", "Hero copy", "Primary CTA", "Trust proof", "Visual centerpiece"],
    conversionPath: ["Value promise", "Proof", "Feature detail", "Pricing/package cue", "Final CTA"],
  };
}
