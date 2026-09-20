"use client";

import { FormEvent, useState } from "react";
import { Stars } from "@/components/stars";
import type { ProjectReview, SiteCopy } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function ReviewList({
  reviews,
  empty,
}: {
  reviews: ProjectReview[];
  empty: string;
}) {
  if (!reviews.length) {
    return <p className="mt-6 text-[var(--muted)]">{empty}</p>;
  }

  return (
    <ul className="mt-8 grid gap-6">
      {reviews.map((review) => (
        <li key={review.id} className="border-t border-[var(--line)] pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display text-xl font-bold">{review.name}</p>
              {review.role ? (
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  {review.role}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              <Stars value={review.rating} />
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-[var(--muted)]">{review.body}</p>
        </li>
      ))}
    </ul>
  );
}

export function ReviewForm({
  projectId,
  copy,
}: {
  projectId: string;
  copy: SiteCopy;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [rating, setRating] = useState(5);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          name: String(form.get("name") || ""),
          role: String(form.get("role") || ""),
          rating,
          body: String(form.get("body") || ""),
          website: String(form.get("website") || ""),
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(payload.error || "Could not send review.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send review.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return <p className="mt-6 text-sm text-[var(--muted)]">{copy.reviewFormSuccess}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid max-w-xl gap-4">
      <p className="font-display text-2xl font-bold">{copy.reviewFormHeading}</p>
      <label className="grid gap-2 text-sm">
        {copy.reviewFormName}
        <input
          name="name"
          required
          minLength={2}
          className="rounded-sm border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3 outline-none focus:border-[var(--accent)]"
        />
      </label>
      <label className="grid gap-2 text-sm">
        {copy.reviewFormRole}
        <input
          name="role"
          className="rounded-sm border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3 outline-none focus:border-[var(--accent)]"
        />
      </label>
      <fieldset className="grid gap-2 text-sm">
        <legend>{copy.reviewFormRating}</legend>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className="p-0.5 text-[var(--accent)]"
              aria-label={`${value} stars`}
              aria-pressed={rating === value}
            >
              <svg viewBox="0 0 16 16" className="h-5 w-5" aria-hidden>
                <path
                  d="M8 1.6 9.9 5.5l4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 1.8.7-4.3-3.1-3 4.3-.6L8 1.6Z"
                  fill={value <= rating ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </button>
          ))}
        </div>
      </fieldset>
      <div className="hidden" aria-hidden>
        <input name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="grid gap-2 text-sm">
        {copy.reviewFormBody}
        <textarea
          name="body"
          required
          minLength={12}
          rows={5}
          className="resize-y rounded-sm border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-3 outline-none focus:border-[var(--accent)]"
        />
      </label>
      {error ? <p className="text-sm text-[var(--accent-2)]">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60 sm:w-fit"
      >
        {pending ? "Sending…" : copy.reviewFormSubmit}
      </button>
    </form>
  );
}
