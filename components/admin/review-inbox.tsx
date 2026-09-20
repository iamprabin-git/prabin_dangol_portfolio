"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass } from "@/components/admin/form-utils";
import { Stars } from "@/components/stars";
import type { Project, ProjectReview, ReviewStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const filters: Array<{ id: ReviewStatus | "all"; label: string }> = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "all", label: "All" },
];

export function ReviewInbox({
  reviews,
  projects,
  defaultFilter = "pending",
}: {
  reviews: ProjectReview[];
  projects: Project[];
  defaultFilter?: ReviewStatus | "all";
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<ReviewStatus | "all">(defaultFilter);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const titles = useMemo(
    () => Object.fromEntries(projects.map((project) => [project.id, project.title])),
    [projects],
  );

  const visible = reviews.filter((review) => (filter === "all" ? true : review.status === filter));

  async function setStatus(id: string, status: ReviewStatus) {
    setBusyId(id);
    setError("");
    const response = await fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const payload = (await response.json()) as { error?: string };
    setBusyId(null);
    if (!response.ok) {
      setError(payload.error || "Could not update review.");
      return;
    }
    router.refresh();
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this review?")) return;
    setBusyId(id);
    const response = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    setBusyId(null);
    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setError(payload.error || "Could not delete review.");
      return;
    }
    router.refresh();
  }

  async function onCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: String(data.get("projectId") || ""),
        name: String(data.get("name") || ""),
        role: String(data.get("role") || ""),
        rating: Number(data.get("rating") || 5),
        body: String(data.get("body") || ""),
        status: "approved",
      }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error || "Could not publish review.");
      return;
    }
    form.reset();
    setMessage("Review published on the project page.");
    router.refresh();
  }

  return (
    <div className="grid gap-8">
      <form onSubmit={onCreate} className="admin-card grid gap-4 p-5 sm:p-6">
        <div>
          <h2 className="font-display text-lg font-bold">Publish a review</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Added from here goes live immediately. Visitor reviews wait in Pending.
          </p>
        </div>
        <label className={labelClass}>
          Project
          <select name="projectId" required className={inputClass} defaultValue={projects[0]?.id || ""}>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            Name
            <input name="name" required className={inputClass} />
          </label>
          <label className={labelClass}>
            Role or company
            <input name="role" className={inputClass} />
          </label>
        </div>
        <label className={labelClass}>
          Rating
          <select name="rating" defaultValue="5" className={inputClass}>
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} stars
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Review
          <textarea name="body" required minLength={12} rows={4} className={inputClass} />
        </label>
        <button
          type="submit"
          className="w-fit rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[var(--on-accent)]"
        >
          Publish review
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {filters.map((item) => {
          const count =
            item.id === "all"
              ? reviews.length
              : reviews.filter((review) => review.status === item.id).length;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={
                filter === item.id
                  ? "rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--on-accent)]"
                  : "rounded-full border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--muted)]"
              }
            >
              {item.label} {count}
            </button>
          );
        })}
      </div>

      {error ? <p className="text-sm text-[var(--accent-2)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--accent)]">{message}</p> : null}

      {!visible.length ? (
        <div className="admin-card px-5 py-16 text-center text-sm text-[var(--muted)]">
          No {filter === "all" ? "" : `${filter} `}reviews.
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map((review) => (
            <article key={review.id} className="admin-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{review.name}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                    {titles[review.projectId] || "Unknown project"}
                    {review.role ? ` · ${review.role}` : ""}
                    {` · ${formatDate(review.createdAt)}`}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Stars value={review.rating} size="sm" />
                  <span className="rounded-full border border-[var(--line)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                    {review.status}
                  </span>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{review.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {review.status !== "approved" ? (
                  <button
                    type="button"
                    disabled={busyId === review.id}
                    onClick={() => setStatus(review.id, "approved")}
                    className="rounded-full bg-[var(--accent)] px-3 py-1.5 text-xs font-semibold text-[var(--on-accent)] disabled:opacity-60"
                  >
                    Approve
                  </button>
                ) : null}
                {review.status !== "rejected" ? (
                  <button
                    type="button"
                    disabled={busyId === review.id}
                    onClick={() => setStatus(review.id, "rejected")}
                    className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs disabled:opacity-60"
                  >
                    Reject
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busyId === review.id}
                  onClick={() => onDelete(review.id)}
                  className="rounded-full border border-[var(--line)] px-3 py-1.5 text-xs text-[var(--accent-2)] disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
