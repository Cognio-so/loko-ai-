import { AccountPageShell } from "@/components/AccountPageShell";
import AppearanceClient from "./AppearanceClient";

export default function AppearancePage() {
  return (
    <AccountPageShell
      eyebrow="Appearance"
      title="Theme Studio"
      description="Choose the visual system for LokoAI. Changes apply instantly across the dashboard, chat, sidebar, navbar, profile, settings, documentation, community, and support pages."
    >
      <AppearanceClient />
    </AccountPageShell>
  );
}
