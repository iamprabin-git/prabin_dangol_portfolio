"use client";

import { useMemo, useState } from "react";
import type { SiteCopy, TimelineItem, TimelineTrack } from "@/lib/types";
import { cn } from "@/lib/utils";

function yearValue(year: string) {
  const parsed = Number.parseInt(year, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

function CompletionChart({
  items,
  webLabel,
  designLabel,
}: {
  items: TimelineItem[];
  webLabel: string;
  designLabel: string;
}) {
  const years = useMemo(() => {
    if (!items.length) return [];
    const values = items.map((item) => yearValue(item.year));
    const min = Math.min(...values);
    const max = Math.max(...values);
    return Array.from({ length: max - min + 1 }, (_, index) => min + index);
  }, [items]);

  const series = years.map((year) => ({
    year,
    web: items.filter((item) => yearValue(item.year) === year && item.track === "web").length,
    design: items.filter((item) => yearValue(item.year) === year && item.track === "design").length,
  }));
  const peak = Math.max(1, ...series.flatMap((row) => [row.web, row.design]));
  const width = Math.max(320, years.length * 72);
  const height = 168;
  const padX = 28;
  const padTop = 16;
  const padBottom = 36;
  const chartH = height - padTop - padBottom;
  const groupW = (width - padX * 2) / Math.max(years.length, 1);

  return (
    <div className="overflow-x-auto -mx-1 px-1">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-44 w-full min-w-[20rem]"
        role="img"
        aria-label="Completions by year"
      >
        {series.map((row, index) => {
          const x = padX + index * groupW;
          const webH = (row.web / peak) * chartH;
          const designH = (row.design / peak) * chartH;
          const barW = Math.min(16, groupW * 0.28);
          const gap = 4;
          const pairW = barW * 2 + gap;
          const start = x + (groupW - pairW) / 2;
          return (
            <g key={row.year}>
              <rect
                x={start}
                y={padTop + chartH - webH}
                width={barW}
                height={Math.max(webH, row.web ? 3 : 0)}
                fill="var(--accent)"
                rx="2"
              />
              <rect
                x={start + barW + gap}
                y={padTop + chartH - designH}
                width={barW}
                height={Math.max(designH, row.design ? 3 : 0)}
                fill="var(--accent-2)"
                rx="2"
              />
              <text
                x={x + groupW / 2}
                y={height - 12}
                textAnchor="middle"
                fill="var(--muted)"
                fontSize="11"
                fontFamily="var(--font-mono), ui-monospace, monospace"
              >
                {row.year}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-[var(--accent)]" />
          {webLabel}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-sm bg-[var(--accent-2)]" />
          {designLabel}
        </span>
      </div>
    </div>
  );
}

function TrackLane({
  label,
  years,
  items,
  color,
}: {
  label: string;
  years: number[];
  items: TimelineItem[];
  color: string;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color }}>
        {label}
      </p>
      <div className="relative mt-3 overflow-x-auto">
        <div className="absolute left-0 right-0 top-2 h-px" style={{ background: color, opacity: 0.35 }} />
        <div className="grid" style={{ gridTemplateColumns: `repeat(${years.length}, minmax(0, 1fr))` }}>
          {years.map((year) => {
            const count = items.filter((item) => yearValue(item.year) === year).length;
            return (
              <div key={year} className="flex justify-center">
                <span
                  className="relative z-10 block rounded-full"
                  style={{
                    width: count ? 10 + count * 3 : 6,
                    height: count ? 10 + count * 3 : 6,
                    background: count ? color : "var(--bg-panel)",
                    outline: count ? undefined : "1px solid var(--line)",
                  }}
                  title={`${year}: ${count}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function HistoryGraph({
  items,
  copy,
  className,
}: {
  items: TimelineItem[];
  copy: Pick<
    SiteCopy,
    "timelineKicker" | "timelineHeading" | "timelineWeb" | "timelineDesign" | "timelineEmpty"
  >;
  className?: string;
}) {
  const [filter, setFilter] = useState<"all" | TimelineTrack>("all");
  const visible = items.filter((item) => filter === "all" || item.track === filter);
  const years = useMemo(() => {
    if (!items.length) return [];
    const values = items.map((item) => yearValue(item.year));
    const min = Math.min(...values);
    const max = Math.max(...values);
    return Array.from({ length: max - min + 1 }, (_, index) => min + index);
  }, [items]);

  const grouped = useMemo(() => {
    const map = new Map<string, TimelineItem[]>();
    for (const item of visible) {
      const key = item.year;
      map.set(key, [...(map.get(key) || []), item]);
    }
    return [...map.entries()].sort((a, b) => yearValue(b[0]) - yearValue(a[0]));
  }, [visible]);

  const filters: Array<{ id: "all" | TimelineTrack; label: string }> = [
    { id: "all", label: "All" },
    { id: "web", label: copy.timelineWeb },
    { id: "design", label: copy.timelineDesign },
  ];

  return (
    <section id="history" className={cn("mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-20", className)}>
      <div className="flex flex-wrap items-end justify-between gap-4 sm:gap-6">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
            {copy.timelineKicker}
          </p>
          <h2 className="mt-3 break-words font-display text-3xl font-extrabold sm:text-5xl">
            {copy.timelineHeading}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={
                filter === item.id
                  ? "rounded-full bg-[var(--accent)] px-3 py-1.5 text-[11px] font-semibold text-[var(--on-accent)]"
                  : "rounded-full border border-[var(--line)] px-3 py-1.5 text-[11px] text-[var(--muted)]"
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {!items.length ? (
        <p className="mt-10 text-[var(--muted)]">{copy.timelineEmpty}</p>
      ) : (
        <>
          <div className="mt-8 rounded-sm border border-[var(--line)] bg-[var(--bg-soft)] p-4 sm:mt-10 sm:p-8">
            <CompletionChart
              items={visible}
              webLabel={copy.timelineWeb}
              designLabel={copy.timelineDesign}
            />
            <div className="mt-10 grid gap-8">
              {(filter === "all" || filter === "web") && years.length ? (
                <TrackLane
                  label={copy.timelineWeb}
                  years={years}
                  items={items.filter((item) => item.track === "web")}
                  color="var(--accent)"
                />
              ) : null}
              {(filter === "all" || filter === "design") && years.length ? (
                <TrackLane
                  label={copy.timelineDesign}
                  years={years}
                  items={items.filter((item) => item.track === "design")}
                  color="var(--accent-2)"
                />
              ) : null}
            </div>
          </div>

          <ol className="mt-12 grid gap-10">
            {grouped.map(([year, entries]) => (
              <li key={year} className="grid gap-6 border-t border-[var(--line)] pt-8 lg:grid-cols-12">
                <p className="font-display text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl lg:col-span-2">
                  {year}
                </p>
                <div className="grid gap-6 sm:grid-cols-2 lg:col-span-10">
                  {entries.map((entry) => (
                    <article key={entry.id}>
                      <p
                        className="font-mono text-[10px] uppercase tracking-[0.2em]"
                        style={{ color: entry.track === "web" ? "var(--accent)" : "var(--accent-2)" }}
                      >
                        {entry.source === "project" ? "Project" : "Skill"}
                        {" · "}
                        {entry.track === "web" ? copy.timelineWeb : copy.timelineDesign}
                      </p>
                      <h3 className="mt-2 font-display text-2xl font-bold">{entry.title}</h3>
                      {entry.body ? (
                        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{entry.body}</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
}
