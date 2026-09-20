import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ProjectLogoMarquee } from "@/components/project-logo-marquee";
import { WhatsAppWidget } from "@/components/whatsapp-widget";
import { getSite } from "@/lib/content";
import { getProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return {
    title: {
      default: `${site.name} — ${site.role}`,
      template: `%s — ${site.name}`,
    },
    description: site.headline,
    openGraph: {
      title: `${site.name} — ${site.role}`,
      description: site.headline,
      type: "website",
    },
  };
}

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [site, projects] = await Promise.all([getSite(), getProjects()]);

  return (
    <>
      <Header site={site} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <div className="mt-auto">
        <ProjectLogoMarquee projects={projects} kicker={site.copy.logosKicker} />
        <Footer site={site} />
      </div>
      <WhatsAppWidget site={site} />
    </>
  );
}
