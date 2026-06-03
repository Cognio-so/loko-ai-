"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Bot,
  Check,
  ChevronRight,
  Compass,
  Copy,
  FileText,
  FolderOpen,
  Maximize2,
  Grid3X3,
  History,
  Loader2,
  Menu,
  Mic,
  Moon,
  Notebook,
  Package,
  Paperclip,
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
  Globe,
  Database,
  X,
  Zap,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import IntegrationsPage from "@/app/integrations/page";
import PartnersPage from "@/app/partners/page";
import LaunchpadPage from "@/app/launchpad/page";
import CollectionPage from "@/app/collection/page";
import { assistants } from "@/app/collection/collection-data";
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

type GeneratedCodeFile = {
  path: string;
  content: string;
};

type Project = {
  id: string;
  title: string;
  description: string | null;
  prompt: string | null;
  preview_html: string | null;
  generated_code: GeneratedCodeFile[];
  chat_messages: ChatMessage[];
  created_at: string;
  updated_at: string;
};

type View = "chat" | "dashboard" | "integrations" | "partners" | "launchpad" | "collection" | "affiliate" | "pricing";

type UploadedAttachment = {
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

type BuilderTab = "preview" | "code";

type ActivityDatum = {
  key: string;
  label: string;
  month: string;
  date: string;
  count: number;
};

type ActivityTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload?: ActivityDatum }>;
};

type GeneratedProjectResponse = {
  projectTitle?: string;
  description?: string;
  previewHtml?: string;
  files?: GeneratedCodeFile[];
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

const BUILD_REQUEST_PATTERN =
  /\b(create|build|make|design|generate|develop|bna|banao|bnao).{0,60}\b(website|web app|landing page|page|dashboard|app|desktop app|ui|ux|component|saas)\b|\b(website|landing page|web app|dashboard|desktop app|saas page)\b/i;

function isBuildRequestPrompt(value: string) {
  const normalized = value.trim();
  const wantsBuilderWorkspace =
    /\b(open|launch|show|create|generate|build)\b.{0,40}\b(builder|workspace|live preview|preview panel|project files|right side|right panel)\b/i.test(normalized) ||
    /\b(build mode|builder mode|generate project|create project|open preview)\b/i.test(normalized);

  return (
    wantsBuilderWorkspace &&
    BUILD_REQUEST_PATTERN.test(normalized) &&
    !/\b(pdf|docx|word|excel|xlsx|pptx|csv|resume|invoice|video|image|photo)\b/i.test(normalized)
  );
}

function normalizeGeneratedFiles(value: unknown): GeneratedCodeFile[] {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is GeneratedCodeFile => {
    return (
      Boolean(item) &&
      typeof item === "object" &&
      "path" in item &&
      "content" in item &&
      typeof item.path === "string" &&
      typeof item.content === "string"
    );
  });
}

function getDefaultGeneratedFile(project: Project | null) {
  return project?.generated_code?.[0]?.path ?? "";
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Compass, view: "dashboard" as View },
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
      "Create a premium Lovable-style responsive website with a complete self-contained HTML preview, polished inline CSS, hero, social proof, product showcase, features, benefits, pricing, testimonials, FAQ, CTA, footer, smooth animations, mobile-first layout, refined typography, tasteful gradients, professional shadows, and startup-quality visual design.",
  },
  {
    title: "Desktop app",
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
          className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-white text-sky-500 shadow-sm sm:h-10 sm:w-10 dark:border-sky-400/20 dark:bg-white dark:shadow-[0_10px_30px_rgba(56,189,248,0.2)]"
        >
          <Sparkles className="relative h-5 w-5 sm:h-5 sm:w-5" />
        </motion.div>
        <motion.div
          initial={{ width: 0, opacity: 0, x: -16, filter: "blur(12px)" }}
          animate={{ width: "auto", opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.05, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="ml-2.5 overflow-hidden sm:ml-3"
        >
          <span className="block whitespace-nowrap bg-gradient-to-r from-slate-800 via-slate-700 to-sky-600 bg-clip-text text-[clamp(1.2rem,3vw,1.75rem)] font-medium leading-none tracking-normal text-transparent dark:from-white dark:via-slate-200 dark:to-sky-300">
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
        <span className="font-normal text-slate-500">{language}</span>
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
            <span key={index} className="my-3 block overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
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
  const trimmed = value.trim();
  if (/^[-*_]{3,}$/.test(trimmed) || /^[*+-]\s*[-*_]{2,}$/.test(trimmed)) return "";

  return trimmed
    .replace(/^#{1,6}\s+/, "")
    .replace(/^>\s*/, "")
    .replace(/^[-*+]\s*/, "")
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
          <p key={index} className="mb-2 text-[0.95rem] font-normal leading-7 text-slate-700 dark:text-slate-200">
            {cleaned}
          </p>
        );
      })}
    </>
  );
}

