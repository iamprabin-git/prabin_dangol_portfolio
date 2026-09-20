import { ProfileForm } from "@/components/admin/profile-form";
import { PageHeader } from "@/components/admin/page-header";
import { getSite } from "@/lib/content";

export const metadata = { title: "Profile" };

export default async function ProfileAdminPage() {
  const site = await getSite();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Identity"
        title="Profile"
        description="Name, photos, WhatsApp chat, and links used across the public site."
      />
      <div className="admin-card p-5 sm:p-8">
        <ProfileForm site={site} />
      </div>
    </div>
  );
}
