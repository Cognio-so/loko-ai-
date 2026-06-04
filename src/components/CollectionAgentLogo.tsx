import type { CollectionAssistant } from "@/app/collection/collection-data";

const LOGO_PALETTES = [
  { shell: "border-sky-200 bg-sky-50 text-sky-700", badge: "bg-sky-500", ring: "shadow-sky-500/14" },
  { shell: "border-emerald-200 bg-emerald-50 text-emerald-700", badge: "bg-emerald-500", ring: "shadow-emerald-500/14" },
  { shell: "border-indigo-200 bg-indigo-50 text-indigo-700", badge: "bg-indigo-500", ring: "shadow-indigo-500/14" },
  { shell: "border-rose-200 bg-rose-50 text-rose-700", badge: "bg-rose-500", ring: "shadow-rose-500/14" },
  { shell: "border-violet-200 bg-violet-50 text-violet-700", badge: "bg-violet-500", ring: "shadow-violet-500/14" },
  { shell: "border-amber-200 bg-amber-50 text-amber-700", badge: "bg-amber-500", ring: "shadow-amber-500/14" },
  { shell: "border-cyan-200 bg-cyan-50 text-cyan-700", badge: "bg-cyan-500", ring: "shadow-cyan-500/14" },
  { shell: "border-slate-300 bg-slate-100 text-slate-800", badge: "bg-slate-700", ring: "shadow-slate-500/14" },
] as const;

function paletteFor(slug: string) {
  const index = slug.split("").reduce((total, char) => total + char.charCodeAt(0), 0) % LOGO_PALETTES.length;
  return LOGO_PALETTES[index];
}

export function CollectionAgentLogo({
  assistant,
  size = "md",
}: {
  assistant: CollectionAssistant;
  size?: "sm" | "md" | "lg";
}) {
  const Icon = assistant.icon;
  const palette = paletteFor(assistant.slug);
  const sizeClass = size === "lg" ? "h-16 w-16 rounded-3xl" : size === "sm" ? "h-8 w-8 rounded-xl" : "h-14 w-14 rounded-2xl";
  const innerClass = size === "lg" ? "rounded-[22px]" : size === "sm" ? "rounded-[10px]" : "rounded-[17px]";
  const iconClass = size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4 w-4" : "h-6 w-6";

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center border p-[1px] shadow-lg ${palette.shell} ${palette.ring} ${sizeClass}`}
    >
      <div className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-white/82 ${innerClass}`}>
        <div className="absolute inset-0 bg-current opacity-[0.06]" />
        <div className="absolute -right-4 -top-4 h-10 w-10 rounded-full bg-white/70 blur-md" />
        <Icon className={`relative ${iconClass}`} />
      </div>
      <span
        className={`absolute -bottom-1 -right-1 rounded-lg px-1.5 py-0.5 text-[8px] font-black leading-none tracking-wide text-white shadow-sm ring-2 ring-white ${palette.badge} ${
          size === "sm" ? "hidden" : ""
        }`}
      >
        {assistant.logoText}
      </span>
    </div>
  );
}
