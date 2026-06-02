"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, DragEvent as ReactDragEvent } from "react";
import {
  DEFAULT_SELECTED_OPENROUTER_MODEL,
  SELECTED_MODEL_STORAGE_KEY,
  getOpenRouterModelById,
  isSupportedOpenRouterModel,
} from "@/lib/openrouterModels";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { getAssistant, type CollectionAssistant } from "@/app/collection/collection-data";
import { ModelPicker } from "@/components/ModelPicker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bot,
  FileText,
  ChevronRight,
  Database,
  FolderOpen,
  Globe,
  Grid3X3,
  History,
  Home,
  Library,
  Loader2,
  Menu,
  Mic,
  Moon,
  Package,
  Paperclip,
  Plus,
  Rocket,
  Search,
  Send,
  Settings,
  Sparkles,
  Sun,
  Trash2,
  Trophy,
  Upload,
  Users,
  X,
  Zap,
} from "lucide-react";

type ChatMessage = {
  id?: string;
  role: "assistant" | "user";
  content: string;
  createdAt?: string;
};

type Attachment = {
  id: string;
  name: string;
  size: number;
  type: string;
};

type SavedChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
};

const COLLECTION_HISTORY_STORAGE_KEY = "lokoai:collection-chat-history";

function createChatId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function createMessage(role: ChatMessage["role"], content: string): ChatMessage {
  return {
    id: createChatId(),
    role,
    content,
    createdAt: new Date().toISOString(),
  };
}

function getChatTitle(messages: ChatMessage[]) {
  return messages.find((message) => message.role === "user" && message.content.trim())?.content.slice(0, 48) || "New chat";
}

function getHistoryStorageKey(slug: string) {
  return `${COLLECTION_HISTORY_STORAGE_KEY}:${slug}`;
}

function extractApiErrorMessage(value: string) {
  try {
    const parsed = JSON.parse(value) as { error?: unknown };
    return typeof parsed.error === "string" && parsed.error.trim() ? parsed.error : value;
  } catch {
    return value;
  }
}

function AssistantLogo({ assistant, size = "md" }: { assistant: CollectionAssistant; size?: "sm" | "md" | "lg" }) {
  const Icon = assistant.icon;
  const sizeClass = size === "lg" ? "h-16 w-16" : size === "sm" ? "h-7 w-7" : "h-12 w-12";
  const iconClass = size === "lg" ? "h-7 w-7" : size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  const shellRadius = size === "sm" ? "rounded-xl" : "rounded-2xl";
  const innerRadius = size === "sm" ? "rounded-[10px]" : "rounded-[14px]";

  return (
    <div
      className={`relative flex ${sizeClass} shrink-0 items-center justify-center ${shellRadius} bg-gradient-to-br ${assistant.accent} p-[2px] shadow-lg shadow-slate-200/70 dark:shadow-black/30`}
    >
      <div className={`relative flex h-full w-full items-center justify-center overflow-hidden ${innerRadius} bg-white text-slate-950 dark:bg-slate-950 dark:text-white`}>
        <div className={`absolute inset-0 bg-gradient-to-br ${assistant.accent} opacity-15`} />
        <div className="absolute -right-3 -top-3 h-8 w-8 rounded-full bg-white/60 blur-sm dark:bg-white/20" />
        <Icon className={`relative ${iconClass}`} />
      </div>
      <span
        className={`absolute -bottom-1 -right-1 rounded-md bg-gradient-to-br ${assistant.accent} px-1.5 py-0.5 text-[9px] font-black leading-none tracking-wide text-white shadow-sm ring-2 ring-white dark:ring-slate-900 ${size === "sm" ? "hidden" : ""}`}
      >
        {assistant.logoText}
      </span>
    </div>
  );
}

