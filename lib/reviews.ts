import { readJsonRecord, readProjects, writeJsonRecord } from "./storage";
import type { ProjectReview, ReviewInput, ReviewStatus } from "./types";

const REVIEWS_KEY = "portfolio/reviews.json";
const REVIEWS_FILE = "reviews.json";

function clip(value: string, max: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

export async function getReviews(): Promise<ProjectReview[]> {
  const stored = await readJsonRecord<ProjectReview[]>(REVIEWS_KEY, REVIEWS_FILE);
  const reviews = stored ?? [];
  return [...reviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

async function saveReviews(reviews: ProjectReview[]) {
  await writeJsonRecord(REVIEWS_KEY, REVIEWS_FILE, reviews);
  return reviews;
}

export function normalizeReviewInput(input: ReviewInput): ReviewInput {
  const rating = Math.round(Number(input.rating));
  return {
    projectId: String(input.projectId || "").trim(),
    name: clip(input.name, 80),
    role: clip(input.role, 80),
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(1, rating)) : 0,
    body: clip(input.body, 800),
  };
}

export async function createReview(input: ReviewInput, status: ReviewStatus = "pending") {
  const data = normalizeReviewInput(input);
  if (!data.projectId) throw new Error("A project is required.");
  if (data.name.length < 2) throw new Error("Please add your name.");
  if (data.body.length < 12) throw new Error("Please write a slightly longer review.");
  if (data.rating < 1) throw new Error("Please choose a rating from 1 to 5.");

  const projects = await readProjects();
  if (!projects.some((item) => item.id === data.projectId)) {
    throw new Error("Project not found.");
  }

  const reviews = await getReviews();
  const review: ProjectReview = {
    id: crypto.randomUUID(),
    projectId: data.projectId,
    name: data.name,
    role: data.role,
    rating: data.rating,
    body: data.body,
    status,
    createdAt: new Date().toISOString(),
  };

  await saveReviews([review, ...reviews]);
  return review;
}

export async function setReviewStatus(id: string, status: ReviewStatus) {
  if (!["pending", "approved", "rejected"].includes(status)) {
    throw new Error("Invalid review status.");
  }
  const reviews = await getReviews();
  const index = reviews.findIndex((item) => item.id === id);
  if (index === -1) throw new Error("Review not found.");

  const next = [...reviews];
  next[index] = { ...next[index], status };
  await saveReviews(next);
  return next[index];
}

export async function deleteReview(id: string) {
  const reviews = await getReviews();
  if (!reviews.some((item) => item.id === id)) throw new Error("Review not found.");
  await saveReviews(reviews.filter((item) => item.id !== id));
}

export async function deleteReviewsForProject(projectId: string) {
  const reviews = await getReviews();
  await saveReviews(reviews.filter((item) => item.projectId !== projectId));
}

export async function getApprovedReviews(projectId: string) {
  const reviews = await getReviews();
  return reviews.filter((item) => item.projectId === projectId && item.status === "approved");
}

export function averageRating(reviews: ProjectReview[]) {
  if (!reviews.length) return 0;
  const total = reviews.reduce((sum, item) => sum + item.rating, 0);
  return Math.round((total / reviews.length) * 10) / 10;
}

export async function getReviewStats() {
  const reviews = await getReviews();
  const stats: Record<string, { average: number; count: number; pending: number }> = {};

  for (const review of reviews) {
    if (!stats[review.projectId]) {
      stats[review.projectId] = { average: 0, count: 0, pending: 0 };
    }
    const entry = stats[review.projectId];
    if (review.status === "approved") {
      const total = entry.average * entry.count + review.rating;
      entry.count += 1;
      entry.average = Math.round((total / entry.count) * 10) / 10;
    }
    if (review.status === "pending") entry.pending += 1;
  }

  return stats;
}
