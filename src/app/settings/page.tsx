import { redirect } from "next/navigation";
import { AccountPageShell } from "@/components/AccountPageShell";
import { getCurrentUser } from "@/lib/supabase";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/settings");

  return (
    <AccountPageShell
      eyebrow="Settings"
      title="Account Settings"
      description="Manage theme, account, notification, and privacy preferences. Settings are saved in Supabase for your account."
    >
      <SettingsClient />
    </AccountPageShell>
  );
}
