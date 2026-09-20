import { uniqueSlug } from "./utils";
import {
  deleteStoredImage,
  readProjects,
  saveImage,
  writeProjects,
} from "./storage";
import { deleteReviewsForProject } from "./reviews";
import type { Project, ProjectInput } from "./types";

function withLogo(project: Project): Project {
  return { ...project, logoUrl: project.logoUrl || "" };
}

export async function getProjects() {
  const projects = await readProjects();
  return [...projects]
    .map(withLogo)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getFeaturedProjects() {
  const projects = await getProjects();
  const featured = projects.filter((project) => project.featured);
  return featured.length ? featured : projects.slice(0, 3);
}

export async function getProjectBySlug(slug: string) {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug) ?? null;
}

export async function getProjectById(id: string) {
  const projects = await getProjects();
  return projects.find((project) => project.id === id) ?? null;
}

function normalizeInput(input: ProjectInput): ProjectInput {
  return {
    title: input.title.trim(),
    summary: input.summary.trim(),
    description: input.description.trim(),
    tags: input.tags.map((tag) => tag.trim()).filter(Boolean),
    liveUrl: input.liveUrl.trim(),
    githubUrl: input.githubUrl.trim(),
    featured: Boolean(input.featured),
    year: input.year.trim() || String(new Date().getFullYear()),
    imageUrl: input.imageUrl,
    logoUrl: input.logoUrl,
  };
}

export async function createProject(input: ProjectInput, image?: File | null, logo?: File | null) {
  const data = normalizeInput(input);
  if (!data.title) throw new Error("A title is required.");
  if (!data.summary) throw new Error("A short summary is required.");

  const projects = await readProjects();
  const now = new Date().toISOString();
  const imageUrl = image && image.size > 0 ? await saveImage(image) : data.imageUrl || "";
  const logoUrl = logo && logo.size > 0 ? await saveImage(logo) : data.logoUrl || "";

  const project: Project = {
    id: crypto.randomUUID(),
    title: data.title,
    slug: uniqueSlug(
      data.title,
      projects.map((item) => item.slug),
    ),
    summary: data.summary,
    description: data.description || data.summary,
    tags: data.tags,
    imageUrl,
    logoUrl,
    liveUrl: data.liveUrl,
    githubUrl: data.githubUrl,
    featured: data.featured,
    year: data.year,
    createdAt: now,
    updatedAt: now,
  };

  await writeProjects([project, ...projects]);
  return project;
}

export async function updateProject(
  id: string,
  input: ProjectInput,
  image?: File | null,
  logo?: File | null,
) {
  const data = normalizeInput(input);
  if (!data.title) throw new Error("A title is required.");
  if (!data.summary) throw new Error("A short summary is required.");

  const projects = await readProjects();
  const index = projects.findIndex((project) => project.id === id);
  if (index === -1) throw new Error("Project not found.");

  const current = withLogo(projects[index]);
  let imageUrl = current.imageUrl;
  let logoUrl = current.logoUrl;

  if (image && image.size > 0) {
    imageUrl = await saveImage(image);
    if (current.imageUrl && current.imageUrl !== imageUrl) {
      await deleteStoredImage(current.imageUrl);
    }
  }

  if (logo && logo.size > 0) {
    logoUrl = await saveImage(logo);
    if (current.logoUrl && current.logoUrl !== logoUrl) {
      await deleteStoredImage(current.logoUrl);
    }
  }

  const updated: Project = {
    ...current,
    title: data.title,
    slug: uniqueSlug(
      data.title,
      projects.filter((project) => project.id !== id).map((project) => project.slug),
    ),
    summary: data.summary,
    description: data.description || data.summary,
    tags: data.tags,
    liveUrl: data.liveUrl,
    githubUrl: data.githubUrl,
    featured: data.featured,
    year: data.year,
    imageUrl,
    logoUrl,
    updatedAt: new Date().toISOString(),
  };

  const next = [...projects];
  next[index] = updated;
  await writeProjects(next);
  return updated;
}

export async function deleteProject(id: string) {
  const projects = await readProjects();
  const current = projects.find((project) => project.id === id);
  if (!current) throw new Error("Project not found.");

  await writeProjects(projects.filter((project) => project.id !== id));
  await deleteStoredImage(current.imageUrl);
  await deleteStoredImage(current.logoUrl || "");
  await deleteReviewsForProject(id);
}
