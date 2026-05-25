"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Clock,
  ExternalLink,
  Loader2,
  Plus,
  Wand2,
  LayoutGrid,
  Zap,
  Globe,
  Palette,
  Code2,
  Search,
  TrendingUp,
  Trash2,
  Sun,
  Moon,
} from "lucide-react";
import { writePendingBuilderPrompt } from "@/lib/builder-session";

type Project = {
  id: string;
  title: string;
  description: string | null;
  prompt: string | null;
  preview_html: string | null;
  created_at: string;
  updated_at: string;
};

const QUICK_PROMPTS = [
  {
    icon: "🚀",
    label: "SaaS Landing",
    prompt: "Design a premium SaaS website for a project management tool with a polished dashboard mockup, pricing comparison, integrations, proof, and strong CTA flow.",
  },
  {
    icon: "🛍️",
    label: "E-commerce",
    prompt: "Create a modern e-commerce website for an online fashion store with product grid, cart mini-view, category filters, hover image swaps, and customer reviews.",
  },
  {
    icon: "🤖",
    label: "Image Concept",
    prompt: "Create a premium image concept board for a coffee brand poster with hero artwork, 3 visual variations, prompt notes, and a polished art presentation.",
  },
  {
    icon: "💼",
    label: "Agency",
    prompt: "Build a creative agency portfolio website with full-screen hero, work grid, team cards, services, and a premium dark visual identity.",
  },
  {
    icon: "📚",
    label: "Education",
    prompt: "Build an online learning platform with course previews, instructor profiles, category filters, testimonials, and premium pricing tiers.",
  },
  {
    icon: "🏢",
    label: "Real Estate",
    prompt: "Create a real estate property portal with featured listings, advanced filters, neighborhood cards, agents, and a premium slate-and-green palette.",
  },
];

const PLACEHOLDER_PROMPTS = [
  "Create a modern e-commerce website with filters, reviews, and rich product cards...",
  "Build a premium dashboard for sales analytics and team activity...",
  "Design a restaurant website with menu tabs, chef story, and reservations...",
  "Create an image concept board for a poster, logo, or campaign visual...",
  "Build an editorial text page or brochure with premium typography...",
  "Design a creative agency portfolio with case studies and bold art direction...",
];

function PreviewCard({ html, title }: { html: string | null; title: string }) {
  if (!html) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-700/80">
            <Globe className="h-6 w-6 text-slate-400" />
          </div>
          <p className="text-xs text-slate-500">{title}</p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      className="pointer-events-none h-full w-full border-0"
      title={title}
      sandbox="allow-scripts"
      style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "200%" }}
    />
  );
}

