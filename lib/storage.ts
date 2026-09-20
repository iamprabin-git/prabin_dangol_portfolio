import { del, list, put } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";
import {
  deleteFile,
  getRecord,
  hasDatabase,
  mediaHref,
  mediaIdFromUrl,
  putFile,
  setRecord,
} from "./db";
import type { Project } from "./types";

const PROJECTS_BLOB = "portfolio/projects.json";
const DATA_FILE = path.join(process.cwd(), "data", "projects.json");
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

export function hasBlobStore() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      (process.env.BLOB_STORE_ID && process.env.VERCEL_OIDC_TOKEN),
  );
}

export function isVercel() {
  return process.env.VERCEL === "1";
}

export function canPersistWrites() {
  return hasDatabase() || hasBlobStore() || !isVercel();
}

export function storageLabel() {
  if (hasDatabase()) return "Vercel Postgres";
  if (hasBlobStore()) return "Vercel Blob";
  if (isVercel()) return "Read-only (enable Postgres to save)";
  return "Local files";
}

export async function readJsonRecord<T>(blobPath: string, fileName: string): Promise<T | null> {
  if (hasDatabase()) {
    const fromDb = await getRecord<T>(blobPath);
    if (fromDb) return fromDb;
  }

  if (hasBlobStore()) {
    const { blobs } = await list({ prefix: blobPath, limit: 20 });
    const file = blobs.find(
      (blob) => blob.pathname === blobPath || blob.pathname.endsWith(path.posix.basename(blobPath)),
    );
    if (file) {
      const response = await fetch(file.url, { cache: "no-store" });
      if (response.ok) return (await response.json()) as T;
    }
  }

  try {
    const raw = await fs.readFile(path.join(process.cwd(), "data", path.basename(fileName)), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJsonRecord<T>(blobPath: string, fileName: string, value: T) {
  if (!canPersistWrites()) {
    throw new Error(
      "Saves need Vercel Postgres. In the project, open Storage → Create Database → Neon, connect it, and redeploy.",
    );
  }

  if (hasDatabase()) {
    await setRecord(blobPath, value);
    return;
  }

  const payload = JSON.stringify(value, null, 2);

  if (hasBlobStore()) {
    await put(blobPath, payload, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
    });
    return;
  }

  const filePath = path.join(process.cwd(), "data", path.basename(fileName));
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, payload, "utf8");
}

async function readSeed(): Promise<Project[]> {
  const raw = await fs.readFile(DATA_FILE, "utf8");
  return JSON.parse(raw) as Project[];
}

export async function readProjects(): Promise<Project[]> {
  const fromStore = await readJsonRecord<Project[]>(PROJECTS_BLOB, "projects.json");
  if (fromStore) return fromStore;
  try {
    return await readSeed();
  } catch {
    return [];
  }
}

export async function writeProjects(projects: Project[]) {
  await writeJsonRecord(PROJECTS_BLOB, "projects.json", projects);
}

function extensionFor(file: File) {
  const fromName = path.extname(file.name).toLowerCase();
  if (fromName) return fromName;
  if (file.type === "image/jpeg") return ".jpg";
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/gif") return ".gif";
  if (file.type === "image/svg+xml") return ".svg";
  return ".png";
}

export async function saveImage(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Please upload a JPG, PNG, WebP, GIF, or SVG image.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Images must be 4MB or smaller (Vercel Hobby request limit).");
  }

  const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${extensionFor(file)}`;

  if (hasDatabase()) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    await putFile(filename, file.type, bytes);
    return mediaHref(filename);
  }

  if (hasBlobStore()) {
    const blob = await put(`portfolio/uploads/${filename}`, file, {
      access: "public",
      addRandomSuffix: false,
    });
    return blob.url;
  }

  if (isVercel()) {
    throw new Error(
      "Uploads need Vercel Postgres. Create a Neon database in Storage and redeploy.",
    );
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, filename), bytes);
  return `/uploads/${filename}`;
}

export async function deleteStoredImage(imageUrl: string) {
  if (!imageUrl) return;

  const mediaId = mediaIdFromUrl(imageUrl);
  if (mediaId) {
    try {
      await deleteFile(mediaId);
    } catch {
      // Ignore missing database files.
    }
    return;
  }

  if (hasBlobStore() && imageUrl.includes("blob.vercel-storage.com")) {
    try {
      await del(imageUrl);
    } catch {
      // Old or already-deleted blobs should not block project removal.
    }
    return;
  }

  if (imageUrl.startsWith("/uploads/")) {
    const filePath = path.join(process.cwd(), "public", imageUrl);
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore missing local files.
    }
  }
}
