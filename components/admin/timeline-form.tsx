"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass, submitSite } from "@/components/admin/form-utils";
import type { SiteContent, TimelineItem, TimelineTrack } from "@/lib/types";

export function TimelineForm({ site }: { site: SiteContent }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [items, setItems] = useState<TimelineItem[]>(site.timeline);

  function update(index: number, patch: Partial<TimelineItem>) {
    setItems((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      await submitSite({
        timeline: items
          .filter((item) => item.title.trim() && item.year.trim())
          .map((item) => ({
            ...item,
            year: item.year.trim(),
            title: item.title.trim(),
            body: item.body.trim(),
          })),
        copy: {
          ...site.copy,
          timelineKicker: String(form.get("timelineKicker") || site.copy.timelineKicker),
          timelineHeading: String(form.get("timelineHeading") || site.copy.timelineHeading),
          timelineWeb: String(form.get("timelineWeb") || site.copy.timelineWeb),
          timelineDesign: String(form.get("timelineDesign") || site.copy.timelineDesign),
          timelineEmpty: String(form.get("timelineEmpty") || site.copy.timelineEmpty),
        },
      });
      setMessage("Timeline saved. The history graph is live.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-6">
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium">Completed work</p>
        <button
          type="button"
          className="text-sm text-[var(--accent)]"
          onClick={() =>
            setItems((current) => [
              {
                id: crypto.randomUUID(),
                year: String(new Date().getFullYear()),
                title: "",
                body: "",
                track: "web",
              },
              ...current,
            ])
          }
        >
          Add entry
        </button>
      </div>

      <div className="grid gap-4">
        {items.map((item, index) => (
          <div key={item.id} className="grid gap-3 border border-[var(--line)] p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <label className={labelClass}>
                Year completed
                <input
                  value={item.year}
                  onChange={(event) => update(index, { year: event.target.value })}
                  className={inputClass}
                  placeholder="2024"
                />
              </label>
              <label className={labelClass}>
                Track
                <select
                  value={item.track}
                  onChange={(event) => update(index, { track: event.target.value as TimelineTrack })}
                  className={inputClass}
                >
                  <option value="web">{site.copy.timelineWeb}</option>
                  <option value="design">{site.copy.timelineDesign}</option>
                </select>
              </label>
              <button
                type="button"
                className="self-end text-sm text-[var(--accent-2)]"
                onClick={() => setItems((current) => current.filter((_, i) => i !== index))}
              >
                Remove
              </button>
            </div>
            <label className={labelClass}>
              Title
              <input
                value={item.title}
                onChange={(event) => update(index, { title: event.target.value })}
                className={inputClass}
              />
            </label>
            <label className={labelClass}>
              Note
              <textarea
                rows={3}
                value={item.body}
                onChange={(event) => update(index, { body: event.target.value })}
                className={inputClass}
              />
            </label>
          </div>
        ))}
      </div>

      {error ? <p className="text-sm text-[var(--accent-2)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--accent)]">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save timeline"}
      </button>
    </form>
  );
}
