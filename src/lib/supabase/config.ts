export const protectedRoutes: string[] = [
  "/dashboard",
  "/profile",
  "/settings",
  "/generate", // Assuming generation features require auth
  "/api/chat", // If chat history is user-specific
  // Add other routes that should require authentication
];

function getSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_ANON_KEY ||
    ""
  );
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      getSupabaseAnonKey()
  );
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = getSupabaseAnonKey();
  
  if (!url || !anonKey) {
    console.warn("Supabase URL or Anon Key is missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.");
  }

  return {
    url: url || "https://your-supabase-url.supabase.co", // Placeholder for user
    anonKey: anonKey || "your-supabase-anon-key", // Placeholder for user
    configured: isSupabaseConfigured(),
  };
}

export function getSupabaseServerConfig() {
  const publicConfig = getSupabaseConfig();
  const url = process.env.SUPABASE_URL || publicConfig.url;
  const anonKey = process.env.SUPABASE_ANON_KEY || publicConfig.anonKey;

  return {
    url,
    anonKey,
    configured: Boolean(url && anonKey && !url.includes("your-supabase-url")),
  };
}

export function isProtectedPath(pathname: string) {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}
