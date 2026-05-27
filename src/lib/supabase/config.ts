export const protectedRoutes: string[] = []; // No protected routes - everything is public

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
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co",
    anonKey: getSupabaseAnonKey() || "missing-anon-key",
    configured: isSupabaseConfigured(),
  };
}

export function isProtectedPath(_pathname: string) {
  return false; // Nothing is protected
}
