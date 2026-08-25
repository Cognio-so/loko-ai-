"use client";

import { Loader2, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

type AuthPanelProps = {
  nextPath?: string;
  onSuccess?: () => void;
};

export default function AuthPanel({ nextPath = "/dashboard", onSuccess }: AuthPanelProps) {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const safeNextPath = nextPath.startsWith("/") ? nextPath : "/dashboard";

  const handleDeveloperLogin = async () => {
    setIsLoading(true);
    // Set the cookie for local login
    document.cookie = "lokoai_logged_in=true; path=/; max-age=31536000";
    
    // Refresh the user session in useAuth state
    await refreshUser();
    
    // Slight artificial delay for feedback
    setTimeout(() => {
      setIsLoading(false);
      onSuccess?.();
      router.push(safeNextPath);
      router.refresh();
    }, 800);
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative rounded-[1.75rem] p-[1px] bg-gradient-to-b from-sky-200/80 via-white to-cyan-200/80 shadow-[0_22px_70px_rgba(14,165,233,0.18)]">
        <div className="pointer-events-none absolute -inset-10 rounded-[2.25rem] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.22),transparent_55%),radial-gradient(circle_at_bottom,rgba(14,165,233,0.16),transparent_50%)] blur-2xl" />
        <Card className="relative w-full rounded-[1.7rem] border border-white/50 bg-white/85 shadow-[0_10px_30px_rgba(15,23,42,0.10)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-6 top-0 h-20 rounded-b-[1.5rem] bg-gradient-to-b from-sky-100/80 to-transparent opacity-80 blur-2xl" />
          <CardHeader>
            <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/15 text-sky-500">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Developer Access</CardTitle>
            <CardDescription className="text-slate-500 mt-1">
              LokoAI is configured for local-first, offline mode. Enter your local workspace below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4 text-xs leading-relaxed text-sky-800 dark:border-sky-950/30 dark:bg-sky-950/20 dark:text-sky-300">
              <div className="flex gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-sky-500 mt-0.5 animate-pulse" />
                <div>
                  <p className="font-bold">Offline SQLite Mode Active</p>
                  <p className="mt-0.5 opacity-90">
                    All projects, design files, code generation data, and preferences are stored directly on this computer.
                  </p>
                </div>
              </div>
            </div>

            <Button
              className="relative w-full rounded-2xl py-6 bg-slate-950 text-white font-bold hover:bg-slate-900 shadow-xl shadow-slate-950/15 transition-all flex items-center justify-center gap-2 group active:scale-98"
              onClick={handleDeveloperLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Entering Workspace...
                </>
              ) : (
                <>
                  Enter Workspace as Developer
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}