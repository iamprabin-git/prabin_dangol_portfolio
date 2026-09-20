import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { ProjectList } from "@/components/admin/project-list";
import { getProjects } from "@/lib/projects";
import { getReviewStats } from "@/lib/reviews";

export const metadata = { title: "Projects" };

export default async function ProjectsAdminPage() {
  const [projects, stats] = await Promise.all([getProjects(), getReviewStats()]);
  const pendingByProject = Object.fromEntries(
    Object.entries(stats).map(([id, value]) => [id, value.pending]),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Work"
        title="Projects"
        description={`${projects.length} live ${projects.length === 1 ? "entry" : "entries"} on the public site.`}
        action={
          <Link
            href="/admin/projects/new"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-[13px] font-semibold text-[var(--on-accent)]"
          >
            Add project
          </Link>
        }
      />
      <ProjectList projects={projects} pendingByProject={pendingByProject} />
    </div>
  );
}
