import Link from "next/link";
import { Stars } from "@/components/stars";
import type { Project, SiteCopy } from "@/lib/types";
import { displayHost } from "@/lib/utils";

export function CoverImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`grid place-items-center bg-[var(--bg-panel)] text-sm text-[var(--muted)] ${className}`}
      >
        No image yet
      </div>
    );
  }

  return (
    // Uploaded files can be SVG, local paths, or Vercel Blob URLs.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} />
  );
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path
        d="M4 12.5 12 4.5M7 4.5h5v5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function ProjectCard({
  project,
  index,
  labels,
  rating,
}: {
  project: Project;
  index: number;
  labels: Pick<SiteCopy, "visitSite" | "caseStudy" | "sourceLabel">;
  rating?: { average: number; count: number };
}) {
  const flipped = index % 2 === 1;
  const imageHref = project.liveUrl || `/projects/${project.slug}`;
  const imageIsExternal = Boolean(project.liveUrl);

  return (
    <article className="group grid items-stretch gap-6 border-t border-[var(--line)] py-8 sm:gap-8 sm:py-10 lg:grid-cols-12 lg:gap-12 lg:py-14">
      <div className={`lg:col-span-7 ${flipped ? "lg:order-2" : ""}`}>
        <a
          href={imageHref}
          target={imageIsExternal ? "_blank" : undefined}
          rel={imageIsExternal ? "noreferrer" : undefined}
          className="relative block aspect-[16/10] overflow-hidden rounded-sm bg-[var(--bg-panel)]"
        >
          <CoverImage
            src={project.imageUrl}
            alt={`${project.title} website`}
            className="transition duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute left-3 top-3 rounded-full bg-[var(--overlay)] px-2.5 py-1 font-mono text-[10px] text-[var(--accent)] sm:left-4 sm:top-4 sm:text-xs">
            {String(index + 1).padStart(2, "0")} / {project.year}
          </span>
          {project.liveUrl ? (
            <span className="absolute bottom-3 left-3 right-3 flex flex-col gap-1 rounded-sm bg-[var(--overlay)] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--on-overlay)] sm:bottom-4 sm:left-4 sm:right-4 sm:flex-row sm:items-center sm:justify-between sm:tracking-[0.16em] sm:text-[11px]">
              <span className="truncate">{displayHost(project.liveUrl)}</span>
              <span className="inline-flex items-center gap-1 text-[var(--accent)]">
                {labels.visitSite}
                <ExternalIcon />
              </span>
            </span>
          ) : null}
        </a>
      </div>
      <div className={`flex min-w-0 flex-col justify-end lg:col-span-5 ${flipped ? "lg:order-1" : ""}`}>
        <p className="break-words font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)] sm:text-xs sm:tracking-[0.22em]">
          {project.tags.join(" · ")}
        </p>
        <h3 className="mt-3 break-words font-display text-3xl font-extrabold leading-none sm:mt-4 sm:text-5xl">
          <Link href={`/projects/${project.slug}`} className="hover:text-[var(--accent)]">
            {project.title}
          </Link>
        </h3>
        {rating && rating.count ? (
          <p className="mt-3 flex items-center gap-2 text-sm text-[var(--muted)]">
            <Stars value={rating.average} size="sm" />
            <span>
              {rating.average} · {rating.count} {rating.count === 1 ? "review" : "reviews"}
            </span>
          </p>
        ) : null}
        <p className="mt-5 max-w-md text-[var(--muted)]">{project.summary}</p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[var(--accent)]"
            >
              {displayHost(project.liveUrl)}
              <ExternalIcon />
            </a>
          ) : null}
          <Link href={`/projects/${project.slug}`} className="text-[var(--muted)] hover:text-[var(--text)]">
            {labels.caseStudy}
          </Link>
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--muted)] hover:text-[var(--text)]"
            >
              {labels.sourceLabel}
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
