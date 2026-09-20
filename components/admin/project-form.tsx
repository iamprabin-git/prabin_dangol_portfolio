"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { CoverImage } from "@/components/project-card";
import { inputClass, labelClass } from "@/components/admin/form-utils";
import type { Project } from "@/lib/types";

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(project?.imageUrl || "");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = event.currentTarget;
    const body = new FormData(form);
    const url = project ? `/api/projects/${project.id}` : "/api/projects";
    const response = await fetch(url, {
      method: project ? "PATCH" : "POST",
      body,
    });
    const data = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "Could not save project.");
      return;
    }
    router.push("/admin/projects");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5">
      <label className={labelClass}>
        Title
        <input
          name="title"
          required
          defaultValue={project?.title}
          className={inputClass}
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Year
          <input
            name="year"
            defaultValue={project?.year || String(new Date().getFullYear())}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Tags (comma separated)
          <input
            name="tags"
            defaultValue={project?.tags.join(", ")}
            placeholder="Next.js, TypeScript, Vercel"
            className={inputClass}
          />
        </label>
      </div>
      <label className={labelClass}>
        Short summary
        <textarea
          name="summary"
          required
          rows={3}
          defaultValue={project?.summary}
          className={inputClass}
        />
      </label>
      <label className={labelClass}>
        Full description
        <textarea
          name="description"
          rows={8}
          defaultValue={project?.description}
          className={inputClass}
        />
      </label>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={labelClass}>
          Live URL
          <input
            name="liveUrl"
            type="url"
            defaultValue={project?.liveUrl}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          GitHub URL
          <input
            name="githubUrl"
            type="url"
            defaultValue={project?.githubUrl}
            className={inputClass}
          />
        </label>
      </div>
      <label className={labelClass}>
        Cover image
        <input
          name="image"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) setPreview(URL.createObjectURL(file));
          }}
          className={`${inputClass} border-dashed`}
        />
      </label>
      {preview ? (
        <div className="aspect-[16/9] overflow-hidden rounded-lg bg-[var(--bg)]">
          <CoverImage src={preview} alt="Cover preview" />
        </div>
      ) : null}
      <label className="flex items-center gap-3 text-[13px]">
        <input
          name="featured"
          type="checkbox"
          defaultChecked={project?.featured}
          className="h-4 w-4 accent-[var(--accent)]"
        />
        Featured on the home page
      </label>
      {error ? <p className="text-sm text-[var(--accent-2)]">{error}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
      >
        {pending ? "Saving…" : project ? "Save changes" : "Publish project"}
      </button>
    </form>
  );
}
