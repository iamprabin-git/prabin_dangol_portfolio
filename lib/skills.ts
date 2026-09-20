import type { SkillGroup, SkillItem } from "./types";

const DEFAULT_LEVELS: Record<string, { level: number; year: string }> = {
  TypeScript: { level: 90, year: "2023" },
  JavaScript: { level: 92, year: "2021" },
  HTML: { level: 94, year: "2021" },
  CSS: { level: 90, year: "2021" },
  SQL: { level: 78, year: "2023" },
  "Next.js": { level: 88, year: "2023" },
  React: { level: 90, year: "2022" },
  "Node.js": { level: 82, year: "2022" },
  "Tailwind CSS": { level: 88, year: "2022" },
  Express: { level: 74, year: "2022" },
  Git: { level: 86, year: "2021" },
  Vercel: { level: 84, year: "2023" },
  PostgreSQL: { level: 76, year: "2023" },
  Figma: { level: 80, year: "2021" },
  "REST APIs": { level: 85, year: "2022" },
};

function clampLevel(value: unknown) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return 70;
  return Math.min(100, Math.max(1, n));
}

export function skillName(item: string | SkillItem) {
  if (typeof item === "string") return item.trim();
  return String(item?.name || "").trim();
}

export function normalizeSkillItem(item: string | SkillItem | null | undefined): SkillItem | null {
  const name = skillName(item || "");
  if (!name) return null;
  const preset = DEFAULT_LEVELS[name];
  if (typeof item === "string") {
    return { name, level: preset?.level ?? 70, year: preset?.year ?? "" };
  }
  if (!item) {
    return { name, level: preset?.level ?? 70, year: preset?.year ?? "" };
  }
  return {
    name,
    level: clampLevel(item.level ?? preset?.level ?? 70),
    year: String(item.year || preset?.year || "").trim(),
  };
}

export function sanitizeSkills(groups: SkillGroup[] | null | undefined): SkillGroup[] {
  return (groups || [])
    .map((group) => ({
      id: group.id || crypto.randomUUID(),
      label: String(group.label || "").trim(),
      items: (group.items || [])
        .map((item) => normalizeSkillItem(item as string | SkillItem))
        .filter((item): item is SkillItem => Boolean(item)),
    }))
    .filter((group) => group.label || group.items.length);
}

export function groupAverage(group: SkillGroup) {
  if (!group.items.length) return 0;
  const total = group.items.reduce((sum, item) => sum + item.level, 0);
  return Math.round(total / group.items.length);
}

export function skillYearValue(year: string) {
  const parsed = Number.parseInt(year, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}
