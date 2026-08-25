"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Check,
  ChevronDown,
  Code2,
  Compass,
  Copy,
  ExternalLink,
  Eye,
  FileCode2,
  FileText,
  FolderOpen,
  Grid3X3,
  History,
  Home,
  Layers,
  Layout,
  Loader2,
  Maximize2,
  Menu,
  Mic,
  Minimize2,
  Monitor,
  Notebook,
  Palette,
  Play,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Send,
  Settings,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Trophy,
  Users,
  Wand2,
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
  generatedProject?: {
    title: string;
    description: string;
    previewHtml: string;
    files?: Array<{ path: string; content: string }>;
  };
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
type DeviceMode = "desktop" | "tablet" | "mobile";
type PreviewTab = "preview" | "code";

const THEMES = [
  { id: "3d-cyberpunk", name: "⚡ 3D Cyberpunk", accent: "#00f0ff", accent2: "#ff007f", bg: "#080b14" },
  { id: "dark-glass", name: "✨ Dark Glassmorphism", accent: "#6366f1", accent2: "#a855f7", bg: "#0b0f19" },
  { id: "3d-hologram", name: "🌌 3D Holographic", accent: "#38bdf8", accent2: "#4ade80", bg: "#030712" },
  { id: "luxury-noir", name: "👑 Luxury Noir", accent: "#d4af37", accent2: "#f3e5ab", bg: "#0a0a0a" },
  { id: "vibrant-neon", name: "🎨 Vibrant Neon", accent: "#ec4899", accent2: "#8b5cf6", bg: "#0f172a" },
];

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
    title: "⚡ Build 3D Website",
    prompt:
      "Create a futuristic 3D Web Experience with interactive Three.js floating geometric meshes, particle galaxies, glassmorphic hero, navbar, features, and pricing cards.",
  },
  {
    title: "🎨 3D SaaS Landing Page",
    prompt:
      "Build a modern high-converting 3D SaaS landing page with real-time WebGL interactive canvas, glowing badges, feature grid, and live testimonials.",
  },
  {
    title: "📊 Futuristic Dashboard",
    prompt:
      "Create a sleek dark cyberpunk analytics dashboard with 3D perspective cards, charts, metric cards, activity feed, and sidebar.",
  },
  {
    title: "🛍️ 3D eCommerce Store",
    prompt:
      "Build a modern 3D luxury product showcase with interactive 3D product visualizer, gallery cards, cart drawer, and premium typography.",
  },
];

