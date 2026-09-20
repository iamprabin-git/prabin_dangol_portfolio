import { defaultSite } from "./site";
import { sanitizeAppearance } from "./appearance";
import { sanitizeSkills, skillName } from "./skills";
import { deleteStoredImage, readJsonRecord, saveImage, writeJsonRecord } from "./storage";
import type { NavItem, SiteContent, SocialLink } from "./types";

const SITE_KEY = "portfolio/site.json";
const SITE_FILE = "site.json";

function socialFromLegacy(social: SiteContent["social"]): SocialLink[] {
  return [
    { id: "github", label: "GitHub", href: social.github || "" },
    { id: "linkedin", label: "LinkedIn", href: social.linkedin || "" },
    { id: "twitter", label: "Twitter", href: social.twitter || "" },
  ].filter((item) => item.href);
}

export function socialRecord(links: SocialLink[]): SiteContent["social"] {
  const byId = Object.fromEntries(links.map((item) => [item.id, item.href]));
  return {
    github: byId.github || "",
    linkedin: byId.linkedin || "",
    twitter: byId.twitter || "",
  };
}

function mergeSite(base: SiteContent, extra: Partial<SiteContent> | null): SiteContent {
  if (!extra) return base;
  const socialLinks = extra.socialLinks
    ?? (extra.social ? socialFromLegacy({ ...base.social, ...extra.social }) : base.socialLinks);
  return {
    ...base,
    ...extra,
    photos: { ...base.photos, ...extra.photos },
    social: extra.socialLinks
      ? { ...base.social, ...extra.social, ...socialRecord(extra.socialLinks) }
      : { ...base.social, ...extra.social },
    copy: { ...base.copy, ...extra.copy },
    whatsapp: { ...base.whatsapp, ...extra.whatsapp },
    appearance: sanitizeAppearance({
      ...base.appearance,
      ...extra.appearance,
      dark: { ...base.appearance.dark, ...extra.appearance?.dark },
      light: { ...base.appearance.light, ...extra.appearance?.light },
    }),
    about: extra.about ?? base.about,
    services: extra.services ?? base.services,
    skills: sanitizeSkills(extra.skills ?? base.skills),
    timeline: extra.timeline ?? base.timeline,
    navigation: withSkillsNav(extra.navigation ?? base.navigation),
    socialLinks,
  };
}

export async function getSite(): Promise<SiteContent> {
  const stored = await readJsonRecord<Partial<SiteContent>>(SITE_KEY, SITE_FILE);
  return mergeSite(defaultSite, stored);
}

export async function saveSite(next: SiteContent) {
  await writeJsonRecord(SITE_KEY, SITE_FILE, next);
  return next;
}

export async function updateSite(
  patch: Partial<SiteContent> & {
    portrait?: File | null;
    workspace?: File | null;
  },
) {
  const current = await getSite();
  let portrait = current.photos.portrait;
  let workspace = current.photos.workspace;

  if (patch.portrait && patch.portrait.size > 0) {
    portrait = await saveImage(patch.portrait);
    if (current.photos.portrait && current.photos.portrait !== portrait) {
      await deleteStoredImage(current.photos.portrait);
    }
  }
  if (patch.workspace && patch.workspace.size > 0) {
    workspace = await saveImage(patch.workspace);
    if (current.photos.workspace && current.photos.workspace !== workspace) {
      await deleteStoredImage(current.photos.workspace);
    }
  }

  const { portrait: _p, workspace: _w, ...rest } = patch;
  void _p;
  void _w;

  const next: SiteContent = mergeSite(current, {
    ...rest,
    photos: {
      portrait,
      workspace,
    },
  });

  return saveSite(next);
}

function withSkillsNav(items: NavItem[]) {
  if (items.some((item) => item.id === "skills" || item.href.includes("#skills"))) return items;
  const next = [...items];
  const about = next.findIndex((item) => item.id === "about");
  next.splice(about >= 0 ? about + 1 : 0, 0, { id: "skills", label: "Skills", href: "/#skills" });
  return next;
}

export function skillItems(site: SiteContent) {
  return sanitizeSkills(site.skills).flatMap((group) => group.items.map((item) => skillName(item)));
}

export function displayName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { first: name, last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}
