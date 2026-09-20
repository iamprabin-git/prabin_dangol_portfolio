import { PageHeader } from "@/components/admin/page-header";
import { TimelineForm } from "@/components/admin/timeline-form";
import { getSite } from "@/lib/content";
import { getProjects } from "@/lib/projects";

export const metadata = { title: "Timeline" };

export default async function TimelineAdminPage() {
  const [site, projects] = await Promise.all([getSite(), getProjects()]);
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="History"
        title="Timeline"
        description="Built automatically from skill start years and project completion years."
      />
      <div className="admin-card p-5 sm:p-8">
        <TimelineForm site={site} projects={projects} />
      </div>
    </div>
  );
}
