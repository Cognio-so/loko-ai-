"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Check,
  Compass,
  Copy,
  FileText,
  FolderOpen,
  Maximize2,
  Grid3X3,
  History,
  Home,
  Loader2,
  Menu,
  Mic,
  Moon,
  Notebook,
  Plus,
  RefreshCw,
  Rocket,
  Search,
  Send,
  Settings,
  Sparkles,
  Sun,
  Trash2,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import LandingPage from "@/app/page";
import IntegrationsPage from "@/app/integrations/page";
import PartnersPage from "@/app/partners/page";
import LaunchpadPage from "@/app/launchpad/page";
import CollectionPage from "@/app/collection/page";
import AffiliatePage from "@/app/affiliate/page";
import PricingPage from "@/app/pricing/page";
import { FileCard, type FileCardData } from "@/components/file-card/FileCard";
import { ModelPicker } from "@/components/ModelPicker";
import {
  DEFAULT_SELECTED_OPENROUTER_MODEL,
  SELECTED_MODEL_STORAGE_KEY,
  isSupportedOpenRouterModel,
} from "@/lib/openrouterModels";

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

type UploadedAttachment = {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

const ACCEPTED_ATTACHMENT_TYPES = [
  ".pdf",
  ".docx",
  ".txt",
  ".csv",
  ".xlsx",
  ".pptx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".zip",
  ".json",
].join(",");

const MAX_ATTACHMENT_SIZE = 15 * 1024 * 1024;

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
      "Create a premium modern responsive website as a complete self-contained HTML preview with polished inline CSS, navbar, hero, dashboard/product preview, features, pricing, testimonials, CTA, footer, animations, mobile layout, and no broken images or unstyled default browser UI.",
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

const searchPlaceholders = [
  "Ask LokoAI anything...",
  "Build a modern website...",
  "Create AI images instantly...",
  "Generate React apps...",
  "Design futuristic UI...",
  "Fix my code errors...",
  "Create viral content ideas...",
  "Search latest IPL news...",
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

function useTypewriterPlaceholder() {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const startTimer = window.setTimeout(() => setHasStarted(true), 1900);
    return () => window.clearTimeout(startTimer);
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    const fullText = searchPlaceholders[placeholderIndex];
    const isComplete = displayText === fullText;
    const isEmpty = displayText.length === 0;

    const timeoutId = window.setTimeout(() => {
      if (!isDeleting && isComplete) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && isEmpty) {
        setIsDeleting(false);
        setPlaceholderIndex((current) => (current + 1) % searchPlaceholders.length);
        return;
      }

      setDisplayText((current) =>
        isDeleting
          ? fullText.slice(0, Math.max(current.length - 1, 0))
          : fullText.slice(0, current.length + 1)
      );
    }, isComplete ? 1250 : isDeleting ? 34 : 58);

      return () => window.clearTimeout(timeoutId);
  }, [displayText, hasStarted, isDeleting, placeholderIndex]);

  return { displayText, hasStarted, placeholderIndex };
}

