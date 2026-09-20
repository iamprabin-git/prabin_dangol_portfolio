import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { HistoryGraph } from "@/components/history-graph";
import { ProjectCard } from "@/components/project-card";
import { SkillsSection } from "@/components/skills-section";
import { WhatsAppButton } from "@/components/whatsapp-widget";
import { displayName, getSite, skillItems } from "@/lib/content";
import { sanitizeSkills } from "@/lib/skills";
import { interpolate, navHref } from "@/lib/copy";
import { getProjects } from "@/lib/projects";
import { buildHistory } from "@/lib/history";
import { getReviewStats } from "@/lib/reviews";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [site, projects, stats] = await Promise.all([
    getSite(),
    getProjects(),
    getReviewStats(),
  ]);
  const featured = projects.filter((project) => project.featured);
  const work = featured.length ? featured : projects.slice(0, 3);
  const history = buildHistory(site.skills, projects);
  const marquee = skillItems(site);
  const { first, last } = displayName(site.name);
  const workHref = navHref(site, "work", "#work");
  const contactHref = navHref(site, "contact", "#contact");
  const labels = {
    visitSite: site.copy.visitSite,
    caseStudy: site.copy.caseStudy,
    sourceLabel: site.copy.sourceLabel,
  };

  return (
    <div>
      <section className="grain relative overflow-hidden">
        <div className="grid-fade absolute inset-0 opacity-70" />
        <div className="relative mx-auto grid max-w-6xl items-end gap-8 px-4 pb-12 pt-10 sm:gap-12 sm:px-8 sm:pb-20 sm:pt-24 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-8">
            <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-[var(--line)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent)] sm:text-xs">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
              <span className="truncate">{site.availability}</span>
            </p>
            <h1 className="mt-6 break-words font-display text-[clamp(2.55rem,12vw,7.5rem)] font-extrabold leading-[0.88] tracking-tight sm:mt-8">
              {first}
              {last ? (
                <>
                  <br />
                  <span className="text-[var(--accent)]">{last}</span>
                </>
              ) : null}
            </h1>
            <div className="mt-8 flex max-w-2xl flex-col gap-6 sm:mt-10 sm:gap-8">
              <p className="max-w-xl text-base text-[var(--muted)] sm:text-xl">
                {site.headline}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href={workHref}
                  className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--on-accent)]"
                >
                  {site.copy.heroPrimaryCta}
                </Link>
                <Link
                  href={contactHref}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--line)] px-5 py-3 text-sm"
                >
                  {site.copy.heroSecondaryCta}
                </Link>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="relative mx-auto aspect-[3/4] w-full max-w-[17rem] overflow-hidden rounded-sm bg-[var(--bg-panel)] sm:max-w-sm lg:ml-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={site.photos.portrait}
                alt={`${site.name}, ${site.role}`}
                className="h-full w-full object-cover"
              />
            </div>
            <p className="mt-3 text-right font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              {site.location}
            </p>
          </div>
        </div>
      </section>

      {marquee.length ? (
        <div className="overflow-hidden border-y border-[var(--line)] bg-[var(--bg-soft)] py-4">
          <div className="marquee-track flex w-max gap-10 whitespace-nowrap px-6 font-mono text-sm uppercase tracking-[0.22em] text-[var(--muted)]">
            {[...marquee, ...marquee].map((item, index) => (
              <span key={`${item}-${index}`} className="flex items-center gap-10">
                {item}
                <span className="text-[var(--accent)]">*</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <section id="work" className="mx-auto max-w-6xl px-4 py-12 sm:px-8 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
              {site.copy.workKicker}
            </p>
            <h2 className="mt-3 break-words font-display text-3xl font-extrabold sm:text-5xl">
              {site.copy.workHeading}
            </h2>
          </div>
          <Link href="/projects" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">
            {site.copy.workAllLink}
          </Link>
        </div>
        <div className="mt-6">
          {work.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              labels={labels}
              rating={stats[project.id]}
            />
          ))}
        </div>
      </section>

      <section id="about" className="border-y border-[var(--line)] bg-[var(--bg-soft)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:gap-12 sm:px-8 sm:py-20 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-5">
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
              {site.copy.aboutKicker}
            </p>
            <h2 className="mt-3 break-words font-display text-3xl font-extrabold sm:text-4xl">
              {interpolate(site.copy.aboutHeading, site)}
            </h2>
            <div className="mt-8 overflow-hidden rounded-sm bg-[var(--bg-panel)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={site.photos.workspace}
                alt={`${site.name} at work`}
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>
          <div className="min-w-0 lg:col-span-7">
            <div className="space-y-5 text-base text-[var(--muted)] sm:text-lg">
              {site.about.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {site.services.map((service) => (
                <div key={service.id} className="border-t border-[var(--line)] pt-4">
                  <h3 className="font-display text-xl font-bold">{service.title}</h3>
                  <p className="mt-3 text-sm text-[var(--muted)]">{service.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-[var(--line)] bg-[var(--bg-soft)]">
        <SkillsSection
          groups={sanitizeSkills(site.skills)}
          timeline={history}
          copy={{
            skillsKicker: site.copy.skillsKicker,
            skillsHeading: site.copy.skillsHeading,
            skillsLevel: site.copy.skillsLevel,
            skillsYear: site.copy.skillsYear,
            skillsEmpty: site.copy.skillsEmpty,
          }}
        />
        <HistoryGraph
          className="pt-4 sm:pt-6"
          items={history}
          copy={{
            timelineKicker: site.copy.timelineKicker,
            timelineHeading: site.copy.timelineHeading,
            timelineWeb: site.copy.timelineWeb,
            timelineDesign: site.copy.timelineDesign,
            timelineEmpty: site.copy.timelineEmpty,
          }}
        />
      </div>

      <section id="contact" className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:gap-12 sm:px-8 sm:py-20 lg:grid-cols-2">
        <div className="min-w-0">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
            {site.copy.contactKicker}
          </p>
          <h2 className="mt-3 break-words font-display text-3xl font-extrabold sm:text-5xl">
            {site.copy.contactHeading}
          </h2>
          <p className="mt-5 max-w-md text-[var(--muted)]">{site.summary}</p>
          <div className="mt-8 flex min-w-0 items-center gap-3 sm:gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={site.photos.portrait}
              alt={site.name}
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-[var(--line)] sm:h-14 sm:w-14"
            />
            <a
              href={`mailto:${site.email}`}
              className="min-w-0 break-all font-display text-lg font-bold text-[var(--accent)] sm:text-2xl"
            >
              {site.email}
            </a>
          </div>
          <WhatsAppButton
            site={site}
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm hover:border-[#25d366]"
          />
        </div>
        <ContactForm to={site.email} copy={site.copy} />
      </section>
    </div>
  );
}
