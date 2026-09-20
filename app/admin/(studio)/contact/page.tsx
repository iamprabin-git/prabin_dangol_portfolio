import { ContactFormAdmin } from "@/components/admin/contact-copy-form";
import { PageHeader } from "@/components/admin/page-header";
import { getSite } from "@/lib/content";

export const metadata = { title: "Contact & copy" };

export default async function ContactAdminPage() {
  const site = await getSite();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="Pages"
        title="Contact & copy"
        description="Headings, buttons, navigation, and form labels used on the public site."
      />
      <div className="admin-card p-5 sm:p-8">
        <ContactFormAdmin site={site} />
      </div>
    </div>
  );
}
