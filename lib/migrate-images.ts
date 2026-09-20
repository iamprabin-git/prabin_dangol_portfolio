import { promises as fs } from "fs";
import path from "path";
import { isCloudinaryUrl, uploadImagePath } from "./cloudinary";
import { getSite, saveSite } from "./content";
import { readProjects, writeProjects } from "./storage";
import type { Project, SiteContent } from "./types";

const ROOT = process.cwd();
const SITE_FILE = path.join(ROOT, "data", "site.json");
const PROJECTS_FILE = path.join(ROOT, "data", "projects.json");

function publicFile(url: string) {
  if (!url.startsWith("/")) return "";
  return path.join(ROOT, "public", url.replace(/^\//, "").split("/").join(path.sep));
}

async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function migrateUrl(url: string, publicId: string, fallbacks: string[] = []) {
  if (!url) return url;
  if (isCloudinaryUrl(url)) return url;

  const candidates = [publicFile(url), ...fallbacks].filter(Boolean);
  for (const candidate of candidates) {
    if (await fileExists(candidate)) {
      return uploadImagePath(candidate, publicId);
    }
  }

  throw new Error(`Could not find a local file for ${url}`);
}

export async function migrateExistingImages() {
  const site = await getSite();
  const portrait = await migrateUrl(site.photos.portrait, "portfolio/portrait", [
    path.join(ROOT, "public", "profile", "prabin-portrait.jpg"),
  ]);
  const workspace = await migrateUrl(site.photos.workspace, "portfolio/workspace", [
    path.join(ROOT, "public", "profile", "prabin-workspace.jpg"),
  ]);

  const nextSite: SiteContent = {
    ...site,
    photos: { portrait, workspace },
  };
  await saveSite(nextSite);

  const projects = await readProjects();
  const nextProjects: Project[] = [];
  for (const project of projects) {
    const imageUrl = await migrateUrl(
      project.imageUrl,
      `portfolio/projects/${project.slug || project.id}`,
    );
    nextProjects.push({ ...project, imageUrl });
  }
  await writeProjects(nextProjects);

  const localSite = JSON.parse(await fs.readFile(SITE_FILE, "utf8")) as SiteContent;
  localSite.photos = { portrait, workspace };
  await fs.writeFile(SITE_FILE, `${JSON.stringify(localSite, null, 2)}\n`, "utf8");
  await fs.writeFile(PROJECTS_FILE, `${JSON.stringify(nextProjects, null, 2)}\n`, "utf8");

  return {
    portrait: isCloudinaryUrl(portrait),
    workspace: isCloudinaryUrl(workspace),
    projects: nextProjects.map((project) => ({
      slug: project.slug,
      cloudinary: isCloudinaryUrl(project.imageUrl),
    })),
  };
}
