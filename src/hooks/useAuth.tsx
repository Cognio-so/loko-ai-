"use client";

import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { isTheme, type Theme } from "@/components/ThemeProvider";

export type AppProfile = {
  id: string;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  theme: Theme | null;
  created_at?: string;
  updated_at?: string;
};

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isConfigured: boolean;
  profile: AppProfile | null;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<AppProfile, "username" | "avatar_url" | "theme">>) => Promise<AppProfile | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  const loadProfile = useCallback(async (nextUser: User | null) => {
    if (!nextUser) {
      setProfile(null);
      return null;
    }

    const fallbackUsername =
      (typeof nextUser.user_metadata?.full_name === "string" && nextUser.user_metadata.full_name) ||
      (typeof nextUser.user_metadata?.name === "string" && nextUser.user_metadata.name) ||
      nextUser.email?.split("@")[0] ||
      "Account";

    const fallbackAvatar =
      (typeof nextUser.user_metadata?.avatar_url === "string" && nextUser.user_metadata.avatar_url) ||
      (typeof nextUser.user_metadata?.picture === "string" && nextUser.user_metadata.picture) ||
      null;

    const existing = await supabase
      .from("profiles")
      .select("id,email,username,avatar_url,theme,created_at,updated_at")
      .eq("id", nextUser.id)
      .maybeSingle();

    const { data, error } = existing.data
      ? await supabase
          .from("profiles")
          .update({
            email: nextUser.email ?? existing.data.email,
            avatar_url: existing.data.avatar_url || fallbackAvatar,
            updated_at: new Date().toISOString(),
          })
          .eq("id", nextUser.id)
          .select("id,email,username,avatar_url,theme,created_at,updated_at")
          .single()
      : await supabase
          .from("profiles")
          .insert({
            id: nextUser.id,
            email: nextUser.email ?? null,
            username: fallbackUsername,
            avatar_url: fallbackAvatar,
          })
      .select("id,email,username,avatar_url,theme,created_at,updated_at")
      .single();

    if (error) {
      setProfile(null);
      return null;
    }

    const normalizedProfile: AppProfile = {
      ...data,
      theme: isTheme(data.theme) ? data.theme : null,
    };
    setProfile(normalizedProfile);
    return normalizedProfile;
  }, [supabase]);

  const refreshUser = useCallback(async () => {
    const {
      data: { user: nextUser },
    } = await supabase.auth.getUser();
    setUser(nextUser);
    await loadProfile(nextUser);
    setIsLoading(false);
  }, [loadProfile, supabase]);

  const refreshProfile = useCallback(async () => {
    await loadProfile(user);
  }, [loadProfile, user]);

  const updateProfile = useCallback(
    async (updates: Partial<Pick<AppProfile, "username" | "avatar_url" | "theme">>) => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email ?? null,
            ...updates,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        )
        .select("id,email,username,avatar_url,theme,created_at,updated_at")
        .single();

      if (error) return null;
      const normalizedProfile: AppProfile = {
        ...data,
        theme: isTheme(data.theme) ? data.theme : null,
      };
      setProfile(normalizedProfile);
      window.dispatchEvent(new Event("profilechange"));
      return normalizedProfile;
    },
    [supabase, user]
  );

  useEffect(() => {
    const onProfileChange = () => void loadProfile(user);
    window.addEventListener("profilechange", onProfileChange);
    return () => window.removeEventListener("profilechange", onProfileChange);
  }, [loadProfile, user]);

  useEffect(() => {
    let isActive = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!isActive) return;
      setUser(data.user);
      void loadProfile(data.user);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      void loadProfile(session?.user ?? null);
      setIsLoading(false);
      router.refresh();
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
    router.refresh();
  }, [loadProfile, router, supabase]);

  const value = useMemo(
    () => ({ user, isLoading, isConfigured, profile, signOut, refreshUser, refreshProfile, updateProfile }),
    [user, isLoading, isConfigured, profile, signOut, refreshUser, refreshProfile, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
