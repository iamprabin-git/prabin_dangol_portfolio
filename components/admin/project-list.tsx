"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CoverImage } from "@/components/project-card";
import type { Project } from "@/lib/types";
import { displayHost } from "@/lib/utils";

export function ProjectList({
  projects,
  pendingByProject,
}: {
  projects: Project[];
  pendingByProject: Record<string, number>;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function onDelete(id: string, title: string) {
    if (!confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setBusyId(id);
    const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (!response.ok) {
      const data = (await response.json()) as { error?: string };
      alert(data.error || "Could not delete project.");
      return;
    }
    router.refresh();
  }

  if (!projects.length) {
    return (
      <div className="admin-card grid place-items-center px-6 py-20 text-center">
        <p className="font-display text-2xl font-bold">No projects yet</p>
        <p className="mt-2 max-w-sm text-sm text-[var(--muted)]">
          Add a cover, project mark logo, write-up, and live URL. Featured work shows on the home page.
        </p>
        <Link
          href="/admin/projects/new"
          className="mt-6 rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--on-accent)]"
        >
          Add first project
        </Link>
      </div>
    );
  }

  return (
    <div className="admin-card overflow-hidden">
      <div className="hidden grid-cols-[minmax(0,1.4fr)_140px_100px_160px] gap-4 border-b border-[var(--line)] px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] md:grid">
        <span>Project</span>
        <span>Year</span>
        <span>Status</span>
        <span className="text-right">Actions</span>
      </div>
      <div className="divide-y divide-[var(--line)]">
        {projects.map((project) => (
          <div
            key={project.id}
            className="grid gap-4 px-5 py-4 md:grid-cols-[minmax(0,1.4fr)_140px_100px_160px] md:items-center"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="h-14 w-20 shrink-0 overflow-hidden rounded-md bg-[var(--bg)]">
                <CoverImage src={project.imageUrl} alt={project.title} />
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{project.title}</p>
                <p className="truncate text-xs text-[var(--muted)]">
                  {project.liveUrl ? displayHost(project.liveUrl) : project.summary}
                  {pendingByProject[project.id]
                    ? ` · ${pendingByProject[project.id]} pending review${pendingByProject[project.id] === 1 ? "" : "s"}`
                    : ""}
                </p>
              </div>
            </div>
            <p className="text-sm text-[var(--muted)]">{project.year}</p>
            <p>
              <span
                className={
                  project.featured
                    ? "rounded-full bg-[var(--accent)]/15 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--accent)]"
                    : "rounded-full border border-[var(--line)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]"
                }
              >
                {project.featured ? "Featured" : "Archive"}
              </span>
            </p>
            <div className="flex gap-2 md:justify-end">
              <Link
                href={`/admin/projects/${project.id}/edit`}
                className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs hover:border-[var(--accent)]"
              >
                Edit
              </Link>
              <button
                type="button"
                disabled={busyId === project.id}
                onClick={() => onDelete(project.id, project.title)}
                className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--accent-2)] disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
