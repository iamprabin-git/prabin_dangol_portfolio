import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { getSite } from "@/lib/content";
import { getProjects } from "@/lib/projects";
import { getReviewStats } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return { title: site.copy.projectsHeading };
}

export default async function ProjectsPage() {
  const [site, projects, stats] = await Promise.all([
    getSite(),
    getProjects(),
    getReviewStats(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
        {site.copy.projectsKicker}
      </p>
      <h1 className="mt-3 break-words font-display text-4xl font-extrabold sm:text-6xl">
        {site.copy.projectsHeading}
      </h1>
      <p className="mt-4 max-w-xl text-[var(--muted)]">{site.copy.projectsIntro}</p>
      <div className="mt-8">
        {projects.length ? (
          projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              labels={{
                visitSite: site.copy.visitSite,
                caseStudy: site.copy.caseStudy,
                sourceLabel: site.copy.sourceLabel,
              }}
              rating={stats[project.id]}
            />
          ))
        ) : (
          <p className="border-t border-[var(--line)] py-16 text-[var(--muted)]">
            {site.copy.projectsEmpty}
          </p>
        )}
      </div>
    </div>
  );
}
