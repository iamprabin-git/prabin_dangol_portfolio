import { AboutForm } from "@/components/admin/about-form";
import { PageHeader } from "@/components/admin/page-header";
import { getSite } from "@/lib/content";

export const metadata = { title: "About" };

export default async function AboutAdminPage() {
  const site = await getSite();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Story"
        title="About"
        description="Bio paragraphs and the service cards on the home page."
      />
      <div className="admin-card p-5 sm:p-8">
        <AboutForm site={site} />
      </div>
    </div>
  );
}
