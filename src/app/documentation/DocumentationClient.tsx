"use client";

import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const docs = [
  { title: "Getting Started", body: "Create an account, open the dashboard, choose a model, and describe what you want LokoAI to build.", code: "npm run dev" },
  { title: "AI Chat", body: "Use the chat composer for app generation, code edits, file analysis, and follow-up refinements. Attach supported files when context matters.", code: "Ask: Build a CRM dashboard with invoices and analytics" },
  { title: "Models", body: "Pick models from the dashboard model selector. LokoAI stores your selected model locally for the next session.", code: "localStorage.setItem('loko:selected-model', modelId)" },
  { title: "API Usage", body: "The app exposes API routes for chat, generation, project persistence, sandbox execution, and generated file downloads.", code: "POST /api/chat\nPOST /api/generate\nGET /api/projects" },
  { title: "Workflows", body: "Start with a prompt, inspect generated files, continue in chat, then save or download generated assets.", code: "Prompt -> Generate -> Preview -> Refine -> Save" },
  { title: "Integrations", body: "Use the integrations page to review connected services and route model or storage features through configured providers.", code: "NEXT_PUBLIC_SUPABASE_URL=...\nNEXT_PUBLIC_SUPABASE_ANON_KEY=..." },
  { title: "Authentication", body: "Supabase Auth manages sessions. Protected account actions read the current user on the server and redirect to login when needed.", code: "const user = await getCurrentUser()" },
  { title: "Supabase Setup", body: "Run the SQL migration in the Supabase dashboard or CLI, then create the avatars storage bucket and configure public URL access through policies.", code: "supabase db push" },
  { title: "OpenRouter Setup", body: "Add your OpenRouter key to environment variables and choose supported model IDs from the model picker.", code: "OPENROUTER_API_KEY=sk-or-..." },
  { title: "FAQ", body: "Themes, avatars, settings, support tickets, and community posts persist in Supabase when the database tables are installed.", code: "localStorage + profiles table = persistent theme" },
];

function CodeSnippet({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-slate-400">
        <span>Example</span>
        <button type="button" onClick={() => void copy()} className="flex items-center gap-1.5 rounded-lg px-2 py-1 transition hover:bg-white/10 hover:text-white">
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="scrollbar-soft overflow-auto p-4 text-xs leading-6"><code>{code}</code></pre>
    </div>
  );
}

export default function DocumentationClient() {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(
    () => docs.filter((doc) => `${doc.title} ${doc.body}`.toLowerCase().includes(query.toLowerCase())),
    [query]
  );
  const activeDoc = filtered[activeIndex] ?? filtered[0] ?? docs[0];
  const currentIndex = Math.max(0, filtered.findIndex((doc) => doc.title === activeDoc.title));

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
          <Input value={query} onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); }} placeholder="Search docs..." className="pl-10" />
        </div>
        <Card className="p-2">
          {filtered.map((doc, index) => (
            <button
              key={doc.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`flex h-10 w-full items-center rounded-xl px-3 text-left text-sm font-semibold transition ${
                activeDoc.title === doc.title ? "bg-sky-500/10 text-sky-600 dark:text-sky-200" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {doc.title}
            </button>
          ))}
        </Card>
      </aside>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{activeDoc.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm leading-7 text-muted-foreground">{activeDoc.body}</p>
          <CodeSnippet code={activeDoc.code} />
          <div className="flex items-center justify-between border-t border-border pt-5">
            <Button variant="outline" disabled={currentIndex <= 0} onClick={() => setActiveIndex(currentIndex - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button variant="outline" disabled={currentIndex >= filtered.length - 1} onClick={() => setActiveIndex(currentIndex + 1)}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
