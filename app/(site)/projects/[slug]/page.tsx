import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverImage } from "@/components/project-card";
import { ReviewForm, ReviewList } from "@/components/review-section";
import { Stars } from "@/components/stars";
import { getSite } from "@/lib/content";
import { getProjectBySlug, getProjects } from "@/lib/projects";
import { averageRating, getApprovedReviews } from "@/lib/reviews";
import { displayHost } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project" };
  return { title: project.title, description: project.summary };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [site, project] = await Promise.all([getSite(), getProjectBySlug(slug)]);
  if (!project) notFound();

  const [others, reviews] = await Promise.all([
    getProjects().then((items) => items.filter((item) => item.id !== project.id).slice(0, 2)),
    getApprovedReviews(project.id),
  ]);
  const rating = averageRating(reviews);

  return (
    <article className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
      <Link href="/projects" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
        ← {site.copy.backToProjects}
      </Link>
      <p className="mt-6 break-words font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent)] sm:mt-8 sm:text-xs sm:tracking-[0.22em]">
        {project.year} · {project.tags.join(" · ")}
      </p>
      <h1 className="mt-3 max-w-4xl break-words font-display text-4xl font-extrabold leading-[0.98] sm:mt-4 sm:text-7xl sm:leading-[0.95]">
        {project.title}
      </h1>
      <p className="mt-5 max-w-2xl text-base text-[var(--muted)] sm:mt-6 sm:text-lg">{project.summary}</p>
      {reviews.length ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-[var(--muted)]">
          <Stars value={rating} />
          {rating} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
        </p>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        {project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)]"
          >
            {site.copy.visitSite} {displayHost(project.liveUrl)}
          </a>
        ) : null}
        {project.githubUrl ? (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-5 py-2.5 text-sm"
          >
            {site.copy.sourceLabel}
          </a>
        ) : null}
      </div>
      {project.liveUrl ? (
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noreferrer"
          className="relative mt-12 block aspect-[16/9] overflow-hidden rounded-sm bg-[var(--bg-panel)]"
        >
          <CoverImage src={project.imageUrl} alt={`${project.title} website`} />
          <span className="absolute bottom-3 right-3 rounded-full bg-[var(--overlay)] px-3 py-1.5 text-xs text-[var(--accent)] sm:bottom-4 sm:right-4 sm:px-4 sm:py-2 sm:text-sm">
            {site.copy.liveSite} →
          </span>
        </a>
      ) : (
        <div className="mt-12 aspect-[16/9] overflow-hidden rounded-sm bg-[var(--bg-panel)]">
          <CoverImage src={project.imageUrl} alt={project.title} />
        </div>
      )}
      <div className="prose-muted mx-auto mt-10 max-w-2xl whitespace-pre-wrap text-base leading-7 text-[var(--muted)] sm:mt-12 sm:text-lg sm:leading-8">
        {project.description}
      </div>
      <section className="mx-auto mt-20 max-w-2xl border-t border-[var(--line)] pt-10">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
          {site.copy.reviewsKicker}
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold">{site.copy.reviewsHeading}</h2>
        <ReviewList reviews={reviews} empty={site.copy.reviewsEmpty} />
        <div className="mt-12 border-t border-[var(--line)] pt-10">
          <ReviewForm projectId={project.id} copy={site.copy} />
        </div>
      </section>
      {others.length ? (
        <div className="mt-20 border-t border-[var(--line)] pt-10">
          <h2 className="font-display text-3xl font-bold">{site.copy.moreWork}</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {others.map((item) => (
              <div key={item.id} className="group">
                <a
                  href={item.liveUrl || `/projects/${item.slug}`}
                  target={item.liveUrl ? "_blank" : undefined}
                  rel={item.liveUrl ? "noreferrer" : undefined}
                  className="block aspect-[16/10] overflow-hidden rounded-sm bg-[var(--bg-panel)]"
                >
                  <CoverImage
                    src={item.imageUrl}
                    alt={item.title}
                    className="transition duration-500 group-hover:scale-[1.03]"
                  />
                </a>
                <h3 className="mt-4 font-display text-2xl font-bold">
                  <Link href={`/projects/${item.slug}`} className="hover:text-[var(--accent)]">
                    {item.title}
                  </Link>
                </h3>
                {item.liveUrl ? (
                  <a
                    href={item.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block text-sm text-[var(--muted)] hover:text-[var(--accent)]"
                  >
                    {displayHost(item.liveUrl)} ↗
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}
