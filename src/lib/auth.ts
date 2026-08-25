import { cookies } from "next/headers";

export type SessionUser = {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
    avatar_url: string;
    name?: string;
    picture?: string;
  };
  created_at?: string;
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const loggedIn = cookieStore.get("lokoai_logged_in")?.value === "true";
  if (!loggedIn) return null;
  return {
    id: "local-user-id",
    email: "developer@lokoai.local",
    user_metadata: {
      full_name: "Local Developer",
      avatar_url: "",
    },
    created_at: new Date().toISOString(),
  };
}