function AnimatedChatHero() {
  return (
    <div className="relative mb-2 flex min-h-[64px] w-full max-w-2xl items-end justify-start overflow-visible px-5 text-left sm:min-h-[72px]">
      <div className="relative z-10 flex items-center justify-start">
        <motion.div
          initial={{ opacity: 0, scale: 0.78, y: 16, filter: "blur(10px)" }}
          animate={{
            opacity: 1,
            scale: 1,
            y: [0, -3, 0],
            filter: "blur(0px)",
          }}
          transition={{
            opacity: { duration: 0.8, ease: "easeOut" },
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            filter: { duration: 0.8 },
          }}
          className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-white text-sky-500 shadow-sm sm:h-10 sm:w-10"
        >
          <Sparkles className="relative h-5 w-5 sm:h-5 sm:w-5" />
        </motion.div>
        <motion.div
          initial={{ width: 0, opacity: 0, x: -16, filter: "blur(12px)" }}
          animate={{ width: "auto", opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.05, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="ml-2.5 overflow-hidden sm:ml-3"
        >
          <span className="block whitespace-nowrap bg-gradient-to-r from-slate-800 via-slate-700 to-sky-600 bg-clip-text text-[clamp(1.2rem,3vw,1.75rem)] font-medium leading-none tracking-normal text-transparent">
            LokoAI
          </span>
        </motion.div>
      </div>
    </div>
  );
}

function parseFileCardData(value: string): FileCardData | null {
  try {
    const parsed = JSON.parse(value) as Partial<FileCardData>;
    if (
      parsed.success === true &&
      typeof parsed.fileType === "string" &&
      typeof parsed.fileName === "string" &&
      typeof parsed.downloadUrl === "string" &&
      typeof parsed.title === "string" &&
      typeof parsed.size === "number"
    ) {
      return parsed as FileCardData;
    }
  } catch {
    return null;
  }

  return null;
}

function MarkdownTextContent({ content }: { content: string }) {
  const parts = content.split(/```([\w-]*)\n([\s\S]*?)```/g);

  return (
    <div className="space-y-3 text-sm leading-7">
      {parts.map((part, index) => {
        if (index % 3 === 2) {
          const language = parts[index - 1] || "code";
          return <CodeBlock key={index} language={language} code={part} />;
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

function MarkdownContent({ content }: { content: string }) {
  const segments = content.split(/<loko-file>([\s\S]*?)<\/loko-file>/g);

  return (
    <div>
      {segments.map((segment, index) => {
        if (index % 2 === 1) {
          const file = parseFileCardData(segment);
          return file ? <FileCard key={index} file={file} /> : null;
        }

        return segment.trim() ? <MarkdownTextContent key={index} content={segment} /> : null;
      })}
    </div>
  );
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const normalizedLanguage = language.toLowerCase();
  const canPreview =
    normalizedLanguage.includes("html") ||
    code.trimStart().toLowerCase().startsWith("<!doctype html") ||
    code.trimStart().toLowerCase().startsWith("<html");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-[0_16px_38px_rgba(15,23,42,0.10)]">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-2 font-normal text-slate-500">{language}</span>
        </div>
        <div className="flex items-center gap-2">
          {canPreview && (
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => setActiveTab("code")}
                className={`h-7 rounded-md px-2.5 text-xs font-normal transition ${activeTab === "code" ? "bg-sky-50 text-sky-600" : "text-slate-500 hover:bg-slate-50"}`}
              >
                Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`h-7 rounded-md px-2.5 text-xs font-normal transition ${activeTab === "preview" ? "bg-sky-50 text-sky-600" : "text-slate-500 hover:bg-slate-50"}`}
              >
                Preview
              </button>
            </div>
          )}
          {canPreview && (
            <button
              type="button"
              onClick={() => {
                setActiveTab("preview");
                setIsFullscreen(true);
              }}
              className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-normal text-slate-600 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600"
              aria-label="Open preview fullscreen"
              title="Fullscreen preview"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Full</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-normal text-slate-600 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600"
            aria-label="Copy code"
            title="Copy code"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>
      {canPreview && activeTab === "preview" ? (
        <iframe
          title="Generated page preview"
          srcDoc={code}
          sandbox="allow-scripts allow-forms allow-popups allow-modals"
          className="h-[440px] w-full bg-white"
        />
      ) : (
        <pre className="scrollbar-soft max-h-96 w-full overflow-auto bg-white p-4 text-xs font-normal leading-6 text-slate-700 selection:bg-sky-100">
          <code className="whitespace-pre-wrap break-words">{code}</code>
        </pre>
      )}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 text-sm text-slate-600">
              <span>Preview</span>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 px-3 text-xs transition hover:bg-slate-50"
                aria-label="Close fullscreen preview"
              >
                Close
              </button>
            </div>
            <iframe
              title="Generated page fullscreen preview"
              srcDoc={code}
              sandbox="allow-scripts allow-forms allow-popups allow-modals"
              className="min-h-0 flex-1 bg-white"
            />
          </motion.div>
        )}
      </AnimatePresence>
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

        return <FormattedMarkdownText key={index} content={segment} />;
      })}
    </>
  );
}

function cleanMarkdownText(value: string) {
  return value
    .replace(/^#{1,6}\s+/, "")
    .replace(/^>\s+/, "")
    .replace(/^[-*+]\s+/, "")
    .replace(/^\d+\.\s+/, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

function FormattedMarkdownText({ content }: { content: string }) {
  const lines = content.split(/\r?\n/);

  return (
    <>
      {lines.map((line, index) => {
        const cleaned = cleanMarkdownText(line);
        if (!cleaned) return <div key={index} className="h-3" />;

        return (
          <p key={index} className="mb-2 text-[0.95rem] font-normal leading-7 text-slate-700">
            {cleaned}
          </p>
        );
      })}
    </>
  );
}

export default function DashboardWorkspace() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  const [selectedModelId, setSelectedModelId] = useState(DEFAULT_SELECTED_OPENROUTER_MODEL);
  const [uploadedAttachment, setUploadedAttachment] = useState<UploadedAttachment | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

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
    const storedModel = window.localStorage.getItem(SELECTED_MODEL_STORAGE_KEY);
    if (storedModel && isSupportedOpenRouterModel(storedModel)) {
      setSelectedModelId(storedModel);
    }
  }, []);

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

  function isAcceptedFile(file: File) {
    const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
    return ACCEPTED_ATTACHMENT_TYPES.split(",").includes(extension);
  }

  function handleSelectedFile(file: File) {
    setComposerNotice("");
    if (!isAcceptedFile(file)) {
      setComposerNotice("This file type is not supported yet.");
      return;
    }
    if (file.size > MAX_ATTACHMENT_SIZE) {
      setComposerNotice("Please upload a file smaller than 15 MB.");
      return;
    }

    const reader = new FileReader();
    setUploadProgress(8);
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.max(8, Math.round((event.loaded / event.total) * 100)));
      }
    };
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      setUploadedAttachment({
        name: file.name,
        type: file.type || `application/${file.name.split(".").pop() ?? "octet-stream"}`,
        size: file.size,
        dataUrl,
      });
      setUploadProgress(100);
    };
    reader.onerror = () => {
      setUploadProgress(0);
      setComposerNotice("File upload failed. Please try again.");
    };
    reader.readAsDataURL(file);
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) handleSelectedFile(file);
    event.target.value = "";
  }

  function removeUploadedAttachment() {
    setUploadedAttachment(null);
    setUploadProgress(0);
  }

  async function handleSubmit(inputPrompt = prompt) {
    const trimmed = inputPrompt.trim();
    if ((!trimmed && !uploadedAttachment) || isSubmitting) return;

    setIsSubmitting(true);
    setComposerNotice("");
    const attachmentToSend = uploadedAttachment;
    const userVisibleContent = [
      trimmed || "Analyze the uploaded file.",
      attachmentToSend ? `\n\nAttached file: ${attachmentToSend.name}` : "",
    ].join("");

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: userVisibleContent,
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
    setUploadedAttachment(null);
    setUploadProgress(0);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: activeChatId,
          message: trimmed || "Analyze the uploaded file.",
          messages,
          selectedModel: selectedModelId,
          attachment: attachmentToSend,
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
    fileInputRef.current?.click();
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingFile(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDraggingFile(false);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDraggingFile(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleSelectedFile(file);
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
                <span className="text-xl font-normal tracking-tight text-slate-900">LokoAI</span>
              </button>
              <button type="button" onClick={() => setIsSidebarOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-white hover:text-slate-900 lg:hidden" aria-label="Close sidebar">
                <X className="h-5 w-5" />
              </button>
            </div>

            <button type="button" onClick={startNewChat} className="group mb-2 flex h-11 w-full items-center gap-3 rounded-xl bg-white border border-slate-200 px-4 text-sm font-normal text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]">
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
              <p className="mb-3 px-4 text-[11px] font-normal uppercase tracking-[0.1em] text-slate-400">Navigation</p>
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
              <div className="mb-3 flex items-center justify-between px-3 text-[11px] font-normal uppercase tracking-[0.1em] text-slate-400">
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
                        <span className={`line-clamp-1 text-sm ${activeChatId === project.id ? "font-medium text-slate-900" : "text-slate-600"}`}>{project.title || project.prompt || "Untitled chat"}</span>
                        <span className="mt-0.5 block text-[10px] font-normal text-slate-400">{getTimeAgo(project.updated_at || project.created_at)}</span>
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
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-sm font-medium text-white shadow-sm">{userName.slice(0, 1).toUpperCase()}</div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-normal text-slate-900">{userName}</p>
                      <p className="truncate text-[11px] text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => void signOut()} className="mt-3 flex h-9 w-full items-center gap-3 rounded-xl px-3 text-xs font-normal text-slate-500 transition hover:bg-red-50 hover:text-red-600">
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
              <button type="button" onClick={() => setActiveView("pricing")} className="inline-flex h-9 items-center gap-2 rounded-full bg-sky-50 px-5 text-xs font-normal text-sky-600 transition hover:bg-sky-100">
                <Sparkles className="h-3.5 w-3.5" />
                Upgrade Pro
              </button>
              <button
                type="button"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-600 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to night mode"}
                title={theme === "dark" ? "Light mode" : "Night mode"}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </header>

          <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            {activeView === "chat" ? (
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="relative mx-auto flex min-h-0 w-full max-w-[860px] flex-1 flex-col overflow-hidden">
                  {messages.length === 0 ? (
                    <div className="flex flex-1 flex-col items-center justify-center px-4 py-6 sm:py-8">
                      <AnimatedChatHero />
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
                          selectedModelId={selectedModelId}
                          onModelChange={setSelectedModelId}
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
                            <div className="flex items-center gap-3 text-sm font-normal text-slate-400">
                              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-100 bg-white text-sky-500 shadow-sm">
                                <Sparkles className="h-4 w-4" />
                              </span>
                              LokoAI is writing...
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
                            selectedModelId={selectedModelId}
                            onModelChange={setSelectedModelId}
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
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 text-sm font-normal text-slate-700 shadow-[0_2px_0_rgba(148,163,184,0.28),0_8px_18px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white hover:text-slate-950 active:translate-y-0 active:shadow-sm"
            >
              <Plus className="size-4 shrink-0 overflow-visible text-slate-400" />
              Explore More
            </button>
          ) : (
            <button
              key={item.title}
              type="button"
              onClick={() => setPrompt(item.prompt)}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 text-sm font-normal text-slate-700 shadow-[0_2px_0_rgba(148,163,184,0.28),0_8px_18px_rgba(15,23,42,0.10)] transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white hover:text-slate-950 active:translate-y-0 active:shadow-sm"
            >
              <Sparkles className="size-4 shrink-0 overflow-visible text-sky-400" />
              {item.title}
            </button>
          )
        )}
      </div>
      {isMoreOpen && (
        <div className="absolute bottom-12 right-0 z-30 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-slate-200 animate-in fade-in zoom-in-95 duration-200 sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
          <div className="mb-2 px-3 py-1 text-[10px] font-normal uppercase tracking-widest text-slate-400">Templates</div>
          {moreQuickActions.map((moreItem) => (
            <button
              key={moreItem.title}
              type="button"
              onClick={() => {
                setPrompt(moreItem.prompt);
                setIsMoreOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-normal text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
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
  selectedModelId,
  onModelChange,
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
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
}) {
  const { displayText, hasStarted, placeholderIndex } = useTypewriterPlaceholder();
  const shouldShowAnimatedPlaceholder = !prompt.trim() && !isSubmitting;

  return (
    <div className="relative flex flex-col rounded-3xl border border-slate-200 bg-white transition-all focus-within:border-slate-300">
      <div className="relative px-5 pt-5">
        <AnimatePresence mode="wait">
          {shouldShowAnimatedPlaceholder && hasStarted && (
            <motion.div
              key={placeholderIndex}
              initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute left-5 right-5 top-5 z-10 flex min-h-[44px] items-center overflow-hidden py-2.5"
            >
              <span className="line-clamp-2 text-[0.95rem] font-normal leading-relaxed text-slate-600 sm:text-base">
                {displayText}
              </span>
              <motion.span
                className="ml-1 inline-block h-[1.05em] w-[2px] shrink-0 translate-y-0.5 rounded-full bg-sky-500"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={isSubmitting ? "Generating..." : ""}
          className="relative z-0 max-h-60 min-h-[44px] w-full resize-none bg-transparent py-2.5 text-base leading-relaxed text-slate-900 outline-none placeholder:text-slate-400"
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
          <ModelPicker selectedModelId={selectedModelId} onModelChange={onModelChange} />
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
            <div className="absolute -top-6 right-1 text-[10px] font-normal uppercase tracking-widest text-slate-400 opacity-0 transition group-hover:opacity-100">
              You
            </div>
          )}
          <div className={`text-base leading-relaxed ${isUser ? "text-slate-900 font-medium" : "text-slate-700"} ${message.isError ? "text-red-500 font-medium" : ""}`}>
            <div className={!isUser ? "prose prose-slate max-w-none text-slate-700" : ""}>
              <MarkdownContent content={message.content || (message.isStreaming ? "Thinking..." : "")} />
            </div>
          </div>

          <div className={`mt-2 flex items-center gap-3 text-[10px] font-normal uppercase tracking-wider text-slate-400 opacity-0 transition group-hover:opacity-100 ${isUser ? "justify-end" : "justify-start"}`}>
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