function ActivityTooltip({ active, payload }: ActivityTooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload as ActivityDatum | undefined;
  if (!item) return null;

  return (
    <div className="pointer-events-none animate-in fade-in zoom-in-95 duration-150 rounded-2xl border border-slate-200/80 bg-white/95 px-4 py-3 text-center shadow-[0_16px_45px_rgba(15,23,42,0.16)] backdrop-blur-2xl">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
        {item.month} {item.date}
      </p>
      <p className="mt-1 text-xl font-black leading-none text-slate-950">{item.count}</p>
    </div>
  );
}

function ActivityActiveDot({ cx, cy }: { cx?: number; cy?: number }) {
  if (typeof cx !== "number" || typeof cy !== "number") return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={10} fill="rgba(14,165,233,0.12)" />
      <circle cx={cx} cy={cy} r={5} fill="#0ea5e9" stroke="#ffffff" strokeWidth={3} />
    </g>
  );
}

function DashboardOverview({
  projects,
  onOpenProject,
  onOpenAgent,
}: {
  projects: Project[];
  onOpenProject: (project: Project) => void;
  onOpenAgent: (slug: string) => void;
}) {
  const assignedAgents = assistants.slice(0, 10);
  const totalConversations = projects.length;
  const generatedFiles = projects.reduce((count, project) => count + (project.generated_code?.length ?? 0), 0);
  const totalMessages = projects.reduce((count, project) => count + (project.chat_messages?.length ?? 0), 0);
  const recentProjects = projects.slice(0, 5);
  const popularAgents = assignedAgents.slice(0, 5);
  const activityDateFormatter = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  const activityKeyFormatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const activityCounts = new Map<string, number>();
  const today = new Date();

  for (const project of projects) {
    const realEvents = project.chat_messages?.length
      ? project.chat_messages.filter((message) => message.role === "user").map((message) => message.createdAt)
      : [project.updated_at || project.created_at];

    for (const eventDate of realEvents) {
      const parsedDate = new Date(eventDate);
      if (Number.isNaN(parsedDate.getTime())) continue;
      const key = activityKeyFormatter.format(parsedDate);
      activityCounts.set(key, (activityCounts.get(key) ?? 0) + 1);
    }
  }

  const activityDays = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (29 - index));
    const key = activityKeyFormatter.format(date);
    const label = activityDateFormatter.format(date);
    const [month, dayOfMonth] = label.split(" ");
    return {
      key,
      label,
      month,
      date: dayOfMonth,
      count: activityCounts.get(key) ?? 0,
    };
  });
  const maxActivity = Math.max(1, ...activityDays.map((day) => day.count));
  const chartMax = Math.max(4, maxActivity);

  return (
    <div className="relative min-h-full overflow-hidden bg-[#f8fbff] text-slate-950">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(14,165,233,0.16),transparent_28%),radial-gradient(circle_at_82%_0%,rgba(99,102,241,0.12),transparent_30%),linear-gradient(180deg,#ffffff_0%,#f8fbff_45%,#eef6ff_100%)]" />
      <div className="relative mx-auto w-full max-w-[1500px] px-5 py-5 lg:px-7">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-sky-500">Loko AI dashboard</p>
            <h1 className="mt-1.5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Your Dashboard</h1>
            <p className="mt-1.5 max-w-3xl text-sm text-slate-500">
              Overview of your agent usage, conversation activity, model routing, workflows, and quick launch agents.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenAgent("loko-ai")}
            className="inline-flex h-11 w-fit items-center gap-2 rounded-2xl bg-slate-950 px-4 text-sm font-bold text-white shadow-xl shadow-sky-500/10 transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            <Sparkles className="h-4 w-4 text-sky-300" />
            Open Loko AI
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Assigned Agents", value: assignedAgents.length, note: "Agents ready to use", icon: Bot, tone: "from-blue-500 to-cyan-400" },
            { label: "Total Conversations", value: totalConversations, note: "All your conversations", icon: History, tone: "from-emerald-500 to-teal-400" },
            { label: "AI Messages", value: totalMessages, note: "Conversation activity", icon: FileText, tone: "from-violet-500 to-fuchsia-500" },
            { label: "Generated Files", value: generatedFiles, note: "Project files created", icon: Database, tone: "from-orange-500 to-amber-400" },
          ].map((stat) => (
            <div key={stat.label} className="group rounded-[24px] border border-slate-200/80 bg-white/82 p-4 shadow-[0_16px_54px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_22px_72px_rgba(14,165,233,0.14)]">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500">{stat.label}</p>
                <div className={`flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.tone} shadow-lg shadow-slate-300/50`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-3xl font-black tracking-tight text-slate-950">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-500">{stat.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="flex rounded-[26px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_18px_64px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex min-h-[320px] w-full flex-col">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-black text-slate-950">Conversation Activity</h2>
                <p className="mt-1 text-xs text-slate-500">Daily workspace signal across the latest sessions</p>
              </div>
              <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-600">Last 30 days</span>
            </div>
            <div className="relative min-h-0 flex-1 rounded-[22px] border border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-2 pb-1 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityDays} margin={{ top: 4, right: 14, bottom: 14, left: 0 }}>
                  <defs>
                    <linearGradient id="conversationActivityFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 6" vertical={false} />
                  <XAxis
                    dataKey="label"
                    interval={3}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={8}
                    height={32}
                    tick={({ x, y, payload }) => {
                      const item = activityDays[payload.index];
                      if (!item) return <g />;
                      return (
                        <g transform={`translate(${Number(x)},${Number(y) + 6})`}>
                          <text textAnchor="middle" className="fill-slate-400 text-[10px] font-bold">
                            <tspan x="0" dy="0">{item.month}</tspan>
                            <tspan x="0" dy="12">{item.date}</tspan>
                          </text>
                        </g>
                      );
                    }}
                  />
                  <YAxis
                    domain={[0, chartMax]}
                    ticks={[0, 1, 2, 3, 4].filter((tick) => tick <= chartMax)}
                    tickLine={false}
                    axisLine={false}
                    width={42}
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 700 }}
                  />
                  <Tooltip
                    content={<ActivityTooltip />}
                    cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                    wrapperStyle={{ outline: "none", transition: "transform 160ms ease, opacity 160ms ease" }}
                    position={{ y: 46 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    fill="url(#conversationActivityFill)"
                    dot={false}
                    activeDot={<ActivityActiveDot />}
                    isAnimationActive
                    animationDuration={700}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            </div>
          </section>

          <section className="rounded-[26px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_18px_64px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-4">
              <h2 className="text-base font-black text-slate-950">Model Router</h2>
              <p className="mt-1 text-xs text-slate-500">Best model selected by task type</p>
            </div>
            <div className="space-y-2.5">
              {[
                ["Frontend/Coding", "qwen/qwen3-coder:free", "from-indigo-500 to-cyan-400"],
                ["Creative Writing", "moonshotai/kimi-k2.6:free", "from-emerald-500 to-teal-400"],
                ["Research/Reasoning", "openai/gpt-oss-120b:free", "from-blue-500 to-sky-400"],
                ["UI Analysis", "hermes-3-llama-405b", "from-slate-700 to-slate-500"],
                ["Image Prompting", "gemini-2.5-flash-image", "from-orange-500 to-amber-400"],
              ].map(([label, model, tone]) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
                  <span className={`h-3 w-3 rounded-full bg-gradient-to-br ${tone} shadow-lg`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-black text-slate-800">{label}</p>
                    <p className="truncate text-[11px] text-slate-500">{model}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          <section className="rounded-[26px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_18px_64px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-2">
              <History className="h-4 w-4 text-sky-500" />
              <h2 className="text-base font-black text-slate-950">Recent Conversations</h2>
            </div>
            {recentProjects.length ? (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => onOpenProject(project)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-slate-900">{project.title}</p>
                      <p className="truncate text-xs text-slate-500">{project.prompt || "Workspace conversation"}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex min-h-36 flex-col items-center justify-center rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 text-center">
                <History className="mb-3 h-9 w-9 text-slate-400" />
                <p className="text-sm font-bold text-slate-700">No conversations yet</p>
                <p className="mt-1 text-xs text-slate-500">Start chatting with your assigned agents to see them here.</p>
              </div>
            )}
          </section>

          <section className="rounded-[26px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_18px_64px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-sky-500" />
                <h2 className="text-base font-black text-slate-950">Quick Launch Agents</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">AI Collection</span>
            </div>
            <div className="space-y-2.5">
              {popularAgents.map((agent) => (
                <button
                  key={agent.slug}
                  type="button"
                  onClick={() => onOpenAgent(agent.slug)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                >
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${agent.accent} shadow-lg shadow-slate-300/50`}>
                    <agent.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-slate-900">{agent.name}</p>
                    <p className="truncate text-xs text-slate-500">{agent.specializations.slice(0, 3).join(" • ")}</p>
                  </div>
                  <span className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition group-hover:border-sky-200 group-hover:text-sky-600">
                    Chat
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
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
  const [activeBuildProject, setActiveBuildProject] = useState<Project | null>(null);
  const [builderTab, setBuilderTab] = useState<BuilderTab>("preview");
  const [selectedBuilderFile, setSelectedBuilderFile] = useState("");

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
          generated_code: normalizeGeneratedFiles(project.generated_code),
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
    setActiveBuildProject(null);
    setSelectedBuilderFile("");
    setPrompt("");
    setActiveView("chat");
    setIsSidebarOpen(false);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }

  function openProject(project: Project) {
    setActiveChatId(project.id);
    setMessages(normalizeMessages(project.chat_messages));
    const generatedCode = normalizeGeneratedFiles(project.generated_code);
    const hydratedProject = { ...project, generated_code: generatedCode };
    setActiveBuildProject(project.preview_html || generatedCode.length ? hydratedProject : null);
    setSelectedBuilderFile(generatedCode[0]?.path ?? "");
    setBuilderTab(project.preview_html ? "preview" : "code");
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
    if (activeBuildProject?.id === projectId) setActiveBuildProject(null);

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
      if (trimmed && isBuildRequestPrompt(trimmed) && !attachmentToSend) {
        const generateResponse = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: trimmed }),
        });

        if (!generateResponse.ok) {
          const errorText = await generateResponse.text();
          throw new Error(errorText || "Project generation failed");
        }

        const generated = (await generateResponse.json()) as GeneratedProjectResponse;
        const generatedFiles = normalizeGeneratedFiles(generated.files);
        const assistantFinal: ChatMessage = {
          ...assistantMessage,
          isStreaming: false,
          content: `Build ready: ${generated.projectTitle || "Generated project"}\n\nI opened the workspace on the right with live preview, code, and files. Keep chatting here to update this same project.`,
        };
        const finalMessages = [...messages, userMessage, assistantFinal];
        const projectPayload = {
          title: generated.projectTitle || trimmed.slice(0, 64) || "Generated Project",
          description: generated.description || "AI generated project",
          prompt: trimmed,
          preview_html: generated.previewHtml || null,
          generated_code: generatedFiles,
          chat_messages: finalMessages,
        };
        const shouldUpdateCurrentBuild = Boolean(activeBuildProject?.id && activeChatId === activeBuildProject.id);
        const saveResponse = await fetch(
          shouldUpdateCurrentBuild ? `/api/projects/${activeBuildProject!.id}` : "/api/projects",
          {
            method: shouldUpdateCurrentBuild ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(projectPayload),
          }
        );

        if (!saveResponse.ok) {
          const errorText = await saveResponse.text();
          throw new Error(errorText || "Project save failed");
        }

        const savedData = (await saveResponse.json()) as { project?: Project };
        const savedProject = savedData.project;
        if (!savedProject) throw new Error("Generated project was not returned.");

        const hydratedProject: Project = {
          ...savedProject,
          generated_code: normalizeGeneratedFiles(savedProject.generated_code),
          chat_messages: normalizeMessages(savedProject.chat_messages),
        };

        setMessages(finalMessages);
        setActiveChatId(hydratedProject.id);
        setActiveBuildProject(hydratedProject);
        setSelectedBuilderFile(getDefaultGeneratedFile(hydratedProject));
        setBuilderTab(hydratedProject.preview_html ? "preview" : "code");
        loadProjects();
        return;
      }

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

        <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_ATTACHMENT_TYPES}
            className="hidden"
            onChange={handleFileInputChange}
          />
          <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-100 bg-white/80 px-4 backdrop-blur-md transition-colors duration-300 sm:px-8 dark:border-white/10 dark:bg-slate-950/80">
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

          <section
            className={`relative flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent transition-colors duration-300 dark:workspace-dark-bg dark:workspace-dark-grid dark:workspace-dark-noise ${isDraggingFile ? "bg-sky-50/60 dark:bg-sky-950/20" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="pointer-events-none absolute inset-0 hidden dark:block">
              <div className="absolute left-[12%] top-[10%] h-56 w-56 rounded-full bg-sky-500/10 blur-3xl" />
              <div className="absolute bottom-[14%] right-[12%] h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/6 blur-3xl" />
            </div>
            {isDraggingFile && (
              <div className="pointer-events-none absolute inset-4 z-30 flex items-center justify-center rounded-3xl border-2 border-dashed border-sky-300 bg-sky-50/80 text-sm font-semibold text-sky-700 shadow-inner backdrop-blur-sm">
                Drop file to attach it to this chat
              </div>
            )}
            {activeView === "chat" ? (
              <div className={`relative z-10 flex min-h-0 flex-1 overflow-hidden ${activeBuildProject ? "flex-col lg:flex-row" : "flex-col"}`}>
                <div className={`relative flex min-h-0 w-full flex-col overflow-hidden ${
                  activeBuildProject
                    ? "mx-0 flex-[0_0_42%] border-r border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-950/35 lg:max-w-[520px]"
                    : "mx-auto max-w-[860px] flex-1"
                }`}>
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
                          attachment={uploadedAttachment}
                          uploadProgress={uploadProgress}
                          onRemoveAttachment={removeUploadedAttachment}
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
                            <div className="flex items-center gap-3 text-sm font-normal text-slate-400 dark:text-slate-500">
                              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-sky-100 bg-white text-sky-500 shadow-sm dark:border-sky-400/20 dark:bg-slate-900/80 dark:text-sky-300">
                                <Sparkles className="h-4 w-4" />
                              </span>
                              LokoAI is writing...
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>
                      </div>
                      <div className="shrink-0 bg-white/80 px-4 pb-6 pt-4 backdrop-blur-md transition-colors duration-300 sm:pb-10 dark:bg-slate-950/80">
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
                            attachment={uploadedAttachment}
                            uploadProgress={uploadProgress}
                            onRemoveAttachment={removeUploadedAttachment}
                          />
                          <PromptChips setPrompt={setPrompt} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {activeBuildProject && (
                  <BuildSidePanel
                    project={activeBuildProject}
                    activeTab={builderTab}
                    selectedFile={selectedBuilderFile}
                    onTabChange={setBuilderTab}
                    onFileChange={setSelectedBuilderFile}
                    onClose={() => setActiveBuildProject(null)}
                  />
                )}
              </div>
            ) : (
              <div className="scrollbar-soft min-h-0 flex-1 overflow-y-auto overscroll-contain">
                {activeView === "integrations" && <IntegrationsPage />}
                {activeView === "dashboard" && (
                  <DashboardOverview
                    projects={projects}
                    onOpenProject={openProject}
                    onOpenAgent={(slug) => router.push(`/collection/${slug}`)}
                  />
                )}
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

function BuildSidePanel({
  project,
  activeTab,
  selectedFile,
  onTabChange,
  onFileChange,
  onClose,
}: {
  project: Project;
  activeTab: BuilderTab;
  selectedFile: string;
  onTabChange: (tab: BuilderTab) => void;
  onFileChange: (path: string) => void;
  onClose: () => void;
}) {
  const files = project.generated_code ?? [];
  const currentFile = files.find((file) => file.path === selectedFile) ?? files[0] ?? null;
  const previewHtml = project.preview_html || "";

  return (
    <aside className="flex min-h-0 flex-1 flex-col border-t border-slate-200 bg-white/95 shadow-[inset_1px_0_0_rgba(148,163,184,0.16)] dark:border-white/10 dark:bg-slate-950/88 lg:border-t-0">
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-3 dark:border-white/10">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{project.title}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{files.length} files generated</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => onTabChange("preview")}
              className={`h-8 rounded-lg px-3 text-xs font-semibold transition ${
                activeTab === "preview"
                  ? "bg-white text-sky-600 shadow-sm dark:bg-sky-500 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => onTabChange("code")}
              className={`h-8 rounded-lg px-3 text-xs font-semibold transition ${
                activeTab === "code"
                  ? "bg-white text-sky-600 shadow-sm dark:bg-sky-500 dark:text-white"
                  : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              }`}
            >
              Code
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
            aria-label="Close builder panel"
            title="Close builder"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {activeTab === "preview" ? (
        <div className="min-h-0 flex-1 bg-slate-100 p-3 dark:bg-slate-900/80">
          {previewHtml ? (
            <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-white/10">
              <iframe
                title={`${project.title} preview`}
                srcDoc={previewHtml}
                sandbox="allow-scripts allow-forms allow-popups allow-modals"
                className="h-full w-full bg-white"
              />
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
              Preview will appear when generated HTML is available.
            </div>
          )}
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 bg-white dark:bg-slate-950 md:grid-cols-[260px_1fr]">
          <div className="min-h-0 border-b border-slate-200 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-slate-900/60 md:border-b-0 md:border-r">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
              <FolderOpen className="h-3.5 w-3.5" />
              Files
            </div>
            <div className="scrollbar-soft max-h-48 space-y-1 overflow-auto md:max-h-none">
              {files.map((file) => (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => onFileChange(file.path)}
                  className={`flex h-9 w-full min-w-0 items-center gap-2 rounded-lg px-2 text-left text-xs transition ${
                    currentFile?.path === file.path
                      ? "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200"
                      : "text-slate-600 hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`}
                >
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{file.path}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 overflow-hidden">
            <div className="flex h-10 items-center justify-between border-b border-slate-200 bg-white px-3 dark:border-white/10 dark:bg-slate-950">
              <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200">
                {currentFile?.path || "No file selected"}
              </p>
              {currentFile && (
                <button
                  type="button"
                  onClick={() => void navigator.clipboard.writeText(currentFile.content)}
                  className="inline-flex h-7 items-center gap-1.5 rounded-lg px-2 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-900 dark:hover:text-white"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
              )}
            </div>
            <pre className="scrollbar-soft h-[calc(100%-2.5rem)] overflow-auto bg-white p-4 text-[12px] leading-6 text-slate-800 dark:bg-slate-950 dark:text-slate-200">
              <code>{currentFile?.content || "Generated files will appear here."}</code>
            </pre>
          </div>
        </div>
      )}
    </aside>
  );
}

function formatAttachmentSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentPreview({
  attachment,
  progress,
  onRemove,
}: {
  attachment: UploadedAttachment;
  progress: number;
  onRemove: () => void;
}) {
  const extension = attachment.name.split(".").pop()?.toUpperCase() || "FILE";

  return (
    <div className="mx-3 mt-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sky-500 shadow-sm ring-1 ring-slate-200">
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{attachment.name}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            {extension} · {formatAttachmentSize(attachment.size)}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white hover:text-red-500"
          aria-label="Remove uploaded file"
          title="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {progress < 100 && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-sky-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

function PromptChips({ setPrompt }: { setPrompt: (value: string) => void }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  return (
    <div className="relative mt-6 w-full">
      <div className="quick-actions flex w-full justify-start gap-2 overflow-x-auto whitespace-nowrap px-1 pb-2 sm:justify-center">
        {[...quickActions, { title: "Explore More", prompt: "" }].map((item) =>
          item.title === "Explore More" ? (
            <button
              key={item.title}
              type="button"
              onClick={() => setIsMoreOpen((open) => !open)}
              className="quick-action-btn inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 text-[13px] font-medium text-slate-700 shadow-[0_2px_0_rgba(148,163,184,0.18),0_8px_18px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white hover:text-slate-950 active:translate-y-0 active:shadow-sm dark:border-sky-400/10 dark:bg-slate-900/70 dark:text-slate-100 dark:shadow-[0_10px_24px_rgba(2,8,23,0.35)] dark:hover:border-sky-400/30 dark:hover:bg-slate-800/90 dark:hover:text-white"
            >
              <Plus className="size-3.5 shrink-0 overflow-visible text-slate-400" />
              Explore More
            </button>
          ) : (
            <button
              key={item.title}
              type="button"
              onClick={() => setPrompt(item.prompt)}
              className="quick-action-btn inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-slate-300 bg-white px-3 text-[13px] font-medium text-slate-700 shadow-[0_2px_0_rgba(148,163,184,0.18),0_8px_18px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-white hover:text-slate-950 active:translate-y-0 active:shadow-sm dark:border-sky-400/10 dark:bg-slate-900/70 dark:text-slate-100 dark:shadow-[0_10px_24px_rgba(2,8,23,0.35)] dark:hover:border-sky-400/30 dark:hover:bg-slate-800/90 dark:hover:text-white"
            >
              <Sparkles className="size-3.5 shrink-0 overflow-visible text-sky-400" />
              {item.title}
            </button>
          )
        )}
      </div>
      {isMoreOpen && (
        <div className="absolute bottom-12 right-0 z-30 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl ring-1 ring-slate-200 animate-in fade-in zoom-in-95 duration-200 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 dark:border-white/10 dark:bg-slate-900 dark:ring-white/10">
          <div className="mb-2 px-3 py-1 text-[10px] font-normal uppercase tracking-widest text-slate-400 dark:text-slate-500">Templates</div>
          {moreQuickActions.map((moreItem) => (
            <button
              key={moreItem.title}
              type="button"
              onClick={() => {
                setPrompt(moreItem.prompt);
                setIsMoreOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-normal text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
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
  attachment,
  uploadProgress,
  onRemoveAttachment,
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
  attachment: UploadedAttachment | null;
  uploadProgress: number;
  onRemoveAttachment: () => void;
}) {
  const { displayText, hasStarted, placeholderIndex } = useTypewriterPlaceholder();
  const shouldShowAnimatedPlaceholder = !prompt.trim() && !isSubmitting;
  const canSubmit = Boolean(prompt.trim() || attachment) && !isSubmitting;

  return (
    <div className="relative flex flex-col rounded-[28px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.08)] transition-all duration-300 focus-within:border-slate-300 dark:border-white/10 dark:bg-slate-900/82 dark:shadow-[0_24px_70px_rgba(2,8,23,0.45)] dark:ring-1 dark:ring-white/5 dark:backdrop-blur-xl dark:focus-within:border-sky-400/30">
      {attachment && (
        <AttachmentPreview attachment={attachment} progress={uploadProgress} onRemove={onRemoveAttachment} />
      )}
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
              <span className="line-clamp-2 text-[0.95rem] font-normal leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
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
          className="relative z-0 max-h-60 min-h-[44px] w-full resize-none bg-transparent py-2.5 text-base leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
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
              <DropdownMenuItem onClick={onAddContent} className="flex items-center gap-3 rounded-[14px] px-3.5 py-3 text-[14.5px] cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800">
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

          <button 
            type="button" 
            onClick={onVoiceInput} 
            className="flex h-10 w-10 items-center justify-center overflow-visible rounded-full text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100" 
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
          disabled={!canSubmit}
          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-visible rounded-xl bg-slate-900 text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-20 active:scale-95 dark:bg-sky-500 dark:hover:bg-sky-400" 
          aria-label="Send prompt"
        >
          {isSubmitting ? <Loader2 className="size-4 animate-spin overflow-visible" /> : <Send className="size-4 overflow-visible" />}
        </button>
      </div>
      {notice && <p className="px-5 pb-3 text-xs font-medium text-slate-500 dark:text-slate-400">{notice}</p>}
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
        
        <div className={`group relative rounded-[24px] px-5 py-4 transition-colors duration-300 ${
          isUser
            ? "bg-slate-100/90 shadow-[0_10px_30px_rgba(15,23,42,0.05)] dark:bg-slate-900/80 dark:shadow-[0_16px_36px_rgba(2,8,23,0.35)]"
            : "bg-transparent dark:bg-white/[0.02]"
        }`}>
          {isUser && (
            <div className="absolute -top-6 right-1 text-[10px] font-normal uppercase tracking-widest text-slate-400 opacity-0 transition group-hover:opacity-100">
              You
            </div>
          )}
          <div className={`text-base leading-relaxed ${isUser ? "text-slate-900 font-medium dark:text-slate-100" : "text-slate-700 dark:text-slate-200"} ${message.isError ? "text-red-500 font-medium dark:text-red-400" : ""}`}>
            <div className={!isUser ? "prose prose-slate max-w-none text-slate-700 dark:prose-invert dark:text-slate-200" : ""}>
              <MarkdownContent content={message.content || (message.isStreaming ? "Thinking..." : "")} />
            </div>
          </div>

          <div className={`mt-2 flex items-center gap-3 text-[10px] font-normal uppercase tracking-wider text-slate-400 opacity-0 transition group-hover:opacity-100 dark:text-slate-500 ${isUser ? "justify-end" : "justify-start"}`}>
            <span>{formatTime(message.createdAt)}</span>
            <button type="button" onClick={onCopy} className="transition flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200">
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            {!isUser && (
              <button type="button" onClick={onRetry} className="transition flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-200">
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
