import { PageHeader } from "@/components/admin/page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSite } from "@/lib/content";

export const metadata = { title: "Settings" };

export default async function SettingsAdminPage() {
  const site = await getSite();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Look"
        title="Settings"
        description="Font size, typefaces, corners, and colors for the public site and this studio."
      />
      <div className="admin-card p-5 sm:p-8">
        <SettingsForm site={site} />
      </div>
    </div>
  );
}
