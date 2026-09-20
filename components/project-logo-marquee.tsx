"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/utils";

const INTERVAL_MS = 3500;
const SLIDE_MS = 650;

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

function pagesOf(items: Project[], size: number) {
  if (!items.length) return [] as Project[][];
  const pages: Project[][] = [];
  for (let start = 0; start < items.length; start += size) {
    const page: Project[] = [];
    for (let offset = 0; offset < size; offset += 1) {
      page.push(items[(start + offset) % items.length]);
    }
    pages.push(page);
  }
  return pages;
}

function LogoCard({ project }: { project: Project }) {
  const href = project.liveUrl || `/projects/${project.slug}`;
  const external = Boolean(project.liveUrl);
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group flex items-center justify-center py-2"
      title={project.title}
    >
      <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-[var(--line)] bg-[var(--bg-panel)] p-3 shadow-[0_0_0_1px_transparent] transition duration-300 group-hover:border-[var(--accent)] sm:h-24 sm:w-24 sm:p-3.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.logoUrl}
          alt={project.title}
          className="h-full w-full rounded-full object-contain opacity-85 transition duration-300 group-hover:opacity-100"
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
  const pages = pagesOf(logos, perView);
  const track = pages.length ? [...pages, pages[0]] : [];
  const [page, setPage] = useState(0);
  const [instant, setInstant] = useState(false);
  const [paused, setPaused] = useState(false);
  const loopIndex = pages.length;

  useEffect(() => {
    setPage(0);
    setInstant(true);
  }, [perView, logos.length]);

  useEffect(() => {
    if (!instant) return;
    const frame = window.requestAnimationFrame(() => setInstant(false));
    return () => window.cancelAnimationFrame(frame);
  }, [instant]);

  useEffect(() => {
    if (paused || reduceMotion || !loopIndex) return;
    const timer = window.setInterval(() => {
      setPage((current) => (current >= loopIndex ? current : current + 1));
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, loopIndex]);

  useEffect(() => {
    if (page !== loopIndex || !loopIndex) return;
    const timer = window.setTimeout(() => {
      setInstant(true);
      setPage(0);
    }, SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [page, loopIndex]);

  if (!logos.length) return null;

  const activePage = page === loopIndex ? 0 : page;

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
            className={cn("flex", instant || reduceMotion ? "" : "ease-[cubic-bezier(0.22,1,0.36,1)]")}
            style={{
              transform: `translateX(-${page * 100}%)`,
              transitionProperty: instant || reduceMotion ? "none" : "transform",
              transitionDuration: instant || reduceMotion ? "0ms" : `${SLIDE_MS}ms`,
            }}
            aria-live="off"
          >
            {track.map((group, index) => (
              <div
                key={`slide-${index}`}
                className="grid w-full shrink-0"
                style={{ gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))` }}
              >
                {group.map((project, slot) => (
                  <LogoCard key={`${project.id}-${index}-${slot}`} project={project} />
                ))}
              </div>
            ))}
          </div>
        </div>
        {pages.length > 1 ? (
          <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label="Project mark slides">
            {pages.map((_, index) => (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={index === activePage}
                aria-label={`Show logo set ${index + 1}`}
                onClick={() => {
                  setInstant(false);
                  setPage(index);
                }}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === activePage
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
