import { sanitizeSkills, skillYearValue } from "./skills";
import type { Project, SkillGroup, TimelineItem, TimelineTrack } from "./types";

const DESIGN = /figma|design|brand|illustrat|photoshop|packag|poster|graphic|identity|editorial|visual|layout/i;

function yearFromDate(value: string) {
  const fromYear = skillYearValue(value);
  if (fromYear) return String(fromYear);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return String(date.getFullYear());
}

export function inferTrack(...parts: Array<string | undefined>): TimelineTrack {
  return DESIGN.test(parts.filter(Boolean).join(" ")) ? "design" : "web";
}

export function buildHistory(skills: SkillGroup[], projects: Project[]): TimelineItem[] {
  const groups = sanitizeSkills(skills);
  const fromSkills: TimelineItem[] = groups.flatMap((group) =>
    group.items
      .filter((item) => skillYearValue(item.year))
      .map((item) => ({
        id: `skill-${group.id}-${item.name}`,
        year: String(skillYearValue(item.year)),
        title: item.name,
        body: `Started in ${group.label} · proficiency ${item.level}`,
        track: inferTrack(group.label, item.name),
        source: "skill" as const,
      })),
  );

  const fromProjects: TimelineItem[] = [];
  for (const project of projects) {
    const year = yearFromDate(project.year) || yearFromDate(project.createdAt);
    if (!year) continue;
    fromProjects.push({
      id: `project-${project.id}`,
      year,
      title: project.title,
      body: project.summary || project.tags.join(" · "),
      track: inferTrack(project.title, project.summary, project.tags.join(" ")),
      source: "project",
    });
  }

  return [...fromProjects, ...fromSkills].sort((a, b) => {
    const yearDiff = skillYearValue(b.year) - skillYearValue(a.year);
    if (yearDiff) return yearDiff;
    if (a.source !== b.source) return a.source === "project" ? -1 : 1;
    return a.title.localeCompare(b.title);
  });
}
