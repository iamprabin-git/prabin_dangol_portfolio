import Link from "next/link";
import { CoverImage } from "@/components/project-card";
import { PageHeader } from "@/components/admin/page-header";
import { getSite, skillItems } from "@/lib/content";
import { getProjects } from "@/lib/projects";
import { getReviews } from "@/lib/reviews";

export const metadata = { title: "Admin" };

export default async function AdminHomePage() {
  const [site, projects, reviews] = await Promise.all([
    getSite(),
    getProjects(),
    getReviews(),
  ]);
  const skillCount = skillItems(site).length;
  const featured = projects.filter((project) => project.featured).length;
  const pendingReviews = reviews.filter((review) => review.status === "pending").length;
  const liveReviews = reviews.filter((review) => review.status === "approved").length;

  const stats = [
    { label: "Projects", value: String(projects.length) },
    { label: "Featured", value: String(featured) },
    { label: "Skills", value: String(skillCount) },
    { label: "Pending reviews", value: String(pendingReviews) },
  ];

  const cards = [
    {
      href: "/admin/profile",
      kicker: "01",
      title: "Profile",
      body: `${site.name} · ${site.role}`,
    },
    {
      href: "/admin/about",
      kicker: "02",
      title: "About",
      body: `${site.about.length} paragraphs, ${site.services.length} services`,
    },
    {
      href: "/admin/timeline",
      kicker: "03",
      title: "Timeline",
      body: `${site.timeline.length} completed entries on the history graph`,
    },
    {
      href: "/admin/skills",
      kicker: "04",
      title: "Skills",
      body: `${skillCount} tags across ${site.skills.length} groups`,
    },
    {
      href: "/admin/projects",
      kicker: "05",
      title: "Projects",
      body: `${projects.length} live entries on the public site`,
    },
    {
      href: "/admin/reviews",
      kicker: "06",
      title: "Reviews",
      body: `${liveReviews} live, ${pendingReviews} waiting`,
    },
    {
      href: "/admin/contact",
      kicker: "07",
      title: "Page copy",
      body: "Nav, buttons, and every public heading",
    },
    {
      href: "/admin/settings",
      kicker: "08",
      title: "Settings",
      body: "Fonts, size, corners, and colors",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Dashboard"
        title={`Welcome back, ${site.name.split(" ")[0]}.`}
        description="Publish once. Header, home, projects, and footer all read from this studio."
        action={
          <Link
            href="/admin/projects/new"
            className="inline-flex w-full items-center justify-center rounded-full bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-[var(--on-accent)] sm:w-auto"
          >
            New project
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="admin-card px-5 py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              {stat.label}
            </p>
            <p className="mt-2 font-display text-3xl font-extrabold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="admin-card group flex flex-col justify-between p-5 transition-colors hover:border-[var(--accent)]"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--accent)]">
                {card.kicker}
              </p>
              <div className="mt-8">
                <h2 className="font-display text-xl font-bold">{card.title}</h2>
                <p className="mt-1 text-sm text-[var(--muted)]">{card.body}</p>
                <p className="mt-4 text-[12px] text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100">
                  Open →
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="admin-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Latest work
            </p>
            <Link href="/admin/projects" className="text-[12px] text-[var(--accent)]">
              All
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {projects.slice(0, 4).map((project) => (
              <Link
                key={project.id}
                href={`/admin/projects/${project.id}/edit`}
                className="flex items-center gap-3 rounded-lg p-1 hover:bg-[var(--bg)]"
              >
                <div className="h-12 w-16 overflow-hidden rounded-md bg-[var(--bg)]">
                  <CoverImage src={project.imageUrl} alt="" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{project.title}</p>
                  <p className="truncate text-xs text-[var(--muted)]">{project.year}</p>
                </div>
              </Link>
            ))}
            {!projects.length ? (
              <p className="py-8 text-sm text-[var(--muted)]">No projects yet.</p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
