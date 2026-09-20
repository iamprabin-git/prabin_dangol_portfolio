import { PageHeader } from "@/components/admin/page-header";
import { TimelineForm } from "@/components/admin/timeline-form";
import { getSite } from "@/lib/content";

export const metadata = { title: "Timeline" };

export default async function TimelineAdminPage() {
  const site = await getSite();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="History"
        title="Timeline"
        description="Web development and graphic design work, plotted by year of completion."
      />
      <div className="admin-card p-5 sm:p-8">
        <TimelineForm site={site} />
      </div>
    </div>
  );
}
