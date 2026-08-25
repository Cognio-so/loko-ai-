"use client";

import { createContext, useCallback, useContext, useMemo, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface LocalUser {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    avatar_url: string;
    name?: string;
    picture?: string;
  };
  created_at?: string;
}

interface AuthContextValue {
  user: LocalUser | null;
  isLoading: boolean;
  isConfigured: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MOCK_USER: LocalUser = {
  id: "local-user-id",
  email: "developer@lokoai.local",
  user_metadata: {
    full_name: "Local Developer",
    avatar_url: "",
  },
  created_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getLoggedInCookie = () => {
    if (typeof document === "undefined") return false;
    return document.cookie.split("; ").some((row) => row.startsWith("lokoai_logged_in=true"));
  };

  const refreshUser = useCallback(async () => {
    const loggedIn = getLoggedInCookie();
    setUser(loggedIn ? MOCK_USER : null);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const loggedIn = getLoggedInCookie();
    if (loggedIn) {
      setUser(MOCK_USER);
    } else {
      // For local development, default to logged in if no cookie exists yet
      document.cookie = "lokoai_logged_in=true; path=/; max-age=31536000";
      setUser(MOCK_USER);
    }
    setIsLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    document.cookie = "lokoai_logged_in=false; path=/; max-age=0";
    setUser(null);
    router.push("/");
    router.refresh();
  }, [router]);

  const value = useMemo(
    () => ({ user, isLoading, isConfigured: false, signOut, refreshUser }),
    [user, isLoading, signOut, refreshUser]
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
