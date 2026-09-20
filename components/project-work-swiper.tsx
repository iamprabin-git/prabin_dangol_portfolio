"use client";

import { ProjectTile } from "@/components/project-card";
import { ForwardSwiper, pagesOf, useMedia } from "@/components/forward-swiper";
import type { Project, SiteCopy } from "@/lib/types";

type Labels = Pick<SiteCopy, "visitSite" | "caseStudy" | "sourceLabel">;
type Ratings = Record<string, { average: number; count: number }>;

export function ProjectWorkGrid({
  projects,
  labels,
  ratings,
  empty,
}: {
  projects: Project[];
  labels: Labels;
  ratings: Ratings;
  empty?: string;
}) {
  if (!projects.length) {
    return empty ? (
      <p className="border-t border-[var(--line)] py-16 text-[var(--muted)]">{empty}</p>
    ) : null;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
      {projects.map((project, index) => (
        <ProjectTile
          key={project.id}
          project={project}
          index={index}
          labels={labels}
          rating={ratings[project.id]}
        />
      ))}
    </div>
  );
}

export function ProjectWorkSwiper({
  projects,
  labels,
  ratings,
  empty,
}: {
  projects: Project[];
  labels: Labels;
  ratings: Ratings;
  empty?: string;
}) {
  const perView = useMedia("(min-width: 768px)", 2, 1, 1);
  const pages = pagesOf(projects, perView);

  if (!projects.length) {
    return empty ? (
      <p className="border-t border-[var(--line)] py-16 text-[var(--muted)]">{empty}</p>
    ) : null;
  }

  return (
    <ForwardSwiper
      label="Project slides"
      intervalMs={5000}
      slides={pages.map((group, index) => (
        <div
          key={`work-${index}`}
          className="grid gap-4 px-px sm:gap-6"
          style={{ gridTemplateColumns: `repeat(${perView}, minmax(0, 1fr))` }}
        >
          {group.map((project) => (
            <ProjectTile
              key={`${project.id}-${index}`}
              project={project}
              index={projects.findIndex((item) => item.id === project.id)}
              labels={labels}
              rating={ratings[project.id]}
            />
          ))}
        </div>
      ))}
    />
  );
}
