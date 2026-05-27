"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Compass,
  FileText,
  FolderOpen,
  Grid3X3,
  History,
  Home,
  Loader2,
  Menu,
  MessageSquare,
  Mic,
  Notebook,
  Plus,
  Rocket,
  Search,
  Send,
  Settings,
  Sparkles,
  Trophy,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type Project = {
  id: string;
  title: string;
  description: string | null;
  prompt: string | null;
  preview_html: string | null;
  created_at: string;
  updated_at: string;
};

const navItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Integrations", href: "/integrations", icon: Grid3X3 },
  { label: "Partners", href: "/partners", icon: Users },
  { label: "Launchpad", href: "/launchpad", icon: Rocket },
  { label: "Collection", href: "/collection", icon: FileText },
  { label: "Affiliate", href: "/affiliate", icon: Trophy },
  { label: "Pricing", href: "/pricing", icon: Zap },
];

const promptIdeas = [
  "Create a landing page for my AI startup",
  "Design a dashboard for sales analytics",
  "Make a portfolio website for a designer",
  "Build an e-commerce homepage with products",
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

export default function DashboardWorkspace() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user, isLoading, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  const userName = useMemo(() => {
    return user?.user_metadata?.full_name || user?.email?.split("@")[0] || "there";
  }, [user]);

  const userAvatar = useMemo(() => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "";
  }, [user]);

  const loadProjects = useCallback(() => {
    setIsLoadingProjects(true);
    fetch("/api/projects?limit=30")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { projects?: Project[] } | null) => {
        setProjects(data?.projects ?? []);
        setIsLoadingProjects(false);
      })
      .catch((error) => {
        console.warn("Failed to load dashboard projects:", error);
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

  async function handleSubmit(inputPrompt = prompt) {
    const trimmed = inputPrompt.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    setSavedMessage(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: trimmed.slice(0, 56) || "New chat", prompt: trimmed }),
      });

      if (!response.ok) {
        throw new Error("Project save failed");
      }

      setPrompt("");
      setSavedMessage("Saved to recent chats.");
      loadProjects();
    } catch (error) {
      console.warn("Failed to save dashboard chat:", error);
      setSavedMessage("Could not save yet. Try again.");
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

  async function handleDeleteProject(projectId: string) {
    if (deletingProjectId) return;
    setDeletingProjectId(projectId);

    const previousProjects = projects;
    setProjects((current) => current.filter((project) => project.id !== projectId));

    try {
      const response = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Delete failed");
      }
    } catch (error) {
      console.warn("Failed to delete project:", error);
      setProjects(previousProjects);
    } finally {
      setDeletingProjectId(null);
    }
  }

  const filteredProjects = searchQuery
    ? projects.filter((project) => {
        const target = `${project.title} ${project.prompt ?? ""}`.toLowerCase();
        return target.includes(searchQuery.toLowerCase());
      })
    : projects;

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
              onClick={() => {
                setPrompt("");
                textareaRef.current?.focus();
                setIsSidebarOpen(false);
              }}
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
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search recent chats"
                    className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                      aria-label="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setPrompt("Untitled notebook: ");
                textareaRef.current?.focus();
              }}
              className="mb-4 flex h-9 w-full items-center gap-3 rounded-full px-4 text-sm font-medium text-slate-800 transition hover:bg-slate-100"
            >
              <Notebook className="h-4 w-4" />
              Untitled notebook
            </button>

            <div className="mb-3 border-t border-slate-200 pt-3">
              <p className="mb-2 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Pages</p>
              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.href}
                    type="button"
                    onClick={() => router.push(item.href)}
                    className="flex h-9 w-full items-center gap-3 rounded-full px-4 text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-700"
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-1">
              <div className="mb-2 flex items-center justify-between px-3 text-xs text-slate-500">
                <span>Recent</span>
                <History className="h-3.5 w-3.5" />
              </div>
              {isLoadingProjects ? (
                <div className="space-y-2 px-3">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div key={index} className="h-5 animate-pulse rounded bg-slate-100" />
                  ))}
                </div>
              ) : filteredProjects.length > 0 ? (
                <div className="space-y-1">
                  {filteredProjects.slice(0, 18).map((project) => (
                    <div
                      key={project.id}
                      className="group flex items-center gap-2 rounded-2xl px-3 py-2 transition hover:bg-slate-100"
                    >
                      <button
                        type="button"
                        onClick={() => setPrompt(project.prompt || project.title)}
                        className="min-w-0 flex-1 text-left"
                        title={project.prompt || project.title}
                      >
                        <span className="line-clamp-1 text-sm text-slate-900">
                          {project.title || project.prompt || "Untitled chat"}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-slate-500">
                          {getTimeAgo(project.updated_at || project.created_at)}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDeleteProject(project.id)}
                        className="rounded-full p-1.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                        aria-label={`Delete ${project.title || "chat"}`}
                      >
                        {deletingProjectId === project.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-3 py-2 text-sm text-slate-500">No recent chats yet.</p>
              )}
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
              {user && (
                <div className="mt-3 border-t border-slate-200 pt-3">
                  <div className="rounded-3xl bg-slate-50 p-3">
                    <div className="flex items-center gap-3">
                      {userAvatar ? (
                        <img
                          src={userAvatar}
                          alt={userName}
                          className="h-11 w-11 rounded-full object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                          {userName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">{userName}</p>
                        <p className="truncate text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void signOut()}
                    className="mt-2 flex h-9 w-full items-center gap-3 rounded-full px-4 text-sm font-medium text-slate-700 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Bot className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
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
          <header className="flex h-14 items-center justify-between px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-full p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="hidden rounded-full p-2 text-slate-700 hover:bg-slate-100 lg:inline-flex"
                aria-label="Dashboard menu"
              >
                <Compass className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.push("/pricing")}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-sky-100 px-5 text-sm font-semibold text-sky-900 transition hover:bg-sky-200"
              >
                <Sparkles className="h-4 w-4" />
                Upgrade
              </button>
              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white"
                aria-label="Profile"
              >
                {userName.slice(0, 1).toUpperCase()}
              </button>
            </div>
          </header>

          <section className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-16 pt-6">
            <div className="pointer-events-none absolute inset-x-[10%] top-[18%] h-[58%] rounded-full bg-[radial-gradient(circle,#fed7aa_0%,#bae6fd_50%,transparent_76%)] blur-[88px]" />
            <div className="relative mx-auto flex w-full max-w-[740px] flex-col items-center">
              <h1 className="mb-9 text-center text-3xl font-normal tracking-tight text-slate-800 sm:text-4xl">
                What&apos;s next, {isLoading ? "there" : userName}?
              </h1>

              <div className="w-full overflow-hidden rounded-[1.25rem] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.20)] ring-1 ring-slate-200">
                <div className="px-5 pt-5">
                  <textarea
                    ref={textareaRef}
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Assign a task or ask anything"
                    className="max-h-48 min-h-[76px] w-full resize-none bg-transparent text-base leading-7 text-slate-900 outline-none placeholder:text-slate-500"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
                      aria-label="Add attachment"
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
                      aria-label="Voice input"
                    >
                      <Mic className="h-5 w-5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleSubmit()}
                    disabled={!prompt.trim() || isSubmitting}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sky-500 text-white transition hover:bg-sky-600 disabled:bg-slate-200 disabled:text-slate-400"
                    aria-label="Send prompt"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {savedMessage && <p className="mt-3 text-sm text-slate-500">{savedMessage}</p>}

              <div className="mt-5 flex w-full flex-wrap justify-center gap-3">
                {promptIdeas.map((idea) => (
                  <button
                    key={idea}
                    type="button"
                    onClick={() => setPrompt(idea)}
                    className="inline-flex h-11 max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-700 shadow-[0_4px_12px_rgba(15,23,42,0.14)] transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                    <span className="truncate">{idea}</span>
                  </button>
                ))}
              </div>

            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
