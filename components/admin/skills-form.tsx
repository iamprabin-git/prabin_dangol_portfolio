"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass, submitSite } from "@/components/admin/form-utils";
import type { SkillGroup, SiteContent } from "@/lib/types";

export function SkillsForm({ site }: { site: SiteContent }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [groups, setGroups] = useState<SkillGroup[]>(site.skills);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  function addItem(groupId: string) {
    const value = (drafts[groupId] || "").trim();
    if (!value) return;
    setGroups((current) =>
      current.map((group) =>
        group.id === groupId && !group.items.includes(value)
          ? { ...group, items: [...group.items, value] }
          : group,
      ),
    );
    setDrafts((current) => ({ ...current, [groupId]: "" }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    try {
      await submitSite({
        skills: groups
          .filter((group) => group.label.trim())
          .map((group) => ({ ...group, label: group.label.trim() })),
      });
      setMessage("Skills saved. They appear in the home marquee immediately.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid max-w-3xl gap-6">
      {groups.map((group) => (
        <div key={group.id} className="border border-[var(--line)] p-4">
          <div className="flex items-center gap-3">
            <label className={`${labelClass} flex-1`}>
              Group name
              <input
                value={group.label}
                onChange={(event) =>
                  setGroups((current) =>
                    current.map((item) =>
                      item.id === group.id ? { ...item, label: event.target.value } : item,
                    ),
                  )
                }
                className={inputClass}
              />
            </label>
            <button
              type="button"
              className="mt-5 text-sm text-[var(--accent-2)]"
              onClick={() => setGroups((current) => current.filter((item) => item.id !== group.id))}
            >
              Remove group
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {group.items.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() =>
                  setGroups((current) =>
                    current.map((entry) =>
                      entry.id === group.id
                        ? { ...entry, items: entry.items.filter((skill) => skill !== item) }
                        : entry,
                    ),
                  )
                }
                className="rounded-full border border-[var(--line)] px-3 py-1 text-sm hover:border-[var(--accent-2)]"
                title="Remove"
              >
                {item} ×
              </button>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={drafts[group.id] || ""}
              onChange={(event) =>
                setDrafts((current) => ({ ...current, [group.id]: event.target.value }))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addItem(group.id);
                }
              }}
              placeholder="Add a skill and press Enter"
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => addItem(group.id)}
              className="shrink-0 rounded-full border border-[var(--line)] px-4 text-sm"
            >
              Add
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="w-fit text-sm text-[var(--accent)]"
        onClick={() =>
          setGroups((current) => [
            ...current,
            { id: crypto.randomUUID(), label: "New group", items: [] },
          ])
        }
      >
        Add skill group
      </button>
      {error ? <p className="text-sm text-[var(--accent-2)]">{error}</p> : null}
      {message ? <p className="text-sm text-[var(--accent)]">{message}</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent)] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save skills"}
      </button>
    </form>
  );
}
