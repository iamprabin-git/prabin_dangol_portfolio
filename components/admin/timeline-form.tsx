"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass, submitSite } from "@/components/admin/form-utils";
import { buildHistory } from "@/lib/history";
import type { Project, SiteContent } from "@/lib/types";

export function TimelineForm({ site, projects }: { site: SiteContent; projects: Project[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const preview = buildHistory(site.skills, projects);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitSite({
        copy: {
          ...site.copy,
          timelineKicker: String(form.get("timelineKicker") || site.copy.timelineKicker),
          timelineHeading: String(form.get("timelineHeading") || site.copy.timelineHeading),
          timelineWeb: String(form.get("timelineWeb") || site.copy.timelineWeb),
          timelineDesign: String(form.get("timelineDesign") || site.copy.timelineDesign),
          timelineEmpty: String(form.get("timelineEmpty") || site.copy.timelineEmpty),
        },
      });
      setMessage("Labels saved. The history graph still builds itself from skills and projects.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-6">
      <p className="rounded-lg border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
        History is automatic. Skill start years and project completion years build the graph. Edit those
        in Skills and Projects — this page only changes the labels.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Section label
          <input name="timelineKicker" defaultValue={site.copy.timelineKicker} className={inputClass} />
        </label>
        <label className={labelClass}>
          Heading
          <input name="timelineHeading" defaultValue={site.copy.timelineHeading} className={inputClass} />
        </label>
        <label className={labelClass}>
          Web track name
          <input name="timelineWeb" defaultValue={site.copy.timelineWeb} className={inputClass} />
        </label>
        <label className={labelClass}>
          Design track name
          <input name="timelineDesign" defaultValue={site.copy.timelineDesign} className={inputClass} />
        </label>
      </div>
      <label className={labelClass}>
        Empty message
        <input name="timelineEmpty" defaultValue={site.copy.timelineEmpty} className={inputClass} />
      </label>

      <div>
        <p className="text-sm font-medium">Live preview ({preview.length})</p>
        {preview.length ? (
          <ol className="mt-3 grid gap-3">
            {preview.map((item) => (
              <li key={item.id} className="border border-[var(--line)] px-3 py-3 text-sm">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                  {item.year} · {item.source === "project" ? "Project" : "Skill"} · {item.track}
                </p>
                <p className="mt-1 font-medium">{item.title}</p>
                {item.body ? <p className="mt-1 text-[var(--muted)]">{item.body}</p> : null}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted)]">{site.copy.timelineEmpty}</p>
        )}
      </div>

      {error ? <p className="text-sm text-[var(--accent-2)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--accent)]">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save labels"}
      </button>
    </form>
  );
}
