"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileThemeSync() {
  const { profile } = useAuth();
  const { setTheme } = useTheme();
  const appliedProfileTheme = useRef<string | null>(null);

  useEffect(() => {
    if (!profile?.theme || appliedProfileTheme.current === profile.theme) return;
    appliedProfileTheme.current = profile.theme;
    setTheme(profile.theme);
  }, [profile?.theme, setTheme]);

  return null;
}
