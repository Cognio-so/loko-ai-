"use client";

import { motion } from "framer-motion";
import { Check, Moon, Palette, Sparkles, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useTheme, type Theme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";

const themes: Array<{
  value: Theme;
  name: string;
  description: string;
  background: string;
  accent: string;
  icon: typeof Sun;
}> = [
  { value: "light", name: "Light Theme", description: "Clean, bright workspace for daylight sessions.", background: "#ffffff", accent: "#0ea5e9", icon: Sun },
  { value: "dark", name: "Dark Theme", description: "Balanced dark UI with calm contrast.", background: "#0f172a", accent: "#38bdf8", icon: Moon },
  { value: "midnight", name: "Midnight Theme", description: "Deep focus mode with low-glare surfaces.", background: "#020617", accent: "#818cf8", icon: Moon },
  { value: "blue-neon", name: "Blue Neon Theme", description: "High energy blue glow for AI building.", background: "#031b34", accent: "#22d3ee", icon: Sparkles },
  { value: "purple-ai", name: "Purple AI Theme", description: "Creative violet interface with soft highlights.", background: "#1a103d", accent: "#c084fc", icon: Sparkles },
  { value: "glass", name: "Glassmorphism Theme", description: "Blurred translucent panels and airy depth.", background: "rgba(255,255,255,.62)", accent: "#38bdf8", icon: Palette },
];

export default function AppearanceClient() {
  const { theme, setTheme } = useTheme();
  const { user, updateProfile } = useAuth();

  const chooseTheme = async (nextTheme: Theme) => {
    setTheme(nextTheme);
    if (user) await updateProfile({ theme: nextTheme });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {themes.map((item, index) => {
        const Icon = item.icon;
        const isActive = theme === item.value;
        return (
          <motion.button
            key={item.value}
            type="button"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.28 }}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => void chooseTheme(item.value)}
            className="text-left"
          >
            <Card className={`h-full overflow-hidden p-4 transition ${isActive ? "border-sky-400 shadow-sky-500/20 ring-2 ring-sky-400/30" : "hover:border-sky-300"}`}>
              <div className="relative mb-4 h-40 overflow-hidden rounded-2xl border border-border" style={{ background: item.background }}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(255,255,255,.28),transparent_26%),radial-gradient(circle_at_88%_8%,rgba(255,255,255,.18),transparent_24%)]" />
                <div className="absolute left-4 top-4 h-8 w-24 rounded-full border border-white/25 bg-white/20 backdrop-blur" />
                <div className="absolute bottom-4 left-4 right-4 grid grid-cols-[1fr_.65fr] gap-3">
                  <div className="space-y-2 rounded-xl border border-white/20 bg-white/18 p-3 backdrop-blur">
                    <div className="h-2 w-24 rounded-full bg-white/75" />
                    <div className="h-2 w-16 rounded-full bg-white/35" />
                    <div className="h-8 rounded-lg" style={{ background: item.accent }} />
                  </div>
                  <div className="rounded-xl border border-white/20 bg-white/18 p-3 backdrop-blur">
                    <div className="mb-2 h-10 rounded-lg" style={{ background: `${item.accent}66` }} />
                    <div className="h-2 rounded-full bg-white/45" />
                  </div>
                </div>
                {item.value === "glass" ? <div className="absolute inset-0 backdrop-blur-[20px]" /> : null}
              </div>

              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                      <Icon className="h-4 w-4" />
                    </span>
                    <h2 className="text-base font-bold text-foreground">{item.name}</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
                </div>
                {isActive ? (
                  <Badge variant="premium" className="gap-1">
                    <Check className="h-3 w-3" />
                    Active
                  </Badge>
                ) : null}
              </div>
            </Card>
          </motion.button>
        );
      })}
    </div>
  );
}
