import Link from "next/link";
import type { Project } from "@/lib/types";

function looped<T>(items: T[]) {
  if (!items.length) return [];
  const copies = items.length >= 6 ? 2 : items.length >= 3 ? 3 : 6;
  return Array.from({ length: copies }, () => items).flat();
}

function LogoCard({ project }: { project: Project }) {
  const href = project.liveUrl || `/projects/${project.slug}`;
  const external = Boolean(project.liveUrl);
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group flex h-24 w-[9.5rem] shrink-0 items-center justify-center rounded-sm border border-[var(--line)] bg-[var(--bg-panel)] px-4 sm:h-28 sm:w-44"
      title={project.title}
    >
      {project.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.imageUrl}
          alt={project.title}
          className="max-h-12 max-w-full object-contain opacity-80 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 sm:max-h-14"
        />
      ) : (
        <span className="text-center font-display text-sm font-bold leading-tight">{project.title}</span>
      )}
    </Link>
  );
}

function NameChip({ project }: { project: Project }) {
  const href = project.liveUrl || `/projects/${project.slug}`;
  const external = Boolean(project.liveUrl);
  return (
    <Link
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="flex h-12 shrink-0 items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--bg)] px-4"
    >
      {project.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.imageUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
      ) : (
        <span className="h-7 w-7 rounded-full bg-[var(--accent)]/20" />
      )}
      <span className="whitespace-nowrap text-sm font-medium">{project.title}</span>
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
  const withMarks = projects.filter((project) => project.imageUrl || project.title);
  if (!withMarks.length) return null;

  const logos = looped(withMarks);
  const names = looped([...withMarks].reverse());

  return (
    <section className="border-t border-[var(--line)] bg-[var(--bg)] py-8 sm:py-10" aria-label={kicker}>
      <p className="mx-auto mb-5 max-w-6xl px-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--muted)] sm:px-8">
        {kicker}
      </p>
      <div className="overflow-hidden">
        <div className="logo-marquee flex w-max gap-3 px-3 sm:gap-4">
          {logos.map((project, index) => (
            <LogoCard key={`logo-${project.id}-${index}`} project={project} />
          ))}
        </div>
      </div>
      <div className="mt-4 overflow-hidden">
        <div className="logo-marquee-reverse flex w-max gap-3 px-3 sm:gap-4">
          {names.map((project, index) => (
            <NameChip key={`name-${project.id}-${index}`} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
