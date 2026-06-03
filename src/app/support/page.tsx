import { AccountPageShell } from "@/components/AccountPageShell";
import SupportClient from "./SupportClient";

export default function SupportPage() {
  return (
    <AccountPageShell
      eyebrow="Support"
      title="Support Center"
      description="Contact support, report bugs, request features, review service status, and submit tickets that persist in Supabase."
    >
      <SupportClient />
    </AccountPageShell>
  );
}
