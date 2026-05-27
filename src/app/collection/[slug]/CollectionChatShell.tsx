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
  Lightbulb,
  Menu,
  MessageCircle,
  Mic,
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

  function handleVoiceInput() {
    type SpeechRecognitionConstructor = new () => {
      lang: string;
      interimResults: boolean;
      start: () => void;
      onresult: ((event: { results: ArrayLike<{ 0: { transcript: string } }> }) => void) | null;
    };
    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setPrompt((current) => current || "Voice input is not supported in this browser.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) setPrompt((current) => `${current}${current ? " " : ""}${transcript}`);
    };
    recognition.start();
  }

  return (
    <div className="min-h-dvh bg-white text-slate-900">
      <div className="flex min-h-dvh">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-[280px] border-r border-slate-100 bg-slate-50/50 backdrop-blur-xl px-4 py-6 transition-transform lg:static lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col">
            <div className="mb-8 flex items-center justify-between px-2">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex items-center gap-2.5 rounded-xl px-1 py-1 text-left transition hover:opacity-80"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </span>
                <span className="text-xl font-bold tracking-tight text-slate-900">LokoAI</span>
              </button>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-white hover:text-slate-900 lg:hidden"
                aria-label="Close sidebar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <button
              type="button"
              onClick={startNewChat}
              className="group mb-2 flex h-11 w-full items-center gap-3 rounded-xl bg-white border border-slate-200 px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
            >
              <Plus className="h-4 w-4 text-slate-400 transition group-hover:text-slate-600" />
              New chat
            </button>

            <button
              type="button"
              onClick={() => setIsSearchOpen((open) => !open)}
              className="mb-6 flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-900"
            >
              <Search className="h-4 w-4" />
              Search chats
            </button>

            {isSearchOpen && (
              <div className="mb-4 px-1">
                <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm ring-2 ring-sky-50">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    placeholder="Search messages..."
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="mb-6 space-y-1 border-t border-slate-100 pt-6">
              <p className="mb-3 px-4 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">Navigation</p>
              <div className="space-y-0.5">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex h-10 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium transition ${
                      item.href === "/collection"
                        ? "bg-white text-sky-600 shadow-sm border border-slate-100"
                        : "text-slate-500 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${item.href === "/collection" ? "text-sky-500" : ""}`} />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-1">
              <div className="mb-3 flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                <span>Recent History</span>
                <History className="h-3.5 w-3.5 opacity-50" />
              </div>
              <Link
                href={`/collection/${assistant.slug}`}
                className="flex items-center gap-3 rounded-xl bg-white border border-slate-100 px-3 py-3 text-left shadow-sm ring-1 ring-slate-100 transition hover:border-slate-200 hover:shadow-md"
              >
                <AssistantLogo assistant={assistant} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900">{assistant.name}</p>
                  <p className="truncate text-[11px] text-slate-400">Currently active</p>
                </div>
              </Link>
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-6">
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => router.push("/projects")}
                  className="flex h-10 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-900"
                >
                  <FolderOpen className="h-4 w-4" />
                  Projects
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/settings")}
                  className="flex h-10 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-900"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>

              <div className="rounded-2xl bg-white border border-slate-100 p-3 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">
                    {userInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{userName}</p>
                    <p className="truncate text-[11px] text-slate-400">{userEmail}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void signOut()}
                  className="mt-3 flex h-9 w-full items-center gap-3 rounded-xl px-3 text-xs font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Bot className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </aside>

        {isSidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-slate-950/10 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar overlay"
          />
        )}

        <main className="flex min-w-0 flex-1 flex-col bg-white">
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 backdrop-blur-md px-4 sm:px-8">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <AssistantLogo assistant={assistant} size="sm" />
                <div>
                  <h1 className="text-sm font-bold tracking-tight text-slate-900">{assistant.name}</h1>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-sky-500">{assistant.model}</p>
                </div>
              </div>
            </div>
            <Link
              href="/collection"
              className="rounded-full bg-slate-50 px-5 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              All assistants
            </Link>
          </header>

          <section className="flex flex-1 flex-col overflow-y-auto">
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-12 sm:px-6 lg:px-8">
              <div className="flex-1 space-y-10">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex flex-col ${message.role === "user" ? "items-end" : "items-start"}`}
                  >
                    <div className={`flex gap-4 max-w-[90%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      {message.role === "assistant" && (
                        <div className="mt-1 shrink-0">
                          <AssistantLogo assistant={assistant} size="sm" />
                        </div>
                      )}
                      
                      <div
                        className={`relative text-base leading-relaxed ${
                          message.role === "user"
                            ? "text-slate-900 font-medium"
                            : "text-slate-700"
                        }`}
                      >
                        {message.role === "user" && (
                          <div className="absolute -top-6 right-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 opacity-0 transition group-hover:opacity-100">
                            You
                          </div>
                        )}
                        <div className={`${message.role === "assistant" ? "prose prose-slate max-w-none text-slate-700" : ""}`}>
                          {message.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="sticky bottom-0 mt-12 bg-white/80 pb-10 pt-4 backdrop-blur-md">
                <div className="mx-auto max-w-2xl">
                  <div className="relative flex flex-col rounded-2xl border border-slate-200 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-50">
                    <div className="flex items-center gap-1.5 p-2">
                      <button
                        type="button"
                        onClick={() => setPrompt(p => p + "\n")}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                        aria-label="New line"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrompt("Can you help me brainstorm some creative ideas?")}
                        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                        Get ideas
                      </button>
                    </div>
                    
                    <div className="flex items-end gap-2 px-4 pb-4">
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
                        className="max-h-60 min-h-[44px] flex-1 resize-none bg-transparent py-2.5 text-base text-slate-900 outline-none placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={sendMessage}
                        disabled={!prompt.trim()}
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-20 disabled:grayscale`}
                        aria-label="Send message"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-center text-[11px] font-medium text-slate-400">
                    AI can make mistakes. Check important info.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
