import { SkillsForm } from "@/components/admin/skills-form";
import { PageHeader } from "@/components/admin/page-header";
import { getSite } from "@/lib/content";

export const metadata = { title: "Skills" };

export default async function SkillsAdminPage() {
  const site = await getSite();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Stack"
        title="Skills"
        description="Groups and tags that roll across the home page marquee."
      />
      <div className="admin-card p-5 sm:p-8">
        <SkillsForm site={site} />
      </div>
    </div>
  );
}
