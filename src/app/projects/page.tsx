import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import ProjectList from "@/components/ProjectList";
import { getCurrentUser } from "@/lib/supabase/server";
import { isMissingProjectsTableError, supabaseListProjects } from "@/lib/supabase/projects";

export default async function ProjectsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/projects");

  let projects: Awaited<ReturnType<typeof supabaseListProjects>> = [];
  try {
    projects = await supabaseListProjects(100, 0);
  } catch (error) {
    if (!isMissingProjectsTableError(error)) {
      throw error;
    }
    console.warn("Projects page fallback: public.projects is missing.");
  }

  const projectListItems = projects.map((project) => ({
    id: project.id,
    title: project.title,
    description: project.description,
    preview_url: project.preview_html,
    created_at: project.created_at,
  }));
  const avatarUrl =
    typeof user.user_metadata?.avatar_url === "string" && user.user_metadata.avatar_url
      ? user.user_metadata.avatar_url
      : typeof user.user_metadata?.picture === "string" && user.user_metadata.picture
        ? user.user_metadata.picture
        : "";
  const displayName =
    typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name
      ? user.user_metadata.full_name
      : typeof user.user_metadata?.name === "string" && user.user_metadata.name
        ? user.user_metadata.name
        : user.email?.split("@")[0] || "Account";
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "A";

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-sky-500">
            Generated Client Dashboard
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 dark:text-white">
            Your generated apps
          </h1>
          <p className="mt-3 text-sm text-slate-500 dark:text-gray-400">
            Create, manage, edit, and delete only your own LokoAI projects.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/85 px-3 py-2 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-500 text-sm font-black text-white">
              {avatarUrl ? (
                <img src={avatarUrl} alt={`${displayName} avatar`} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                initials
              )}
            </div>
            <div className="min-w-0 text-left">
              <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{displayName}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
            </div>
          </div>
          <Link href="/workspace">
            <Button>New Project</Button>
          </Link>
        </div>
      </div>
      <ProjectList initialProjects={projectListItems} />
    </div>
  );
}
