"use client";

import { Trash2, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { removeStoredProject } from "@/lib/project-history";

interface Project {
  id: string;
  title: string;
  description: string | null;
  preview_url: string | null;
  created_at: string;
}

export default function ProjectList({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);

    const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json();
      setError(data.error || "Failed to delete project");
    } else {
      setProjects((items) => items.filter((item) => item.id !== id));
      removeStoredProject(id);
    }

    setDeletingId(null);
  };

  if (!projects.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-slate-500 dark:text-gray-400">
            No generated apps yet. Open the workspace and create your first project.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {error && <div className="rounded-xl bg-red-500/10 p-3 text-sm text-red-500">{error}</div>}
      {projects.map((project) => (
        <Card key={project.id}>
          <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="font-bold text-slate-950 dark:text-white">{project.title}</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                {project.description || "Generated LokoAI application"}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Created {new Date(project.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {project.preview_url && (
                <Button variant="outline" onClick={() => window.open(project.preview_url || undefined, "_blank")}>
                  <ExternalLink className="h-4 w-4" />
                  Preview
                </Button>
              )}
              <Button variant="destructive" onClick={() => handleDelete(project.id)} disabled={deletingId === project.id}>
                {deletingId === project.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
