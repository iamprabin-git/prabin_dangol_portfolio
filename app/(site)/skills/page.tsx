import type { Metadata } from "next";
import { SkillsSection } from "@/components/skills-section";
import { getSite } from "@/lib/content";
import { buildHistory } from "@/lib/history";
import { getProjects } from "@/lib/projects";
import { sanitizeSkills } from "@/lib/skills";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return { title: site.copy.skillsHeading };
}

export default async function SkillsPage() {
  const [site, projects] = await Promise.all([getSite(), getProjects()]);
  const history = buildHistory(site.skills, projects);

  return (
    <div className="border-b border-[var(--line)] bg-[var(--bg-soft)]">
      <SkillsSection
        groups={sanitizeSkills(site.skills)}
        timeline={history}
        copy={{
          skillsKicker: site.copy.skillsKicker,
          skillsHeading: site.copy.skillsHeading,
          skillsLevel: site.copy.skillsLevel,
          skillsYear: site.copy.skillsYear,
          skillsEmpty: site.copy.skillsEmpty,
        }}
      />
    </div>
  );
}
