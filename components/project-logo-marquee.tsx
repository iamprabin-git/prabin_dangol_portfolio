"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 4000;

function useMedia<T>(query: string, whenTrue: T, whenFalse: T, serverValue: T) {
  return useSyncExternalStore(
    (onStoreChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onStoreChange);
      return () => media.removeEventListener("change", onStoreChange);
    },
    () => (window.matchMedia(query).matches ? whenTrue : whenFalse),
    () => serverValue,
  );
}

function LogoCard({ project }: { project: Project }) {
  const href = project.liveUrl || `/projects/${project.slug}`;
  const external = Boolean(project.liveUrl);
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group flex h-24 w-1/2 shrink-0 items-center justify-center px-2 md:h-28 md:w-1/4"
      title={project.title}
    >
      <span className="flex h-full w-full items-center justify-center rounded-sm border border-[var(--line)] bg-[var(--bg-panel)] px-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.logoUrl}
          alt={project.title}
          className="max-h-12 max-w-full object-contain opacity-80 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 sm:max-h-14"
        />
      </span>
    </Link>
  );
}

export function ProjectLogoMarquee({
  projects,
  kicker,
}: {
  projects: Project[];
  kicker: string;
}) {
  const logos = projects.filter((project) => project.logoUrl);
  const perView = useMedia("(min-width: 768px)", 4, 2, 2);
  const reduceMotion = useMedia("(prefers-reduced-motion: reduce)", true, false, false);
  const [page, setPage] = useState(0);
  const [paused, setPaused] = useState(false);
  const pageCount = Math.max(1, Math.ceil(logos.length / perView));
  const safePage = page % pageCount;

  useEffect(() => {
    if (paused || reduceMotion || pageCount <= 1) return;
    const timer = window.setInterval(() => {
      setPage((current) => (current + 1) % pageCount);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, pageCount]);

  if (!logos.length) return null;

  return (
    <section className="border-t border-[var(--line)] bg-[var(--bg)] py-8 sm:py-10" aria-label={kicker}>
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
          {kicker}
        </p>
        <div
          className="overflow-hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setPaused(false);
            }
          }}
        >
          <div
            className={cn(
              "flex",
              reduceMotion ? "" : "transition-transform duration-500 ease-out",
            )}
            style={{ transform: `translateX(-${safePage * 100}%)` }}
            aria-live="off"
          >
            {logos.map((project) => (
              <LogoCard key={project.id} project={project} />
            ))}
          </div>
        </div>
        {pageCount > 1 ? (
          <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label="Project mark slides">
            {Array.from({ length: pageCount }, (_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === safePage}
                aria-label={`Show logos ${index * perView + 1} to ${Math.min((index + 1) * perView, logos.length)}`}
                onClick={() => setPage(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === safePage
                    ? "w-6 bg-[var(--accent)]"
                    : "w-2 bg-[var(--line)] hover:bg-[var(--muted)]",
                )}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
