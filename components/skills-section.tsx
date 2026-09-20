"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { groupAverage, skillYearValue } from "@/lib/skills";
import type { SiteCopy, SkillGroup, SkillItem, TimelineItem } from "@/lib/types";

function useInView<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function RadarChart({ groups }: { groups: Array<{ label: string; value: number }> }) {
  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 96;
        const count = groups.length || 3;
  const rings = [0.25, 0.5, 0.75, 1];

  function point(index: number, scale: number) {
    const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    return [cx + Math.cos(angle) * radius * scale, cy + Math.sin(angle) * radius * scale] as const;
  }

  const polygon = groups
    .map((group, index) => point(index, group.value / 100).join(","))
    .join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-64 w-64 sm:h-72 sm:w-72" role="img" aria-label="Skill group averages">
      {rings.map((ring) => (
        <polygon
          key={ring}
          fill="none"
          stroke="var(--line)"
          strokeWidth="1"
          points={Array.from({ length: count }, (_, index) => point(index, ring).join(",")).join(" ")}
        />
      ))}
      {Array.from({ length: count }, (_, index) => {
        const [x, y] = point(index, 1);
        return <line key={index} x1={cx} y1={cy} x2={x} y2={y} stroke="var(--line)" />;
      })}
      <polygon points={polygon} fill="color-mix(in srgb, var(--accent) 22%, transparent)" stroke="var(--accent)" strokeWidth="2" />
      {groups.map((group, index) => {
        const [x, y] = point(index, group.value / 100);
        const [lx, ly] = point(index, 1.18);
        return (
          <g key={group.label}>
            <circle cx={x} cy={y} r="4" fill="var(--accent)" />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--muted)"
              fontSize="11"
              fontFamily="var(--font-mono), ui-monospace, monospace"
            >
              {group.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function SkillRing({ item, active, yearLabel }: { item: SkillItem; active: boolean; yearLabel: string }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - (active ? item.level : 0) / 100);

  return (
    <div className="flex flex-col items-center gap-3 rounded-sm border border-[var(--line)] bg-[var(--bg-panel)] px-3 py-5">
      <svg viewBox="0 0 88 88" className="h-[5.5rem] w-[5.5rem]" aria-hidden>
        <circle cx="44" cy="44" r={radius} fill="none" stroke="var(--line)" strokeWidth="7" />
        <circle
          cx="44"
          cy="44"
          r={radius}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 44 44)"
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
        <text
          x="44"
          y="48"
          textAnchor="middle"
          fill="var(--text)"
          fontSize="16"
          fontWeight="700"
          fontFamily="var(--font-display), sans-serif"
        >
          {item.level}
        </text>
      </svg>
      <p className="text-center text-sm font-semibold">{item.name}</p>
      {item.year ? (
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
          {yearLabel} {item.year}
        </p>
      ) : null}
    </div>
  );
}

function PracticeTimeline({ items }: { items: SkillItem[] }) {
  const dated = items.filter((item) => skillYearValue(item.year));
  if (!dated.length) return null;
  const years = [...new Set(dated.map((item) => skillYearValue(item.year)))].sort((a, b) => a - b);

  return (
    <div className="rounded-sm border border-[var(--line)] bg-[var(--bg-panel)] p-4 sm:p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">Practice timeline</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {years.map((year) => (
          <div key={year} className="border-t border-[var(--line)] pt-4">
            <p className="font-display text-2xl font-extrabold">{year}</p>
            <ul className="mt-3 grid gap-1.5">
              {dated
                .filter((item) => skillYearValue(item.year) === year)
                .map((item) => (
                  <li key={item.name} className="flex items-center justify-between gap-2 text-sm">
                    <span>{item.name}</span>
                    <span className="font-mono text-[10px] text-[var(--muted)]">{item.level}</span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkillsSection({
  groups,
  timeline,
  copy,
}: {
  groups: SkillGroup[];
  timeline: TimelineItem[];
  copy: Pick<SiteCopy, "skillsKicker" | "skillsHeading" | "skillsLevel" | "skillsYear" | "skillsEmpty">;
}) {
  const { ref, visible } = useInView<HTMLElement>();
  const [activeId, setActiveId] = useState(groups[0]?.id || "");
  const active = groups.find((group) => group.id === activeId) || groups[0];
  const averages = useMemo(
    () => groups.map((group) => ({ label: group.label, value: groupAverage(group) })),
    [groups],
  );
  const allItems = groups.flatMap((group) => group.items);
  const years = timeline.map((item) => Number.parseInt(item.year, 10)).filter((year) => Number.isFinite(year));
  const span = years.length ? `${Math.min(...years)}–${Math.max(...years)}` : "—";

  if (!groups.length || !allItems.length) {
    return (
      <section id="skills" className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-20">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent)]">{copy.skillsKicker}</p>
        <h2 className="mt-3 font-display text-3xl font-extrabold sm:text-5xl">{copy.skillsHeading}</h2>
        <p className="mt-6 text-[var(--muted)]">{copy.skillsEmpty}</p>
      </section>
    );
  }

  return (
    <section id="skills" ref={ref} className="relative overflow-hidden">
      <div className="grid-fade pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent)]">{copy.skillsKicker}</p>
            <h2 className="mt-3 break-words font-display text-3xl font-extrabold sm:text-5xl">{copy.skillsHeading}</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Skills", value: String(allItems.length) },
              { label: "Groups", value: String(groups.length) },
              { label: "Years", value: span },
            ].map((stat) => (
              <p
                key={stat.label}
                className="rounded-full border border-[var(--line)] bg-[var(--bg-panel)] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]"
              >
                <span className="text-[var(--text)]">{stat.value}</span> {stat.label}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <RadarChart groups={averages} />
          </div>
          <div className="grid gap-4 lg:col-span-7">
            {averages.map((group) => (
              <div key={group.label}>
                <div className="mb-2 flex items-baseline justify-between gap-3">
                  <p className="font-medium">{group.label}</p>
                  <p className="font-mono text-xs text-[var(--muted)]">
                    {copy.skillsLevel} {group.value}
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-panel)]">
                  <span
                    className="block h-full origin-left rounded-full bg-[var(--accent)] transition-transform duration-700 ease-out"
                    style={{ transform: `scaleX(${visible ? group.value / 100 : 0})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {groups.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setActiveId(group.id)}
              className={
                active?.id === group.id
                  ? "rounded-full bg-[var(--accent)] px-3 py-1.5 text-[11px] font-semibold text-[var(--on-accent)]"
                  : "rounded-full border border-[var(--line)] px-3 py-1.5 text-[11px] text-[var(--muted)]"
              }
            >
              {group.label}
            </button>
          ))}
        </div>

        {active ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {active.items.map((item) => (
              <SkillRing key={item.name} item={item} active={visible} yearLabel={copy.skillsYear} />
            ))}
          </div>
        ) : null}

        <div className="mt-10">
          <PracticeTimeline items={allItems} />
        </div>
      </div>
    </section>
  );
}