function ProjectCard({
  project,
  onOpen,
  onDelete,
}: {
  project: Project;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const timeAgo = getTimeAgo(project.created_at);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDeleting) return;
    setIsDeleting(true);
    onDelete(project.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="project-card group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 shadow-xl transition-all duration-300 hover:border-indigo-500/40 hover:shadow-indigo-500/10"
    >
      {/* Preview thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-800">
        <PreviewCard html={project.preview_html} title={project.title} />

        {/* Hover overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/70 backdrop-blur-sm"
            >
              <button
                onClick={() => onOpen(project.id)}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500"
              >
                <Code2 className="h-3.5 w-3.5" />
                Edit Design
              </button>
              {project.preview_html && (
                <button
                  onClick={() => {
                    const blob = new Blob([project.preview_html!], { type: "text/html" });
                    const url = URL.createObjectURL(blob);
                    window.open(url, "_blank");
                    setTimeout(() => URL.revokeObjectURL(url), 30000);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white backdrop-blur transition hover:bg-white/20"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Preview
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 backdrop-blur transition hover:bg-red-500/20 disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="project-card-title truncate font-bold text-white">{project.title}</h3>
        {project.prompt && (
          <p className="project-card-desc mt-1 line-clamp-2 text-xs leading-relaxed text-slate-400">
            {project.prompt}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <span className="project-card-time flex items-center gap-1.5 text-[11px] text-slate-500">
            <Clock className="h-3 w-3" />
            {timeAgo}
          </span>
          <button
            onClick={() => onOpen(project.id)}
            className="inline-flex items-center gap-1 rounded-full bg-slate-700/60 px-3 py-1 text-[11px] font-semibold text-slate-300 transition hover:bg-indigo-600 hover:text-white"
          >
            Open
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 30) return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export default function DashboardWorkspace() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderText, setPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Sync theme with localStorage — dashboard has its own independent key
  useEffect(() => {
    const stored = localStorage.getItem("lokoai.theme.dashboard");
    if (stored === "light") setIsDark(false);
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("lokoai.theme.dashboard", next ? "dark" : "light");
      return next;
    });
  };

  const loadProjects = useCallback(() => {
    fetch("/api/projects?limit=50")
      .then((res) => res.ok ? res.json() : null)
      .then((data: { projects?: Project[] } | null) => {
        setProjects(data?.projects ?? []);
        setIsLoadingProjects(false);
      })
      .catch((e) => {
        console.warn("Failed to load projects:", e);
        setIsLoadingProjects(false);
      });
  }, []);

  const handleProjectDelete = useCallback((id: string) => {
    // Optimistically remove from list
    setProjects((prev) => prev.filter((p) => p.id !== id));
    fetch(`/api/projects/${id}`, { method: "DELETE" }).catch(() => {
      // If delete fails, reload projects to restore correct state
      loadProjects();
    });
  }, [loadProjects]);

  // Load all projects
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  // Typewriter for placeholder
  useEffect(() => {
    const currentPrompt = PLACEHOLDER_PROMPTS[placeholderIndex];
    const isComplete = placeholderText === currentPrompt;
    const isEmpty = placeholderText.length === 0;

    const delay = isComplete && !isDeleting ? 2000 : isDeleting ? 22 : 42;

    const timer = window.setTimeout(() => {
      if (!isDeleting && isComplete) {
        setIsDeleting(true);
        return;
      }
      if (isDeleting && isEmpty) {
        setIsDeleting(false);
        setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_PROMPTS.length);
        return;
      }
      setPlaceholderText((t) =>
        isDeleting ? t.slice(0, -1) : currentPrompt.slice(0, t.length + 1)
      );
    }, delay);

    return () => clearTimeout(timer);
  }, [isDeleting, placeholderIndex, placeholderText]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [prompt]);

  async function handleCreate(inputPrompt = prompt) {
    const trimmed = inputPrompt.trim();
    if (!trimmed || isCreating) return;

    setIsCreating(true);
    writePendingBuilderPrompt(trimmed);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Design", prompt: trimmed }),
      });

      if (res.ok) {
        const data = await res.json() as { project?: { id: string } };
        const projectId = data.project?.id;
        if (projectId) {
          sessionStorage.setItem(`lokoai.pending.${projectId}`, trimmed);
          router.push(`/build/${projectId}`);
          return;
        }
      }
    } catch (e) {
      console.warn("Failed to create project:", e);
    }

    // Fallback
    router.push("/create");
  }

  function handleKeyDown(e: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleCreate();
    }
  }

  const filteredProjects = searchQuery
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.prompt ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30" data-theme={isDark ? "dark" : "light"}>
      {/* Light mode overrides */}
      {!isDark && (
        <style dangerouslySetInnerHTML={{ __html: `
          [data-theme="light"] { background: #f8fafc !important; }
          [data-theme="light"] header { background: rgba(255,255,255,0.92) !important; border-color: rgba(0,0,0,0.08) !important; }
          [data-theme="light"] .project-card { background: rgba(255,255,255,0.95) !important; border-color: rgba(0,0,0,0.1) !important; box-shadow: 0 4px 20px rgba(0,0,0,0.08) !important; }
          [data-theme="light"] .project-card:hover { border-color: rgba(99,102,241,0.4) !important; }
          [data-theme="light"] .project-card-title { color: #1e293b !important; }
          [data-theme="light"] .project-card-desc { color: #475569 !important; }
          [data-theme="light"] .project-card-time { color: #94a3b8 !important; }
          [data-theme="light"] h1, [data-theme="light"] h2, [data-theme="light"] h3 { color: #1e293b !important; }
          [data-theme="light"] .text-white { color: #1e293b !important; }
          [data-theme="light"] .text-slate-400 { color: #475569 !important; }
          [data-theme="light"] .text-slate-500 { color: #64748b !important; }
          [data-theme="light"] .border-white\\/5 { border-color: rgba(0,0,0,0.06) !important; }
          [data-theme="light"] .border-white\\/10 { border-color: rgba(0,0,0,0.08) !important; }
          [data-theme="light"] nav button { color: #475569 !important; }
          [data-theme="light"] nav button:hover { color: #1e293b !important; }
        `}} />
      )}
      {/* Animated background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-indigo-600/8 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-purple-600/8 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-cyan-600/6 blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.4) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                <Wand2 className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight">LokoAI</span>
            </div>

            <nav className="hidden items-center gap-6 text-sm font-medium text-slate-400 sm:flex">
              <button className="transition hover:text-white">Gallery</button>
              <button className="transition hover:text-white">Templates</button>
              <button className="transition hover:text-white">Docs</button>
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 hover:text-white"
                title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <button
                onClick={() => void handleCreate(
                  "Create a stunning modern landing page with dark theme, hero section, features, testimonials, and pricing"
                )}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 active:scale-95"
              >
                <Plus className="h-4 w-4" />
                New Design
              </button>
            </div>
          </div>
        </header>

        {/* Hero / Create Section */}
        <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Design
            </div>
            <h1 className="mb-4 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-6xl">
              Build stunning pages
              <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                in seconds
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-base text-slate-400 sm:text-lg">
              Describe your vision and watch AI generate a complete, beautiful landing page instantly. Edit with chat, preview in real-time.
            </p>

            {/* Prompt input */}
            <div className="relative mx-auto max-w-3xl">
              <div className="absolute -inset-[1px] rounded-3xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-50 blur-sm" />
              <div className="relative rounded-3xl border border-white/10 bg-slate-900/90 p-4 shadow-2xl backdrop-blur-xl">
                <div className="relative">
                  {!prompt && (
                    <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1 text-sm text-slate-500">
                      <span className="truncate">{placeholderText}</span>
                      <span className="h-4 w-[2px] animate-pulse bg-indigo-400/70" />
                    </div>
                  )}
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="min-h-[80px] w-full resize-none bg-transparent px-3 py-3 text-sm font-medium text-white outline-none placeholder:text-transparent selection:bg-indigo-500/30"
                    style={{ maxHeight: 240 }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/5 pt-3">
                  <div className="flex flex-wrap gap-2">
                    {QUICK_PROMPTS.slice(0, 3).map((q) => (
                      <button
                        key={q.label}
                        onClick={() => void handleCreate(q.prompt)}
                        disabled={isCreating}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-white disabled:opacity-50"
                      >
                        <span>{q.icon}</span>
                        {q.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => void handleCreate()}
                    disabled={!prompt.trim() || isCreating}
                    className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Quick prompts row 2 */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {QUICK_PROMPTS.slice(3).map((q) => (
                <button
                  key={q.label}
                  onClick={() => void handleCreate(q.prompt)}
                  disabled={isCreating}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-400 backdrop-blur transition hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-slate-200 disabled:opacity-50"
                >
                  <span>{q.icon}</span>
                  {q.label}
                </button>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Stats row */}
        <div className="mx-auto mb-12 flex max-w-4xl items-center justify-center gap-8 px-4 sm:gap-16">
          {[
            { icon: Zap, label: "Instant Generation", value: "< 30s" },
            { icon: Palette, label: "Design Styles", value: "∞" },
            { icon: TrendingUp, label: "Designs Created", value: `${projects.length}+` },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-2xl font-black text-white">
                <stat.icon className="h-5 w-5 text-indigo-400" />
                {stat.value}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Projects Gallery */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-xl font-bold text-white">
                <LayoutGrid className="h-5 w-5 text-indigo-400" />
                {projects.length > 0 ? "Your Designs" : "Design Gallery"}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                {projects.length > 0
                  ? `${projects.length} design${projects.length === 1 ? "" : "s"} created`
                  : "Create your first design above"}
              </p>
            </div>

            {projects.length > 4 && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search designs..."
                  className="h-9 rounded-full border border-white/10 bg-slate-900/60 pl-9 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500/50"
                />
              </div>
            )}
          </div>

          {isLoadingProjects ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-2xl border border-white/5 bg-slate-900/50"
                />
              ))}
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onOpen={(id) => router.push(`/build/${id}`)}
                  onDelete={handleProjectDelete}
                />
              ))}
            </div>
          ) : projects.length === 0 ? (
            // Empty state
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="relative mb-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600/20 to-purple-600/20 ring-1 ring-white/10">
                  <Wand2 className="h-10 w-10 text-indigo-400" />
                </div>
                <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Plus className="h-4 w-4" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">No designs yet</h3>
              <p className="mb-6 max-w-sm text-sm text-slate-400">
                Type a description above or pick a template to create your first stunning landing page
              </p>
              <button
                onClick={() => void handleCreate(QUICK_PROMPTS[0].prompt)}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
              >
                <Sparkles className="h-4 w-4" />
                Create First Design
              </button>
            </motion.div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              No designs match &ldquo;{searchQuery}&rdquo;
            </div>
          )}
        </section>
      </div>

      {/* Creating overlay */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-3xl border border-white/10 bg-slate-900/90 p-8 text-center shadow-2xl"
            >
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30">
                <Loader2 className="h-7 w-7 animate-spin text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">Setting up workspace</h3>
              <p className="mt-1 text-sm text-slate-400">Preparing your design environment...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