export default function UniversalChatInterface({ slug }: { slug: string }) {
  const assistant = getAssistant(slug) ?? getAssistant("brief-buddy")!;
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [selectedModelId, setSelectedModelId] = useState<string>(assistant.modelId || DEFAULT_SELECTED_OPENROUTER_MODEL);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<SavedChatSession[]>([]);

  // Persist model selection per-collection
  useEffect(() => {
    try {
      const storageKey = `${SELECTED_MODEL_STORAGE_KEY}:collection:${slug}`;
      const stored = window.localStorage.getItem(storageKey);
      const nextModelId =
        stored && isSupportedOpenRouterModel(stored)
          ? stored
          : assistant.modelId || DEFAULT_SELECTED_OPENROUTER_MODEL;
      setSelectedModelId(nextModelId);
    } catch {
      setSelectedModelId(assistant.modelId || DEFAULT_SELECTED_OPENROUTER_MODEL);
    }
  }, [assistant.modelId, slug]);

  useEffect(() => {
    try {
      const storageKey = `${SELECTED_MODEL_STORAGE_KEY}:collection:${slug}`;
      window.localStorage.setItem(storageKey, selectedModelId);
    } catch {
      // ignore
    }
  }, [selectedModelId, slug]);

  useEffect(() => {
    try {
      const rawHistory = window.localStorage.getItem(getHistoryStorageKey(slug));
      const parsed = rawHistory ? (JSON.parse(rawHistory) as SavedChatSession[]) : [];
      const validHistory = Array.isArray(parsed)
        ? parsed.filter((session) => session?.id && Array.isArray(session.messages))
        : [];
      setChatHistory(validHistory);

      const latestSession = validHistory[0];
      if (latestSession) {
        setActiveChatId(latestSession.id);
        setMessages(latestSession.messages);
      } else {
        setActiveChatId(null);
        setMessages([]);
      }
    } catch {
      setChatHistory([]);
      setActiveChatId(null);
      setMessages([]);
    }
  }, [slug]);

  const userName = useMemo(() => {
    return user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest user";
  }, [user]);

  const userEmail = user?.email || "Sign in to sync chats";
  const userInitial = userName.trim().charAt(0).toUpperCase() || "A";
  const isDarkMode = theme === "dark";
  const selectedModelName = getOpenRouterModelById(selectedModelId)?.name ?? "selected model";
  const visibleHistory = chatHistory.filter((session) => {
    const query = historySearch.trim().toLowerCase();
    if (!query) return true;
    return (
      session.title.toLowerCase().includes(query) ||
      session.messages.some((message) => message.content.toLowerCase().includes(query))
    );
  });

  function startNewChat() {
    setMessages([]);
    setPrompt("");
    setAttachments([]);
    setGenerationStatus("");
    setActiveChatId(null);
    setIsSidebarOpen(false);
  }

  function saveChatSession(nextMessages: ChatMessage[], chatId: string) {
    if (!nextMessages.some((message) => message.role === "user" && message.content.trim())) return;

    const now = new Date().toISOString();
    setChatHistory((current) => {
      const existing = current.find((session) => session.id === chatId);
      const nextSession: SavedChatSession = {
        id: chatId,
        title: getChatTitle(nextMessages),
        messages: nextMessages,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      const nextHistory = [nextSession, ...current.filter((session) => session.id !== chatId)].slice(0, 30);
      window.localStorage.setItem(getHistoryStorageKey(slug), JSON.stringify(nextHistory));
      return nextHistory;
    });
  }

  function loadChatSession(session: SavedChatSession) {
    setActiveChatId(session.id);
    setMessages(session.messages);
    setPrompt("");
    setAttachments([]);
    setIsSidebarOpen(false);
  }

  function deleteChatSession(sessionId: string) {
    setChatHistory((current) => {
      const nextHistory = current.filter((session) => session.id !== sessionId);
      window.localStorage.setItem(getHistoryStorageKey(slug), JSON.stringify(nextHistory));

      if (activeChatId === sessionId) {
        const nextActive = nextHistory[0] ?? null;
        setActiveChatId(nextActive?.id ?? null);
        setMessages(nextActive?.messages ?? []);
      }

      return nextHistory;
    });
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const supported = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "image/png", "image/jpeg", "image/gif", "application/zip"];
    
    Array.from(files).forEach((file) => {
      if (supported.includes(file.type)) {
        setAttachments((current) => [
          ...current,
          {
            id: Math.random().toString(36).slice(2),
            name: file.name,
            size: file.size,
            type: file.type,
          },
        ]);
      }
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((current) => current.filter((a) => a.id !== id));
  };

  const handleDragOver = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: ReactDragEvent<HTMLDivElement>) => {
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: ReactDragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleVoiceInput = () => {
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
  };

  const sendMessage = async () => {
    const text = prompt.trim();
    if (!text || isSubmitting) return;

    const chatId = activeChatId ?? createChatId();
    const userMessage = createMessage("user", text);
    const assistantMessage = createMessage("assistant", "");
    const messagesBeforeSend = [...messages, userMessage];
    const pendingMessages = [...messagesBeforeSend, assistantMessage];

    setActiveChatId(chatId);
    setIsSubmitting(true);
    setGenerationStatus(`Connecting to ${selectedModelName}...`);
    setMessages(pendingMessages);
    saveChatSession(pendingMessages, chatId);
    setPrompt("");
    setAttachments([]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          messages,
          selectedModel: selectedModelId,
          agent: slug,
        }),
      });

      if (!response.ok || !response.body) {
        const errText = await response.text();
        throw new Error(extractApiErrorMessage(errText) || "AI response failed");
      }

      const upstreamModelId = response.headers.get("X-AI-Model");
      const upstreamModelName = getOpenRouterModelById(upstreamModelId)?.name ?? selectedModelName;
      setGenerationStatus(`Generating with ${upstreamModelName}...`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;
        setGenerationStatus(`Streaming response from ${upstreamModelName}...`);
        setMessages((current) => {
          const lastIndex = current.length - 1;
          const updated = [...current];
          const last = updated[lastIndex];
          if (last && last.role === "assistant") {
            updated[lastIndex] = { ...last, content: last.content + chunk };
          }
          return updated;
        });
      }

      const completedMessages = [
        ...messagesBeforeSend,
        {
          ...assistantMessage,
          content: assistantText || "I could not generate a response. Please try again.",
        },
      ];
      setMessages(completedMessages);
      saveChatSession(completedMessages, chatId);
      setGenerationStatus("");
    } catch (error) {
      console.warn("Chat send failed:", error);
      const failedMessages = [
        ...messagesBeforeSend,
        {
          ...assistantMessage,
          content: error instanceof Error && error.message ? error.message : "Something went wrong. Please try again.",
        },
      ];
      setMessages(failedMessages);
      saveChatSession(failedMessages, chatId);
      setGenerationStatus("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-white dark:bg-slate-950">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[280px] border-r border-slate-100 bg-slate-50/50 px-4 py-6 backdrop-blur-xl transition-transform dark:border-white/10 dark:bg-slate-900/60 lg:static lg:h-dvh lg:translate-x-0 ${
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
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">LokoAI</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              className="rounded-full p-2 text-slate-400 hover:bg-white hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            onClick={startNewChat}
            className="group mb-2 flex h-11 w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] dark:border-white/10 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            <Plus className="h-4 w-4 text-slate-400 transition group-hover:text-slate-600 dark:group-hover:text-slate-200" />
            New chat
          </button>

          <button
            type="button"
            onClick={() => setIsSearchOpen((open) => !open)}
            className="mb-6 flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <Search className="h-4 w-4" />
            Search chats
          </button>

          {isSearchOpen && (
            <div className="mb-4 px-1">
              <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm ring-2 ring-sky-50 dark:border-white/10 dark:bg-slate-900 dark:ring-sky-500/10">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  placeholder="Search messages..."
                  value={historySearch}
                  onChange={(event) => setHistorySearch(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="mb-6 space-y-1 border-t border-slate-100 pt-6 dark:border-white/10">
            <p className="mb-3 px-4 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">Navigation</p>
            <div className="space-y-0.5">
              {[
                { label: "Home", href: "/", icon: Home },
                { label: "Integrations", href: "/integrations", icon: Grid3X3 },
                { label: "Partners", href: "/partners", icon: Users },
                { label: "Launchpad", href: "/launchpad", icon: Rocket },
                { label: "Collection", href: "/collection", icon: Library },
                { label: "Affiliate", href: "/affiliate", icon: Trophy },
                { label: "Pricing", href: "/pricing", icon: Zap },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex h-10 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium transition ${
                    item.href === "/collection"
                      ? "border border-slate-100 bg-white text-sky-600 shadow-sm dark:border-white/10 dark:bg-slate-900 dark:text-sky-400"
                      : "text-slate-500 hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
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
            <div className="space-y-2">
              {visibleHistory.length ? (
                visibleHistory.map((session) => (
                  <div
                    key={session.id}
                    className={`group flex items-center gap-2 rounded-xl border px-3 py-3 shadow-sm ring-1 transition ${
                      activeChatId === session.id
                        ? "border-sky-100 bg-white ring-sky-100 dark:border-sky-400/20 dark:bg-slate-900 dark:ring-sky-400/10"
                        : "border-slate-100 bg-white/70 ring-slate-100 hover:border-slate-200 hover:bg-white dark:border-white/10 dark:bg-slate-900/70 dark:ring-white/10 dark:hover:border-white/15"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => loadChatSession(session)}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <AssistantLogo assistant={assistant} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{session.title}</p>
                        <p className="truncate text-[11px] text-slate-400">{assistant.name}</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteChatSession(session.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-300 opacity-100 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Delete chat"
                      title="Delete chat"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 px-3 py-4 text-xs font-medium text-slate-400 dark:border-white/10">
                  No saved chats yet.
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-3 border-t border-slate-100 pt-6 dark:border-white/10">
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => router.push("/projects")}
                className="flex h-10 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <FolderOpen className="h-4 w-4" />
                Projects
              </button>
              <button
                type="button"
                onClick={() => router.push("/settings")}
                className="flex h-10 w-full items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Settings className="h-4 w-4" />
                Settings
              </button>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm ring-1 ring-slate-100 dark:border-white/10 dark:bg-slate-900 dark:ring-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-sm dark:bg-white dark:text-slate-900">
                  {userInitial}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{userName}</p>
                  <p className="truncate text-[11px] text-slate-400">{userEmail}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => void signOut()}
                className="mt-3 flex h-9 w-full items-center gap-3 rounded-xl px-3 text-xs font-bold text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400"
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

      {/* Main Chat Area */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="sticky top-0 z-20 flex h-16 items-center justify-between bg-white/80 px-4 backdrop-blur-md dark:bg-slate-950/80">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/pricing")}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Upgrade"
              title="Upgrade"
            >
              <Zap className="h-4 w-4 text-sky-500" />
              Upgrade
            </button>
            <button
              type="button"
              onClick={() => setTheme(isDarkMode ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              title={isDarkMode ? "Light mode" : "Dark mode"}
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {/* Chat Messages */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-2xl space-y-6">
            {messages.map((message, index) => {
              if (!message.content.trim()) return null;

              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[78%] whitespace-pre-wrap text-[15px] font-normal leading-7 ${
                      message.role === "user"
                        ? "text-slate-700 dark:text-slate-200"
                        : "text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })}
            {isSubmitting && generationStatus && (
              <div className="flex justify-start">
                <div className="inline-flex items-center gap-2 text-[15px] font-normal leading-7 text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                  <span>{generationStatus}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div
          className="shrink-0 bg-white px-4 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] dark:bg-slate-950 sm:px-8 sm:py-6 sm:pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
            <div className="mx-auto max-w-3xl">
            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-2 text-sm"
                  >
                    <FileText className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">{att.name}</span>
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drag and Drop Area */}
            {isDragging && (
              <div className="mb-4 rounded-2xl border-2 border-dashed border-sky-400 bg-sky-50 dark:bg-sky-900/20 p-8 text-center">
                <Upload className="mx-auto h-8 w-8 text-sky-500 mb-2" />
                <p className="text-sm font-medium text-sky-700 dark:text-sky-400">Drag files here</p>
              </div>
            )}

            {/* Input Box */}
            <div className="relative flex flex-col rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.08)] transition-all duration-300 focus-within:border-slate-300 dark:border-white/10 dark:bg-slate-900/82 dark:shadow-[0_24px_70px_rgba(2,8,23,0.45)] dark:ring-1 dark:ring-white/5 dark:backdrop-blur-xl dark:focus-within:border-sky-400/30">
              <div className="relative px-5 pt-5">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder={isSubmitting ? "Generating..." : "Ask LokoAI anything..."}
                  rows={2}
                  className="max-h-60 min-h-[44px] w-full resize-none bg-transparent py-2.5 text-base leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center justify-between px-3 pb-3 pt-2">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex h-10 w-10 items-center justify-center overflow-visible rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-slate-800"
                        aria-label="Add content"
                        title="Add content"
                      >
                        <Plus className="size-5 overflow-visible" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64 rounded-[24px] border border-slate-100 bg-white p-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:border-white/10 dark:bg-slate-900">
                      <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 rounded-[14px] px-3.5 py-3 text-[14.5px] cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800">
                        <Paperclip className="h-4.5 w-4.5 text-slate-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-200">Add files & photos</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 rounded-[14px] px-3.5 py-3 text-[14.5px] cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800">
                        <Package className="h-4.5 w-4.5 text-slate-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-200">Presets</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-3 rounded-[14px] px-3.5 py-3 text-[14.5px] cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800">
                        <Database className="h-4.5 w-4.5 text-slate-500" />
                        <span className="font-medium text-slate-700 dark:text-slate-200">Professional data</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center justify-between gap-3 rounded-[14px] px-3.5 py-3 text-[14.5px] cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800">
                        <div className="flex items-center gap-3">
                          <Globe className="h-4.5 w-4.5 text-slate-500" />
                          <span className="font-medium text-slate-700 dark:text-slate-200">Web search</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg,.gif,.zip"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className="flex h-10 w-10 items-center justify-center overflow-visible rounded-full text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                    aria-label="Voice input"
                    title="Voice input"
                  >
                    <Mic className="size-5 overflow-visible" />
                  </button>

                  <ModelPicker selectedModelId={selectedModelId} onModelChange={setSelectedModelId} />
                </div>

                <button
                  type="button"
                  onClick={sendMessage}
                  disabled={(!prompt.trim() && attachments.length === 0) || isSubmitting}
                  className="flex h-9 w-9 shrink-0 items-center justify-center overflow-visible rounded-xl bg-slate-900 text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-20 active:scale-95 dark:bg-sky-500 dark:hover:bg-sky-400"
                  aria-label="Send message"
                >
                  {isSubmitting ? <Loader2 className="size-4 animate-spin overflow-visible" /> : <Send className="size-4 overflow-visible" />}
                </button>
              </div>
            </div>

            <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
              AI can make mistakes. Check important info.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
