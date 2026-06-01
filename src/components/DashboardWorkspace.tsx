"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Check,
  Compass,
  Copy,
  FileText,
  FolderOpen,
  Grid3X3,
  History,
  Home,
  Loader2,
  Menu,
  Mic,
  Notebook,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Send,
  Settings,
  Sparkles,
  Trash2,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "@/app/page";
import IntegrationsPage from "@/app/integrations/page";
import PartnersPage from "@/app/partners/page";
import LaunchpadPage from "@/app/launchpad/page";
import CollectionPage from "@/app/collection/page";
import AffiliatePage from "@/app/affiliate/page";
import PricingPage from "@/app/pricing/page";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  isStreaming?: boolean;
  isError?: boolean;
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  prompt: string | null;
  preview_html: string | null;
  chat_messages: ChatMessage[];
  created_at: string;
  updated_at: string;
};

type View = "chat" | "home" | "integrations" | "partners" | "launchpad" | "collection" | "affiliate" | "pricing";

const navItems = [
  { label: "Home", href: "/", icon: Home, view: "home" as View },
  { label: "Integrations", href: "/integrations", icon: Grid3X3, view: "integrations" as View },
  { label: "Partners", href: "/partners", icon: Users, view: "partners" as View },
  { label: "Launchpad", href: "/launchpad", icon: Rocket, view: "launchpad" as View },
  { label: "Collection", href: "/collection", icon: FileText, view: "collection" as View },
  { label: "Affiliate", href: "/affiliate", icon: Trophy, view: "affiliate" as View },
  { label: "Pricing", href: "/pricing", icon: Zap, view: "pricing" as View },
];

const quickActions = [
  {
    title: "Create slides",
    prompt:
      "Create modern professional presentation slides with beautiful layouts, animations, icons, editable content sections, and premium design.",
  },
  {
    title: "Build website",
    prompt:
      "Create a modern responsive website with hero section, navbar, animations, services, pricing, contact form, and premium UI design.",
  },
  {
    title: "Develop desktop app",
    prompt:
      "Create a modern desktop application with sidebar, dashboard, analytics cards, responsive layout, and clean professional UI.",
  },
  {
    title: "Design",
    prompt:
      "Create a modern creative UI/UX design with beautiful typography, colors, animations, clean layout, and premium user experience.",
  },
];

const heroHeadings = [
  "How can I help you today, {name}?",
  "Build anything with AI.",
  "Design smarter with LokoAI.",
  "Create stunning apps instantly.",
  "Your AI-powered creative partner.",
];

const heroParticles = [
  { left: "12%", top: "24%", delay: 0.1, size: "h-1.5 w-1.5" },
  { left: "24%", top: "68%", delay: 0.8, size: "h-1 w-1" },
  { left: "36%", top: "18%", delay: 1.4, size: "h-2 w-2" },
  { left: "58%", top: "72%", delay: 0.4, size: "h-1.5 w-1.5" },
  { left: "70%", top: "22%", delay: 1.1, size: "h-1 w-1" },
  { left: "84%", top: "58%", delay: 0.6, size: "h-2 w-2" },
];

const moreQuickActions = [
  {
    title: "Invoicing",
    prompt:
      'Create an app with a list of invoices. Each has: ID or number, client name, amount, due date, status (Draft, Sent, Paid, Overdue), and optional notes. Include a form to add or edit and a way to update status. Add a header and "New invoice" button. Works for sending and tracking invoices.',
  },
  {
    title: "Income Log",
    prompt:
      'Create an app with a single list of transactions. Each has: date, description, amount, type (Income or Expense), and optional category. Include a form to add or edit and a summary (total income, total expenses, balance). Add a header and "Add transaction" button. Works for simple P&L or cash flow.',
  },
  {
    title: "Tax Tracker",
    prompt:
      'Create an app with a list of transactions. Each has: date, description, amount, type (income/expense), and tax category. Include a form to add or edit and a summary by category or simple report view. Add a header and "Add transaction" button. Works for tax prep or categorized reporting.',
  },
  {
    title: "Finance dashboard",
    prompt:
      'Create an app with a dashboard: summary cards (e.g. balance, income this month, expenses this month) and a list of recent transactions. Include a form to add transactions. Add a header and "Add" button. Works for overview and quick entry.',
  },
];

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

function normalizeMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ChatMessage => {
    return Boolean(
      item &&
        typeof item === "object" &&
        "role" in item &&
        "content" in item &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string"
    );
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getFirstDisplayName(user: ReturnType<typeof useAuth>["user"]) {
  const fullName = user?.user_metadata?.full_name;
  if (typeof fullName === "string" && fullName.trim()) {
    return fullName.trim().split(/\s+/)[0];
  }

  const handle = user?.email?.split("@")[0] || "";
  const cleanedHandle = handle.replace(/[_\-.]+/g, " ").trim();
  if (!cleanedHandle) return "there";

  const hypeIndex = cleanedHandle.toLowerCase().indexOf("thealgohype");
  const firstName = hypeIndex > 0 ? cleanedHandle.slice(0, hypeIndex) : cleanedHandle.split(/\s+/)[0];
  return firstName || "there";
}

function toTitleName(value: string) {
  if (!value || value === "there") return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function useTypewriterHeadings(userName: string) {
  const [headingIndex, setHeadingIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const startTimer = window.setTimeout(() => setHasStarted(true), 1000);
    return () => window.clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    const fullText = heroHeadings[headingIndex].replace("{name}", toTitleName(userName));
    let timeoutId: number;

    if (isExiting) {
      timeoutId = window.setTimeout(() => {
        setDisplayText("");
        setIsExiting(false);
        setHeadingIndex((current) => (current + 1) % heroHeadings.length);
      }, 380);
      return () => window.clearTimeout(timeoutId);
    }

    if (displayText.length < fullText.length) {
      timeoutId = window.setTimeout(() => {
        setDisplayText(fullText.slice(0, displayText.length + 1));
      }, displayText.length < 6 ? 95 : 58);
      return () => window.clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => setIsExiting(true), 1000);
    return () => window.clearTimeout(timeoutId);
  }, [displayText, hasStarted, headingIndex, isExiting, userName]);

  return { displayText, hasStarted, isExiting, headingIndex };
}

function AnimatedChatHero({ userName }: { userName: string }) {
  const { displayText, hasStarted, isExiting, headingIndex } = useTypewriterHeadings(userName);

  return (
    <div className="relative mb-8 flex min-h-[250px] w-full max-w-4xl items-center justify-center overflow-hidden rounded-[2rem] px-4 py-8 text-center sm:mb-10 sm:min-h-[300px] sm:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(56,189,248,0.16),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.72))]" />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-14 h-32 w-32 -translate-x-1/2 rounded-full bg-sky-300/20 blur-3xl"
        animate={{ opacity: [0.35, 0.85, 0.35], scale: [0.9, 1.2, 0.9] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      />
      {heroParticles.map((particle) => (
        <motion.span
          key={`${particle.left}-${particle.top}`}
          className={`absolute rounded-full bg-sky-400/45 ${particle.size}`}
          style={{ left: particle.left, top: particle.top }}
          initial={{ opacity: 0, y: 10, scale: 0.6 }}
          animate={{ opacity: [0.1, 0.65, 0.1], y: [-4, -18, -4], scale: [0.8, 1.15, 0.8] }}
          transition={{ duration: 5, delay: particle.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <div className="relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.78, y: 16, filter: "blur(10px)" }}
          animate={{
            opacity: 1,
            scale: [1, 1.035, 1],
            y: [0, -8, 0],
            filter: "blur(0px)",
          }}
          transition={{
            opacity: { duration: 0.8, ease: "easeOut" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            filter: { duration: 0.8 },
          }}
          className="relative mb-7 flex h-16 w-16 items-center justify-center rounded-3xl border border-sky-100 bg-white/90 shadow-[0_18px_55px_rgba(14,165,233,0.20),inset_0_1px_0_rgba(255,255,255,0.9)] sm:h-20 sm:w-20"
        >
          <motion.span
            className="absolute inset-0 rounded-3xl bg-sky-400/20 blur-xl"
            animate={{ opacity: [0.25, 0.8, 0.25] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <Sparkles className="relative h-8 w-8 text-sky-500 sm:h-10 sm:w-10" />
        </motion.div>

        <AnimatePresence mode="wait">
          {hasStarted && (
            <motion.h1
              key={headingIndex}
              initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
              animate={{ opacity: isExiting ? 0 : 1, y: isExiting ? -12 : 0, filter: isExiting ? "blur(8px)" : "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-[92px] max-w-4xl text-balance text-4xl font-black leading-[1.06] tracking-tight text-slate-950 sm:min-h-[110px] sm:text-6xl lg:text-7xl"
            >
              <span className="bg-gradient-to-r from-slate-950 via-sky-950 to-sky-500 bg-clip-text text-transparent">
                {displayText}
              </span>
              <motion.span
                className="ml-1 inline-block h-[0.85em] w-[3px] translate-y-1 rounded-full bg-sky-500"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.h1>
          )}
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: hasStarted && !isExiting ? 1 : 0.4, y: hasStarted ? 0 : 10 }}
          transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
          className="mt-3 max-w-xl text-base font-semibold text-slate-500 sm:text-lg"
        >
          Build, design, and launch polished AI experiences with LokoAI.
        </motion.p>
      </div>
    </div>
  );
}

function MarkdownContent({ content }: { content: string }) {
  const parts = content.split(/```([\w-]*)\n([\s\S]*?)```/g);

  return (
    <div className="space-y-3 text-sm leading-7">
      {parts.map((part, index) => {
        if (index % 3 === 2) {
          const language = parts[index - 1] || "code";
          return (
            <div key={index} className="overflow-hidden rounded-2xl bg-slate-950 text-slate-100 shadow-sm">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-slate-400">
                <span>{language}</span>
                <button
                  type="button"
                  onClick={() => void navigator.clipboard.writeText(part)}
                  className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:bg-white/10"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
              </div>
              <pre className="max-h-80 overflow-auto p-4 text-xs leading-6">
                <code>{part}</code>
              </pre>
            </div>
          );
        }

        if (index % 3 === 1) return null;

        return (
          <div key={index} className="whitespace-pre-wrap">
            <MarkdownText content={part} />
          </div>
        );
      })}
    </div>
  );
}

function MarkdownText({ content }: { content: string }) {
  const segments = content.split(/!\[([^\]]*)\]\((data:image\/[^)]+|https?:\/\/[^)\s]+)\)/g);

  return (
    <>
      {segments.map((segment, index) => {
        if (index % 3 === 1) return null;
        if (index % 3 === 2) {
          const alt = segments[index - 1] || "Generated image";
          return (
            <span key={index} className="my-3 block overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={segment} alt={alt} className="block max-h-[520px] w-full object-contain" />
            </span>
          );
        }

        return segment;
      })}
    </>
  );
}

export default function DashboardWorkspace() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user, isLoading, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<View>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [composerNotice, setComposerNotice] = useState("");

  const userName = useMemo(() => {
    return getFirstDisplayName(user);
  }, [user]);

  const userAvatar = useMemo(() => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
  }, [user]);

  const loadProjects = useCallback(() => {
    setIsLoadingProjects(true);
    fetch("/api/projects?limit=50")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { projects?: Project[] } | null) => {
        const nextProjects = (data?.projects ?? []).map((project) => ({
          ...project,
          chat_messages: normalizeMessages(project.chat_messages),
        }));
        setProjects(nextProjects);
        setIsLoadingProjects(false);
      })
      .catch((error) => {
        console.warn("Failed to load chats:", error);
        setProjects([]);
        setIsLoadingProjects(false);
      });
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [prompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function startNewChat() {
    setActiveChatId(null);
    setMessages([]);
    setPrompt("");
    setActiveView("chat");
    setIsSidebarOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function openProject(project: Project) {
    setActiveChatId(project.id);
    setMessages(normalizeMessages(project.chat_messages));
    setPrompt("");
    setActiveView("chat");
    setIsSidebarOpen(false);
  }

  async function handleDeleteProject(projectId: string) {
    if (deletingProjectId) return;
    setDeletingProjectId(projectId);
    const previousProjects = projects;
    setProjects((current) => current.filter((project) => project.id !== projectId));
    if (activeChatId === projectId) startNewChat();

    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Delete failed");
    } catch (error) {
      console.warn("Failed to delete chat:", error);
      setProjects(previousProjects);
    } finally {
      setDeletingProjectId(null);
    }
  }

  async function handleSubmit(inputPrompt = prompt) {
    const trimmed = inputPrompt.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setComposerNotice("");

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    const assistantId = crypto.randomUUID();
    const assistantMessage: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
      isStreaming: true,
    };

    const nextMessages = [...messages, userMessage, assistantMessage];
    setMessages(nextMessages);
    setPrompt("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChatId,
          message: trimmed,
          messages,
        }),
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        let message = errorText || "AI response failed";
        try {
          const data = JSON.parse(errorText) as { error?: string };
          message = data.error || message;
        } catch {
          // Keep the plain text provider error.
        }
        throw new Error(message);
      }

      const nextChatId = response.headers.get("X-Chat-Id");
      if (nextChatId) setActiveChatId(nextChatId);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: message.content + chunk, isStreaming: true }
              : message
          )
        );
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId ? { ...message, isStreaming: false } : message
        )
      );
      loadProjects();
    } catch (error) {
      console.warn("Chat send failed:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong while generating the response. Please retry.";
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                isStreaming: false,
                isError: true,
                content: errorMessage,
              }
            : message
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
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
      setComposerNotice("Voice input will be available soon for this browser.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) setPrompt((current) => `${current}${current ? " " : ""}${transcript}`);
      setComposerNotice("");
    };
    setComposerNotice("Listening...");
    recognition.start();
  }

  function handleAddContent() {
    setComposerNotice("File attachments and extra content tools are coming soon.");
  }

  async function handleCopyMessage(message: ChatMessage) {
    await navigator.clipboard.writeText(message.content);
    setCopiedMessageId(message.id);
    setTimeout(() => setCopiedMessageId(null), 1400);
  }

  const filteredProjects = searchQuery
    ? projects.filter((project) => {
        const target = `${project.title} ${project.prompt ?? ""}`.toLowerCase();
        return target.includes(searchQuery.toLowerCase());
      })
    : projects;

  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");

  return (
    <div data-app-shell className="h-dvh overflow-hidden bg-white text-slate-900">
      <div className="flex h-full min-h-0 overflow-hidden">
        <aside
          className={`scrollbar-soft fixed inset-y-0 left-0 z-40 h-dvh w-[280px] overflow-y-auto overscroll-contain border-r border-slate-100 bg-slate-50/50 px-4 py-6 backdrop-blur-xl transition-transform lg:static lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex min-h-full flex-col">
            <div className="mb-8 flex items-center justify-between px-2">
              <button type="button" onClick={() => router.push("/dashboard")} className="flex items-center gap-2.5 rounded-xl px-1 py-1 text-left transition hover:opacity-80">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm">
                  <Sparkles className="h-5 w-5" />
                </span>
                <span className="text-xl font-bold tracking-tight text-slate-900">LokoAI</span>
              </button>
              <button type="button" onClick={() => setIsSidebarOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-white hover:text-slate-900 lg:hidden" aria-label="Close sidebar">
                <X className="h-5 w-5" />
              </button>
            </div>

            <button type="button" onClick={startNewChat} className="group mb-2 flex h-11 w-full items-center gap-3 rounded-xl bg-white border border-slate-200 px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]">
              <Plus className="h-4 w-4 text-slate-400 transition group-hover:text-slate-600" />
              New chat
            </button>

            <button type="button" onClick={() => setIsSearchOpen((open) => !open)} className="mb-6 flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-900">
              <Search className="h-4 w-4" />
              Search chats
            </button>

            {isSearchOpen && (
              <div className="mb-4 px-1">
                <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm ring-2 ring-sky-50">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search chats..." className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" autoFocus />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery("")} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Clear search">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="mb-6 space-y-1 border-t border-slate-100 pt-6">
              <p className="mb-3 px-4 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">Navigation</p>
              <div className="space-y-0.5">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setActiveView(item.view)}
                    className={`flex h-10 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium transition ${
                      activeView === item.view
                        ? "bg-white text-sky-600 shadow-sm border border-slate-100"
                        : "text-slate-500 hover:bg-white hover:text-slate-900"
                    }`}
                  >
                    <item.icon className={`h-4 w-4 ${activeView === item.view ? "text-sky-500" : ""}`} />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-1 pr-2">
              <div className="mb-3 flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                <span>Recent History</span>
                <History className="h-3.5 w-3.5 opacity-50" />
              </div>
              {isLoadingProjects ? (
                <div className="space-y-2 px-3">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="h-8 animate-pulse rounded-lg bg-slate-100/50" />
                  ))}
                </div>
              ) : filteredProjects.length > 0 ? (
                <div className="space-y-1">
                  {filteredProjects.slice(0, 20).map((project) => (
                    <div key={project.id} className={`group relative flex items-center gap-2 rounded-xl px-3 py-2.5 transition hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-slate-100 ${activeChatId === project.id ? "bg-white shadow-sm ring-1 ring-slate-100" : ""}`}>
                      <button type="button" onClick={() => openProject(project)} className="min-w-0 flex-1 text-left" title={project.prompt || project.title}>
                        <span className={`line-clamp-1 text-sm ${activeChatId === project.id ? "font-bold text-slate-900" : "text-slate-600"}`}>{project.title || project.prompt || "Untitled chat"}</span>
                        <span className="mt-0.5 block text-[10px] font-bold text-slate-400">{getTimeAgo(project.updated_at || project.created_at)}</span>
                      </button>
                      <button type="button" onClick={() => void handleDeleteProject(project.id)} className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100" aria-label={`Delete ${project.title || "chat"}`}>
                        {deletingProjectId === project.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-2 text-xs font-medium text-slate-400">No recent chats yet.</p>
              )}
            </div>

            <div className="mt-auto space-y-3 border-t border-slate-100 pt-6">
              <div className="flex flex-col gap-1">
                <button type="button" onClick={() => router.push("/projects")} className="flex h-10 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-900">
                  <FolderOpen className="h-4 w-4" />
                  Projects
                </button>
                <button type="button" onClick={() => router.push("/settings")} className="flex h-10 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-900">
                  <Settings className="h-4 w-4" />
                  Settings
                </button>
              </div>
              {user && (
                <div className="rounded-2xl bg-white border border-slate-100 p-3 shadow-sm ring-1 ring-slate-100">
                  <div className="flex items-center gap-3">
                    {userAvatar ? (
                      <img src={userAvatar} alt={userName} className="h-10 w-10 shrink-0 rounded-xl object-cover shadow-sm ring-1 ring-slate-100" />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm">{userName.slice(0, 1).toUpperCase()}</div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">{userName}</p>
                      <p className="truncate text-[11px] text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => void signOut()} className="mt-3 flex h-9 w-full items-center gap-3 rounded-xl px-3 text-xs font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600">
                    <Bot className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>

        {isSidebarOpen && <button type="button" className="fixed inset-0 z-30 bg-slate-950/10 backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Close sidebar overlay" />}

        <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white">
          <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-50 bg-white/80 px-4 backdrop-blur-md sm:px-8">
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setIsSidebarOpen(true)} className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 lg:hidden" aria-label="Open sidebar">
                <Menu className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => setActiveView("chat")} className="hidden rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 lg:inline-flex" aria-label="Dashboard menu">
                <Compass className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setActiveView("pricing")} className="inline-flex h-9 items-center gap-2 rounded-full bg-sky-50 px-5 text-xs font-bold text-sky-600 transition hover:bg-sky-100">
                <Sparkles className="h-3.5 w-3.5" />
                Upgrade Pro
              </button>
              <button type="button" onClick={() => router.push("/profile")} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800" aria-label="Profile">
                A
              </button>
            </div>
          </header>

          <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            {activeView === "chat" ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="relative mx-auto flex min-h-0 w-full max-w-[860px] flex-1 flex-col overflow-hidden">
                  {messages.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 sm:py-8">
                      <AnimatedChatHero userName={userName} />
                      <div className="w-full max-w-2xl">
                        <Composer
                          prompt={prompt}
                          setPrompt={setPrompt}
                          textareaRef={textareaRef}
                          onKeyDown={handleKeyDown}
                          onSubmit={() => void handleSubmit()}
                          onAddContent={handleAddContent}
                          onVoiceInput={handleVoiceInput}
                          isSubmitting={isSubmitting}
                          notice={composerNotice}
                        />
                        <PromptChips setPrompt={setPrompt} />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="scrollbar-none min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-10 sm:px-6">
                        <div className="space-y-12">
                          {messages.map((message) => (
                            <MessageBubble
                              key={message.id}
                              message={message}
                              copied={copiedMessageId === message.id}
                              onCopy={() => void handleCopyMessage(message)}
                              onRetry={() => lastUserMessage && void handleSubmit(lastUserMessage.content)}
                            />
                          ))}
                          {isSubmitting && messages[messages.length - 1]?.role !== "assistant" && (
                            <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
                              <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                              LokoAI is thinking...
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </div>
                      <div className="shrink-0 bg-white/80 px-4 pb-6 pt-4 backdrop-blur-md sm:pb-10">
                        <div className="mx-auto max-w-2xl">
                          <Composer
                            prompt={prompt}
                            setPrompt={setPrompt}
                            textareaRef={textareaRef}
                            onKeyDown={handleKeyDown}
                            onSubmit={() => void handleSubmit()}
                            onAddContent={handleAddContent}
                            onVoiceInput={handleVoiceInput}
                            isSubmitting={isSubmitting}
                            notice={composerNotice}
                          />
                          <PromptChips setPrompt={setPrompt} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="scrollbar-soft min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {activeView === "home" && <LandingPage />}
                {activeView === "integrations" && <IntegrationsPage />}
                {activeView === "partners" && <PartnersPage />}
                {activeView === "launchpad" && <LaunchpadPage />}
                {activeView === "collection" && <CollectionPage />}
                {activeView === "affiliate" && <AffiliatePage />}
                {activeView === "pricing" && <PricingPage />}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function PromptChips({ setPrompt }: { setPrompt: (value: string) => void }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <div className="relative mt-6 w-full">
      <div className="flex w-full flex-wrap justify-center gap-3 overflow-visible pb-1">
        {[...quickActions, { title: "Explore More", prompt: "" }].map((item) =>
          item.title === "Explore More" ? (
            <button
              key={item.title}
              type="button"
              onClick={() => setIsMoreOpen((open) => !open)}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 shadow-[0_2px_0_rgba(148,163,184,0.28),0_8px_18px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white hover:text-slate-950 active:translate-y-0 active:shadow-sm"
            >
              <Plus className="size-4 shrink-0 overflow-visible text-slate-400" />
              Explore More
            </button>
          ) : (
            <button
              key={item.title}
              type="button"
              onClick={() => setPrompt(item.prompt)}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 shadow-[0_2px_0_rgba(148,163,184,0.28),0_8px_18px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white hover:text-slate-950 active:translate-y-0 active:shadow-sm"
            >
              <Sparkles className="size-4 shrink-0 overflow-visible text-sky-400" />
              {item.title}
            </button>
          )
        )}
      </div>
      {isMoreOpen && (
        <div className="absolute bottom-12 right-0 z-30 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-slate-200 animate-in fade-in zoom-in-95 duration-200 sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
          <div className="mb-2 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Templates</div>
          {moreQuickActions.map((moreItem) => (
            <button
              key={moreItem.title}
              type="button"
              onClick={() => {
                setPrompt(moreItem.prompt);
                setIsMoreOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Sparkles className="size-4 shrink-0 overflow-visible text-sky-400" />
              {moreItem.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Composer({
  prompt,
  setPrompt,
  textareaRef,
  onKeyDown,
  onSubmit,
  onAddContent,
  onVoiceInput,
  isSubmitting,
  notice,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onKeyDown: (event: ReactKeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onAddContent: () => void;
  onVoiceInput: () => void;
  isSubmitting: boolean;
  notice: string;
}) {
  return (
    <div className="relative flex flex-col rounded-3xl border border-slate-200 bg-white transition-all focus-within:border-slate-300">
      <div className="px-5 pt-5">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="What do you want to build?"
          className="max-h-60 min-h-[44px] w-full resize-none bg-transparent py-2.5 text-base leading-relaxed text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>
      
      <div className="flex items-center justify-between px-3 pb-3 pt-2">
        <div className="flex items-center gap-1.5">
          <button 
            type="button" 
            onClick={onAddContent} 
            className="flex h-9 w-9 items-center justify-center overflow-visible rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-slate-900" 
            aria-label="Add content"
            title="Add content"
          >
            <Plus className="size-5 overflow-visible" />
          </button>
          <button 
            type="button" 
            onClick={onVoiceInput} 
            className="flex h-9 w-9 items-center justify-center overflow-visible rounded-xl text-slate-500 transition hover:bg-slate-50 hover:text-slate-900" 
            aria-label="Voice input"
            title="Voice input"
          >
            <Mic className="size-5 overflow-visible" />
          </button>
        </div>
        
        <button 
          type="button" 
          onClick={onSubmit} 
          disabled={!prompt.trim() || isSubmitting} 
          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-visible rounded-xl bg-slate-900 text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-20 active:scale-95" 
          aria-label="Send prompt"
        >
          {isSubmitting ? <Loader2 className="size-4 animate-spin overflow-visible" /> : <Send className="size-4 overflow-visible" />}
        </button>
      </div>
      {notice && <p className="px-5 pb-3 text-xs font-medium text-slate-500">{notice}</p>}
    </div>
  );
}

function MessageBubble({
  message,
  copied,
  onCopy,
  onRetry,
}: {
  message: ChatMessage;
  copied: boolean;
  onCopy: () => void;
  onRetry: () => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
      <div className={`flex max-w-[90%] gap-4 ${isUser ? "justify-end" : "flex-row"}`}>
        {!isUser && (
          <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-200">
            <Sparkles className="h-5 w-5" />
          </div>
        )}
        
        <div className="group relative">
          {isUser && (
            <div className="absolute -top-6 right-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 opacity-0 transition group-hover:opacity-100">
              You
            </div>
          )}
          <div className={`text-base leading-relaxed ${isUser ? "text-slate-900 font-medium" : "text-slate-700"} ${message.isError ? "text-red-500 font-medium" : ""}`}>
            <div className={!isUser ? "prose prose-slate max-w-none text-slate-700" : ""}>
              <MarkdownContent content={message.content || (message.isStreaming ? "Thinking..." : "")} />
            </div>
            {message.isStreaming && <span className="mt-2 inline-block h-1 w-8 animate-pulse rounded-full bg-sky-400" />}
          </div>

          <div className={`mt-2 flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 opacity-0 transition group-hover:opacity-100 ${isUser ? "justify-end" : "justify-start"}`}>
            <span>{formatTime(message.createdAt)}</span>
            <button type="button" onClick={onCopy} className="hover:text-slate-900 transition flex items-center gap-1">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            {!isUser && (
              <button type="button" onClick={onRetry} className="hover:text-slate-900 transition flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