const moreQuickActions = [
  {
    title: "AI Portfolio",
    prompt: "Create an interactive 3D developer portfolio with WebGL hero mesh, project showcase bento grid, skill tags, and contact modal.",
  },
  {
    title: "Crypto / Web3 Hub",
    prompt: "Build a neon decentralized Web3 DeFi portal with floating 3D tokens, swap interface, stats cards, and wallet connect button.",
  },
  {
    title: "Creative Agency",
    prompt: "Create an avant-garde digital agency website with bold typography, 3D interactive physics canvas, and case study grid.",
  },
  {
    title: "Mobile App Showcase",
    prompt: "Create an interactive mobile app landing page with 3D floating phone mockups, feature carousels, app store badges, and FAQ.",
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

function isWebsiteIntent(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("build") ||
    lower.includes("website") ||
    lower.includes("landing") ||
    lower.includes("create site") ||
    lower.includes("web app") ||
    lower.includes("dashboard") ||
    lower.includes("3d") ||
    lower.includes("portfolio") ||
    lower.includes("ecommerce")
  );
}

function MarkdownContent({ content }: { content: string }) {
  const parts = content.split(/```([\w-]*)\n([\s\S]*?)```/g);

  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-200">
      {parts.map((part, index) => {
        if (index % 3 === 2) {
          const language = parts[index - 1] || "code";
          return (
            <div key={index} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/80 text-slate-100 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2 text-xs font-mono text-cyan-400">
                <span className="flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5" />
                  {language}
                </span>
                <button
                  type="button"
                  onClick={() => void navigator.clipboard.writeText(part)}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs text-slate-200 transition hover:bg-white/20"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
              </div>
              <pre className="max-h-96 overflow-auto p-4 font-mono text-xs leading-6 text-slate-300">
                <code>{part}</code>
              </pre>
            </div>
          );
        }

        if (index % 3 === 1) return null;

        return (
          <div key={index} className="whitespace-pre-wrap">
            {part}
          </div>
        );
      })}
    </div>
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

  // ── Split Builder State ───────────────────────────────────────────────────
  const [isSplitView, setIsSplitView] = useState(false);
  const [activePreviewHtml, setActivePreviewHtml] = useState<string>("");
  const [generatedFiles, setGeneratedFiles] = useState<Array<{ path: string; content: string }>>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  const [previewTab, setPreviewTab] = useState<PreviewTab>("preview");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [activeTheme, setActiveTheme] = useState(THEMES[0]);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isGeneratingWebsite, setIsGeneratingWebsite] = useState(false);

  const userName = useMemo(() => {
    return user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
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
    setIsSplitView(false);
    setActivePreviewHtml("");
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function openProject(project: Project) {
    setActiveChatId(project.id);
    setMessages(normalizeMessages(project.chat_messages));
    setPrompt("");
    setActiveView("chat");
    setIsSidebarOpen(false);
    if (project.preview_html) {
      setActivePreviewHtml(project.preview_html);
      setIsSplitView(true);
    }
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

  async function handleGenerateWebsite(userPromptText: string) {
    setIsGeneratingWebsite(true);
    setIsSplitView(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPromptText }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.previewHtml) {
          setActivePreviewHtml(data.previewHtml);
        }
        if (data.files && Array.isArray(data.files)) {
          setGeneratedFiles(data.files);
        }
      }
    } catch (err) {
      console.error("Website generation failed:", err);
    } finally {
      setIsGeneratingWebsite(false);
    }
  }

  async function handleSubmit(inputPrompt = prompt) {
    const trimmed = inputPrompt.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);

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

    const shouldTriggerBuilder = isWebsiteIntent(trimmed);
    if (shouldTriggerBuilder) {
      void handleGenerateWebsite(trimmed);
    }

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
        throw new Error(errorText || "AI response failed");
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
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId
            ? {
                ...message,
                isStreaming: false,
                isError: true,
                content: "Something went wrong while generating the response. Please retry.",
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
      setPrompt((current) => current || "Voice input is not supported in this browser.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript || "";
      setPrompt((current) => (current ? `${current} ${transcript}` : transcript));
    };
    recognition.start();
  }

  const handleCopyMessage = async (message: ChatMessage) => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopiedMessageId(message.id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch {
      // ignore
    }
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return projects;
    return projects.filter((project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#070b14] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background 3D Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-40 -top-40 h-[550px] w-[550px] rounded-full bg-cyan-600/15 blur-[140px]" />
        <div className="absolute -right-40 top-1/3 h-[600px] w-[600px] rounded-full bg-indigo-600/15 blur-[160px]" />
        <div className="absolute bottom-0 left-1/3 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      <div className="relative z-10 flex h-full w-full">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-white/10 bg-[#0a0f1d]/90 backdrop-blur-2xl transition-transform duration-300 lg:static lg:translate-x-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-1/2 -translate-x-full"
          }`}
        >
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
            <button
              type="button"
              onClick={startNewChat}
              className="flex items-center gap-3 text-left transition hover:opacity-90"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-500 shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-lg font-bold tracking-tight text-transparent">
                  LokoAI
                </span>
                <span className="ml-1.5 rounded-md bg-cyan-500/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-400 border border-cyan-500/30">
                  3D STUDIO
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* New Chat & Search */}
          <div className="p-4 space-y-2">
            <button
              type="button"
              onClick={startNewChat}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-semibold text-white shadow-lg shadow-cyan-500/20 ring-1 ring-white/20 transition hover:from-cyan-400 hover:to-indigo-500 hover:shadow-cyan-500/30"
            >
              <Plus className="h-4 w-4" />
              New 3D Project
            </button>

            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 text-xs text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
              />
            </div>
          </div>

          {/* Nav / History List */}
          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
            {/* Pages Section */}
            <div>
              <p className="px-3 text-[11px] font-bold tracking-wider text-slate-400 uppercase">Pages</p>
              <div className="mt-2 space-y-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.view;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        setActiveView(item.view);
                        setIsSidebarOpen(false);
                      }}
                      className={`flex h-9 w-full items-center gap-3 rounded-xl px-3 text-xs font-medium transition ${
                        isActive
                          ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recent History Section */}
            <div>
              <div className="flex items-center justify-between px-3">
                <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">Recent Projects</p>
                <History className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <div className="mt-2 space-y-1">
                {isLoadingProjects ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                    Loading...
                  </div>
                ) : filteredProjects.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-slate-500">No projects yet.</p>
                ) : (
                  filteredProjects.map((project) => (
                    <div
                      key={project.id}
                      className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs transition ${
                        activeChatId === project.id
                          ? "bg-white/10 text-cyan-300 ring-1 ring-cyan-500/30"
                          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => openProject(project)}
                        className="flex min-w-0 flex-1 flex-col text-left"
                      >
                        <span className="truncate font-medium">{project.title}</span>
                        <span className="text-[10px] text-slate-500">{getTimeAgo(project.updated_at)}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteProject(project.id)}
                        className="ml-2 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
                        aria-label="Delete project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* User Profile / Footer */}
          <div className="border-t border-white/10 p-3">
            <div className="flex items-center justify-between rounded-xl bg-white/5 p-2.5 ring-1 ring-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="h-8 w-8 rounded-full object-cover ring-1 ring-cyan-500/40" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 text-xs font-bold text-white shadow-md">
                    {userName.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-200">{userName}</p>
                  <p className="truncate text-[10px] text-cyan-400">Local Developer</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void signOut()}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-red-400"
                title="Sign out"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>

        {/* Sidebar Overlay on Mobile */}
        {isSidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}

        {/* Main Content Area */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* Top Bar Header */}
          <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#0a0f1d]/60 px-4 backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* View Switcher: Full Chat vs Split 3D Builder */}
              {activeView === "chat" && (
                <div className="flex items-center rounded-xl bg-white/5 p-1 ring-1 ring-white/10">
                  <button
                    type="button"
                    onClick={() => setIsSplitView(false)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      !isSplitView ? "bg-cyan-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Bot className="h-3.5 w-3.5" />
                    Chat Studio
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSplitView(true)}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      isSplitView ? "bg-cyan-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Layers className="h-3.5 w-3.5" />
                    3D Live Split Builder
                  </button>
                </div>
              )}
            </div>

            {/* Right Controls: Theme Selector + Upgrade + Profile */}
            <div className="flex items-center gap-3">
              {/* Theme Customizer Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                  className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10"
                >
                  <Palette className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">{activeTheme.name}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </button>

                {isThemeMenuOpen && (
                  <div className="absolute right-0 top-11 z-50 w-52 rounded-2xl border border-white/10 bg-[#0d1326] p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-black/40">
                    <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Select Design Style</p>
                    {THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => {
                          setActiveTheme(theme);
                          setIsThemeMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                          activeTheme.id === theme.id ? "bg-cyan-500/20 text-cyan-300 font-semibold" : "text-slate-300 hover:bg-white/5"
                        }`}
                      >
                        <span>{theme.name}</span>
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: theme.accent }} />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setActiveView("pricing")}
                className="hidden items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-orange-500/20 transition hover:opacity-95 sm:inline-flex"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Upgrade
              </button>

              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-xs font-bold text-white shadow-md ring-1 ring-white/20"
                aria-label="Profile"
              >
                {userName.slice(0, 1).toUpperCase()}
              </button>
            </div>
          </header>

          {/* Dynamic Main Views */}
          <section className="relative flex min-h-0 flex-1 overflow-hidden">
            {activeView === "chat" ? (
              <div className="flex h-full w-full overflow-hidden">
                {/* Left / Center Chat Pane */}
                <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isSplitView ? "w-full lg:w-[42%] border-r border-white/10" : "w-full"}`}>
                  <div className="relative mx-auto flex h-full w-full max-w-4xl flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6">
                    {messages.length === 0 ? (
                      <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
                        {/* 3D Holographic Hero Badge */}
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300 shadow-lg shadow-cyan-500/10 backdrop-blur-md">
                          <Sparkles className="h-3.5 w-3.5 animate-pulse text-cyan-400" />
                          <span>AI 3D Experience Studio</span>
                        </div>

                        <h1 className="mb-3 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
                          What will you{" "}
                          <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">
                            create today
                          </span>
                          , {userName}?
                        </h1>
                        <p className="mb-8 max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
                          Generate full 3D interactive websites, WebGL experiences, React applications, and fullstack prototypes with live real-time preview.
                        </p>

                        <div className="w-full max-w-2xl">
                          <Composer
                            prompt={prompt}
                            setPrompt={setPrompt}
                            textareaRef={textareaRef}
                            onKeyDown={handleKeyDown}
                            onSubmit={() => void handleSubmit()}
                            onVoiceInput={handleVoiceInput}
                            isSubmitting={isSubmitting}
                          />
                          <PromptChips setPrompt={setPrompt} />
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                          <div className="space-y-6 py-4">
                            {messages.map((message) => (
                              <MessageBubble
                                key={message.id}
                                message={message}
                                userAvatar={userAvatar}
                                userName={userName}
                                copied={copiedMessageId === message.id}
                                onCopy={() => void handleCopyMessage(message)}
                                onRetry={() => {
                                  const lastUser = [...messages].reverse().find((m) => m.role === "user");
                                  if (lastUser) void handleSubmit(lastUser.content);
                                }}
                                onOpenSplitBuilder={() => setIsSplitView(true)}
                              />
                            ))}

                            {isSubmitting && messages[messages.length - 1]?.role !== "assistant" && (
                              <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-xs font-medium text-cyan-300 backdrop-blur-md">
                                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                                <span>Generating 3D web experience with OpenRouter AI...</span>
                              </div>
                            )}
                            <div ref={messagesEndRef} />
                          </div>
                        </div>

                        <div className="pt-3 pb-2">
                          <Composer
                            prompt={prompt}
                            setPrompt={setPrompt}
                            textareaRef={textareaRef}
                            onKeyDown={handleKeyDown}
                            onSubmit={() => void handleSubmit()}
                            onVoiceInput={handleVoiceInput}
                            isSubmitting={isSubmitting}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Split 3D Live Builder & Code Workspace */}
                {isSplitView && (
                  <div className="hidden h-full flex-1 flex-col bg-[#050811] lg:flex">
                    {/* Preview Pane Top Header */}
                    <div className="flex h-12 items-center justify-between border-b border-white/10 bg-white/5 px-4">
                      {/* Tabs */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewTab("preview")}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
                            previewTab === "preview" ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Live 3D Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewTab("code")}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition ${
                            previewTab === "code" ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/40" : "text-slate-400 hover:text-white"
                          }`}
                        >
                          <Code2 className="h-3.5 w-3.5" />
                          Generated Code ({generatedFiles.length || 6} files)
                        </button>
                      </div>

                      {/* Device Mode Switcher */}
                      <div className="flex items-center gap-1 rounded-lg bg-black/40 p-1 ring-1 ring-white/10">
                        <button
                          type="button"
                          onClick={() => setDeviceMode("desktop")}
                          className={`rounded p-1 transition ${deviceMode === "desktop" ? "bg-white/20 text-cyan-300" : "text-slate-400 hover:text-white"}`}
                          title="Desktop View"
                        >
                          <Monitor className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeviceMode("tablet")}
                          className={`rounded p-1 transition ${deviceMode === "tablet" ? "bg-white/20 text-cyan-300" : "text-slate-400 hover:text-white"}`}
                          title="Tablet View"
                        >
                          <Tablet className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeviceMode("mobile")}
                          className={`rounded p-1 transition ${deviceMode === "mobile" ? "bg-white/20 text-cyan-300" : "text-slate-400 hover:text-white"}`}
                          title="Mobile View"
                        >
                          <Smartphone className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Close / Fullscreen button */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsSplitView(false)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
                          title="Close Split View"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Preview Pane Body */}
                    <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-black/50 p-4">
                      {isGeneratingWebsite ? (
                        <div className="flex flex-col items-center justify-center text-center space-y-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 ring-1 ring-cyan-500/40">
                            <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
                          </div>
                          <p className="text-sm font-semibold text-white">Synthesizing 3D Web Experience...</p>
                          <p className="text-xs text-slate-400">Loading Three.js geometry, particle nodes, and spatial shaders.</p>
                        </div>
                      ) : previewTab === "preview" ? (
                        <div
                          className={`h-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl transition-all duration-300 ${
                            deviceMode === "desktop"
                              ? "w-full"
                              : deviceMode === "tablet"
                              ? "w-[768px] max-w-full"
                              : "w-[390px] max-w-full"
                          }`}
                        >
                          {activePreviewHtml ? (
                            <iframe
                              srcDoc={activePreviewHtml}
                              title="3D Web Experience Preview"
                              className="h-full w-full border-0 bg-transparent"
                              sandbox="allow-scripts allow-same-origin allow-modals"
                            />
                          ) : (
                            <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center space-y-3">
                              <Sparkles className="h-8 w-8 text-cyan-400" />
                              <p className="text-sm font-semibold text-slate-300">No active 3D preview</p>
                              <p className="max-w-xs text-xs text-slate-500">
                                Type a prompt like &quot;Build 3D cyber SaaS website&quot; to generate and render a live WebGL application.
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Code Tab */
                        <div className="flex h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-[#080d1a]">
                          {/* File list sidebar */}
                          <div className="w-48 border-r border-white/10 bg-black/40 p-2 space-y-1 overflow-y-auto">
                            <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Files</p>
                            {(generatedFiles.length > 0
                              ? generatedFiles
                              : [
                                  { path: "src/App.tsx", content: "" },
                                  { path: "src/components/ThreeHero3D.tsx", content: "" },
                                  { path: "src/index.css", content: "" },
                                  { path: "package.json", content: "" },
                                  { path: "vite.config.ts", content: "" },
                                ]
                            ).map((f, i) => (
                              <button
                                key={f.path}
                                type="button"
                                onClick={() => setActiveFileIndex(i)}
                                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-mono transition ${
                                  activeFileIndex === i ? "bg-cyan-500/20 text-cyan-300 ring-1 ring-cyan-500/30" : "text-slate-400 hover:bg-white/5"
                                }`}
                              >
                                <FileCode2 className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{f.path}</span>
                              </button>
                            ))}
                          </div>

                          {/* Code Display */}
                          <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200">
                            <pre>
                              <code>
                                {generatedFiles[activeFileIndex]?.content ||
                                  `// 3D Web Experience Component\nimport React, { useEffect, useRef } from 'react';\nimport * as THREE from 'three';\n\nexport default function ThreeHero3D() {\n  // Interactive WebGL canvas...\n}`}
                              </code>
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
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
    <div className="relative mt-6 flex w-full flex-wrap justify-center gap-2.5 pb-2">
      {quickActions.map((item) => (
        <button
          key={item.title}
          type="button"
          onClick={() => setPrompt(item.prompt)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-300 shadow-md backdrop-blur-md transition hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-200 hover:shadow-cyan-500/10"
        >
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
          {item.title}
        </button>
      ))}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsMoreOpen((open) => !open)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-medium text-slate-300 shadow-md backdrop-blur-md transition hover:bg-white/10 hover:text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          More Ideas
        </button>

        {isMoreOpen && (
          <div className="absolute left-1/2 top-11 z-30 w-64 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#0d1326] p-2 shadow-2xl backdrop-blur-2xl ring-1 ring-black/40">
            {moreQuickActions.map((moreItem) => (
              <button
                key={moreItem.title}
                type="button"
                onClick={() => {
                  setPrompt(moreItem.prompt);
                  setIsMoreOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-slate-300 transition hover:bg-cyan-500/20 hover:text-cyan-200"
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                {moreItem.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Composer({
  prompt,
  setPrompt,
  textareaRef,
  onKeyDown,
  onSubmit,
  onVoiceInput,
  isSubmitting,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onKeyDown: (event: ReactKeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onVoiceInput: () => void;
  isSubmitting: boolean;
}) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-2xl backdrop-blur-2xl transition focus-within:border-cyan-500/60 focus-within:ring-2 focus-within:ring-cyan-500/20">
      <div className="px-5 pt-4 pb-2">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Describe any 3D website, app, or question..."
          className="max-h-48 min-h-[64px] w-full resize-none bg-transparent text-sm leading-6 text-slate-100 outline-none placeholder:text-slate-500"
        />
      </div>
      <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 bg-black/20">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPrompt(`${prompt}${prompt ? "\n" : ""}`)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-slate-200"
            title="Add new line"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onVoiceInput}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-slate-200"
            title="Voice input"
          >
            <Mic className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!prompt.trim() || isSubmitting}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 disabled:hover:from-cyan-500"
          aria-label="Send"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin text-slate-950" /> : <Send className="h-4 w-4 text-slate-950" />}
        </button>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  userAvatar,
  userName,
  copied,
  onCopy,
  onRetry,
  onOpenSplitBuilder,
}: {
  message: ChatMessage;
  userAvatar: string;
  userName: string;
  copied: boolean;
  onCopy: () => void;
  onRetry: () => void;
  onOpenSplitBuilder: () => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 shadow-md shadow-cyan-500/20 ring-1 ring-white/20">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}

      <div className={`max-w-[82%] ${isUser ? "items-end" : "items-start"}`}>
        {/* User Message: Translucent Seamless Glass Bubble (NO BLACK BOX) */}
        {isUser ? (
          <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-r from-cyan-500/10 via-sky-500/10 to-indigo-500/15 px-5 py-3 text-sm leading-relaxed text-cyan-50 shadow-lg shadow-cyan-500/5 backdrop-blur-md">
            <div className="whitespace-pre-wrap">{message.content}</div>
          </div>
        ) : (
          /* Assistant Message */
          <div className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-xl backdrop-blur-2xl ${message.isError ? "border-red-500/40 bg-red-500/10" : ""}`}>
            <MarkdownContent content={message.content || (message.isStreaming ? "Thinking..." : "")} />
            {message.isStreaming && <span className="ml-1 inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-400" />}

            {/* Quick Trigger to Split Builder if website prompt was detected */}
            {isWebsiteIntent(message.content) && !message.isStreaming && (
              <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={onOpenSplitBuilder}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition hover:opacity-95"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Open in 3D Live Split Builder
                </button>
              </div>
            )}
          </div>
        )}

        {/* Message Actions */}
        <div className={`mt-1.5 flex items-center gap-2 text-[11px] text-slate-500 ${isUser ? "justify-end" : "justify-start"}`}>
          <span>{formatTime(message.createdAt)}</span>
          <button type="button" onClick={onCopy} className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 hover:bg-white/10 hover:text-slate-300">
            {copied ? <Check className="h-3 w-3 text-cyan-400" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
          {!isUser && (
            <button type="button" onClick={onRetry} className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 hover:bg-white/10 hover:text-slate-300">
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          )}
        </div>
      </div>

      {isUser && (
        userAvatar ? (
          <img src={userAvatar} alt={userName} className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-cyan-500/40" />
        ) : (
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 text-xs font-bold text-white shadow-md">
            {userName.slice(0, 1).toUpperCase()}
          </div>
        )
      )}
    </div>
  );
}
