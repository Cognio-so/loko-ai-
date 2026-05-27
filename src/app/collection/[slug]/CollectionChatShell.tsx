"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Bot,
  FolderOpen,
  Grid3X3,
  History,
  Home,
  Library,
  Menu,
  MessageCircle,
  Notebook,
  Plus,
  Rocket,
  Search,
  Send,
  Settings,
  Sparkles,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAssistant, type CollectionAssistant } from "../collection-data";

type ChatMessage = {
  role: "assistant" | "user";
  content: string;
};

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Integrations", href: "/integrations", icon: Grid3X3 },
  { label: "Partners", href: "/partners", icon: Users },
  { label: "Launchpad", href: "/launchpad", icon: Rocket },
  { label: "Collection", href: "/collection", icon: Library },
  { label: "Affiliate", href: "/affiliate", icon: Trophy },
  { label: "Pricing", href: "/pricing", icon: Zap },
];

function AssistantLogo({ assistant, size = "md" }: { assistant: CollectionAssistant; size?: "sm" | "md" | "lg" }) {
  const Icon = assistant.icon;
  const sizeClass = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-9 w-9" : "h-12 w-12";
  const iconClass = size === "lg" ? "h-7 w-7" : size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div
      className={`relative flex ${sizeClass} shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${assistant.accent} p-[2px] shadow-lg shadow-slate-200/70 dark:shadow-black/30`}
    >
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[14px] bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
        <div className={`absolute inset-0 bg-gradient-to-br ${assistant.accent} opacity-15`} />
        <div className="absolute -right-3 -top-3 h-8 w-8 rounded-full bg-white/60 blur-sm dark:bg-white/20" />
        <Icon className={`relative ${iconClass}`} />
      </div>
      <span
        className={`absolute -bottom-1 -right-1 rounded-md bg-gradient-to-br ${assistant.accent} px-1.5 py-0.5 text-[9px] font-black leading-none tracking-wide text-white shadow-sm ring-2 ring-white dark:ring-slate-900`}
      >
        {assistant.logoText}
      </span>
    </div>
  );
}

export default function CollectionChatShell({ slug }: { slug: string }) {
  const assistant = getAssistant(slug) ?? getAssistant("brief-buddy")!;
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { role: "assistant", content: assistant.welcome },
  ]);

  const userName = useMemo(() => {
    return user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest user";
  }, [user]);

  const userEmail = user?.email || "Sign in to sync chats";
  const userInitial = userName.trim().charAt(0).toUpperCase() || "A";

  function startNewChat() {
    setMessages([{ role: "assistant", content: assistant.welcome }]);
    setPrompt("");
    setIsSidebarOpen(false);
  }

  function sendMessage() {
    const text = prompt.trim();
    if (!text) return;

    setMessages((current) => [
      ...current,
      { role: "user", content: text },
      {
        role: "assistant",
        content: `${assistant.name} is ready. I will help with this: ${text}`,
      },
    ]);
    setPrompt("");
  }

  return (
    <div className="min-h-dvh bg-[#fbfbfb] text-slate-950">
      <div className="flex min-h-dvh">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[286px] border-r border-slate-200 bg-white px-3 py-3 transition-transform lg:static lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="mb-4 flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2 rounded-full px-1 py-1 text-left"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-500 text-white">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="text-xl font-semibold tracking-tight">LokoAI</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={startNewChat}
              className="mb-2 flex h-9 w-full items-center gap-3 rounded-full bg-slate-100 px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              <Plus className="h-4 w-4" />
              New chat
            </button>

            <button
              type="button"
              onClick={() => setIsSearchOpen((open) => !open)}
              className="mb-2 flex h-9 w-full items-center gap-3 rounded-full px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
            >
              <Search className="h-4 w-4" />
              Search chats
            </button>

            {isSearchOpen && (
              <div className="mb-2 px-1">
                <div className="flex h-10 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 shadow-sm">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    placeholder="Search collection chats"
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setPrompt("Untitled notebook: ")}
              className="mb-4 flex h-9 w-full items-center gap-3 rounded-full px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
            >
              <Notebook className="h-4 w-4" />
              Untitled notebook
            </button>

            <div className="mb-3 border-t border-slate-200 pt-3">
              <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Pages</p>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex h-9 w-full items-center gap-3 rounded-full px-4 text-sm font-medium transition ${
                      item.href === "/collection"
                        ? "bg-sky-50 text-sky-700"
                        : "text-slate-700 hover:bg-sky-50 hover:text-sky-700"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-1">
              <div className="mb-2 flex items-center justify-between px-3 text-xs text-slate-500">
                <span>Recent</span>
                <History className="h-3.5 w-3.5" />
              </div>
              <Link
                href={`/collection/${assistant.slug}`}
                className="flex items-center gap-3 rounded-2xl bg-slate-100 px-3 py-3 text-left"
              >
                <AssistantLogo assistant={assistant} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{assistant.name}</p>
                  <p className="truncate text-xs text-slate-500">Collection chat</p>
                </div>
              </Link>
            </div>

            <div className="mt-3 border-t border-slate-200 pt-3">
              <button
                type="button"
                onClick={() => router.push("/projects")}
                className="flex h-9 w-full items-center gap-3 rounded-full px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <FolderOpen className="h-4 w-4" />
                Projects
              </button>
              <button
                type="button"
                onClick={() => router.push("/settings")}
                className="flex h-9 w-full items-center gap-3 rounded-full px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>

              <div className="mt-3 rounded-3xl bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{userName}</p>
                    <p className="truncate text-xs text-slate-500">{userEmail}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="mt-3 flex h-9 w-full items-center gap-3 rounded-full px-4 text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Bot className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </aside>

        {isSidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-slate-950/20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-full p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <AssistantLogo assistant={assistant} size="sm" />
            </div>
            <Link
              href="/collection"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              All cards
            </Link>
          </header>

          <section className="flex flex-1 flex-col">
            <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6">
              <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <AssistantLogo assistant={assistant} size="lg" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-500">Collection assistant</p>
                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">{assistant.name}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{assistant.description}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-[2rem] px-6 py-4 text-base leading-relaxed shadow-md ${
                        message.role === "user"
                          ? "bg-slate-950 text-white"
                          : "border border-slate-200 bg-white text-slate-800"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="sticky bottom-0 mt-6 bg-[#fbfbfb] pb-8 pt-4">
                <div className="flex items-end gap-4 rounded-[2.5rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder={`Message ${assistant.name}...`}
                    rows={1}
                    className="max-h-48 min-h-12 flex-1 resize-none bg-transparent px-4 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={sendMessage}
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${assistant.accent} text-white shadow-lg transition-transform hover:scale-105 active:scale-95`}
                    aria-label="Send message"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
