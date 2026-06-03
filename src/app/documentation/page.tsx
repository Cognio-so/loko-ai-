import { AccountPageShell } from "@/components/AccountPageShell";
import DocumentationClient from "./DocumentationClient";

export default function DocumentationPage() {
  return (
    <AccountPageShell
      eyebrow="Documentation"
      title="LokoAI Documentation"
      description="A practical guide for using chat, models, APIs, workflows, integrations, authentication, Supabase, OpenRouter, and common account features."
    >
      <DocumentationClient />
    </AccountPageShell>
  );
}
