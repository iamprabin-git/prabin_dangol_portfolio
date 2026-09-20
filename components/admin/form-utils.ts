export async function submitSite(
  data: unknown,
  files?: { portrait?: File | null; workspace?: File | null },
) {
  const body = new FormData();
  body.set("data", JSON.stringify(data));
  if (files?.portrait && files.portrait.size > 0) body.set("portrait", files.portrait);
  if (files?.workspace && files.workspace.size > 0) body.set("workspace", files.workspace);

  const response = await fetch("/api/site", { method: "PATCH", body });
  const payload = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(payload.error || "Could not save.");
}

export const inputClass =
  "w-full rounded-lg border border-[var(--line)] bg-[var(--bg-panel)] px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-[var(--accent)]";

export const labelClass = "grid gap-1.5 text-[13px] font-medium";
