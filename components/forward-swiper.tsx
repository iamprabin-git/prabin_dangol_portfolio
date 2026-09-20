"use client";

import { ReactNode, useEffect, useState, useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

export function useMedia<T>(query: string, whenTrue: T, whenFalse: T, serverValue: T) {
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

export function pagesOf<T>(items: T[], size: number) {
  if (!items.length) return [] as T[][];
  const pages: T[][] = [];
  for (let start = 0; start < items.length; start += size) {
    pages.push(items.slice(start, start + size));
  }
  return pages;
}

export function ForwardSwiper({
  slides,
  intervalMs = 4500,
  slideMs = 700,
  label,
}: {
  slides: ReactNode[];
  intervalMs?: number;
  slideMs?: number;
  label: string;
}) {
  const reduceMotion = useMedia("(prefers-reduced-motion: reduce)", true, false, false);
  const track = slides.length ? [...slides, slides[0]] : [];
  const [page, setPage] = useState(0);
  const [instant, setInstant] = useState(false);
  const [paused, setPaused] = useState(false);
  const loopIndex = slides.length;

  useEffect(() => {
    setPage(0);
    setInstant(true);
  }, [loopIndex]);

  useEffect(() => {
    if (!instant) return;
    const frame = window.requestAnimationFrame(() => setInstant(false));
    return () => window.cancelAnimationFrame(frame);
  }, [instant]);

  useEffect(() => {
    if (paused || reduceMotion || !loopIndex) return;
    const timer = window.setInterval(() => {
      setPage((current) => (current >= loopIndex ? current : current + 1));
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, loopIndex, intervalMs]);

  useEffect(() => {
    if (page !== loopIndex || !loopIndex) return;
    const timer = window.setTimeout(() => {
      setInstant(true);
      setPage(0);
    }, slideMs);
    return () => window.clearTimeout(timer);
  }, [page, loopIndex, slideMs]);

  if (!slides.length) return null;

  const activePage = page === loopIndex ? 0 : page;

  return (
    <div>
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
            transitionDuration: instant || reduceMotion ? "0ms" : `${slideMs}ms`,
          }}
          aria-live="off"
        >
          {track.map((slide, index) => (
            <div key={`slide-${index}`} className="w-full shrink-0">
              {slide}
            </div>
          ))}
        </div>
      </div>
      {slides.length > 1 ? (
        <div className="mt-6 flex justify-center gap-2" role="tablist" aria-label={label}>
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={index === activePage}
              aria-label={`Show slide ${index + 1}`}
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
  );
}
